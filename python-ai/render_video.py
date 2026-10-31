from __future__ import annotations

import asyncio
import re
import subprocess
from pathlib import Path

import edge_tts

OUT = Path("output")
VIDEO = OUT / "aprovaja_story.mp4"
VOICE = "pt-BR-FranciscaNeural"


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def clean_narration_line(line: str) -> str:
    """Remove Markdown/artefactos visuais sem inventar conteúdo para a locução."""
    line = line.strip()
    if not line:
        return ""

    # Ignora metadados e referências, que não fazem parte do conteúdo didático.
    if re.match(r"^(?:#{1,6}\\s*)?(?:disciplina|formato|modelo local|fontes recuperadas pelo sistema)\\s*:", line, re.I):
        return ""
    if re.match(r"^(?:[-*•]\\s*)?(?:nenhuma fonte local relevante|fontes recuperadas)", line, re.I):
        return ""

    # Remove marcação Markdown, mantendo o texto e sua pontuação.
    line = re.sub(r"^#{1,6}\\s*", "", line)
    line = re.sub(r"^>+\\s*", "", line)
    line = re.sub(r"^[-*•]\\s+", "", line)
    line = re.sub(r"\\[([^\\]]+)\\]\\([^)]*\\)", r"\\1", line)
    line = re.sub(r"[*_`]", "", line)

    # Símbolos comparativos são verbalizados somente quando conectam expressões.
    line = re.sub(r"\\s*>\\s*", " maior que ", line)
    line = re.sub(r"\\s*<\\s*", " menor que ", line)
    # Remove sinais gráficos soltos e caracteres de diagramação que não devem ser lidos.
    line = re.sub(r"[<>|]+", " ", line)
    line = re.sub(r"[📘📄🟦🔵]", " ", line)
    line = re.sub(r"\\s+", " ", line).strip()
    return line


def narration_text() -> str:
    raw = (OUT / "conteudo.md").read_text(encoding="utf-8")
    paragraphs: list[str] = []
    current: list[str] = []

    for raw_line in raw.splitlines():
        line = clean_narration_line(raw_line)
        if line:
            current.append(line)
        elif current:
            paragraphs.append(" ".join(current))
            current = []

    if current:
        paragraphs.append(" ".join(current))

    # Mantém a pontuação original e as pausas entre parágrafos.
    text = ". ".join(p.rstrip(" .;:") for p in paragraphs if p.strip())
    text = re.sub(r"\\s+([,.;:!?])", r"\\1", text)
    text = re.sub(r"([.!?])(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])", r"\\1 ", text)
    text = re.sub(r"\\s{2,}", " ", text).strip()

    # Limita por frase inteira: nunca interrompe a locução no meio de uma ideia.
    sentences = re.split(r"(?<=[.!?])\\s+", text)
    selected: list[str] = []
    count = 0
    for sentence in sentences:
        words = sentence.split()
        if not words:
            continue
        if count + len(words) > 180:
            break
        selected.append(sentence)
        count += len(words)
    text = " ".join(selected).strip()

    if not text:
        raise ValueError("O conteúdo não possui texto didático válido para narração.")
    return text


async def make_voice(text: str, path: Path) -> None:
    # Edge TTS recebe texto pontuado; pausas naturais decorrem da pontuação original.
    communicate = edge_tts.Communicate(text, VOICE, rate="-8%", volume="+0%")
    await communicate.save(str(path))


def main() -> None:
    OUT.mkdir(exist_ok=True)
    slides = sorted(OUT.glob("slide_*.png"))
    if not slides:
        raise SystemExit("Nenhuma arte slide_*.png encontrada. Execute render_instagram.py primeiro.")

    spoken_text = narration_text()
    (OUT / "narracao.txt").write_text(spoken_text, encoding="utf-8")
    print("Texto exato enviado à narração:")
    print(spoken_text)

    voice = OUT / "narracao.mp3"
    asyncio.run(make_voice(spoken_text, voice))
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(voice)],
        check=True, capture_output=True, text=True
    )
    duration = max(8.0, float(result.stdout.strip()))
    per_slide = duration / len(slides)
    clips: list[Path] = []

    for i, slide in enumerate(slides):
        clip = OUT / f"story_clip_{i:02d}.mp4"
        vf = (
            "scale=960:1200:force_original_aspect_ratio=decrease,"
            "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x102A43,"
            "drawbox=x=0:y=0:w=iw:h=14:color=0xF28C28:t=fill,"
            "format=yuv420p"
        )
        run([
            "ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(slide),
            "-t", f"{per_slide:.3f}", "-vf", vf, "-r", "30", "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", str(clip)
        ])
        clips.append(clip)

    concat_file = OUT / "story_clips.txt"
    concat_file.write_text(
        "".join(f"file '{p.resolve().as_posix()}'\\n" for p in clips),
        encoding="utf-8"
    )
    silent = OUT / "story_silent.mp4"
    run([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(silent)
    ])

    # Trilha sintética simples, criada localmente pelo FFmpeg; sem arquivo musical externo.
    music = (
        f"aevalsrc=0.035*sin(2*PI*196*t)+0.018*sin(2*PI*246.94*t)"
        f"+0.012*sin(2*PI*293.66*t):s=44100:d={duration:.3f},"
        f"afade=t=in:st=0:d=1,afade=t=out:st={max(0.0, duration-2):.2f}:d=2"
    )
    run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(voice),
        "-f", "lavfi", "-i", music,
        "-filter_complex",
        "[1:a]volume=1.0[voice];[2:a]volume=0.22[music];"
        "[voice][music]amix=inputs=2:duration=first:dropout_transition=2,"
        "loudnorm=I=-16:TP=-1.5:LRA=11[a]",
        "-map", "0:v:0", "-map", "[a]", "-t", f"{duration:.3f}",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", "-shortest", str(VIDEO)
    ])
    probe = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height",
        "-of", "csv=p=0", str(VIDEO)
    ], check=True, capture_output=True, text=True)
    print("Vídeo gerado:", VIDEO)
    print("Duração da narração (s):", round(duration, 1))
    print("Streams:", probe.stdout.strip())
    for path in clips + [concat_file, silent]:
        path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
