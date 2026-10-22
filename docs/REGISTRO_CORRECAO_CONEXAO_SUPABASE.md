# Registro de correção — conexão do Insta AprovaJá com Supabase

Data: 22/10/2026  
Repositório: `fpontualprog/insta_aprovaja`  
Hospedagem: GitHub Pages  
Projeto Supabase: `nukddukqilhsdklocout`

## Sintoma
O painel ficava parado em “Verificando conexão com o Supabase…” depois das alterações relacionadas à geração de vídeos para Stories. O Supabase estava com status `ACTIVE_HEALTHY`.

## Causa identificada
Havia sequências literais `\n` fora de strings em `app.js`, na região do gerador em lote. Isso podia causar erro de sintaxe e impedir a execução do arquivo JavaScript inteiro. Além disso, a checagem de saúde usava `/auth/v1/health` sem timeout, podendo deixar a interface presa caso a chamada não terminasse.

## Correções aplicadas
1. Removidas as sequências literais `\n` que estavam fora de lugar em `app.js`.
2. A verificação de conexão passou a consultar `/rest/v1/` com `AbortController` e timeout de 8 segundos.
3. Atualizado o `index.html` para carregar `app.js?v=624d6f68`, evitando reutilização da versão antiga em cache.
4. O usuário confirmou que o painel reconectou após essas alterações.

## Commits
- `a85cb56a0856239f99b1ecf2436213bd2a8783e9` — correção inicial de sintaxe.
- `cd361bd126e93f61c4bf9825d3fd326b1f6e6a94` — remoção de outra sequência literal fora do lugar.
- `624d6f687ca3590991c8956482023eff9575e9ac` — timeout na checagem de conexão.
- `781cc09647bc030e672ea19d9792f325b12bb5d4` — atualização da referência ao JavaScript para invalidar cache.

## Procedimento para ocorrências futuras
1. Conferir primeiro o Console do navegador e validar se `app.js` tem erro de sintaxe.
2. Procurar sequências literais `\n` fora de strings/comentários, especialmente perto de código recém-inserido.
3. Confirmar que a checagem de conexão tem timeout e mostra erro específico.
4. Após publicar correção, invalidar o cache alterando a query string de `app.js` no `index.html` (por exemplo, `app.js?v=<hash-do-commit>`).
5. Fazer recarga forçada e confirmar o resultado com o usuário.
6. Não alterar políticas de autenticação, chaves ou configuração do banco para corrigir um problema de sintaxe/front-end.
