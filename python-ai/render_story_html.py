from __future__ import annotations
import json, re
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path("output"); ASSETS=OUT/"story_assets.json"; HTML_DIR=OUT/"slides_html"

def main():
    if not ASSETS.exists(): raise SystemExit("Pacote DeepSeek ausente: output/story_assets.json")
    data=json.loads(ASSETS.read_text(encoding="utf-8"))
    slides=data.get("slides_html") or []; roteiro=data.get("roteiro") or []
    narration=data.get("narration") or ""
    if len(slides)!=len(roteiro) or len(slides)<6: raise SystemExit("Pacote incompleto: slides HTML e cenas do roteiro não correspondem.")
    expected="\n\n".join(str(s["narracao"]).strip() for s in roteiro)
    if not narration.strip() or narration!=expected: raise SystemExit("A narração não corresponde literalmente às falas do roteiro.")
    HTML_DIR.mkdir(parents=True,exist_ok=True)
    (OUT/"conteudo_didatico.html").write_text(data.get("content_html",""),encoding="utf-8")
    (OUT/"roteiro.json").write_text(json.dumps(roteiro,ensure_ascii=False,indent=2),encoding="utf-8")
    (OUT/"roteiro_narracao.txt").write_text(narration,encoding="utf-8")
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={"width":1080,"height":1920},device_scale_factor=1)
        for i,fragment in enumerate(slides,1):
            if "<section" not in fragment.lower(): raise SystemExit(f"Slide {i} não contém section HTML.")
            doc='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;padding:0;width:1080px;height:1920px;overflow:hidden}body{font-family:Arial,Helvetica,sans-serif;background:#102A43;color:#fff}.slide{width:1080px;height:1920px;overflow:hidden;position:relative}</style></head><body>'+fragment+'</body></html>'
            (HTML_DIR/f"slide_{i:02d}.html").write_text(doc,encoding="utf-8")
            page.set_content(doc,wait_until="networkidle")
            page.screenshot(path=str(OUT/f"slide_{i:02d}.png"))
        browser.close()
    texts=[" ".join(re.sub(r"<[^>]+>"," ",s).split()).lower() for s in slides]
    if len(set(texts))!=len(texts): raise SystemExit("Slides repetidos detectados.")
    if any(len(t)<80 for t in texts[1:-1]): raise SystemExit("Slide intermediário sem conteúdo didático suficiente.")
    print(f"DeepSeek validado: {len(slides)} slides HTML, {len(roteiro)} cenas, locução fiel ao roteiro.")

if __name__=="__main__": main()
