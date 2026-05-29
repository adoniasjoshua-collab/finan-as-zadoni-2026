# Deploy no GitHub Pages

Esta versao foi revisada para rodar como frontend estatico. Os dados sao gravados no `localStorage` do navegador, sem Supabase, banco externo ou build.

## Publicar

1. Crie um repositorio no GitHub e envie estes arquivos para a branch principal.
2. No GitHub, abra `Settings` -> `Pages`.
3. Em `Build and deployment`, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Salve e aguarde o link do GitHub Pages.

## Observacoes

- Nao ha comando de build.
- O arquivo de entrada e `index.html`.
- Como os dados ficam no navegador, outro computador ou outro navegador comecara com base vazia.
- Limpar dados do site no navegador tambem apaga os registros salvos.
