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


def narration_text() -> str:
    raw = (OUT / "conteudo.md").read_text(encoding="utf-8")
    lines = []
    for line in raw.splitlines():
        line = re.sub(r"^#+\\s*", "", line)
        line = re.sub(r"^\\*.*?\\*\\*:?\\s*", "", line)
        line = re.sub(r"^[-*•]\\s*", "", line)
        line = re.sub(r"\\*{1,2}", "", line).strip()
        if not line or line.lower().startswith(("fontes recuperadas", "nenhuma fonte local")):
            continue
        if line.startswith(">"):
            line = line.lstrip("> ").strip()
        if line:
            lines.append(line)
    text = " ".join(lines)
    words = text.split()
    if len(words) > 180:
        text = " ".join(words[:180])
    return text or "AprovaJá. Prepare-se para concursos com estratégia. Estude, revise e avance rumo à sua aprovação."


async def make_voice(text: str, path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate="-5%", volume="+0%")
    await communicate.save(str(path))


def main() -> None:
    OUT.mkdir(exist_ok=True)
    slides = sorted(OUT.glob("slide_*.png"))
    if not slides:
        raise SystemExit("Nenhuma arte slide_*.png encontrada. Execute render_instagram.py primeiro.")

    voice = OUT / "narracao.mp3"
    asyncio.run(make_voice(narration_text(), voice))
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
