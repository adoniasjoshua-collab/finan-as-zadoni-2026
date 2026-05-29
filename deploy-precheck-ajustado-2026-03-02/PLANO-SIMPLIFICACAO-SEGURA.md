# Plano de Simplificacao Segura

Este plano reduz complexidade em camadas, sem quebrar operacao nem historico.

## Etapa 1 (Aplicada)
- Modo gestao enxuta ativo por padrao.
- Foco diario no `Caixa` com KPIs criticos.
- ROI Ads simplificado incluido no `Caixa`.
- Modulos avancados ocultos por padrao, com botao para reativar.

## Etapa 2 (Aplicada)
- Compras, saidas, distribuicoes e ads unificados em um unico fluxo de movimentacoes.
- Tabela unica de movimentacoes no `Caixa` para consulta e exclusao.
- Formularios antigos mantidos como `advanced-only` para seguranca operacional.

## Etapa 3 (Aplicada)
- Modelo consolidado de movimentacoes com ledger unificado (`zadoni_movements_v1`).
- Persistencia legada mantida para compatibilidade (`purchases`, `withdrawals`, `partnerContributions`, `adsInvestments`).
- Hidratacao automatica dos dados legados a partir do ledger quando necessario.

## Etapa 4 (Aplicada)
- `app.js` passou a usar modulos especializados:
  - `modules/data.js` (persistencia e ledger)
  - `modules/calc.js` (datas e arredondamento)
  - `modules/ui.js` (helpers de visibilidade/classe)
  - `modules/sync.js` (helpers de sincronizacao Supabase)
- Integracao incremental para reduzir risco de regressao.

## Proximo ciclo sugerido
- Migrar gradualmente calculos de relatorio para `modules/calc.js`.
- Migrar gradualmente logica de tela para `modules/ui.js`.
- No fim, reduzir `app.js` para orquestracao.
