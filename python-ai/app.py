from __future__ import annotations
import os, re
from pathlib import Path
from typing import Literal
import gdown, requests, fitz
from docx import Document
from pptx import Presentation
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
MATERIALS_DIR = Path(os.getenv("MATERIALS_DIR", str(BASE_DIR / "materiais"))).resolve()
DRIVE_URL = os.getenv("GOOGLE_DRIVE_FOLDER_URL", "https://drive.google.com/drive/folders/1EUof9_ZX-FiLA1GTi8le5AQpccKH08je?usp=sharing")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "50"))
SUPPORTED = {".pdf", ".docx", ".pptx", ".txt", ".md"}
app = FastAPI(title="AprovaJá — IA local gratuita", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["https://fpontualprog.github.io", "https://aprovajaconcurso.netlify.app", "http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5500", "http://127.0.0.1:5500"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])

class GenerateRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)
    kind: Literal["resumo", "mapa_mental", "questoes", "flashcards", "carrossel"] = "resumo"
    discipline: str = Field(default="Concursos públicos", max_length=120)
    quantity: int = Field(default=5, ge=1, le=20)
    exam_board: str = Field(default="CEBRASPE", max_length=80)

def extract_file(path: Path) -> list[dict]:
    chunks = []
    try:
        if path.suffix.lower() == ".pdf":
            with fitz.open(path) as pdf:
                for n, page in enumerate(pdf, 1):
                    t = page.get_text("text").strip()
                    if t: chunks.append({"text": t, "source": path.name, "page": n})
        elif path.suffix.lower() == ".docx":
            doc = Document(path)
            t = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            if t: chunks.append({"text": t, "source": path.name, "page": None})
            for i, table in enumerate(doc.tables, 1):
                t = "\n".join(" | ".join(c.text.strip() for c in row.cells) for row in table.rows)
                if t.strip(): chunks.append({"text": t, "source": f"{path.name} (tabela {i})", "page": None})
        elif path.suffix.lower() == ".pptx":
            prs = Presentation(path)
            for n, slide in enumerate(prs.slides, 1):
                parts = [s.text for s in slide.shapes if getattr(s, "has_text_frame", False) and s.text.strip()]
                if parts: chunks.append({"text": "\n".join(parts), "source": path.name, "page": n})
        else:
            t = path.read_text(encoding="utf-8", errors="ignore").strip()
            if t: chunks.append({"text": t, "source": path.name, "page": None})
    except Exception as exc:
        print(f"[aviso] Falha ao ler {path.name}: {exc}")
    return chunks

def load_chunks() -> list[dict]:
    MATERIALS_DIR.mkdir(parents=True, exist_ok=True)
    result = []
    for p in MATERIALS_DIR.rglob("*"):
        if p.is_file() and p.suffix.lower() in SUPPORTED and p.stat().st_size <= MAX_FILE_MB * 1024 * 1024:
            result.extend(extract_file(p))
    return result

def retrieve(topic: str, chunks: list[dict], limit: int = 8) -> list[dict]:
    if not chunks: return []
    docs = [re.sub(r"\s+", " ", c["text"])[:12000] for c in chunks]
    try:
        vec = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), strip_accents="unicode")
        matrix = vec.fit_transform(docs + [topic])
        scores = cosine_similarity(matrix[-1], matrix[:-1]).ravel()
        return [chunks[i] for i in scores.argsort()[::-1][:limit] if scores[i] > 0]
    except ValueError: return []

