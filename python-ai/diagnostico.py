import json
import os
from pathlib import Path
from datetime import datetime, timezone
import requests

BASE_URL = "http://127.0.0.1:8000"
OUT = Path("output")
OUT.mkdir(exist_ok=True)
report = {
    "executed_at_utc": datetime.now(timezone.utc).isoformat(),
    "topic": os.environ.get("TEMA", ""),
    "discipline": os.environ.get("DISCIPLINA", ""),
    "stages": {}, "sources": [], "warnings": [],
}
def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception as exc:
        return {"_read_error": str(exc)}

sync = read_json(OUT / "sincronizacao.json")
if "_read_error" in sync:
    report["stages"]["drive_sync"] = {"status":"ERROR","message":"Não foi possível ler o resultado da sincronização.","detail":sync["_read_error"]}
elif sync.get("status") == "partial":
    report["stages"]["drive_sync"] = {"status":"PARTIAL","message":"O Drive foi percorrido parcialmente; os arquivos baixados foram preservados.","files_read":sync.get("files_read",0),"chunks_indexed":sync.get("chunks_indexed",0),"detail":sync.get("error")}
elif sync.get("detail") or sync.get("error"):
    report["stages"]["drive_sync"] = {"status":"ERROR","message":"A sincronização do Drive informou erro.","detail":sync.get("detail") or sync.get("error")}
else:
    report["stages"]["drive_sync"] = {"status":"OK","message":"A etapa de sincronização retornou resultado.","files_read":sync.get("files_read",0),"chunks_indexed":sync.get("chunks_indexed",0)}

try:
    response = requests.get(f"{BASE_URL}/materials", timeout=120)
    response.raise_for_status()
    materials = response.json()
    report["materials"] = materials
    count = int(materials.get("files_read", 0))
    report["stages"]["file_reading"] = {"status":"OK" if count else "ERROR","message":f"{count} arquivo(s) legível(is); {materials.get('chunks_indexed',0)} bloco(s) de texto extraído(s).","files_read":count,"chunks_indexed":materials.get("chunks_indexed",0),"files":materials.get("files",[])}
except Exception as exc:
    report["stages"]["file_reading"] = {"status":"ERROR","message":"Não foi possível consultar os materiais lidos.","detail":str(exc)}

payload = {
    "topic": report["topic"], "discipline": report["discipline"],
    "kind": os.environ.get("FORMATO", "resumo"),
    "quantity": max(1, min(10, int(os.environ.get("QUANTIDADE", "5")))),
    "exam_board": os.environ.get("BANCA", "CEBRASPE"),
}
try:
    response = requests.post(f"{BASE_URL}/generate", json=payload, timeout=660)
    response.raise_for_status()
    data = response.json()
    report["generation"] = {"model":data.get("model"),"kind":data.get("kind"),"content_chars":len(data.get("content","")),"warnings":data.get("warnings",[])}
    report["sources"] = data.get("sources", [])
    retrieval = data.get("retrieval", {})
    selected = int(retrieval.get("passages_selected", data.get("source_count", 0)) or 0)
    report["retrieval"] = retrieval
    report["stages"]["topic_retrieval"] = {"status":"OK" if selected else "WARNING","message":f"{selected} trecho(s) local(is) selecionado(s) para o tema.","sources":data.get("sources",[]),"details":retrieval}
    report["stages"]["ai_generation"] = {"status":"OK" if data.get("content","").strip() else "ERROR","message":"Conteúdo gerado pelo modelo." if data.get("content","").strip() else "O modelo retornou conteúdo vazio.","model":data.get("model"),"warnings":data.get("warnings",[])}
    if not selected:
        report["warnings"].append("Nenhum trecho local relevante foi recuperado. O conteúdo não está fundamentado nos materiais do Drive.")
    if data.get("warnings"):
        report["warnings"].extend(data["warnings"])
    with (OUT / "conteudo.md").open("w", encoding="utf-8") as f:
        f.write("# " + data.get("topic", payload["topic"]) + "\n\n")
        f.write("**Disciplina:** " + payload["discipline"] + "  \n")
        f.write("**Formato:** " + payload["kind"] + "  \n")
        f.write("**Modelo:** " + str(data.get("model", "não informado")) + "\n\n")
        if report["warnings"]:
            f.write("> **Revisar antes de publicar:** " + "; ".join(report["warnings"]) + "\n\n")
        f.write(data.get("content", "") + "\n\n")
        f.write("## Fontes recuperadas pelo sistema\n")
        if report["sources"]:
            for source in report["sources"]:
                page = f", página/slide {source['page']}" if source.get("page") else ""
                f.write(f"- {source['source']}{page}\n")
        else:
            f.write("- Nenhuma fonte local relevante foi recuperada para este tema.\n")
except Exception as exc:
    report["stages"]["topic_retrieval"] = report["stages"].get("topic_retrieval", {"status":"ERROR","message":"A etapa de busca/geração não foi concluída."})
    report["stages"]["ai_generation"] = {"status":"ERROR","message":"Não foi possível gerar o conteúdo.","detail":str(exc)}
    report["warnings"].append(f"Falha na geração: {exc}")
    (OUT / "conteudo.md").write_text("# Diagnóstico AprovaJá\n\nNão foi possível gerar o conteúdo. Consulte relatorio-diagnostico.md para ver a etapa que falhou.\n", encoding="utf-8")

order = [("drive_sync","Conexão e sincronização com o Drive"),("file_reading","Leitura dos arquivos"),("topic_retrieval","Recuperação de trechos para o tema"),("ai_generation","Geração do conteúdo pela IA")]
lines = ["# Relatório automático — AprovaJá","","- **Tema:** " + report["topic"],"- **Disciplina:** " + report["discipline"],"- **Executado em (UTC):** " + report["executed_at_utc"],"","## Resultado por etapa",""]
for key, title in order:
    stage = report["stages"].get(key, {"status":"NOT_RUN","message":"Etapa não executada."})
    lines.append("### " + title + " — " + stage.get("status", "NOT_RUN"))
    lines.append(stage.get("message", ""))
    if stage.get("detail"):
        lines.append("- Detalhe técnico: " + str(stage["detail"]))
    if key == "topic_retrieval" and stage.get("sources"):
        for source in stage["sources"]:
            page = f", página/slide {source['page']}" if source.get("page") else ""
            lines.append(f"- Fonte: {source.get('source', 'arquivo não identificado')}{page}")
    lines.append("")
if report["warnings"]:
    lines += ["## Alertas", ""] + ["- " + warning for warning in report["warnings"]] + [""]
lines += ["## Interpretação","","- **OK:** etapa concluída.","- **PARTIAL:** parte da biblioteca foi acessada; a sincronização não está completa.","- **WARNING:** etapa executada, mas sem evidência suficiente para considerar o resultado fundamentado.","- **ERROR:** etapa falhou e precisa de correção.","","Revise o conteúdo antes de publicar, especialmente questões, gabaritos e referências legais."]
(OUT / "relatorio-diagnostico.md").write_text("\n".join(lines), encoding="utf-8")
(OUT / "relatorio-diagnostico.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print("\n".join(lines))
