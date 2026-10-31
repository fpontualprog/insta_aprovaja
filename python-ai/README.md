# AprovaJá — IA local gratuita com Python

Este serviço lê materiais de estudo e gera resumos, mapas mentais textuais, questões comentadas, flashcards e textos para carrossel sem API de IA paga. A geração usa um modelo executado no próprio computador pelo Ollama. Os arquivos do Drive são baixados como cópias; os originais não são alterados.

## Requisitos
- Windows 10/11, macOS ou Linux
- Python 3.11 ou 3.12
- Ollama instalado: https://ollama.com/download
- Espaço em disco para o modelo e os documentos

O modelo qwen2.5:3b é uma opção inicial relativamente leve. Velocidade e qualidade dependem do computador. Não há cobrança por chamada de API: o processamento é local.

## Instalação no Windows (PowerShell)

    cd python-ai
    py -3.11 -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    Copy-Item .env.example .env
    ollama pull qwen2.5:3b

## Iniciar

    uvicorn app:app --host 127.0.0.1 --port 8000

Abra http://127.0.0.1:8000/docs para usar a API.

## Sincronizar o Google Drive público

Na documentação interativa, abra POST /sync-drive e clique em Try it out e Execute. O serviço tentará baixar cópias da pasta compartilhada. O gdown pode falhar se o Google aplicar limites temporários, a pasta for muito grande ou algum arquivo não puder ser baixado. Nesse caso, baixe os documentos pelo navegador e coloque cópias em python-ai/materiais.

Formatos lidos: PDF, DOCX, PPTX, TXT e MD. PDFs digitalizados sem camada de texto exigem OCR; OCR não está ativado nesta versão.

## Gerar conteúdo

Na página /docs, use POST /generate com este exemplo JSON:

    {
      "topic": "Controle de constitucionalidade",
      "kind": "questoes",
      "discipline": "Direito Constitucional",
      "quantity": 5,
      "exam_board": "CEBRASPE"
    }

Tipos aceitos: resumo, mapa_mental, questoes, flashcards e carrossel. A resposta contém o conteúdo e os arquivos/páginas recuperados. Revise questões, gabaritos e referências legais em fontes oficiais antes de publicar.\n\n## Fotografias de pessoas nas artes\n\nNa montagem, `render_instagram.py` consulta a API do Wikimedia Commons e tenta selecionar uma fotografia de pessoa. Só aceita licenças que permitem reutilização comercial (CC0, domínio público, CC BY e CC BY-SA), rejeitando licenças não comerciais ou sem derivações. A imagem é incorporada à capa; os créditos e os metadados da licença são gravados em `output/credito_fotografia.json` e incluídos no ZIP, e a legenda recebe a atribuição quando exigida. Se nenhuma imagem compatível for encontrada, a geração continua sem fotografia e registra esse resultado — nunca substitui por imagem sem licença verificada.\n\n## Artes para Instagram pelo GitHub Actions\n\nO workflow manual `.github/workflows/gerar-conteudo-ia.yml` gera o conteúdo, executa `python-ai/render_instagram.py` e monta um carrossel com identidade visual azul-marinho, branco e laranja. O resultado inclui imagens PNG individuais em 1080 × 1350 (proporção 4:5), `carrossel_instagram.zip` e `legenda_instagram.txt`. Ao terminar a execução, baixe o artefato `aprovaja-conteudo-gerado` na página do workflow. A arte usa tipografia e formas vetoriais desenhadas pelo Pillow; não depende de gerador de imagens pago. Confira o resultado visual e corrija manualmente qualquer quebra de linha ou texto antes de publicar.

## Endpoints
- GET /health — verifica Ollama e modelo
- GET /materials — lista os documentos locais lidos
- POST /sync-drive — baixa cópias da pasta pública
- POST /generate — recupera trechos relevantes e gera conteúdo com IA local

## Segurança e limitações
- Não exponha a porta 8000 diretamente à internet. Esta versão é para uso local.
- CORS não é autenticação.
- A pasta compartilhada por link pode ser acessada por qualquer pessoa que tenha o link; não coloque material privado nela.
- O serviço não altera, move ou exclui os originais do Drive.
- GitHub Pages e Netlify são hospedagens estáticas e não executam Python. Para usar esta API, Python e Ollama precisam estar ativos no computador. A integração direta do botão do site com a API é uma etapa separada e precisa ser testada no navegador.
- As bibliotecas Python são gratuitas/open source; confira a licença do modelo escolhido antes de redistribuí-lo.