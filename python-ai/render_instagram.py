from __future__ import annotations
import json, os, re, zipfile
from pathlib import Path
from io import BytesIO
import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H = 1080, 1350
NAVY, NAVY2, ORANGE = "#102A43", "#173F5F", "#F28C28"
WHITE, PALE, DARK = "#FFFFFF", "#F4F7FA", "#243B53"
OUT = Path("output")
OUT.mkdir(exist_ok=True)
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
ALLOWED_LICENSES = ("CC0", "CC BY", "CC BY-SA", "Public domain", "Public Domain")

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        if Path(p).exists(): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap_pixels(draw, text, fnt, max_width):
    lines, current = [], ""
    for word in re.sub(r"\s+", " ", text).split():
        candidate = word if not current else current + " " + word
        if draw.textbbox((0,0), candidate, font=fnt)[2] <= max_width: current = candidate
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    return lines

def clean_text(s):
    s = re.sub(r"^#+\s*", "", s)
    s = re.sub(r"^[-*•]\s*", "", s)
    s = re.sub(r"^\d+[.)]\s*", "", s)
    return re.sub(r"\*{1,2}", "", s).strip()

def split_content(text, max_chars=430):
    paras = []
    for raw in text.splitlines():
        line = clean_text(raw)
        if not line or line.startswith("Fontes consultadas") or len(line) < 3: continue
        if len(line) > max_chars:
            buf = ""
            for word in line.split():
                if len(buf) + len(word) + 1 > max_chars and buf:
                    paras.append(buf); buf = word
                else: buf = (buf + " " + word).strip()
            if buf: paras.append(buf)
        else: paras.append(line)
    return paras or ["Conteúdo de revisão para concursos públicos."]

def _meta_value(metadata, key, default=""):
    return str(metadata.get(key, {}).get("value", default) or default).strip()

def find_people_photo(topic: str):
    """Busca foto de pessoa no Wikimedia Commons e aceita apenas licenças comerciais abertas."""
    terms = [
        f"people studying {topic}",
        "student studying at desk books",
        "professional working office portrait"
    ]
    headers = {"User-Agent": "AprovaJaSocialPublisher/1.0 (educational social media; license metadata checked)"}
    for term in terms:
        try:
            params = {
                "action":"query", "format":"json", "generator":"search",
                "gsrnamespace":6, "gsrsearch":term, "gsrlimit":12,
                "prop":"imageinfo", "iiprop":"url|extmetadata", "iiurlwidth":1000
            }
            response = requests.get(COMMONS_API, params=params, headers=headers, timeout=20)
            response.raise_for_status()
            pages = response.json().get("query", {}).get("pages", {})
            for page in pages.values():
                info = (page.get("imageinfo") or [{}])[0]
                meta = info.get("extmetadata") or {}
                license_name = _meta_value(meta, "LicenseShortName")
                usage = _meta_value(meta, "UsageTerms")
                license_text = f"{license_name} {usage}".strip()
                # Exclui explicitamente licenças NC/ND; aceita CC0, domínio público e CC BY/BY-SA.
                if re.search(r"\b(NC|ND)\b|NonCommercial|NoDerivatives", license_text, re.I):
                    continue
                if not any(x.lower() in license_text.lower() for x in ALLOWED_LICENSES):
                    continue
                image_url = info.get("thumburl") or info.get("url")
                if not image_url: continue
                img_response = requests.get(image_url, headers=headers, timeout=30)
                img_response.raise_for_status()
                photo = Image.open(BytesIO(img_response.content)).convert("RGB")
                if photo.width < 400 or photo.height < 300: continue
                title = page.get("title", "")
                artist = _meta_value(meta, "Artist", "Autor não identificado")
                artist = re.sub(r"<[^>]+>", "", artist).strip()
                file_page = "https://commons.wikimedia.org/wiki/" + requests.utils.quote(title.replace(" ", "_"), safe=":_()")
                record = {
                    "provider":"Wikimedia Commons", "title":title, "author":artist,
                    "license":license_name or usage, "license_url":_meta_value(meta, "LicenseUrl"),
                    "file_page":file_page, "source_image_url":info.get("url"),
                    "attribution_required":_meta_value(meta, "AttributionRequired", "true").lower() != "false"
                }
                return photo, record
        except Exception as exc:
            print(f"[foto] Busca Commons falhou para '{term}': {exc}")
    print("[foto] Nenhuma fotografia com licença compatível foi encontrada; arte seguirá sem foto.")
    return None, None

def draw_photo_card(canvas, photo):
    # Foto em cartão vertical com máscara arredondada, sem cobrir textos.
    photo = ImageOps.fit(photo, (330, 500), method=Image.Resampling.LANCZOS, centering=(0.5,0.45))
    mask = Image.new("L", photo.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,329,499), radius=28, fill=255)
    canvas.paste(photo, (630, 355), mask)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((620,345,970,865), radius=34, outline=ORANGE, width=8)

def draw_footer(img, number, total):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((64, 1250, 1016, 1257), radius=3, fill="#34536B")
    d.rounded_rectangle((64, 1250, int(64 + 952*number/max(total,1)), 1257), radius=3, fill=ORANGE)
    d.text((64, 1280), "APROVAJÁ  •  SEU CONCURSO COMEÇA AQUI", font=font(23, True), fill=WHITE)
    d.text((1000, 1280), f"{number}/{total}", font=font(22, True), fill=WHITE, anchor="ra")

