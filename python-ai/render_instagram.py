from __future__ import annotations
import json, re, textwrap, zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
NAVY = "#102A43"
NAVY2 = "#173F5F"
ORANGE = "#F28C28"
WHITE = "#FFFFFF"
PALE = "#F4F7FA"
DARK = "#243B53"
MUTED = "#627D98"
OUT = Path("output")
OUT.mkdir(exist_ok=True)

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap_pixels(draw, text, fnt, max_width):
    lines, current = [], ""
    for word in re.sub(r"\\s+", " ", text).split():
        candidate = word if not current else current + " " + word
        if draw.textbbox((0,0), candidate, font=fnt)[2] <= max_width:
            current = candidate
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    return lines

def clean_text(s):
    s = re.sub(r"^#+\\s*", "", s)
    s = re.sub(r"^[-*•]\\s*", "", s)
    s = re.sub(r"^\\d+[.)]\\s*", "", s)
    s = re.sub(r"\\*{1,2}", "", s)
    return s.strip()

def split_content(text, max_chars=430):
    paras = []
    for raw in text.splitlines():
        line = clean_text(raw)
        if not line or line.startswith("Fontes consultadas"): continue
        if len(line) < 3: continue
        if len(line) > max_chars:
            words, buf = line.split(), ""
            for word in words:
                if len(buf) + len(word) + 1 > max_chars and buf:
                    paras.append(buf); buf = word
                else: buf = (buf + " " + word).strip()
            if buf: paras.append(buf)
        else: paras.append(line)
    return paras or ["Conteúdo de revisão para concursos públicos."]

def draw_footer(img, number, total):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((64, 1250, 1016, 1257), radius=3, fill="#34536B")
    d.rounded_rectangle((64, 1250, int(64 + 952*number/max(total,1)), 1257), radius=3, fill=ORANGE)
    d.text((64, 1280), "APROVAJÁ  •  SEU CONCURSO COMEÇA AQUI", font=font(23, True), fill=WHITE)
    d.text((1000, 1280), f"{number}/{total}", font=font(22, True), fill=WHITE, anchor="ra")

def make_slide(title, body, idx, total, cover=False):
    img = Image.new("RGB", (W,H), NAVY if cover or idx % 2 == 1 else PALE)
    d = ImageDraw.Draw(img)
    dark = img.getpixel((30,30)) == ImageColor(NAVY)
    fg = WHITE if dark else DARK
    # brand accent blocks
    d.rounded_rectangle((64, 60, 250, 76), radius=7, fill=ORANGE)
    d.text((64, 100), "APROVAJÁ  |  CONCURSOS", font=font(24, True), fill=ORANGE if dark else NAVY)
    if cover:
        d.rounded_rectangle((64, 260, 1016, 1080), radius=36, fill=NAVY2)
        d.rounded_rectangle((64, 260, 82, 1080), radius=8, fill=ORANGE)
        title_font = font(68, True)
        lines = wrap_pixels(d, title, title_font, 820)
        y = 370
        for line in lines[:5]:
            d.text((124,y), line, font=title_font, fill=WHITE)
            y += 88
        body_font = font(32)
        subtitle = "GUIA RÁPIDO PARA SUA PRÓXIMA PROVA"
        d.text((124, 900), subtitle, font=body_font, fill="#D9E2EC")
        d.rounded_rectangle((124, 970, 430, 1035), radius=18, fill=ORANGE)
        d.text((152, 985), "SALVE PARA REVISAR", font=font(23, True), fill=NAVY)
    else:
        title_font = font(45, True)
        y = 205
        for line in wrap_pixels(d, title, title_font, 920)[:3]:
            d.text((64,y), line, font=title_font, fill=fg)
            y += 58
        d.rounded_rectangle((64,y+14,190,y+24), radius=5, fill=ORANGE)
        y += 70
        body_font = font(32)
        for para in body:
            lines = wrap_pixels(d, para, body_font, 900)
            height = len(lines)*44 + 24
            if y + height > 1180: break
            d.ellipse((68,y+12,84,y+28), fill=ORANGE)
            for j,line in enumerate(lines):
                d.text((108,y+j*44), line, font=body_font, fill=fg)
            y += height
    draw_footer(img, idx, total)
    return img

def ImageColor(hex_color):
    h=hex_color.lstrip("#")
    return tuple(int(h[i:i+2],16) for i in (0,2,4))

def main():
    md = OUT / "conteudo.md"
    if not md.exists():
        raise SystemExit("Arquivo output/conteudo.md não encontrado.")
    raw = md.read_text(encoding="utf-8")
    lines = raw.splitlines()
    title = next((clean_text(x) for x in lines if x.startswith("# ")), "Dica para concursos")
    content_start = next((i+1 for i,x in enumerate(lines) if x.startswith("**Modelo local:**")), 0)
    body_text = "\\n".join(lines[content_start:])
    body_text = re.split(r"(?im)^## Fontes recuperadas", body_text)[0]
    paras = split_content(body_text)
    chunks, current = [], []
    for p in paras:
        if current and sum(len(x) for x in current) + len(p) > 330:
            chunks.append(current); current=[]
        current.append(p)
    if current: chunks.append(current)
    # One cover + 3-6 content slides + CTA. Keep individual slides readable.
    chunks = chunks[:5]
    total = 1 + len(chunks) + 1
    images=[]
    images.append(make_slide(title, [], 1, total, cover=True))
    for i, chunk in enumerate(chunks, 2):
        slide_title = chunk[0][:90]
        images.append(make_slide(slide_title, chunk[1:] if len(chunk)>1 else chunk, i, total))
    cta = make_slide("Gostou desta revisão?", ["Salve este carrossel para revisar antes da prova.", "Compartilhe com quem também está estudando.", "Siga @aprovaja_seuconcurso para mais conteúdos gratuitos."], total, total)
    images.append(cta)
    paths=[]
    for i, im in enumerate(images,1):
        p=OUT/f"slide_{i:02d}.png"
        im.save(p, "PNG", optimize=True)
        paths.append(p)
    caption = f"{title}\\n\\nEstude com estratégia e revise os pontos principais. Salve esta publicação para consultar depois.\\n\\nSiga @aprovaja_seuconcurso para mais conteúdos gratuitos.\\n\\n#AprovaJá #ConcursosPúblicos #Estudos #DicasDeConcurso #Concurseiro"
    (OUT/"legenda_instagram.txt").write_text(caption,encoding="utf-8")
    with zipfile.ZipFile(OUT/"carrossel_instagram.zip","w",zipfile.ZIP_DEFLATED) as z:
        for p in paths: z.write(p,p.name)
        z.write(OUT/"legenda_instagram.txt","legenda_instagram.txt")
    print(f"Carrossel criado: {len(paths)} PNGs em 1080x1350 + ZIP e legenda.")

if __name__ == "__main__":
    main()
