# Deploy Gestão Financeira Zadoni

Aplicação estática para controle financeiro pessoal extraída do projeto original `deploy-precheck-ajustado-2026-03-02`.

## Como usar

1. Abra `index.html` diretamente no navegador.
2. Para persistência local, use o armazenamento `localStorage` do navegador.
3. Registre entradas e saídas pessoais, aplique filtros e veja o dashboard com gráficos.

## Estrutura

- `index.html`: interface principal.
- `style.css`: estilos da aplicação.
- `app.js`: lógica do painel pessoal.
- `modules/calc.js`: helpers de data e formatação.
- `modules/data.js`: helper para ler/gravar JSON no `localStorage`.
- `modules/ui.js`: helpers de UI leves.
- `netlify.toml`: configuração para deploy estático no Netlify.
 
## Meta Caixa (Reserva mínima)

- A aplicação inclui a funcionalidade de `Meta Caixa` (valor mínimo recomendado para manter em caixa). Por padrão o valor é R$ 5.000,00.
- O valor padrão pode ser alterado pelo botão **Editar Meta Caixa** na interface.
- Há um botão **Reservar Meta Caixa** que marca o valor como reservado (indicador local): isso não move dinheiro, apenas sinaliza que essa quantia não deve ser considerada disponível.
- Ao salvar uma saída, o app verifica se essa saída deixaria o caixa disponível (saldo total menos reservas) abaixo da `Meta Caixa` e pede confirmação antes de registrar a saída.

Os valores de meta, reservas, filtros e lançamentos são mantidos no `localStorage` do navegador.

## Implantação

- Pode ser hospedado como site estático.
- No Netlify, a pasta deste pacote deve ser publicada como raiz do site.

## Observações

- Os dados ficam armazenados localmente no navegador.
- Se quiser redefinir os dados, use o botão `Limpar Lançamentos Pessoais`.