def make_slide(title, body, idx, total, cover=False, photo=None):
    img = Image.new("RGB", (W,H), NAVY if cover or idx % 2 == 1 else PALE)
    d = ImageDraw.Draw(img)
    dark = img.getpixel((30,30)) == ImageColor(NAVY)
    fg = WHITE if dark else DARK
    d.rounded_rectangle((64, 60, 250, 76), radius=7, fill=ORANGE)
    d.text((64, 100), "APROVAJÁ  |  CONCURSOS", font=font(24, True), fill=ORANGE if dark else NAVY)
    if cover:
        d.rounded_rectangle((64, 260, 1016, 1080), radius=36, fill=NAVY2)
        d.rounded_rectangle((64, 260, 82, 1080), radius=8, fill=ORANGE)
        title_font = font(58 if photo else 68, True)
        max_width = 455 if photo else 820
        lines = wrap_pixels(d, title, title_font, max_width)
        y = 380 if photo else 370
        for line in lines[:6]:
            d.text((124,y), line, font=title_font, fill=WHITE)
            y += 76 if photo else 88
        if photo:
            draw_photo_card(img, photo)
            d = ImageDraw.Draw(img)
            d.text((124, 900), "CONHECIMENTO ABRE CAMINHOS", font=font(25, True), fill="#D9E2EC")
        else:
            d.text((124, 900), "GUIA RÁPIDO PARA SUA PRÓXIMA PROVA", font=font(32), fill="#D9E2EC")
        d.rounded_rectangle((124, 970, 430, 1035), radius=18, fill=ORANGE)
        d.text((152, 985), "SALVE PARA REVISAR", font=font(23, True), fill=NAVY)
    else:
        title_font = font(45, True)
        y = 205
        for line in wrap_pixels(d, title, title_font, 920)[:3]:
            d.text((64,y), line, font=title_font, fill=fg); y += 58
        d.rounded_rectangle((64,y+14,190,y+24), radius=5, fill=ORANGE); y += 70
        body_font = font(32)
        for para in body:
            lines = wrap_pixels(d, para, body_font, 900)
            height = len(lines)*44 + 24
            if y + height > 1180: break
            d.ellipse((68,y+12,84,y+28), fill=ORANGE)
            for j,line in enumerate(lines): d.text((108,y+j*44), line, font=body_font, fill=fg)
            y += height
    draw_footer(img, idx, total)
    return img

def ImageColor(hex_color):
    h=hex_color.lstrip("#")
    return tuple(int(h[i:i+2],16) for i in (0,2,4))

def main():
    md = OUT / "conteudo.md"
    if not md.exists(): raise SystemExit("Arquivo output/conteudo.md não encontrado.")
    raw = md.read_text(encoding="utf-8")
    lines = raw.splitlines()
    title = next((clean_text(x) for x in lines if x.startswith("# ")), "Dica para concursos")
    content_start = next((i+1 for i,x in enumerate(lines) if x.startswith("**Modelo local:**")), 0)
    body_text = re.split(r"(?im)^## Fontes recuperadas", "\n".join(lines[content_start:]))[0]
    paras = split_content(body_text)
    chunks, current = [], []
    for p in paras:
        if current and sum(len(x) for x in current) + len(p) > 330:
            chunks.append(current); current=[]
        current.append(p)
    if current: chunks.append(current)
    chunks = chunks[:5]
    total = 1 + len(chunks) + 1
    photo, photo_record = find_people_photo(title)
    images=[make_slide(title, [], 1, total, cover=True, photo=photo)]
    for i, chunk in enumerate(chunks, 2):
        images.append(make_slide(chunk[0][:90], chunk[1:] if len(chunk)>1 else chunk, i, total))
    images.append(make_slide("Gostou desta revisão?", ["Salve este carrossel para revisar antes da prova.", "Compartilhe com quem também está estudando.", "Siga @aprovaja_seuconcurso para mais conteúdos gratuitos."], total, total))
    paths=[]
    for i, im in enumerate(images,1):
        if im.mode != "RGB": im = im.convert("RGB")
        if im.size != (W,H): im = im.resize((W,H), Image.Resampling.LANCZOS)
        p=OUT/f"slide_{i:02d}.png"
        im.save(p, "PNG", optimize=True)
        with Image.open(p) as check:
            if check.size != (1080,1350): raise RuntimeError(f"Dimensão inválida em {p.name}: {check.size}")
        paths.append(p)
    caption = f"{title}\n\nEstude com estratégia e revise os pontos principais. Salve esta publicação para consultar depois.\n\nSiga @aprovaja_seuconcurso para mais conteúdos gratuitos."
    if photo_record:
        attribution = f"Fotografia: {photo_record['author']} — {photo_record['license']}. Fonte: {photo_record['file_page']}"
        caption += "\n\n" + attribution
        (OUT/"credito_fotografia.json").write_text(json.dumps(photo_record, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        (OUT/"credito_fotografia.json").write_text(json.dumps({"status":"no_licensed_photo_found","fallback":"arte gerada sem fotografia"}, ensure_ascii=False, indent=2), encoding="utf-8")
    caption += "\n\n#AprovaJá #ConcursosPúblicos #Estudos #DicasDeConcurso #Concurseiro"
    (OUT/"legenda_instagram.txt").write_text(caption,encoding="utf-8")
    with zipfile.ZipFile(OUT/"carrossel_instagram.zip","w",zipfile.ZIP_DEFLATED) as z:
        for p in paths: z.write(p,p.name)
        z.write(OUT/"legenda_instagram.txt","legenda_instagram.txt")
        z.write(OUT/"credito_fotografia.json","credito_fotografia.json")
    invalid=[]
    for p in paths:
        with Image.open(p) as check:
            if check.size != (1080,1350): invalid.append(f"{p.name}: {check.size}")
    if invalid: raise RuntimeError("Artes fora do padrão: " + "; ".join(invalid))
    print(f"Carrossel validado: {len(paths)} PNGs 1080x1350. Fotografia licenciada: {'sim' if photo_record else 'não; fallback sem foto'}.")

if __name__ == "__main__":
    main()
