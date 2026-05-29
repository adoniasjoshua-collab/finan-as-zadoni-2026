# Finanças Zadoni 2026

Este repositório contém um app estático de gestão financeira pessoal com:

- persistência local no navegador via `localStorage`
- controle de entradas e saídas
- meta caixa mínima com alerta e reserva
- gráficos e indicadores de evolução financeira
- histórico de mudanças de meta
- deploy pronto para GitHub Pages a partir da pasta `docs/`

## Estrutura do projeto

- `docs/` — conteúdo estático publicado pelo GitHub Pages
- `docs/index.html` — página principal do app
- `docs/app.js` — lógica de transações, filtros, gráficos e persistência
- `docs/style.css` — estilos do app
- `docs/modules/` — helpers de data, armazenamento e UI
- `.github/workflows/pages.yml` — workflow de deploy automático no GitHub Pages

## Como testar localmente

1. Abra `docs/index.html` no navegador.
2. Ou use um servidor local como o Live Server do VS Code apontando para `docs/`.
3. O app funciona como site estático sem backend.

## Deploy GitHub Pages

O deploy está configurado para publicar a pasta `docs/` a cada push no branch `main`.

### Passos para ativar o Pages no GitHub

1. Abra o repositório no GitHub.
2. Vá em **Settings > Pages**.
3. Selecione o branch `main` e a pasta `docs`.
4. Clique em **Save**.
5. Aguarde alguns minutos pela publicação.

### URL de publicação

Após ativar, a URL deve ser:

`https://adoniasjoshua-collab.github.io/finan-as-zadoni-2026/`

> Se aparecer o conteúdo do README ao invés da interface do app, verifique se a pasta `docs/` está selecionada corretamente nas configurações do Pages.

## Observações

- O app salva os dados no próprio navegador.
- O histórico de meta caixa também é persistido em `localStorage`.
- A pasta `docs/` contém o site final; o resto do repositório é para controle de versão e deploy.