def make_prompt(req: GenerateRequest, sources: list[dict]) -> str:
    snippets = "\n\n".join(f"[Fonte: {s['source']}" + (f", página/slide {s['page']}" if s.get("page") else "") + f"]\n{s['text'][:9000]}" for s in sources)
    if not snippets:
        snippets = "Nenhum documento relevante foi encontrado na pasta local sincronizada. Informe claramente que a resposta é baseada em conhecimento geral e não finja ter consultado materiais."
    fmt = {
        "resumo": "Resumo didático com conceitos, tópicos-chave, exemplos e pegadinhas de concurso.",
        "mapa_mental": "Mapa mental textual hierárquico com tema central, ramos, sub-ramos, relações e palavras-chave.",
        "questoes": f"Crie {req.quantity} questões inéditas no estilo {req.exam_board}, com enunciado, alternativas quando adequado, gabarito e comentário fundamentado.",
        "flashcards": f"Crie {req.quantity} flashcards no formato Pergunta / Resposta, objetivos e úteis para revisão.",
        "carrossel": "Carrossel de Instagram com 7 slides: capa, cinco slides de conteúdo e fechamento/CTA; texto conciso."
    }[req.kind]
    return f"""Você é professor experiente de concursos públicos no Brasil. Escreva em português brasileiro.
Disciplina: {req.discipline}
Tema: {req.topic}
Formato: {req.kind}
Instrução: {fmt}
Use os materiais abaixo como fonte prioritária. Não invente citações, artigos de lei ou páginas. Sinalize lacunas e conflitos e recomende conferência em fonte oficial. Entregue conteúdo bem estruturado, sem enrolação. Ao final liste apenas as fontes efetivamente utilizadas, com página/slide quando houver. Se não houver fonte pertinente, diga isso explicitamente.
MATERIAIS RECUPERADOS:
{snippets}"""

@app.get("/health")
def health():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3); r.raise_for_status()
        models = [m.get("name", "") for m in r.json().get("models", [])]
        reachable = True
        available = any(m == OLLAMA_MODEL or m.startswith(OLLAMA_MODEL + ":") for m in models)
        detail = {"models_installed": models, "configured_model": OLLAMA_MODEL}
    except Exception as exc:
        reachable, available, detail = False, False, {"error": str(exc), "configured_model": OLLAMA_MODEL}
    return {"status": "ok", "service": "AprovaJá IA local", "ollama_reachable": reachable, "model_available": available, "details": detail}

@app.get("/materials")
def materials():
    chunks = load_chunks()
    names = sorted({c["source"].split(" (tabela")[0] for c in chunks})
    return {"files_read": len(names), "chunks_indexed": len(chunks), "files": names, "directory": str(MATERIALS_DIR)}

@app.post("/sync-drive")
def sync_drive():
    MATERIALS_DIR.mkdir(parents=True, exist_ok=True)
    try:
        downloaded = gdown.download_folder(url=DRIVE_URL, output=str(MATERIALS_DIR), quiet=False, use_cookies=False, remaining_ok=True)
        if downloaded is None:
            raise HTTPException(status_code=502, detail="O Drive não retornou arquivos. Confira o link público e possíveis limites temporários de download.")
        chunks = load_chunks()
        names = sorted({c["source"].split(" (tabela")[0] for c in chunks})
        return {"downloaded_entries": len(downloaded), "files_read": len(names), "chunks_indexed": len(chunks), "directory": str(MATERIALS_DIR), "files": names, "note": "Cópias locais baixadas; os originais do Drive não foram alterados."}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=502, detail=f"Falha ao sincronizar o Drive: {exc}")

@app.post("/generate")
def generate(req: GenerateRequest):
    sources = retrieve(req.topic, load_chunks())
    prompt = make_prompt(req, sources)
    try:
        r = requests.post(f"{OLLAMA_URL}/api/chat", json={"model": OLLAMA_MODEL, "messages": [{"role": "system", "content": "Produza material educacional confiável e transparente sobre incertezas."}, {"role": "user", "content": prompt}], "stream": False, "options": {"temperature": 0.35}}, timeout=300)
        if r.status_code == 404: raise HTTPException(status_code=503, detail=f"Modelo '{OLLAMA_MODEL}' não instalado. Execute: ollama pull {OLLAMA_MODEL}")
        r.raise_for_status()
        content = r.json().get("message", {}).get("content", "").strip()
        if not content: raise HTTPException(status_code=502, detail="O modelo local retornou conteúdo vazio.")
        refs = [{"source": s["source"], "page": s.get("page")} for s in sources]
        return {"content": content, "topic": req.topic, "kind": req.kind, "model": OLLAMA_MODEL, "sources": refs, "source_count": len(refs), "warning": None if refs else "Nenhuma fonte da pasta foi recuperada; revise o conteúdo antes de publicar."}
    except HTTPException: raise
    except requests.ConnectionError: raise HTTPException(status_code=503, detail="Ollama não está em execução. Instale e inicie o Ollama localmente.")
    except requests.Timeout: raise HTTPException(status_code=504, detail="O modelo local demorou demais. Tente um modelo menor.")
    except requests.RequestException as exc: raise HTTPException(status_code=502, detail=f"Erro ao chamar o modelo local: {exc}")
