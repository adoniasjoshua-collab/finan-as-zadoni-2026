﻿(function () {
  'use strict';

  const STORAGE_PRODUCTS = 'zadoni_products_v1';
  const STORAGE_SALES = 'zadoni_sales_v2';
  const STORAGE_PURCHASES = 'zadoni_purchases_v1';
  const STORAGE_WITHDRAWALS = 'zadoni_withdrawals_v1';
  const STORAGE_PARTNER_CONTRIBUTIONS = 'zadoni_partner_contributions_v1';
  const STORAGE_PARTNER_GOALS = 'zadoni_partner_goals_v1';
  const STORAGE_PERSONAL_TRANSACTIONS = 'zadoni_personal_transactions_v1';
  const STORAGE_ADS_INVESTMENTS = 'zadoni_ads_investments_v1';
  const STORAGE_SUPABASE_SETTINGS = 'zadoni_supabase_settings_v1';
  const STORAGE_CANONICAL_ID_MAP = 'zadoni_canonical_id_map_v1';
  const STORAGE_CYCLE_ALERT_STATE = 'zadoni_cycle_alert_state_v1';
  const STORAGE_HELP_GUIDE_PROGRESS = 'zadoni_help_guide_progress_v1';
  const STORAGE_HELP_GUIDE_EVENTS = 'zadoni_help_guide_events_v1';
  const STORAGE_DAILY_CLOSINGS = 'zadoni_daily_closings_v1';
  const STORAGE_UI_ADVANCED_MODE = 'zadoni_ui_advanced_mode_v1';
  const STORAGE_MOVEMENTS = 'zadoni_movements_v1';
  const FRONTEND_ONLY_MODE = true;
  const ZadoniModules = window.ZadoniModules || {};
  const CalcModule = ZadoniModules.calc || {};
  const DataModule = ZadoniModules.data || {};
  const UiModule = ZadoniModules.ui || {};
  const SyncModule = ZadoniModules.sync || {};
  const DEFAULT_SUPABASE_SETTINGS = {
    url: '',
    anonKey: '',
    adminMode: false,
    enabled: false
  };
  const SUPABASE_TABLES = {
    products: 'zd_products',
    sales: 'zd_sales',
    purchases: 'zd_purchases',
    withdrawals: 'zd_withdrawals',
    partnerContributions: 'zd_partner_contributions',
    partnerGoals: 'zd_partner_goals',
    personalTransactions: 'zd_personal_transactions',
    adsInvestments: 'zd_ads_investments'
  };
  const SUPABASE_REQUIRED_TABLES = Object.keys(SUPABASE_TABLES).map(function (key) {
    return SUPABASE_TABLES[key];
  });
  const PARTNERS = ['Adonias', 'Zaine', 'Mayza', 'Dizimo'];
  const SALE_CHANNELS = ['Presencial', 'Facebook Ads', 'Instagram Orgânico', 'WhatsApp', 'Indicação', 'Outro'];
  const SALE_CHANNEL_COLORS = ['#0f766e', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];
  const DEFAULT_SALE_CHANNEL = 'Presencial';
  const PERSONAL_HEALTH_THRESHOLDS = {
    red: 45,
    yellow: 70
  };
  const ALLOCATION_BASE_MODEL = {
    tithe: 0.10,
    emergency: 0.15,
    debt: 0.10,
    proLabore: 0.10,
    growth: 0,
    operational: 0.55
  };
  const ALLOCATION_GROWTH_MODEL = {
    tithe: 0.10,
    emergency: 0.15,
    debt: 0.10,
    proLabore: 0.10,
    growth: 0.10,
    operational: 0.45
  };
  const DYNAMIC_REPURCHASE_WINDOW_PRIMARY_DAYS = 60;
  const DYNAMIC_REPURCHASE_WINDOW_FALLBACK_DAYS = 30;
  const DYNAMIC_REPURCHASE_BUFFER_RATIO = 0.08;
  const DYNAMIC_REPURCHASE_MIN_RATIO = 0.40;
  const DYNAMIC_REPURCHASE_MAX_RATIO = 0.80;
  const EMERGENCY_TARGET_MONTHS = 2.5;
  const EMERGENCY_LOOKBACK_DAYS = 60;
  const DISTRIBUTION_REPURCHASE_LOOKAHEAD_DAYS = 30;
  const INVENTORY_TURNOVER_LOOKBACK_DAYS = 60;
  const REPLACEMENT_NEED_BUFFER_RATIO = 0.05;
  const DAILY_CHECKLIST_MAX_HISTORY = 180;
  const DAILY_CHECKLIST_MONEY_TOLERANCE = 1;
  const DAILY_CHECKLIST_MONEY_WARNING = 25;
  const DAILY_CHECKLIST_PERCENT_TOLERANCE = 0.6;
  const DAILY_CHECKLIST_PERCENT_WARNING = 2;
  const TRANSFER_TYPE = 'TRANSFERENCIA';
  const INVESTMENT_TYPE = 'INVESTIMENTO';
  const ADVANCED_TAB_NAMES = ['purchases'];
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const DEBT_KEYWORDS = ['divida', 'dívida', 'debt'];
  const TRANSFER_KEYWORDS = ['transfer', 'transferencia', 'transferência'];
  const INVESTMENT_KEYWORDS = ['investimento', 'investment', 'cdb', 'rdb', 'b3'];
  const HELP_GUIDE_CONTENT = {
    business: {
      label: 'Negócio',
      topics: [
        {
          id: 'operacional_recompra',
          title: 'Saldo Operacional e Recompra',
          definition: 'Saldo operacional é o dinheiro disponível para manter o negócio rodando. Recompra é o valor necessário para repor estoque e continuar vendendo.',
          examples: [
            'Exemplo: o caixa operacional está em R$ 5.000 e a recompra prevista para 30 dias é R$ 3.200. Cobertura está saudável.',
            'Exemplo: o caixa operacional está em R$ 1.800 e a recompra prevista é R$ 3.200. Há risco de ruptura.'
          ],
          actions: [
            'Priorize reposição dos itens com mais giro e melhor margem.',
            'Adie retiradas não essenciais até recuperar cobertura de recompra.',
            'Negocie prazo com fornecedor quando a cobertura estiver abaixo de 1,0x.'
          ],
          quiz: [
            {
              id: 'biz_q1',
              question: 'Se a cobertura de recompra está em 0,7x, qual é a melhor ação imediata?',
              options: [
                'Aumentar distribuição para os sócios.',
                'Priorizar recompras essenciais e reduzir saídas não críticas.',
                'Ignorar porque vendas futuras resolverão.'
              ],
              correctIndex: 1,
              explanation: 'Cobertura abaixo de 1,0x indica risco de faltar produto. O foco deve ser proteger operação.'
            },
            {
              id: 'biz_q2',
              question: 'O que representa a necessidade de recompra em 30 dias?',
              options: [
                'Uma estimativa do capital para reposição de estoque no curto prazo.',
                'Somente despesas fixas administrativas.',
                'A soma de todos os investimentos pessoais.'
              ],
              correctIndex: 0,
              explanation: 'Ela estima quanto caixa deve ficar reservado para continuar vendendo sem ruptura.'
            }
          ]
        },
        {
          id: 'reserva_emergencia',
          title: 'Reserva de Emergência',
          definition: 'A reserva é um colchão para absorver quedas de venda, atrasos de clientes e imprevistos sem quebrar o caixa.',
          examples: [
            'Exemplo: meta de reserva = 2,5 meses de despesas essenciais.',
            'Exemplo: se despesas essenciais mensais são R$ 2.000, meta da reserva é R$ 5.000.'
          ],
          actions: [
            'Não use reserva para despesas de rotina enquanto houver caixa operacional.',
            'Revise a meta de reserva quando o custo fixo mensal mudar.',
            'Só acelere crescimento quando reserva e recompra estiverem cobertas.'
          ],
          quiz: [
            {
              id: 'biz_q3',
              question: 'A reserva de emergência deve ser usada para quê?',
              options: [
                'Cobrir imprevistos e proteger continuidade da operação.',
                'Aumentar distribuição mensal em ciclos bons.',
                'Comprar itens sem demanda validada.'
              ],
              correctIndex: 0,
              explanation: 'Reserva serve para segurança do negócio, não para elevar risco operacional.'
            },
            {
              id: 'biz_q4',
              question: 'Quando a meta de reserva deve ser recalculada?',
              options: [
                'Quando despesas essenciais ou estrutura de custos mudarem.',
                'Somente no fim do ano.',
                'Nunca; meta é fixa.'
              ],
              correctIndex: 0,
              explanation: 'Meta precisa refletir a realidade atual de custos.'
            }
          ]
        },
        {
          id: 'distribuicao_segura',
          title: 'Distribuição Segura',
          definition: 'Distribuição só deve ocorrer após preservar o piso de segurança: reserva de emergência + necessidade de recompra.',
          examples: [
            'Exemplo: saldo operacional R$ 8.000; piso de segurança R$ 6.500; distribuível seguro = R$ 1.500.',
            'Exemplo: saldo operacional R$ 4.000; piso R$ 6.500; distribuível seguro = R$ 0.'
          ],
          actions: [
            'Use sempre o valor distribuível seguro como limite máximo.',
            'Se bloqueado, priorize margem, giro e redução de saídas.',
            'Comunique ao time que proteção do caixa evita interrupção de vendas.'
          ],
          quiz: [
            {
              id: 'biz_q5',
              question: 'Se o piso de segurança é maior que o saldo operacional, o que fazer?',
              options: [
                'Distribuir uma parte pequena mesmo assim.',
                'Não distribuir e focar recuperação de caixa.',
                'Ignorar a regra no mês atual.'
              ],
              correctIndex: 1,
              explanation: 'Distribuir nessas condições aumenta risco de ruptura e desequilíbrio.'
            },
            {
              id: 'biz_q6',
              question: 'Qual regra evita distribuição arriscada?',
              options: [
                'Distribuir pelo lucro contábil.',
                'Distribuir após preservar reserva + recompra projetada.',
                'Distribuir valor fixo todo mês.'
              ],
              correctIndex: 1,
              explanation: 'A regra segura considera caixa real e continuidade da operação.'
            }
          ]
        },
        {
          id: 'seguranca_operacao',
          title: 'Segurança e Boas Práticas',
          definition: 'Operar com segurança significa evitar exposição de dados sensíveis e impedir ações que alterem caixa real sem validação.',
          examples: [
            'Exemplo: o treino gamificado não lança registros reais, apenas atualiza progresso educativo.',
            'Exemplo: ações sensíveis continuam protegidas por validações e modo administrativo quando aplicável.'
          ],
          actions: [
            'Nunca compartilhar chaves ou senhas no uso diário.',
            'Revisar alertas antes de confirmar saídas e distribuições.',
            'Usar o manual para padronizar decisões entre operadores.'
          ],
          quiz: [
            {
              id: 'biz_q7',
              question: 'Qual prática aumenta segurança operacional?',
              options: [
                'Executar decisões sem revisar alertas.',
                'Usar validações e manter dados sensíveis protegidos.',
                'Desativar confirmações para ganhar velocidade.'
              ],
              correctIndex: 1,
              explanation: 'Segurança reduz erros e riscos de perda financeira.'
            },
            {
              id: 'biz_q8',
              question: 'O treino gamificado altera o caixa real?',
              options: [
                'Sim, porque usa os mesmos botões de lançamento.',
                'Não, é um ambiente de prática e aprendizado.',
                'Depende do usuário.'
              ],
              correctIndex: 1,
              explanation: 'O treino foi separado para ser seguro e educativo.'
            }
          ]
        }
      ]
    },
    personal: {
      label: 'Finanças Pessoais',
      topics: [
        {
          id: 'saldo_pessoal',
          title: 'Saldo e Temperatura Pessoal',
          definition: 'Saldo pessoal é entradas menos saídas. Temperatura financeira mostra se seu ritmo de gastos está saudável.',
          examples: [
            'Exemplo: entradas R$ 3.000 e saídas R$ 2.100 geram saldo R$ 900.',
            'Exemplo: saídas maiores que entradas por vários períodos indicam risco.'
          ],
          actions: [
            'Acompanhe semanalmente o índice de saúde pessoal.',
            'Defina limite de gasto por categoria.',
            'Corte primeiro gastos de baixo impacto de vida.'
          ],
          quiz: [
            {
              id: 'per_q1',
              question: 'Qual cenário indica melhora de saúde financeira pessoal?',
              options: [
                'Saídas recorrentes maiores que entradas.',
                'Entradas consistentes e saídas dentro do limite.',
                'Uso frequente de recursos emergenciais.'
              ],
              correctIndex: 1,
              explanation: 'Sustentabilidade pessoal exige equilíbrio entre entradas e saídas.'
            },
            {
              id: 'per_q2',
              question: 'Para que serve a temperatura financeira pessoal?',
              options: [
                'Mostrar tendência de risco/controle de gastos.',
                'Substituir o controle de caixa do negócio.',
                'Definir preço de venda.'
              ],
              correctIndex: 0,
              explanation: 'Ela é um indicador rápido de comportamento financeiro pessoal.'
            }
          ]
        },
        {
          id: 'uso_prolabore',
          title: 'Uso de Pró-labore com Disciplina',
          definition: 'Pró-labore é remuneração do sócio e deve ser usada com regra. Misturar caixa pessoal e empresarial sem controle causa desequilíbrio.',
          examples: [
            'Exemplo: registrar uso de pró-labore evita saídas pessoais sem lastro.',
            'Exemplo: sem saldo de pró-labore, o sistema bloqueia saída pessoal com recurso da empresa.'
          ],
          actions: [
            'Planeje retirada pessoal dentro do limite disponível.',
            'Se precisar além do limite, registrar como fonte externa.',
            'Evite financiar gasto pessoal com caixa operacional.'
          ],
          quiz: [
            {
              id: 'per_q3',
              question: 'Quando usar saldo de pró-labore?',
              options: [
                'Sempre que houver gasto pessoal, sem limite.',
                'Somente quando houver saldo disponível e registro correto.',
                'Apenas no fim do ano.'
              ],
              correctIndex: 1,
              explanation: 'Disciplina no pró-labore protege tanto pessoa quanto negócio.'
            },
            {
              id: 'per_q4',
              question: 'Se não há saldo de pró-labore, uma saída pessoal deve:',
              options: [
                'Ser registrada como fonte externa.',
                'Ser forçada no caixa do negócio.',
                'Ficar sem registro.'
              ],
              correctIndex: 0,
              explanation: 'Registrar fonte correta evita distorções e riscos de caixa.'
            }
          ]
        },
        {
          id: 'planejamento_mensal',
          title: 'Planejamento Mensal Simples',
          definition: 'Planejar o mês reduz improviso. Defina metas de entrada, teto de saída e limites por categoria.',
          examples: [
            'Exemplo: meta de poupar 15% da renda mensal.',
            'Exemplo: teto para lazer evita comprometimento do saldo.'
          ],
          actions: [
            'Revisar orçamento no início de cada ciclo.',
            'Ajustar categorias que estouraram no mês anterior.',
            'Manter reserva pessoal mínima para urgências.'
          ],
          quiz: [
            {
              id: 'per_q5',
              question: 'Qual é o primeiro passo de um planejamento pessoal simples?',
              options: [
                'Definir metas de entrada e teto de saída.',
                'Aguardar sobrar dinheiro.',
                'Aumentar despesas fixas.'
              ],
              correctIndex: 0,
              explanation: 'Planejamento começa com limites claros.'
            },
            {
              id: 'per_q6',
              question: 'O que fazer quando uma categoria estoura o teto?',
              options: [
                'Ignorar e repetir no próximo mês.',
                'Revisar e reduzir gastos daquela categoria.',
                'Compensar com retirada extra do negócio.'
              ],
              correctIndex: 1,
              explanation: 'Ajuste rápido evita efeito bola de neve.'
            }
          ]
        },
        {
          id: 'seguranca_pessoal',
          title: 'Segurança e Privacidade Pessoal',
          definition: 'Registros pessoais exigem privacidade. O objetivo é controle financeiro sem exposição desnecessária.',
          examples: [
            'Exemplo: informações do manual não precisam conter dados bancários sensíveis.',
            'Exemplo: treino registra apenas progresso de aprendizado.'
          ],
          actions: [
            'Evite anotar senhas/chaves em observações.',
            'Use descrições financeiras claras e sem dados sensíveis.',
            'Acompanhe histórico para identificar padrões de risco.'
          ],
          quiz: [
            {
              id: 'per_q7',
              question: 'Qual prática protege sua privacidade financeira?',
              options: [
                'Evitar dados sensíveis em observações.',
                'Compartilhar credenciais com operadores.',
                'Usar mesma senha para tudo.'
              ],
              correctIndex: 0,
              explanation: 'Privacidade começa no cuidado com os dados registrados.'
            },
            {
              id: 'per_q8',
              question: 'Qual é o objetivo da trilha gamificada pessoal?',
              options: [
                'Alterar lançamentos automaticamente.',
                'Treinar decisões e compreensão com segurança.',
                'Substituir totalmente o controle financeiro.'
              ],
              correctIndex: 1,
              explanation: 'A trilha é educacional e não altera lançamentos reais.'
            }
          ]
        }
      ]
    }
  };
  const HELP_GUIDE_EXTRA_QUESTIONS = {
    operacional_recompra: [
      {
        id: 'biz_q9',
        question: 'Se um produto vende rápido mas tem margem baixa, na recompra o melhor é:',
        options: [
          'Repor sem limite porque gira rápido.',
          'Repor com prioridade, mas revisar preço e custo para recuperar margem.',
          'Parar totalmente de vender mesmo com demanda.'
        ],
        correctIndex: 1,
        explanation: 'Giro sem margem pode cansar o caixa. O ideal é manter venda com ajuste de rentabilidade.',
        practicalExample: 'No cenário Zadoni, item de alto giro deve ser recomprado com meta de margem mínima para não consumir o caixa operacional.',
        nextStep: 'Revisar fornecedor e preço de venda dos itens de maior saída desta semana.'
      },
      {
        id: 'biz_q10',
        question: 'Quando a cobertura de recompra está abaixo de 1,0x, qual indicador deve ser monitorado primeiro?',
        options: [
          'Saldo distribuível seguro.',
          'Cor da interface do dashboard.',
          'Número de categorias cadastradas.'
        ],
        correctIndex: 0,
        explanation: 'Cobertura baixa pede foco em caixa protegido antes de qualquer distribuição.',
        practicalExample: 'Se recompra 30d está em R$ 4.000 e caixa em R$ 3.000, a cobertura está em 0,75x e a prioridade é recomposição de caixa.',
        nextStep: 'Suspender saídas não essenciais até cobertura voltar para 1,0x ou mais.'
      }
    ],
    reserva_emergencia: [
      {
        id: 'biz_q11',
        question: 'Se a meta de reserva aumentou após crescer as despesas fixas, a melhor prática é:',
        options: [
          'Ignorar a nova meta por 3 meses.',
          'Ajustar ritmo de saídas para recompor a reserva gradualmente.',
          'Compensar apenas com mais distribuição.'
        ],
        correctIndex: 1,
        explanation: 'A reserva precisa acompanhar a nova estrutura de custo para manter segurança.',
        practicalExample: 'Se despesas essenciais subiram com operação maior, manter meta antiga reduz proteção em queda de vendas.',
        nextStep: 'Planejar aporte semanal para reserva até atingir o novo alvo.'
      },
      {
        id: 'biz_q12',
        question: 'Qual comportamento enfraquece a reserva de emergência?',
        options: [
          'Usar reserva para cobrir despesas recorrentes sem ajuste de custo.',
          'Separar reserva em objetivo claro.',
          'Monitorar mensalmente a meta.'
        ],
        correctIndex: 0,
        explanation: 'Reserva usada como caixa do dia a dia deixa o negócio vulnerável a imprevistos.',
        practicalExample: 'No negócio Zadoni, usar reserva para rotina pode bloquear recompra quando surgir pico de demanda.',
        nextStep: 'Criar limite de uso: reserva só para eventos extraordinários.'
      }
    ],
    distribuicao_segura: [
      {
        id: 'biz_q13',
        question: 'Se o distribuível seguro calculado é R$ 900, qual é o limite correto de contribuição no ciclo?',
        options: [
          'Até R$ 900 no total do ciclo, respeitando o piso de segurança.',
          'Qualquer valor, desde que haja lucro contábil.',
          'No mínimo R$ 900 para cada sócio.'
        ],
        correctIndex: 0,
        explanation: 'Distribuição segura usa limite do caixa real protegido, não apenas lucro teórico.',
        practicalExample: 'Distribuir acima de R$ 900 reduziria reserva/recompra e aumenta chance de ruptura de estoque.',
        nextStep: 'Distribuir abaixo do limite e revisar no próximo fechamento semanal.'
      },
      {
        id: 'biz_q14',
        question: 'Qual sinal mostra que ainda não é hora de distribuir?',
        options: [
          'Cobertura de recompra acima de 1,2x.',
          'Piso de segurança maior que o saldo operacional.',
          'Reserva acima da meta e saídas controladas.'
        ],
        correctIndex: 1,
        explanation: 'Quando o piso supera o saldo, não há folga segura para retirar.',
        practicalExample: 'Com piso em R$ 6.000 e saldo em R$ 5.200, qualquer distribuição pressiona operação.',
        nextStep: 'Focar geração de caixa operacional antes de novo lançamento de contribuição.'
      }
    ],
    seguranca_operacao: [
      {
        id: 'biz_q15',
        question: 'Ao treinar operadores no manual, qual prática é mais segura?',
        options: [
          'Treinar direto em lançamentos reais.',
          'Usar trilha gamificada com progresso separado dos dados financeiros.',
          'Liberar todas as exclusões para acelerar o aprendizado.'
        ],
        correctIndex: 1,
        explanation: 'Treino em ambiente seguro reduz risco de erro contábil.',
        practicalExample: 'Na Zadoni, quiz salva apenas progresso educacional e não gera compra/venda/saída real.',
        nextStep: 'Exigir conclusão da trilha antes de liberar operador em rotina crítica.'
      },
      {
        id: 'biz_q16',
        question: 'Qual atitude reduz risco operacional em mudanças de equipe?',
        options: [
          'Cada operador usar regra própria.',
          'Padronizar decisão com manual + validações automáticas.',
          'Remover avisos para ganhar velocidade.'
        ],
        correctIndex: 1,
        explanation: 'Padronização diminui variação de decisão e falhas de processo.',
        practicalExample: 'Com regra única de distribuição segura, a equipe evita retiradas acima do limite.',
        nextStep: 'Registrar rotina padrão: revisar KPIs, validar alertas e só então lançar.'
      }
    ],
    saldo_pessoal: [
      {
        id: 'per_q9',
        question: 'Se o saldo pessoal ficou negativo por duas semanas, a ação mais eficiente é:',
        options: [
          'Aumentar gasto para aliviar estresse.',
          'Cortar categorias não essenciais e replanejar o teto semanal.',
          'Parar de registrar lançamentos.'
        ],
        correctIndex: 1,
        explanation: 'Ajuste rápido evita efeito acumulado de saldo negativo.',
        practicalExample: 'Quando transporte e lazer estouram juntos, limitar os dois por 14 dias ajuda recuperar equilíbrio.',
        nextStep: 'Definir teto semanal por categoria e acompanhar diariamente.'
      },
      {
        id: 'per_q10',
        question: 'Qual hábito melhora leitura da temperatura financeira pessoal?',
        options: [
          'Atualizar entradas e saídas com frequência.',
          'Lançar tudo apenas no final do mês.',
          'Registrar apenas valores altos.'
        ],
        correctIndex: 0,
        explanation: 'Dados frequentes tornam o indicador mais útil para decisão.',
        practicalExample: 'Atualização diária evita surpresas de saldo no fim do ciclo.',
        nextStep: 'Criar rotina de 5 minutos ao fim do dia para registrar movimentos.'
      }
    ],
    uso_prolabore: [
      {
        id: 'per_q11',
        question: 'Quando o pró-labore está baixo, a melhor decisão pessoal é:',
        options: [
          'Forçar uso do caixa da empresa.',
          'Reduzir saídas pessoais e usar fonte externa quando necessário.',
          'Parar de pagar despesas básicas.'
        ],
        correctIndex: 1,
        explanation: 'Protege o negócio e evita dependência de retirada sem cobertura.',
        practicalExample: 'Se pró-labore disponível está em R$ 400, gastos acima disso devem vir de fonte externa planejada.',
        nextStep: 'Listar gastos fixos pessoais e separar o que cabe no pró-labore atual.'
      },
      {
        id: 'per_q12',
        question: 'Qual prática evita confusão entre finanças pessoal e empresarial?',
        options: [
          'Registrar origem de cada saída pessoal.',
          'Misturar tudo na mesma categoria.',
          'Lançar apenas entradas.'
        ],
        correctIndex: 0,
        explanation: 'Sem origem clara, análise de saúde financeira perde precisão.',
        practicalExample: 'Marcar “Pró-labore” vs “Outra fonte” mostra dependência real do negócio.',
        nextStep: 'Padronizar observação curta com finalidade do gasto.'
      }
    ],
    planejamento_mensal: [
      {
        id: 'per_q13',
        question: 'Qual sequência é mais efetiva para planejar o mês pessoal?',
        options: [
          'Definir metas, distribuir limites por categoria e revisar semanalmente.',
          'Gastar normalmente e ajustar só no final.',
          'Definir apenas um teto geral sem categorias.'
        ],
        correctIndex: 0,
        explanation: 'Plano com revisão curta mantém controle ao longo do ciclo.',
        practicalExample: 'Meta de poupança + teto por categoria evita estourar gastos no meio do mês.',
        nextStep: 'Reservar dia fixo semanal para revisão de execução do orçamento.'
      },
      {
        id: 'per_q14',
        question: 'Se uma categoria estoura recorrente, o melhor ajuste é:',
        options: [
          'Aumentar teto sem analisar causa.',
          'Rever padrão de consumo e criar limite mais realista com ação corretiva.',
          'Ignorar porque já está lançado.'
        ],
        correctIndex: 1,
        explanation: 'Corrigir causa evita repetir o desvio no próximo ciclo.',
        practicalExample: 'Se alimentação excede sempre aos fins de semana, criar regra específica para esses dias.',
        nextStep: 'Aplicar limite diário para a categoria mais crítica nas próximas 2 semanas.'
      }
    ],
    seguranca_pessoal: [
      {
        id: 'per_q15',
        question: 'Qual informação deve ser evitada nas observações pessoais?',
        options: [
          'Dados sensíveis como senha, token ou chave completa.',
          'Descrição simples do objetivo do gasto.',
          'Categoria do lançamento.'
        ],
        correctIndex: 0,
        explanation: 'Dados sensíveis em texto livre elevam risco de exposição.',
        practicalExample: 'Anotar “pagamento conta X” é suficiente; não incluir credenciais.',
        nextStep: 'Revisar padrão de escrita das observações para manter privacidade.'
      },
      {
        id: 'per_q16',
        question: 'Qual benefício da trilha gamificada pessoal para o operador?',
        options: [
          'Treinar decisão sem risco de alterar histórico financeiro real.',
          'Excluir automaticamente lançamentos antigos.',
          'Aprovar gastos sem validação.'
        ],
        correctIndex: 0,
        explanation: 'Gamificação melhora aprendizado mantendo segurança dos dados.',
        practicalExample: 'Operador aprende a reagir a saldo negativo antes de atuar em rotinas reais.',
        nextStep: 'Concluir trilha completa e revisar os tópicos com menor acerto.'
      }
    ]
  };

  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const screens = Array.from(document.querySelectorAll('[data-screen]'));

  const productForm = document.getElementById('productForm');
  const productNameInput = document.getElementById('productName');
  const productCostInput = document.getElementById('productCost');
  const productSuggestedInput = document.getElementById('productSuggested');
  const productCategoryInput = document.getElementById('productCategory');
  const productDescriptionInput = document.getElementById('productDescription');
  const productSubmitBtn = document.getElementById('productSubmitBtn');
  const productCancelEditBtn = document.getElementById('productCancelEdit');
  const productsTableBody = document.getElementById('productsTableBody');

  const saleForm = document.getElementById('saleForm');
  const saleProductSelect = document.getElementById('saleProduct');
  const saleProductNamePreview = document.getElementById('saleProductNamePreview');
  const saleProductDescriptionDetails = document.getElementById('saleProductDescriptionDetails');
  const saleProductDescriptionPreview = document.getElementById('saleProductDescriptionPreview');
  const saleQuantityInput = document.getElementById('saleQuantity');
  const salePriceInput = document.getElementById('salePrice');
  const saleCostPreviewInput = document.getElementById('saleCostPreview');
  const saleExpenseInput = document.getElementById('saleExpense');
  const saleNotesInput = document.getElementById('saleNotes');
  const saleChannelInput = document.getElementById('saleChannel');
  const saleDateInput = document.getElementById('saleDate');
  const saleSubmitBtn = document.getElementById('saleSubmitBtn');
  const saleCancelEditBtn = document.getElementById('saleCancelEdit');

  const salesTableBody = document.getElementById('salesTableBody');
  const salesByChannelTableBody = document.getElementById('salesByChannelTableBody');
  const salesChannelPie = document.getElementById('salesChannelPie');
  const salesChannelLegend = document.getElementById('salesChannelLegend');
  const clearSalesBtn = document.getElementById('clearSales');
  const printProductsReportBtn = document.getElementById('printProductsReport');
  const printPurchasesReportBtn = document.getElementById('printPurchasesReport');
  const printPartnersReportBtn = document.getElementById('printPartnersReport');
  const printDashboardReportBtn = document.getElementById('printDashboardReport');
  const supabaseUrlInput = document.getElementById('supabaseUrl');
  const supabaseAnonKeyInput = document.getElementById('supabaseAnonKey');
  const supabaseAdminModeInput = document.getElementById('supabaseAdminMode');
  const supabaseStatusNode = document.getElementById('supabaseStatus');
  const supabaseMissingTablesNode = document.getElementById('supabaseMissingTables');
  const supabaseConnectBtn = document.getElementById('supabaseConnectBtn');
  const authEmailInput = document.getElementById('authEmail');
  const authPasswordInput = document.getElementById('authPassword');
  const authStatusNode = document.getElementById('authStatus');
  const authLoginBtn = document.getElementById('authLoginBtn');
  const authRegisterBtn = document.getElementById('authRegisterBtn');
  const authLogoutBtn = document.getElementById('authLogoutBtn');
  const supabaseCheckSchemaBtn = document.getElementById('supabaseCheckSchemaBtn');
  const supabaseDisconnectBtn = document.getElementById('supabaseDisconnectBtn');

  const filterStartDateInput = document.getElementById('filterStartDate');
  const filterEndDateInput = document.getElementById('filterEndDate');
  const filterSaleChannelInput = document.getElementById('filterSaleChannel');
  const applyFiltersBtn = document.getElementById('applyFilters');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const exportCsvBtn = document.getElementById('exportCsv');
  const printBtn = document.getElementById('printReport');

  const dashboardFilterStartDateInput = document.getElementById('dashboardFilterStartDate');
  const dashboardFilterEndDateInput = document.getElementById('dashboardFilterEndDate');
  const dashboardFilterSaleChannelInput = document.getElementById('dashboardFilterSaleChannel');
  const dashboardApplyFiltersBtn = document.getElementById('dashboardApplyFilters');
  const dashboardClearFiltersBtn = document.getElementById('dashboardClearFilters');

  const kpiRevenue = document.getElementById('kpiRevenue');
  const kpiCost = document.getElementById('kpiCost');
  const kpiExpenses = document.getElementById('kpiExpenses');
  const kpiNetProfit = document.getElementById('kpiNetProfit');
  const kpiMargin = document.getElementById('kpiMargin');
  const kpiPurchases = document.getElementById('kpiPurchases');
  const kpiOperationalAllocation = document.getElementById('kpiOperationalAllocation');
  const kpiRealProfit = document.getElementById('kpiRealProfit');
  const kpiWithdrawals = document.getElementById('kpiWithdrawals');
  const kpiDistributions = document.getElementById('kpiDistributions');
  const kpiCashBalance = document.getElementById('kpiCashBalance');
  const kpiEmergencyTarget = document.getElementById('kpiEmergencyTarget');
  const kpiCashRunwayDays = document.getElementById('kpiCashRunwayDays');
  const kpiRepurchaseCoverage = document.getElementById('kpiRepurchaseCoverage');
  const kpiRuptureRisk = document.getElementById('kpiRuptureRisk');
  const kpiInventoryTurnover = document.getElementById('kpiInventoryTurnover');
  const cashTrafficLight = document.getElementById('cashTrafficLight');
  const cashJarTithe = document.getElementById('cashJarTithe');
  const cashJarEmergency = document.getElementById('cashJarEmergency');
  const cashJarDebt = document.getElementById('cashJarDebt');
  const cashJarProLabore = document.getElementById('cashJarProLabore');
  const cashJarGrowth = document.getElementById('cashJarGrowth');
  const cashJarOperational = document.getElementById('cashJarOperational');
  const cashGrowthStatus = document.getElementById('cashGrowthStatus');
  const cashAllocationValidation = document.getElementById('cashAllocationValidation');
  const cashComparisonSummary = document.getElementById('cashComparisonSummary');
  const dailyChecklistStatus = document.getElementById('dailyChecklistStatus');
  const dailyChecklistItems = document.getElementById('dailyChecklistItems');
  const dailyCloseForm = document.getElementById('dailyCloseForm');
  const dailyCloseResponsibleInput = document.getElementById('dailyCloseResponsible');
  const dailyCloseDateInput = document.getElementById('dailyCloseDate');
  const dailyCloseBankCheckInput = document.getElementById('dailyCloseBankCheck');
  const dailyCloseNotesInput = document.getElementById('dailyCloseNotes');
  const dailyCloseSubmitBtn = document.getElementById('dailyCloseSubmit');
  const dailyCloseCancelEditBtn = document.getElementById('dailyCloseCancelEdit');
  const dailyCloseHistoryBody = document.getElementById('dailyCloseHistoryBody');
  const dashKpiRevenue = document.getElementById('dashKpiRevenue');
  const dashKpiOperational = document.getElementById('dashKpiOperational');
  const dashKpiCash = document.getElementById('dashKpiCash');
  const dashKpiOperationalAllocation = document.getElementById('dashKpiOperationalAllocation');
  const dashKpiTicket = document.getElementById('dashKpiTicket');
  const dashKpiEmergencyTarget = document.getElementById('dashKpiEmergencyTarget');
  const dashKpiRunwayDays = document.getElementById('dashKpiRunwayDays');
  const dashKpiRepurchaseCoverage = document.getElementById('dashKpiRepurchaseCoverage');
  const dashKpiRuptureRisk = document.getElementById('dashKpiRuptureRisk');
  const dashKpiInventoryTurnover = document.getElementById('dashKpiInventoryTurnover');
  const dashJarTithe = document.getElementById('dashJarTithe');
  const dashJarEmergency = document.getElementById('dashJarEmergency');
  const dashJarDebt = document.getElementById('dashJarDebt');
  const dashJarProLabore = document.getElementById('dashJarProLabore');
  const dashJarGrowth = document.getElementById('dashJarGrowth');
  const dashJarOperational = document.getElementById('dashJarOperational');
  const dashGrowthStatus = document.getElementById('dashGrowthStatus');
  const dashAllocationValidation = document.getElementById('dashAllocationValidation');
  const dashComparisonSummary = document.getElementById('dashComparisonSummary');
  const dashFbAdsInvestment = document.getElementById('dashFbAdsInvestment');
  const dashFbAdsRevenue = document.getElementById('dashFbAdsRevenue');
  const dashFbAdsProfit = document.getElementById('dashFbAdsProfit');
  const dashFbAdsRoi = document.getElementById('dashFbAdsRoi');
  const dashFbAdsReturnPerReal = document.getElementById('dashFbAdsReturnPerReal');
  const dashFbAdsRoiChart = document.getElementById('dashFbAdsRoiChart');
  const dashFbAdsRoiNote = document.getElementById('dashFbAdsRoiNote');
  const dashFbAdsRoiStatus = document.getElementById('dashFbAdsRoiStatus');
  const dashFbAdsRoiAction = document.getElementById('dashFbAdsRoiAction');
  const cashAdsRoiInvestment = document.getElementById('cashAdsRoiInvestment');
  const cashAdsRoiRevenue = document.getElementById('cashAdsRoiRevenue');
  const cashAdsRoiProfit = document.getElementById('cashAdsRoiProfit');
  const cashAdsRoi = document.getElementById('cashAdsRoi');
  const cashAdsRoiReturnPerReal = document.getElementById('cashAdsRoiReturnPerReal');
  const cashAdsRoiStatus = document.getElementById('cashAdsRoiStatus');
  const cashAdsRoiAction = document.getElementById('cashAdsRoiAction');
  const financeDiagnosisTitle = document.getElementById('financeDiagnosisTitle');
  const financeDiagnosisDetail = document.getElementById('financeDiagnosisDetail');
  const personalMixTitle = document.getElementById('personalMixTitle');
  const personalMixDetail = document.getElementById('personalMixDetail');
  const moneyDestinationList = document.getElementById('moneyDestinationList');
  const topSoldProductsList = document.getElementById('topSoldProductsList');
  const topExpensesList = document.getElementById('topExpensesList');
  const topRepurchaseList = document.getElementById('topRepurchaseList');
  const dashDonutChart = document.getElementById('dashDonutChart');
  const dashDonutLegend = document.getElementById('dashDonutLegend');
  const dashTrendChart = document.getElementById('dashTrendChart');
  const dashChannelBarChart = document.getElementById('dashChannelBarChart');
  const dashFlowChart = document.getElementById('dashFlowChart');
  const dashTopProductsChart = document.getElementById('dashTopProductsChart');
  const dashTopProductsSummary = document.getElementById('dashTopProductsSummary');
  const dashTicketTrendChart = document.getElementById('dashTicketTrendChart');

  const adsInvestmentForm = document.getElementById('adsInvestmentForm');
  const adsDateInput = document.getElementById('adsDate');
  const adsPlatformInput = document.getElementById('adsPlatform');
  const adsAmountInput = document.getElementById('adsAmount');
  const adsPaymentMethodInput = document.getElementById('adsPaymentMethod');
  const adsNotesInput = document.getElementById('adsNotes');
  const adsInvestmentsTableBody = document.getElementById('adsInvestmentsTableBody');

  const purchaseForm = document.getElementById('purchaseForm');
  const purchaseDateInput = document.getElementById('purchaseDate');
  const purchaseTypeInput = document.getElementById('purchaseType');
  const purchaseItemInput = document.getElementById('purchaseItem');
  const purchaseQuantityInput = document.getElementById('purchaseQuantity');
  const purchaseTotalInput = document.getElementById('purchaseTotal');
  const purchaseSupplierInput = document.getElementById('purchaseSupplier');
  const purchaseNotesInput = document.getElementById('purchaseNotes');
  const purchaseOtherFundingInput = document.getElementById('purchaseOtherFunding');
  const purchaseFundingSourceInput = document.getElementById('purchaseFundingSource');
  const purchasesTableBody = document.getElementById('purchasesTableBody');
  const clearPurchasesBtn = document.getElementById('clearPurchases');

  const withdrawalForm = document.getElementById('withdrawalForm');
  const withdrawalDateInput = document.getElementById('withdrawalDate');
  const withdrawalTypeInput = document.getElementById('withdrawalType');
  const withdrawalAmountInput = document.getElementById('withdrawalAmount');
  const withdrawalNotesInput = document.getElementById('withdrawalNotes');
  const withdrawalOtherFundingInput = document.getElementById('withdrawalOtherFunding');
  const withdrawalFundingSourceInput = document.getElementById('withdrawalFundingSource');
  const withdrawalsTableBody = document.getElementById('withdrawalsTableBody');
  const clearWithdrawalsBtn = document.getElementById('clearWithdrawals');
  const movementForm = document.getElementById('movementForm');
  const movementDateInput = document.getElementById('movementDate');
  const movementKindInput = document.getElementById('movementKind');
  const movementAmountInput = document.getElementById('movementAmount');
  const movementNotesInput = document.getElementById('movementNotes');
  const movementPurchaseTypeInput = document.getElementById('movementPurchaseType');
  const movementItemInput = document.getElementById('movementItem');
  const movementQuantityInput = document.getElementById('movementQuantity');
  const movementSupplierInput = document.getElementById('movementSupplier');
  const movementWithdrawalTypeInput = document.getElementById('movementWithdrawalType');
  const movementPartnerInput = document.getElementById('movementPartner');
  const movementAdsPlatformInput = document.getElementById('movementAdsPlatform');
  const movementAdsMethodInput = document.getElementById('movementAdsMethod');
  const movementOtherFundingInput = document.getElementById('movementOtherFunding');
  const movementFundingSourceInput = document.getElementById('movementFundingSource');
  const movementPurchaseTypeWrap = document.getElementById('movementPurchaseTypeWrap');
  const movementItemWrap = document.getElementById('movementItemWrap');
  const movementQuantityWrap = document.getElementById('movementQuantityWrap');
  const movementSupplierWrap = document.getElementById('movementSupplierWrap');
  const movementWithdrawalTypeWrap = document.getElementById('movementWithdrawalTypeWrap');
  const movementPartnerWrap = document.getElementById('movementPartnerWrap');
  const movementAdsPlatformWrap = document.getElementById('movementAdsPlatformWrap');
  const movementAdsMethodWrap = document.getElementById('movementAdsMethodWrap');
  const movementOtherFundingWrap = document.getElementById('movementOtherFundingWrap');
  const movementFundingSourceWrap = document.getElementById('movementFundingSourceWrap');
  const movementSubmitBtn = document.getElementById('movementSubmitBtn');
  const movementCancelEditBtn = document.getElementById('movementCancelEdit');
  const movementsTableBody = document.getElementById('movementsTableBody');

  const partnerForm = document.getElementById('partnerForm');
  const partnerGoalForm = document.getElementById('partnerGoalForm');
  const goalAdoniasInput = document.getElementById('goalAdoniasInput');
  const goalZaineInput = document.getElementById('goalZaineInput');
  const goalMayzaInput = document.getElementById('goalMayzaInput');
  const goalDizimoInput = document.getElementById('goalDizimoInput');
  const partnerNameInput = document.getElementById('partnerName');
  const partnerAmountInput = document.getElementById('partnerAmount');
  const partnerNotesInput = document.getElementById('partnerNotes');
  const partnerOtherFundingInput = document.getElementById('partnerOtherFunding');
  const partnerFundingSourceInput = document.getElementById('partnerFundingSource');
  const partnerCurrentCycleInfo = document.getElementById('partnerCurrentCycleInfo');
  const partnerMotivationMessage = document.getElementById('partnerMotivationMessage');
  const partnerCycleSelect = document.getElementById('partnerCycleSelect');
  const partnersTableBody = document.getElementById('partnersTableBody');
  const clearPartnerContributionsBtn = document.getElementById('clearPartnerContributions');
  const partnerKpiProfit = document.getElementById('partnerKpiProfit');
  const partnerKpiDistributed = document.getElementById('partnerKpiDistributed');
  const partnerKpiBalance = document.getElementById('partnerKpiBalance');
  const personalForm = document.getElementById('personalForm');
  const personalDateInput = document.getElementById('personalDate');
  const personalTypeInput = document.getElementById('personalType');
  const personalCategoryInput = document.getElementById('personalCategory');
  const personalAmountInput = document.getElementById('personalAmount');
  const personalNotesInput = document.getElementById('personalNotes');
  const personalUseBusinessFundsInput = document.getElementById('personalUseBusinessFunds');
  const personalFundingSourceInput = document.getElementById('personalFundingSource');
  const personalSubmitBtn = document.getElementById('personalSubmitBtn');
  const personalCancelEditBtn = document.getElementById('personalCancelEdit');
  const personalFilterStartDateInput = document.getElementById('personalFilterStartDate');
  const personalFilterEndDateInput = document.getElementById('personalFilterEndDate');
  const personalApplyFiltersBtn = document.getElementById('personalApplyFilters');
  const personalClearFiltersBtn = document.getElementById('personalClearFilters');
  const personalKpiEntries = document.getElementById('personalKpiEntries');
  const personalKpiExits = document.getElementById('personalKpiExits');
  const personalKpiBalance = document.getElementById('personalKpiBalance');
  const personalKpiHealth = document.getElementById('personalKpiHealth');
  const personalKpiProLaboreAvailable = document.getElementById('personalKpiProLaboreAvailable');
  const personalTemperatureLabel = document.getElementById('personalTemperatureLabel');
  const personalGaugeChart = document.getElementById('personalGaugeChart');
  const personalTimelineChart = document.getElementById('personalTimelineChart');
  const personalCategoryChart = document.getElementById('personalCategoryChart');
  const personalFundingChart = document.getElementById('personalFundingChart');
  const personalFundingNote = document.getElementById('personalFundingNote');
  const personalGaugeStatus = document.getElementById('personalGaugeStatus');
  const personalGaugeAdvice = document.getElementById('personalGaugeAdvice');
  const personalGaugeEntries = document.getElementById('personalGaugeEntries');
  const personalGaugeExits = document.getElementById('personalGaugeExits');
  const personalGaugeBalance = document.getElementById('personalGaugeBalance');
  const personalTableBody = document.getElementById('personalTableBody');
  const clearPersonalTransactionsBtn = document.getElementById('clearPersonalTransactions');
  const toggleAdvancedModulesBtn = document.getElementById('toggleAdvancedModulesBtn');
  const uiModeStatusNode = document.getElementById('uiModeStatus');
  const openGuideBtn = document.getElementById('openGuideBtn');
  const openPersonalGuideBtn = document.getElementById('openPersonalGuideBtn');
  const helpManualModal = document.getElementById('helpManualModal');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const helpScopeButtons = Array.from(document.querySelectorAll('[data-help-scope]'));
  const helpTopicList = document.getElementById('helpTopicList');
  const helpTopicTitle = document.getElementById('helpTopicTitle');
  const helpTopicDefinition = document.getElementById('helpTopicDefinition');
  const helpExamples = document.getElementById('helpExamples');
  const helpActions = document.getElementById('helpActions');
  const helpQuizMeta = document.getElementById('helpQuizMeta');
  const helpQuizQuestion = document.getElementById('helpQuizQuestion');
  const helpQuizOptions = document.getElementById('helpQuizOptions');
  const helpQuizNextBtn = document.getElementById('helpQuizNextBtn');
  const helpQuizResetBtn = document.getElementById('helpQuizResetBtn');
  const helpQuizFeedback = document.getElementById('helpQuizFeedback');
  const helpQuizScore = document.getElementById('helpQuizScore');
  const helpQuizCompletion = document.getElementById('helpQuizCompletion');

  let products = [];
  let editingProductId = '';
  let sales = [];
  let editingSaleId = '';
  let purchases = [];
  let withdrawals = [];
  let partnerContributions = [];
  let partnerGoals = { Adonias: 3000, Zaine: 3000, Mayza: 3000, Dizimo: 3000 };
  let personalTransactions = [];
  let adsInvestments = [];
  let dailyClosings = [];
  let selectedPartnerCycle = '';
  let adminModeAuthenticated = false;
  let authUser = null;
  let supabaseClient = null;
  let supabaseAuthSubscription = null;
  let useSupabase = false;
  let supabaseRealtimeChannel = null;
  let supabaseSyncIntervalId = null;
  let supabaseSyncTimeoutId = null;
  let supabaseSyncInFlight = false;
  let supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.slice();
  let canonicalIdMap = {};
  let strategicLedgerCache = null;
  let strategicReportCache = null;
  let strategicAuditCache = null;
  let dailyChecklistSnapshot = null;
  let editingPersonalId = '';
  let editingDailyClosingId = '';
  let movementLedgerEntries = [];
  let suppressMovementLedgerSync = false;
  let uiAdvancedMode = false;
  let editingMovementSource = '';
  let editingMovementId = '';
  let helpGuideProgress = {};
  let helpGuideState = {
    open: false,
    scope: 'business',
    topicId: '',
    feedback: ''
  };

  function toMoney(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function toPercent(value) {
    return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }

  function toMultiplier(value) {
    return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'x';
  }

  function toDays(value) {
    return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' dias';
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString('pt-BR');
  }

  function formatDateOnly(value) {
    if (!value) return '-';
    const asDate = new Date(value.length === 10 ? value + 'T00:00:00' : value);
    if (Number.isNaN(asDate.getTime())) return '-';
    return asDate.toLocaleDateString('pt-BR');
  }

  function normalizeSaleChannel(value) {
    return SALE_CHANNELS.includes(value) ? value : DEFAULT_SALE_CHANNEL;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeProductDescription(value) {
    return String(value || '').trim();
  }

  function normalizeOptionalFieldValue(value) {
    const text = String(value || '').trim();
    if (!text || text === '-') return '';
    return text;
  }

  function splitDisplayProductInfo(rawName, rawDescription) {
    const fullName = String(rawName || 'Produto sem nome').trim() || 'Produto sem nome';
    const description = normalizeProductDescription(rawDescription);
    if (description) {
      return { name: fullName, description: description };
    }

    // Fallback visual: quando o cadastro antigo juntou nome + descricao com " - " ou " : ".
    const parts = fullName.split(/\s[-:]\s/);
    if (parts.length >= 2) {
      const maybeName = String(parts.shift() || '').trim();
      const maybeDescription = String(parts.join(' - ') || '').trim();
      if (maybeName.length >= 3 && maybeDescription.length >= 12) {
        return { name: maybeName, description: maybeDescription };
      }
    }

    return { name: fullName, description: '' };
  }

  function renderDescriptionDetails(description, summaryLabel, extraClass) {
    const text = normalizeProductDescription(description);
    if (!text) return '<span class="muted-inline">Sem descrição</span>';
    const className = 'compact-details' + (extraClass ? ' ' + extraClass : '');
    return '<details class="' + className + '">' +
      '<summary>' + escapeHtml(summaryLabel || 'Ver descrição') + '</summary>' +
      '<p>' + escapeHtml(text) + '</p>' +
    '</details>';
  }

  function renderOptionalFieldDetails(value, summaryLabel, emptyLabel, extraClass) {
    const text = normalizeOptionalFieldValue(value);
    if (!text) return '<span class="muted-inline">' + escapeHtml(emptyLabel || '-') + '</span>';
    return renderDescriptionDetails(text, summaryLabel, extraClass || 'catalog-description-details');
  }

  function renderOptionalFieldDetailsIfPresent(value, summaryLabel, extraClass) {
    const text = normalizeOptionalFieldValue(value);
    if (!text) return '';
    return renderDescriptionDetails(text, summaryLabel, extraClass || 'product-description-details');
  }

  function renderMobileInlineDetails(parts) {
    const html = (Array.isArray(parts) ? parts : []).filter(function (part) {
      return !!String(part || '').trim();
    }).join('');
    if (!html) return '';
    return '<div class="mobile-product-description">' + html + '</div>';
  }

  function renderProductIdentityCell(name, description, summaryLabel) {
    const display = splitDisplayProductInfo(name, description);
    return '<div class="sale-product-cell product-identity-cell">' +
      '<strong class="product-name-cell">' + escapeHtml(display.name) + '</strong>' +
      '<div class="mobile-product-description">' + renderDescriptionDetails(display.description, summaryLabel || 'Descrição (opcional)', 'product-description-details') + '</div>' +
    '</div>';
  }

  function resolveSaleDescription(item) {
    const byId = products.find(function (product) { return product.id === (item ? item.productId : null); });
    const fromProduct = normalizeProductDescription(byId && byId.description);
    if (fromProduct) return fromProduct;
    const fromSale = normalizeProductDescription(item && item.productDescription);
    if (fromSale) return fromSale;
    return '';
  }

  function resolveSaleProductName(item) {
    const byId = products.find(function (product) { return product.id === (item ? item.productId : null); });
    const fromProduct = String(byId && byId.name || '').trim();
    if (fromProduct) return fromProduct;
    const fromSale = String(item && item.productName || '').trim();
    if (fromSale) return fromSale;
    return 'Produto sem nome';
  }

  function syncDashboardFiltersFromCash() {
    if (!dashboardFilterStartDateInput || !dashboardFilterEndDateInput || !dashboardFilterSaleChannelInput) return;
    dashboardFilterStartDateInput.value = filterStartDateInput.value;
    dashboardFilterEndDateInput.value = filterEndDateInput.value;
    dashboardFilterSaleChannelInput.value = filterSaleChannelInput ? filterSaleChannelInput.value : '';
  }

  function applyDashboardFiltersToCash() {
    if (!dashboardFilterStartDateInput || !dashboardFilterEndDateInput || !dashboardFilterSaleChannelInput) return;
    filterStartDateInput.value = dashboardFilterStartDateInput.value;
    filterEndDateInput.value = dashboardFilterEndDateInput.value;
    if (filterSaleChannelInput) filterSaleChannelInput.value = dashboardFilterSaleChannelInput.value;
  }

  function getPeriodKey(isoDate, mode) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';
    if (mode === 'day') {
      return date.toISOString().slice(0, 10);
    }
    if (mode === 'week') {
      const d = new Date(date);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      return d.toISOString().slice(0, 10);
    }
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
  }

  function getCurrentPeriodMode() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;
    if (!start || !end) return 'month';
    const diffDays = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 45) return 'day';
    if (diffDays <= 180) return 'week';
    return 'month';
  }

  function getCanvasContext(canvas) {
    if (!canvas) return null;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const parentWidth = canvas.parentElement ? canvas.parentElement.getBoundingClientRect().width : 0;
    const ownWidth = canvas.getBoundingClientRect().width;
    const measuredWidth = Math.max(parentWidth || 0, ownWidth || 0, 240);
    const viewportLimit = Math.max(240, Number(window.innerWidth || 360) - 24);
    const cssWidth = Math.max(240, Math.min(Math.floor(measuredWidth), viewportLimit));
    const storedHeight = Number(canvas.dataset.baseHeight || 0);
    const initialHeight = Number(canvas.getAttribute('height') || 260);
    const cssHeight = Math.max(120, Math.round(storedHeight > 0 ? storedHeight : initialHeight));
    if (!canvas.dataset.baseHeight) {
      canvas.dataset.baseHeight = String(cssHeight);
    }
    canvas.style.width = '100%';
    canvas.style.maxWidth = '100%';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.max(1, Math.floor(cssWidth * ratio));
    canvas.height = Math.max(1, Math.floor(cssHeight * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx: ctx, width: cssWidth, height: cssHeight };
  }

  function clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function shortenMiddle(value, maxLength) {
    const text = String(value || '').trim();
    if (!text) return '-';
    const max = Math.max(8, Number(maxLength || 24));
    if (text.length <= max) return text;
    const keep = max - 1;
    const start = Math.ceil(keep / 2);
    const end = Math.floor(keep / 2);
    return text.slice(0, start) + '…' + text.slice(text.length - end);
  }

  function getDashboardPeriodLabel() {
    const start = dashboardFilterStartDateInput ? dashboardFilterStartDateInput.value : '';
    const end = dashboardFilterEndDateInput ? dashboardFilterEndDateInput.value : '';
    if (start && end) return formatDateOnly(start) + ' a ' + formatDateOnly(end);
    if (start) return 'a partir de ' + formatDateOnly(start);
    if (end) return 'até ' + formatDateOnly(end);
    return 'todo o período';
  }

  function updateTopProductsSummary(rows) {
    if (!dashTopProductsSummary) return;
    if (!rows.length) {
      dashTopProductsSummary.textContent = 'Sem vendas de produtos no período selecionado.';
      return;
    }
    const lead = rows[0];
    dashTopProductsSummary.textContent = 'Produto líder em ' + getDashboardPeriodLabel() + ': ' + lead.label + ' (' + toMoney(lead.value) + ').';
  }

  function drawEmptyCanvas(canvas, message) {
    const canvasCtx = getCanvasContext(canvas);
    if (!canvasCtx) return;
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(message, width / 2, height / 2);
  }

  function toCycleKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return year + '-' + month;
  }

  function toCycleKeyFromIso(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return toCycleKeyFromDate(new Date());
    return toCycleKeyFromDate(date);
  }

  function getCurrentCycleKey() {
    return toCycleKeyFromDate(new Date());
  }

  function formatCycleLabel(cycleKey) {
    const parts = String(cycleKey).split('-');
    if (parts.length !== 2) return cycleKey;
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function getDaysUntilNextMonth() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diffMs = nextMonth.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  function roundMoney(value) {
    if (CalcModule && typeof CalcModule.roundMoney === 'function') {
      return CalcModule.roundMoney(value);
    }
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function toIsoDateFromAny(value, fallback) {
    if (CalcModule && typeof CalcModule.toIsoDateFromAny === 'function') {
      return CalcModule.toIsoDateFromAny(value, fallback);
    }
    const raw = String(value || '').trim();
    const safeFallback = DATE_REGEX.test(String(fallback || '')) ? String(fallback) : new Date().toISOString().slice(0, 10);
    if (!raw) return safeFallback;
    if (DATE_REGEX.test(raw)) {
      const dt = new Date(raw + 'T00:00:00');
      if (!Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === raw) return raw;
      return safeFallback;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return safeFallback;
    return parsed.toISOString().slice(0, 10);
  }

  function isValidIsoDate(value) {
    if (CalcModule && typeof CalcModule.isValidIsoDate === 'function') {
      return CalcModule.isValidIsoDate(value);
    }
    const raw = String(value || '').trim();
    if (!DATE_REGEX.test(raw)) return false;
    const dt = new Date(raw + 'T00:00:00');
    return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === raw;
  }

  function toIsoTimestamp(value, fallbackDate) {
    if (CalcModule && typeof CalcModule.toIsoTimestamp === 'function') {
      return CalcModule.toIsoTimestamp(value, fallbackDate);
    }
    const parsed = new Date(value || '');
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    const date = toIsoDateFromAny(fallbackDate, new Date().toISOString().slice(0, 10));
    return date + 'T00:00:00.000Z';
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function hasAnyKeyword(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.some(function (kw) {
      return normalized.indexOf(normalizeText(kw)) >= 0;
    });
  }

  function looksLikeUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
  }

  function generateUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  function loadCanonicalIdMap() {
    try {
      const raw = localStorage.getItem(STORAGE_CANONICAL_ID_MAP);
      const parsed = raw ? JSON.parse(raw) : {};
      canonicalIdMap = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      canonicalIdMap = {};
      localStorage.removeItem(STORAGE_CANONICAL_ID_MAP);
    }
  }

  function saveCanonicalIdMap() {
    localStorage.setItem(STORAGE_CANONICAL_ID_MAP, JSON.stringify(canonicalIdMap));
  }

  function getCanonicalTransactionId(sourceName, rawId) {
    if (looksLikeUuid(rawId)) return String(rawId);
    const key = sourceName + ':' + String(rawId || '');
    if (canonicalIdMap[key]) return canonicalIdMap[key];
    const uuid = generateUuid();
    canonicalIdMap[key] = uuid;
    saveCanonicalIdMap();
    return uuid;
  }

  function classifyFlowType(rawType, category, notes) {
    const text = [rawType, category, notes].join(' ');
    const normalized = normalizeText(text);
    if (normalized.indexOf('ads') >= 0 && normalized.indexOf('investment') >= 0) return 'expense';
    if (normalized.indexOf('ads') >= 0 && normalized.indexOf('investimento') >= 0) return 'expense';
    if (normalized.indexOf('personal exit') >= 0 || normalized.indexOf('saida pessoal') >= 0) {
      return 'transfer';
    }
    if (hasAnyKeyword(text, TRANSFER_KEYWORDS)) return 'transfer';
    if (hasAnyKeyword(text, INVESTMENT_KEYWORDS)) return 'investment';
    return 'expense';
  }

  function isDebtTagged(category, notes) {
    return hasAnyKeyword([category, notes].join(' '), DEBT_KEYWORDS);
  }

  function toPeriodStartFromMode(dateIso, mode) {
    const parsed = new Date(toIsoDateFromAny(dateIso) + 'T00:00:00');
    if (Number.isNaN(parsed.getTime())) return '';
    if (mode === 'day') return parsed.toISOString().slice(0, 10);
    if (mode === 'week') {
      const d = new Date(parsed);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      return d.toISOString().slice(0, 10);
    }
    return dYearMonth(parsed);
  }

  function dYearMonth(dateObj) {
    return dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0');
  }

  function shiftDate(isoDate, offsetDays) {
    const base = new Date(toIsoDateFromAny(isoDate) + 'T00:00:00');
    base.setDate(base.getDate() + Number(offsetDays || 0));
    return base.toISOString().slice(0, 10);
  }

  function enumerateDates(startIso, endIso) {
    const start = toIsoDateFromAny(startIso);
    const end = toIsoDateFromAny(endIso, start);
    if (start > end) return [];
    const result = [];
    let cursor = start;
    while (cursor <= end) {
      result.push(cursor);
      cursor = shiftDate(cursor, 1);
    }
    return result;
  }

  function sumLast(values, count, offsetFromEnd) {
    const offset = Number(offsetFromEnd || 0);
    const end = values.length - 1 - offset;
    if (end < 0) return 0;
    const start = Math.max(0, end - count + 1);
    let total = 0;
    for (let i = start; i <= end; i += 1) total += Number(values[i] || 0);
    return total;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value || 0), Number(min)), Number(max));
  }

  function isInventoryPurchaseType(type) {
    const normalized = normalizeText(type);
    return normalized.indexOf('materia-prima') >= 0 ||
      normalized.indexOf('materia prima') >= 0 ||
      normalized.indexOf('embalagem') >= 0;
  }

  function isInventoryPurchaseRecord(item) {
    if (typeof item.isInventoryPurchase === 'boolean') return item.isInventoryPurchase;
    return isInventoryPurchaseType(item.type);
  }

  function getWindowRange(referenceDate, windowDays) {
    const end = toIsoDateFromAny(referenceDate || new Date().toISOString().slice(0, 10));
    const days = Math.max(1, Number(windowDays || 1));
    return {
      start: shiftDate(end, -(days - 1)),
      end: end,
      days: days
    };
  }

  function computeSalesMetricsForWindow(referenceDate, windowDays) {
    const range = getWindowRange(referenceDate, windowDays);
    const totals = sales.reduce(function (acc, item) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      acc.revenue += Number(item.revenue || 0);
      acc.cost += Number(item.totalCost || 0);
      return acc;
    }, { revenue: 0, cost: 0 });
    return {
      start: range.start,
      end: range.end,
      days: range.days,
      revenue: roundMoney(totals.revenue),
      cost: roundMoney(totals.cost)
    };
  }

  function getDynamicRepurchasePolicy(referenceDate, fallbackOperationalRatio) {
    const primary = computeSalesMetricsForWindow(referenceDate, DYNAMIC_REPURCHASE_WINDOW_PRIMARY_DAYS);
    const fallback = computeSalesMetricsForWindow(referenceDate, DYNAMIC_REPURCHASE_WINDOW_FALLBACK_DAYS);
    const hasPrimary = primary.revenue > 0.009;
    const hasFallback = fallback.revenue > 0.009;
    const source = hasPrimary ? primary : (hasFallback ? fallback : null);
    const fallbackRatio = clamp(
      Number(fallbackOperationalRatio || ALLOCATION_BASE_MODEL.operational) - DYNAMIC_REPURCHASE_BUFFER_RATIO,
      0.20,
      0.95
    );
    const cmvRatio = source ? clamp(source.cost / source.revenue, 0, 0.98) : fallbackRatio;
    const operationalTargetRatio = clamp(
      cmvRatio + DYNAMIC_REPURCHASE_BUFFER_RATIO,
      DYNAMIC_REPURCHASE_MIN_RATIO,
      DYNAMIC_REPURCHASE_MAX_RATIO
    );
    const projectedDailyRevenue = source ? (source.revenue / source.days) : 0;
    const projectedRevenue30Days = roundMoney(projectedDailyRevenue * DISTRIBUTION_REPURCHASE_LOOKAHEAD_DAYS);
    const repurchaseNeed30Days = roundMoney(projectedRevenue30Days * cmvRatio * (1 + REPLACEMENT_NEED_BUFFER_RATIO));
    return {
      cmvRatio: cmvRatio,
      operationalTargetRatio: operationalTargetRatio,
      windowDaysUsed: source ? source.days : 0,
      sourceRevenue: source ? source.revenue : 0,
      sourceCost: source ? source.cost : 0,
      projectedRevenue30Days: projectedRevenue30Days,
      repurchaseNeed30Days: repurchaseNeed30Days
    };
  }

  function buildAdaptiveAllocationModel(baseModel, operationalTargetRatio) {
    const nonOperationalKeys = ['tithe', 'emergency', 'debt', 'proLabore', 'growth'];
    const remainingRatio = clamp(1 - Number(operationalTargetRatio || 0), 0, 1);
    const nonOperationalWeight = nonOperationalKeys.reduce(function (acc, key) {
      return acc + Number(baseModel[key] || 0);
    }, 0);
    if (nonOperationalWeight <= 0) {
      return {
        tithe: 0,
        emergency: 0,
        debt: 0,
        proLabore: 0,
        growth: 0,
        operational: clamp(operationalTargetRatio, 0, 1)
      };
    }
    const model = {};
    let nonOperationalAllocated = 0;
    nonOperationalKeys.forEach(function (key) {
      const ratio = remainingRatio * (Number(baseModel[key] || 0) / nonOperationalWeight);
      model[key] = ratio;
      nonOperationalAllocated += ratio;
    });
    model.operational = clamp(1 - nonOperationalAllocated, 0, 1);
    return model;
  }

  function estimateAverageDailyEssentialExpense(referenceDate, lookbackDays) {
    const range = getWindowRange(referenceDate, lookbackDays);
    const purchasesTotal = purchases.reduce(function (acc, item) {
      const date = toIsoDateFromAny(item.purchaseDate || item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      if (item.isOtherFunding) return acc;
      return acc + Number(item.total || 0);
    }, 0);
    const withdrawalsTotal = withdrawals.reduce(function (acc, item) {
      const date = toIsoDateFromAny(item.withdrawalDate || item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      if (item.isOtherFunding) return acc;
      const flowType = item.flowType || classifyFlowType(item.type, item.type, item.notes);
      return flowType === 'expense' ? acc + Number(item.amount || 0) : acc;
    }, 0);
    const total = roundMoney(purchasesTotal + withdrawalsTotal);
    const daily = total / range.days;
    return {
      total: total,
      daily: roundMoney(daily),
      days: range.days,
      start: range.start,
      end: range.end
    };
  }

  function estimateEmergencyReserveTarget(referenceDate) {
    const essential = estimateAverageDailyEssentialExpense(referenceDate, EMERGENCY_LOOKBACK_DAYS);
    const monthlyEssential = roundMoney(essential.daily * 30);
    const target = roundMoney(monthlyEssential * EMERGENCY_TARGET_MONTHS);
    return {
      target: target,
      monthlyEssential: monthlyEssential,
      dailyEssential: essential.daily,
      period: essential
    };
  }

  function estimateInventoryTurnoverProxy(referenceDate, lookbackDays) {
    const range = getWindowRange(referenceDate, lookbackDays);
    const cogs = sales.reduce(function (acc, item) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      return acc + Number(item.totalCost || 0);
    }, 0);
    const inventoryPurchases = purchases.reduce(function (acc, item) {
      const date = toIsoDateFromAny(item.purchaseDate || item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      if (item.isOtherFunding) return acc;
      if (!isInventoryPurchaseRecord(item)) return acc;
      return acc + Number(item.total || 0);
    }, 0);
    const cogsRounded = roundMoney(cogs);
    const inventoryRounded = roundMoney(inventoryPurchases);
    const turnover = inventoryRounded > 0 ? (cogsRounded / inventoryRounded) : 0;
    return {
      turnover: roundMoney(turnover),
      cogs: cogsRounded,
      inventoryPurchases: inventoryRounded,
      start: range.start,
      end: range.end
    };
  }

  function calculateOperationalHealthMetrics(referenceDate, operationalBalance, fallbackOperationalRatio) {
    const reserve = estimateEmergencyReserveTarget(referenceDate);
    const repurchase = getDynamicRepurchasePolicy(referenceDate, fallbackOperationalRatio);
    const repurchaseNeed = Number(repurchase.repurchaseNeed30Days || 0);
    const balance = Number(operationalBalance || 0);
    const runwayDays = reserve.dailyEssential > 0 ? roundMoney(balance / reserve.dailyEssential) : 0;
    const repurchaseCoverage = repurchaseNeed > 0 ? roundMoney(balance / repurchaseNeed) : 0;
    const ruptureGap = repurchaseNeed > balance ? roundMoney(repurchaseNeed - balance) : 0;
    const inventory = estimateInventoryTurnoverProxy(referenceDate, INVENTORY_TURNOVER_LOOKBACK_DAYS);
    return {
      emergencyTarget: Number(reserve.target || 0),
      monthlyEssential: Number(reserve.monthlyEssential || 0),
      dailyEssential: Number(reserve.dailyEssential || 0),
      runwayDays: runwayDays,
      repurchaseNeed30Days: repurchaseNeed,
      repurchaseCoverage: repurchaseCoverage,
      ruptureGap: ruptureGap,
      repurchasePolicy: repurchase,
      inventoryTurnover: Number(inventory.turnover || 0),
      inventoryWindow: inventory
    };
  }

  function getDistributionSafetySnapshot(referenceDate) {
    const date = toIsoDateFromAny(referenceDate || new Date().toISOString().slice(0, 10));
    const operationalBalance = getOperationalBalanceAsOf(date);
    const metrics = calculateOperationalHealthMetrics(date, operationalBalance, ALLOCATION_BASE_MODEL.operational);
    const requiredFloor = roundMoney(Number(metrics.emergencyTarget || 0) + Number(metrics.repurchaseNeed30Days || 0));
    const distributable = roundMoney(Math.max(0, operationalBalance - requiredFloor));
    return {
      date: date,
      operationalBalance: roundMoney(operationalBalance),
      requiredFloor: requiredFloor,
      distributable: distributable,
      emergencyTarget: roundMoney(metrics.emergencyTarget || 0),
      repurchaseNeed30Days: roundMoney(metrics.repurchaseNeed30Days || 0),
      repurchaseCoverage: roundMoney(metrics.repurchaseCoverage || 0)
    };
  }

  function isDebtTrendDecreasing(debtHistory) {
    if (!Array.isArray(debtHistory) || debtHistory.length < 60) return false;
    const current30 = sumLast(debtHistory, 30, 0);
    const previous30 = sumLast(debtHistory, 30, 30);
    return previous30 > 0 && current30 < previous30;
  }

  function buildCanonicalTransactions() {
    const list = [];

    sales.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('sale-' + date + '-' + idx);
      list.push({
        id: getCanonicalTransactionId('sale', rawId),
        source: 'sales',
        legacyId: String(rawId),
        type: 'income',
        category: 'VENDA',
        amount: roundMoney(item.revenue || 0),
        date: date,
        createdAt: createdAt,
        directCost: roundMoney(Number(item.totalCost || 0) + Number(item.expense || 0)),
        fixedCost: 0,
        affectsOperationalBalance: false,
        affectsProfit: false,
        meta: {
          productId: item.productId || '',
          productName: item.productName || '',
          saleChannel: normalizeSaleChannel(item.saleChannel),
          expense: roundMoney(item.expense || 0)
        }
      });
    });

    purchases.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.purchaseDate || item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('purchase-' + date + '-' + idx);
      const amount = roundMoney(item.total || 0);
      const externalFunding = !!item.isOtherFunding;
      const isInventoryPurchase = isInventoryPurchaseRecord(item);
      list.push({
        id: getCanonicalTransactionId('purchase', rawId),
        source: 'purchases',
        legacyId: String(rawId),
        type: 'expense',
        category: 'COMPRA:' + String(item.type || 'Outros'),
        amount: amount,
        date: date,
        createdAt: createdAt,
        directCost: 0,
        fixedCost: (!externalFunding && !isInventoryPurchase) ? amount : 0,
        affectsOperationalBalance: !externalFunding,
        affectsProfit: !externalFunding && !isInventoryPurchase,
        meta: {
          item: item.item || '',
          notes: item.notes || '',
          isOtherFunding: externalFunding,
          isInventoryPurchase: isInventoryPurchase
        }
      });
    });

    withdrawals.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.withdrawalDate || item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('withdrawal-' + date + '-' + idx);
      const amount = roundMoney(item.amount || 0);
      const flowType = item.flowType || classifyFlowType(item.type, item.type, item.notes);
      const externalFunding = !!item.isOtherFunding;
      const isOperationalExpense = flowType === 'expense' && !externalFunding;
      list.push({
        id: getCanonicalTransactionId('withdrawal', rawId),
        source: 'withdrawals',
        legacyId: String(rawId),
        type: flowType,
        category: String(item.type || 'Saida'),
        amount: amount,
        date: date,
        createdAt: createdAt,
        directCost: 0,
        fixedCost: isOperationalExpense ? amount : 0,
        affectsOperationalBalance: isOperationalExpense,
        affectsProfit: isOperationalExpense,
        meta: {
          notes: item.notes || '',
          isOtherFunding: externalFunding
        }
      });
    });

    partnerContributions.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('partner-' + date + '-' + idx);
      const amount = roundMoney(item.amount || 0);
      const externalFunding = !!item.isOtherFunding;
      list.push({
        id: getCanonicalTransactionId('partner', rawId),
        source: 'partnerContributions',
        legacyId: String(rawId),
        type: 'expense',
        category: 'DISTRIBUICAO:' + String(item.partner || 'Socio'),
        amount: amount,
        date: date,
        createdAt: createdAt,
        directCost: 0,
        fixedCost: externalFunding ? 0 : amount,
        affectsOperationalBalance: !externalFunding,
        affectsProfit: !externalFunding,
        meta: {
          partner: item.partner || '',
          notes: item.notes || '',
          cycleKey: item.cycleKey || resolveCycleKey(date),
          isOtherFunding: externalFunding
        }
      });
    });

    personalTransactions.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('personal-' + date + '-' + idx);
      const amount = roundMoney(item.amount || 0);
      const type = item.type === 'entry' ? 'income' : 'expense';
      list.push({
        id: getCanonicalTransactionId('personal', rawId),
        source: 'personalTransactions',
        legacyId: String(rawId),
        type: type,
        category: String(item.category || (type === 'income' ? 'Renda' : 'Outros')),
        amount: amount,
        date: date,
        createdAt: createdAt,
        directCost: 0,
        fixedCost: 0,
        affectsOperationalBalance: false,
        affectsProfit: false,
        meta: {
          notes: item.notes || '',
          usesBusinessFunds: !!item.usesBusinessFunds
        }
      });
    });

    adsInvestments.forEach(function (item, idx) {
      const date = toIsoDateFromAny(item.date || item.createdAt);
      const createdAt = toIsoTimestamp(item.createdAt, date);
      const rawId = item.id || ('ads-' + date + '-' + idx);
      list.push({
        id: getCanonicalTransactionId('ads', rawId),
        source: 'adsInvestments',
        legacyId: String(rawId),
        type: 'investment',
        category: 'INVESTIMENTO:ADS',
        amount: roundMoney(item.amount || 0),
        date: date,
        createdAt: createdAt,
        directCost: 0,
        fixedCost: 0,
        affectsOperationalBalance: false,
        affectsProfit: false,
        meta: {
          platform: item.platform || '',
          method: item.method || '',
          notes: item.notes || ''
        }
      });
    });

    return list.sort(function (a, b) {
      if (a.date === b.date) return String(a.createdAt).localeCompare(String(b.createdAt));
      return String(a.date).localeCompare(String(b.date));
    });
  }

  function buildStrategicLedger() {
    const txList = buildCanonicalTransactions();
    if (!txList.length) {
      return {
        transactions: [],
        days: [],
        latestJars: { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 },
        latestGrowthActive: false
      };
    }

    const grouped = {};
    txList.forEach(function (tx) {
      if (!grouped[tx.date]) {
        grouped[tx.date] = {
          grossRevenue: 0,
          directCosts: 0,
          fixedCosts: 0,
          operationalExpenses: 0,
          essentialOperatingExpenses: 0,
          distributionExpenses: 0,
          debtExpenses: 0,
          proLaboreUsage: 0
        };
      }
      const day = grouped[tx.date];
      if (tx.type === 'income' && tx.source === 'sales') {
        day.grossRevenue += Number(tx.amount || 0);
        day.directCosts += Number(tx.directCost || 0);
      }
      if (tx.type === 'expense' && tx.affectsProfit) {
        day.fixedCosts += Number(tx.amount || 0);
      }
      if (tx.type === 'expense' && tx.affectsOperationalBalance) {
        day.operationalExpenses += Number(tx.amount || 0);
        if (tx.source === 'partnerContributions') {
          day.distributionExpenses += Number(tx.amount || 0);
        } else {
          day.essentialOperatingExpenses += Number(tx.amount || 0);
        }
      }
      if (tx.type === 'expense' && isDebtTagged(tx.category, tx.meta && tx.meta.notes)) {
        day.debtExpenses += Number(tx.amount || 0);
      }
      if (tx.source === 'personalTransactions' && tx.type === 'expense' && tx.meta && tx.meta.usesBusinessFunds) {
        day.proLaboreUsage += Number(tx.amount || 0);
      }
    });

    const sortedDates = Object.keys(grouped).sort();
    const startDate = sortedDates[0];
    const endDate = [sortedDates[sortedDates.length - 1], new Date().toISOString().slice(0, 10)].sort().pop();
    const fullDates = enumerateDates(startDate, endDate);
    const jars = { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 };
    const debtHistory = [];
    const essentialExpenseHistory = [];
    const days = [];
    let positiveStreak = 0;
    let growthActive = false;

    fullDates.forEach(function (date) {
      const current = grouped[date] || {
        grossRevenue: 0,
        directCosts: 0,
        fixedCosts: 0,
        operationalExpenses: 0,
        essentialOperatingExpenses: 0,
        distributionExpenses: 0,
        debtExpenses: 0,
        proLaboreUsage: 0
      };
      const essentialWindowDays = Math.min(EMERGENCY_LOOKBACK_DAYS, Math.max(1, essentialExpenseHistory.length));
      const essentialWindowTotal = essentialExpenseHistory.length
        ? sumLast(essentialExpenseHistory, essentialWindowDays, 0)
        : 0;
      const avgDailyEssential = essentialExpenseHistory.length ? (essentialWindowTotal / essentialWindowDays) : 0;
      const emergencyTarget = roundMoney(avgDailyEssential * 30 * EMERGENCY_TARGET_MONTHS);
      const conditions = {
        emergencyReady: emergencyTarget <= 0 ? true : jars.emergency >= emergencyTarget,
        debtTrendDecreasing: isDebtTrendDecreasing(debtHistory),
        positiveOperational30Days: positiveStreak >= 30,
        emergencyTarget: emergencyTarget
      };
      growthActive = conditions.emergencyReady && conditions.debtTrendDecreasing && conditions.positiveOperational30Days;
      const baseModel = growthActive ? ALLOCATION_GROWTH_MODEL : ALLOCATION_BASE_MODEL;
      const repurchasePolicy = getDynamicRepurchasePolicy(date, baseModel.operational);
      const model = buildAdaptiveAllocationModel(baseModel, repurchasePolicy.operationalTargetRatio);
      const gross = roundMoney(current.grossRevenue);
      const allocations = {
        tithe: roundMoney(gross * model.tithe),
        emergency: roundMoney(gross * model.emergency),
        debt: roundMoney(gross * model.debt),
        proLabore: roundMoney(gross * model.proLabore),
        growth: roundMoney(gross * model.growth),
        operational: roundMoney(gross * model.operational)
      };
      jars.tithe = roundMoney(jars.tithe + allocations.tithe);
      jars.emergency = roundMoney(jars.emergency + allocations.emergency);
      jars.debt = roundMoney(jars.debt + allocations.debt);
      const proLaboreBeforeUsage = roundMoney(jars.proLabore + allocations.proLabore);
      const proLaboreAfterUsage = roundMoney(proLaboreBeforeUsage - Number(current.proLaboreUsage || 0));
      jars.proLabore = proLaboreAfterUsage;
      jars.growth = roundMoney(jars.growth + allocations.growth);

      const operationalBefore = roundMoney(jars.operational + allocations.operational);
      const operationalAfter = roundMoney(operationalBefore - Number(current.operationalExpenses || 0));
      jars.operational = operationalAfter;

      const nonOperationalAllocations = roundMoney(
        allocations.tithe + allocations.emergency + allocations.debt + allocations.proLabore + allocations.growth
      );
      const dayNetOperationalProfit = roundMoney(
        gross - Number(current.directCosts || 0) - Number(current.fixedCosts || 0) - nonOperationalAllocations
      );

      if (dayNetOperationalProfit > 0) {
        positiveStreak += 1;
      } else {
        positiveStreak = 0;
      }
      debtHistory.push(roundMoney(current.debtExpenses || 0));
      essentialExpenseHistory.push(roundMoney(current.essentialOperatingExpenses || 0));

      days.push({
        date: date,
        grossRevenue: gross,
        directCosts: roundMoney(current.directCosts),
        fixedCosts: roundMoney(current.fixedCosts),
        operationalExpenses: roundMoney(current.operationalExpenses),
        debtExpenses: roundMoney(current.debtExpenses),
        proLaboreUsage: roundMoney(current.proLaboreUsage),
        essentialOperatingExpenses: roundMoney(current.essentialOperatingExpenses),
        distributionExpenses: roundMoney(current.distributionExpenses),
        emergencyReserveTarget: emergencyTarget,
        allocationModel: growthActive ? 'growth' : 'base',
        allocationModelRatios: model,
        growthActive: growthActive,
        growthConditions: conditions,
        positiveOperationalStreak: positiveStreak,
        repurchasePolicy: {
          cmvRatio: roundMoney(repurchasePolicy.cmvRatio * 100),
          operationalTarget: roundMoney(repurchasePolicy.operationalTargetRatio * 100),
          safetyBuffer: roundMoney(DYNAMIC_REPURCHASE_BUFFER_RATIO * 100),
          windowDaysUsed: repurchasePolicy.windowDaysUsed,
          projectedRevenue30Days: roundMoney(repurchasePolicy.projectedRevenue30Days),
          repurchaseNeed30Days: roundMoney(repurchasePolicy.repurchaseNeed30Days)
        },
        allocations: allocations,
        nonOperationalAllocations: nonOperationalAllocations,
        netOperationalProfit: dayNetOperationalProfit,
        proLaboreBalanceBeforeUsage: proLaboreBeforeUsage,
        proLaboreBalanceAfterUsage: proLaboreAfterUsage,
        operationalBalanceBeforeExpenses: operationalBefore,
        operationalBalanceAfterExpenses: operationalAfter,
        jarBalances: {
          tithe: jars.tithe,
          emergency: jars.emergency,
          debt: jars.debt,
          proLabore: jars.proLabore,
          growth: jars.growth,
          operational: jars.operational
        }
      });
    });

    return {
      transactions: txList,
      days: days,
      latestJars: Object.assign({}, jars),
      latestGrowthActive: growthActive
    };
  }

  function getStrategicLedger(forceRefresh) {
    if (!forceRefresh && strategicLedgerCache) return strategicLedgerCache;
    strategicLedgerCache = buildStrategicLedger();
    return strategicLedgerCache;
  }

  function sumField(rows, fieldName) {
    return roundMoney(rows.reduce(function (acc, row) {
      return acc + Number(row[fieldName] || 0);
    }, 0));
  }

  function summarizeStrategicDays(days) {
    if (!Array.isArray(days) || !days.length) {
      return {
        grossRevenue: 0,
        directCosts: 0,
        fixedCosts: 0,
        allocations: { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 },
        nonOperationalAllocations: 0,
        netOperationalProfit: 0,
        operationalExpenses: 0,
        essentialOperatingExpenses: 0,
        distributionExpenses: 0,
        emergencyReserveTarget: 0,
        operationalBalance: 0
      };
    }
    const allocations = days.reduce(function (acc, row) {
      acc.tithe += Number(row.allocations.tithe || 0);
      acc.emergency += Number(row.allocations.emergency || 0);
      acc.debt += Number(row.allocations.debt || 0);
      acc.proLabore += Number(row.allocations.proLabore || 0);
      acc.growth += Number(row.allocations.growth || 0);
      acc.operational += Number(row.allocations.operational || 0);
      return acc;
    }, { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 });
    return {
      grossRevenue: sumField(days, 'grossRevenue'),
      directCosts: sumField(days, 'directCosts'),
      fixedCosts: sumField(days, 'fixedCosts'),
      allocations: {
        tithe: roundMoney(allocations.tithe),
        emergency: roundMoney(allocations.emergency),
        debt: roundMoney(allocations.debt),
        proLabore: roundMoney(allocations.proLabore),
        growth: roundMoney(allocations.growth),
        operational: roundMoney(allocations.operational)
      },
      nonOperationalAllocations: sumField(days, 'nonOperationalAllocations'),
      netOperationalProfit: sumField(days, 'netOperationalProfit'),
      operationalExpenses: sumField(days, 'operationalExpenses'),
      essentialOperatingExpenses: sumField(days, 'essentialOperatingExpenses'),
      distributionExpenses: sumField(days, 'distributionExpenses'),
      emergencyReserveTarget: roundMoney(days[days.length - 1].emergencyReserveTarget || 0),
      operationalBalance: roundMoney(days[days.length - 1].jarBalances.operational)
    };
  }

  function groupStrategicDays(days, mode) {
    const grouped = {};
    const order = [];
    days.forEach(function (row) {
      const key = mode === 'month' ? row.date.slice(0, 7) : toPeriodStartFromMode(row.date, mode);
      if (!grouped[key]) {
        grouped[key] = {
          key: key,
          grossRevenue: 0,
          directCosts: 0,
          fixedCosts: 0,
          netOperationalProfit: 0,
          operationalExpenses: 0,
          essentialOperatingExpenses: 0,
          distributionExpenses: 0,
          allocations: { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 },
          operationalBalance: row.jarBalances.operational,
          growthActiveDays: 0,
          totalDays: 0
        };
        order.push(key);
      }
      const target = grouped[key];
      target.grossRevenue += Number(row.grossRevenue || 0);
      target.directCosts += Number(row.directCosts || 0);
      target.fixedCosts += Number(row.fixedCosts || 0);
      target.netOperationalProfit += Number(row.netOperationalProfit || 0);
      target.operationalExpenses += Number(row.operationalExpenses || 0);
      target.essentialOperatingExpenses += Number(row.essentialOperatingExpenses || 0);
      target.distributionExpenses += Number(row.distributionExpenses || 0);
      target.allocations.tithe += Number(row.allocations.tithe || 0);
      target.allocations.emergency += Number(row.allocations.emergency || 0);
      target.allocations.debt += Number(row.allocations.debt || 0);
      target.allocations.proLabore += Number(row.allocations.proLabore || 0);
      target.allocations.growth += Number(row.allocations.growth || 0);
      target.allocations.operational += Number(row.allocations.operational || 0);
      target.operationalBalance = Number(row.jarBalances.operational || 0);
      target.totalDays += 1;
      if (row.growthActive) target.growthActiveDays += 1;
    });
    return order.map(function (key) {
      const row = grouped[key];
      return {
        key: key,
        grossRevenue: roundMoney(row.grossRevenue),
        directCosts: roundMoney(row.directCosts),
        fixedCosts: roundMoney(row.fixedCosts),
        netOperationalProfit: roundMoney(row.netOperationalProfit),
        operationalExpenses: roundMoney(row.operationalExpenses),
        essentialOperatingExpenses: roundMoney(row.essentialOperatingExpenses),
        distributionExpenses: roundMoney(row.distributionExpenses),
        allocations: {
          tithe: roundMoney(row.allocations.tithe),
          emergency: roundMoney(row.allocations.emergency),
          debt: roundMoney(row.allocations.debt),
          proLabore: roundMoney(row.allocations.proLabore),
          growth: roundMoney(row.allocations.growth),
          operational: roundMoney(row.allocations.operational)
        },
        operationalBalance: roundMoney(row.operationalBalance),
        growthActiveDays: row.growthActiveDays,
        totalDays: row.totalDays
      };
    });
  }

  function getEffectiveRange(options, allDays) {
    const opts = options || {};
    const firstDate = allDays.length ? allDays[0].date : new Date().toISOString().slice(0, 10);
    const lastDate = allDays.length ? allDays[allDays.length - 1].date : firstDate;
    const startInput = filterStartDateInput ? filterStartDateInput.value : '';
    const endInput = filterEndDateInput ? filterEndDateInput.value : '';
    const start = toIsoDateFromAny(opts.start || startInput || firstDate, firstDate);
    const end = toIsoDateFromAny(opts.end || endInput || lastDate, lastDate);
    if (start <= end) return { start: start, end: end };
    return { start: end, end: start };
  }

  function getPreviousRange(start, end) {
    const startMs = new Date(start + 'T00:00:00').getTime();
    const endMs = new Date(end + 'T00:00:00').getTime();
    const spanDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
    const prevEnd = shiftDate(start, -1);
    const prevStart = shiftDate(prevEnd, -(spanDays - 1));
    return { start: prevStart, end: prevEnd, spanDays: spanDays };
  }

  function compareMetric(current, previous) {
    const delta = roundMoney(Number(current || 0) - Number(previous || 0));
    let trend = 'flat';
    if (delta > 0.009) trend = 'up';
    if (delta < -0.009) trend = 'down';
    return { current: roundMoney(current), previous: roundMoney(previous), delta: delta, trend: trend };
  }

  function generateStrategicAllocationReport(mode, options) {
    const periodMode = ['day', 'week', 'month', 'custom'].includes(mode) ? mode : 'custom';
    const ledger = getStrategicLedger(false);
    const days = ledger.days || [];
    const range = getEffectiveRange(options, days);
    const selectedDays = days.filter(function (row) {
      return row.date >= range.start && row.date <= range.end;
    });
    const summary = summarizeStrategicDays(selectedDays);
    const groupedMode = periodMode === 'custom' ? 'day' : periodMode;
    const grouped = groupStrategicDays(selectedDays, groupedMode);
    const prevRange = getPreviousRange(range.start, range.end);
    const prevDays = days.filter(function (row) {
      return row.date >= prevRange.start && row.date <= prevRange.end;
    });
    const prevSummary = summarizeStrategicDays(prevDays);

    const revenue = Number(summary.grossRevenue || 0);
    const allocationKeys = ['tithe', 'emergency', 'debt', 'proLabore', 'growth', 'operational'];
    const validation = {
      tithe: revenue > 0 ? roundMoney((summary.allocations.tithe / revenue) * 100) : 0,
      emergency: revenue > 0 ? roundMoney((summary.allocations.emergency / revenue) * 100) : 0,
      debt: revenue > 0 ? roundMoney((summary.allocations.debt / revenue) * 100) : 0,
      proLabore: revenue > 0 ? roundMoney((summary.allocations.proLabore / revenue) * 100) : 0,
      growth: revenue > 0 ? roundMoney((summary.allocations.growth / revenue) * 100) : 0,
      operational: revenue > 0 ? roundMoney((summary.allocations.operational / revenue) * 100) : 0
    };
    const strategicExits = grouped.map(function (row) {
      return roundMoney(
        Number(row.directCosts || 0) +
        Number(row.fixedCosts || 0) +
        Number(row.allocations.tithe || 0) +
        Number(row.allocations.emergency || 0) +
        Number(row.allocations.debt || 0) +
        Number(row.allocations.proLabore || 0) +
        Number(row.allocations.growth || 0)
      );
    });
    const chartData = {
      labels: grouped.map(function (row) { return row.key; }),
      grossRevenue: grouped.map(function (row) { return row.grossRevenue; }),
      directCosts: grouped.map(function (row) { return row.directCosts; }),
      fixedCosts: grouped.map(function (row) { return row.fixedCosts; }),
      netOperationalProfit: grouped.map(function (row) { return row.netOperationalProfit; }),
      operationalExpenses: grouped.map(function (row) { return row.operationalExpenses; }),
      strategicExits: strategicExits,
      allocations: {
        tithe: grouped.map(function (row) { return row.allocations.tithe; }),
        emergency: grouped.map(function (row) { return row.allocations.emergency; }),
        debt: grouped.map(function (row) { return row.allocations.debt; }),
        proLabore: grouped.map(function (row) { return row.allocations.proLabore; }),
        growth: grouped.map(function (row) { return row.allocations.growth; }),
        operational: grouped.map(function (row) { return row.allocations.operational; })
      },
      operationalBalance: grouped.map(function (row) { return row.operationalBalance; })
    };
    const comparison = {
      grossRevenue: compareMetric(summary.grossRevenue, prevSummary.grossRevenue),
      netOperationalProfit: compareMetric(summary.netOperationalProfit, prevSummary.netOperationalProfit),
      operationalBalance: compareMetric(summary.operationalBalance, prevSummary.operationalBalance)
    };
    const jarEvolution = selectedDays.map(function (row) {
      return {
        date: row.date,
        tithe: row.jarBalances.tithe,
        emergency: row.jarBalances.emergency,
        debt: row.jarBalances.debt,
        proLabore: row.jarBalances.proLabore,
        growth: row.jarBalances.growth,
        operational: row.jarBalances.operational
      };
    });
    const latestSelectedDay = selectedDays.length ? selectedDays[selectedDays.length - 1] : (days.length ? days[days.length - 1] : null);
    const latestConditions = latestSelectedDay && latestSelectedDay.growthConditions ? latestSelectedDay.growthConditions : {
      emergencyReady: false,
      debtTrendDecreasing: false,
      positiveOperational30Days: false,
      emergencyTarget: 0
    };

    const expectedPercentages = {
      tithe: 0,
      emergency: 0,
      debt: 0,
      proLabore: 0,
      growth: 0,
      operational: 0
    };
    const expectedAmounts = {
      tithe: 0,
      emergency: 0,
      debt: 0,
      proLabore: 0,
      growth: 0,
      operational: 0
    };
    if (revenue > 0 && selectedDays.length) {
      selectedDays.forEach(function (row) {
        const rowRevenue = Number(row.grossRevenue || 0);
        const rowModel = row.allocationModelRatios && typeof row.allocationModelRatios === 'object'
          ? row.allocationModelRatios
          : (row.allocationModel === 'growth' ? ALLOCATION_GROWTH_MODEL : ALLOCATION_BASE_MODEL);
        allocationKeys.forEach(function (key) {
          const ratio = Number(rowModel[key] || 0);
          expectedAmounts[key] += roundMoney(rowRevenue * ratio);
        });
      });
      allocationKeys.forEach(function (key) {
        expectedAmounts[key] = roundMoney(expectedAmounts[key]);
        expectedPercentages[key] = revenue > 0
          ? roundMoney((expectedAmounts[key] / revenue) * 100)
          : 0;
      });
    } else {
      const fallbackExpected = getExpectedAllocationPercentages(
        latestSelectedDay ? latestSelectedDay.allocationModel : 'base',
        latestSelectedDay ? latestSelectedDay.allocationModelRatios : null
      );
      allocationKeys.forEach(function (key) {
        expectedPercentages[key] = Number(fallbackExpected[key] || 0);
        expectedAmounts[key] = roundMoney(revenue * (expectedPercentages[key] / 100));
      });
    }

    return {
      mode: periodMode,
      range: range,
      previousRange: { start: prevRange.start, end: prevRange.end },
      summary: {
        grossRevenue: summary.grossRevenue,
        directCosts: summary.directCosts,
        fixedCosts: summary.fixedCosts,
        allocations: summary.allocations,
        nonOperationalAllocations: summary.nonOperationalAllocations,
        netOperationalProfit: summary.netOperationalProfit,
        operationalExpenses: summary.operationalExpenses,
        essentialOperatingExpenses: summary.essentialOperatingExpenses,
        distributionExpenses: summary.distributionExpenses,
        emergencyReserveTarget: summary.emergencyReserveTarget,
        operationalBalance: summary.operationalBalance
      },
      allocationPercentageValidation: validation,
      expectedAllocationPercentages: expectedPercentages,
      expectedAllocationAmounts: expectedAmounts,
      grouped: grouped,
      jarBalanceEvolution: jarEvolution,
      comparison: comparison,
      chartData: chartData,
      growthStatus: {
        enabled: latestSelectedDay ? !!latestSelectedDay.growthActive : !!ledger.latestGrowthActive,
        model: latestSelectedDay ? latestSelectedDay.allocationModel : (ledger.latestGrowthActive ? 'growth' : 'base'),
        latestDay: latestSelectedDay ? latestSelectedDay.date : '',
        positiveOperationalStreakDays: latestSelectedDay ? Number(latestSelectedDay.positiveOperationalStreak || 0) : 0,
        emergencyReserveBalance: roundMoney(ledger.latestJars.emergency || 0),
        emergencyReserveTarget: roundMoney(latestSelectedDay ? latestSelectedDay.emergencyReserveTarget : 0),
        repurchasePolicy: latestSelectedDay ? Object.assign({}, latestSelectedDay.repurchasePolicy) : null,
        modelRatios: latestSelectedDay ? Object.assign({}, latestSelectedDay.allocationModelRatios) : null,
        conditions: {
          emergencyReady: !!latestConditions.emergencyReady,
          debtTrendDecreasing: !!latestConditions.debtTrendDecreasing,
          positiveOperational30Days: !!latestConditions.positiveOperational30Days,
          emergencyTarget: roundMoney(latestConditions.emergencyTarget || 0)
        }
      }
    };
  }

  function getOperationalBalanceAsOf(dateIso) {
    const ledger = getStrategicLedger(false);
    const targetDate = toIsoDateFromAny(dateIso || new Date().toISOString().slice(0, 10));
    const day = ledger.days.find(function (row) { return row.date === targetDate; });
    if (day) return roundMoney(day.jarBalances.operational || 0);
    if (!ledger.days.length) return 0;
    if (targetDate < ledger.days[0].date) return 0;
    return roundMoney(ledger.days[ledger.days.length - 1].jarBalances.operational || 0);
  }

  function getProLaboreBalanceAsOf(dateIso) {
    const ledger = getStrategicLedger(false);
    const targetDate = toIsoDateFromAny(dateIso || new Date().toISOString().slice(0, 10));
    const day = ledger.days.find(function (row) { return row.date === targetDate; });
    if (day) return roundMoney(day.jarBalances.proLabore || 0);
    if (!ledger.days.length) return 0;
    if (targetDate < ledger.days[0].date) return 0;
    return roundMoney(ledger.days[ledger.days.length - 1].jarBalances.proLabore || 0);
  }

  function getCycleDateRange(cycleKey) {
    const key = String(cycleKey || getCurrentCycleKey());
    const parts = key.split('-');
    if (parts.length !== 2) {
      const today = new Date();
      return {
        start: today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-01',
        end: today.toISOString().slice(0, 10)
      };
    }
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  function runStrategicComplianceAudit() {
    const ledger = getStrategicLedger(false);
    const tx = ledger.transactions || [];
    const invalidDateCount = tx.filter(function (item) { return !isValidIsoDate(item.date); }).length;
    const missingCreatedAtCount = tx.filter(function (item) { return !item.createdAt; }).length;
    const nonUuidIdCount = tx.filter(function (item) { return !looksLikeUuid(item.id); }).length;
    const hasAllocationEngine = !!(ledger.days && Array.isArray(ledger.days));
    const supportsTransfers = !!(withdrawalTypeInput && Array.from(withdrawalTypeInput.options || []).some(function (opt) {
      return String(opt.value || '').toUpperCase() === TRANSFER_TYPE;
    }));
    const supportsInvestments = !!(withdrawalTypeInput && Array.from(withdrawalTypeInput.options || []).some(function (opt) {
      return String(opt.value || '').toUpperCase() === INVESTMENT_TYPE;
    }));
    const findings = [];
    if (!hasAllocationEngine) findings.push('Allocation ledger unavailable.');
    if (invalidDateCount > 0) findings.push('Canonical transactions with invalid date: ' + invalidDateCount + '.');
    if (missingCreatedAtCount > 0) findings.push('Canonical transactions missing createdAt: ' + missingCreatedAtCount + '.');
    if (nonUuidIdCount > 0) findings.push('Canonical transactions with non-UUID id: ' + nonUuidIdCount + '.');
    const riskLevel = findings.length >= 3 ? 'High' : (findings.length > 0 ? 'Medium' : 'Low');
    return {
      timestamp: new Date().toISOString(),
      riskLevel: riskLevel,
      checks: {
        allocationBeforeExpense: true,
        jarProtection: true,
        operationalBalanceCalculation: true,
        dateIntegrity: invalidDateCount === 0 && missingCreatedAtCount === 0,
        profitFormula: true,
        reportingCapability: true,
        transferClassification: supportsTransfers,
        investmentClassification: supportsInvestments
      },
      findings: findings
    };
  }

  function refreshStrategicCaches() {
    strategicLedgerCache = null;
    strategicReportCache = generateStrategicAllocationReport('custom', {
      start: filterStartDateInput ? filterStartDateInput.value : '',
      end: filterEndDateInput ? filterEndDateInput.value : ''
    });
    strategicAuditCache = runStrategicComplianceAudit();
    window.zadoniStrategicReport = strategicReportCache;
    window.zadoniStrategicAudit = strategicAuditCache;
    window.zadoniAllocationController = {
      getLedger: function () { return getStrategicLedger(false); },
      generateReport: generateStrategicAllocationReport,
      runAudit: runStrategicComplianceAudit
    };
  }

  function parseJsonList(key) {
    if (DataModule && typeof DataModule.parseJsonList === 'function') {
      return DataModule.parseJsonList(localStorage, key);
    }
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      localStorage.removeItem(key);
      return [];
    }
  }

  function parseJsonObject(key, fallback) {
    if (DataModule && typeof DataModule.parseJsonObject === 'function') {
      return DataModule.parseJsonObject(localStorage, key, fallback);
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return Object.assign({}, fallback || {});
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return Object.assign({}, fallback || {});
      }
      return parsed;
    } catch (error) {
      localStorage.removeItem(key);
      return Object.assign({}, fallback || {});
    }
  }

  function loadCycleAlertState() {
    const state = parseJsonObject(STORAGE_CYCLE_ALERT_STATE, { notifiedCycles: {} });
    if (!state.notifiedCycles || typeof state.notifiedCycles !== 'object' || Array.isArray(state.notifiedCycles)) {
      state.notifiedCycles = {};
    }
    return state;
  }

  function saveCycleAlertState(state) {
    localStorage.setItem(STORAGE_CYCLE_ALERT_STATE, JSON.stringify(state || { notifiedCycles: {} }));
  }

  function buildCycleAlignmentPrompt(cycleKey, launchContext) {
    const context = launchContext ? (' (' + launchContext + ')') : '';
    const range = getCycleDateRange(cycleKey);
    const report = generateStrategicAllocationReport('custom', { start: range.start, end: range.end });
    const proLaboreBalance = getProLaboreBalanceAsOf(range.end);
    const operationalBalance = Number(report.summary ? report.summary.operationalBalance : 0);
    const goals = {
      Adonias: Number(partnerGoals.Adonias || 0),
      Zaine: Number(partnerGoals.Zaine || 0),
      Mayza: Number(partnerGoals.Mayza || 0),
      Dizimo: Number(partnerGoals.Dizimo || 0)
    };
    const totalGoal = goals.Adonias + goals.Zaine + goals.Mayza + goals.Dizimo;
    return [
      'Novo ciclo de lançamentos detectado' + context + ': ' + formatCycleLabel(cycleKey) + '.',
      'Alinhe o saldo da conta bancária com os objetivos definidos no frontend antes de continuar.',
      'Metas do ciclo -> Adonias: ' + toMoney(goals.Adonias) +
      ', Zaine: ' + toMoney(goals.Zaine) +
      ', Mayza: ' + toMoney(goals.Mayza) +
      ', Dízimo: ' + toMoney(goals.Dizimo) +
      ' (Total: ' + toMoney(totalGoal) + ').',
      'Saldos estratégicos atuais -> Operacional: ' + toMoney(operationalBalance) +
      ' | Pró-labore: ' + toMoney(proLaboreBalance) + '.',
      'Ação sugerida: reconciliar extrato bancário e ajustar metas/ritmo de gastos para o ciclo.'
    ].join('\n');
  }

  function notifyNewBusinessCycleIfNeeded(dateIso, launchContext) {
    const cycleKey = resolveCycleKey(dateIso);
    if (!cycleKey) return;
    const state = loadCycleAlertState();
    if (state.notifiedCycles[cycleKey]) return;
    state.notifiedCycles[cycleKey] = {
      at: new Date().toISOString(),
      context: launchContext || ''
    };
    saveCycleAlertState(state);
    alert(buildCycleAlignmentPrompt(cycleKey, launchContext));
  }

  function saveSupabaseSettings(settings) {
    localStorage.setItem(STORAGE_SUPABASE_SETTINGS, JSON.stringify(settings || {}));
  }

  function loadSupabaseSettings() {
    if (FRONTEND_ONLY_MODE) {
      return {
        url: '',
        anonKey: '',
        authEmail: '',
        adminMode: false,
        enabled: false
      };
    }
    const saved = parseJsonObject(STORAGE_SUPABASE_SETTINGS, {});
    const hasSavedUrl = typeof saved.url === 'string' && saved.url.trim();
    const hasSavedAnonKey = typeof saved.anonKey === 'string' && saved.anonKey.trim();
    const hasSavedEmail = typeof saved.authEmail === 'string' && saved.authEmail.trim();
    return {
      url: String(hasSavedUrl ? saved.url : DEFAULT_SUPABASE_SETTINGS.url),
      anonKey: String(hasSavedAnonKey ? saved.anonKey : DEFAULT_SUPABASE_SETTINGS.anonKey),
      authEmail: String(hasSavedEmail ? saved.authEmail : ''),
      adminMode: !!saved.adminMode,
      enabled: typeof saved.enabled === 'boolean' ? saved.enabled : !!DEFAULT_SUPABASE_SETTINGS.enabled
    };
  }

  function persistSupabaseSettings(patch) {
    const next = Object.assign({}, loadSupabaseSettings(), patch || {});
    saveSupabaseSettings(next);
    return next;
  }

  function applySupabaseSettingsToForm(settings) {
    if (supabaseUrlInput) supabaseUrlInput.value = settings.url || '';
    if (supabaseAnonKeyInput) supabaseAnonKeyInput.value = settings.anonKey || '';
    if (authEmailInput) authEmailInput.value = settings.authEmail || '';
    if (supabaseAdminModeInput) supabaseAdminModeInput.checked = !!settings.adminMode;
  }

  function getSupabaseSettingsFromForm() {
    return {
      url: supabaseUrlInput ? supabaseUrlInput.value.trim() : '',
      anonKey: supabaseAnonKeyInput ? supabaseAnonKeyInput.value.trim() : '',
      authEmail: authEmailInput ? authEmailInput.value.trim() : '',
      adminMode: isAdminModeEnabled()
    };
  }

  function setSupabaseStatus(message, tone) {
    if (!supabaseStatusNode) return;
    supabaseStatusNode.textContent = message;
    supabaseStatusNode.className = 'supabase-status ' + (tone || 'neutral');
  }

  function setAuthStatus(message, tone) {
    if (!authStatusNode) return;
    authStatusNode.textContent = message;
    authStatusNode.className = 'supabase-status ' + (tone || 'neutral');
  }

  function setSupabaseMissingTablesMessage(missing, blocked) {
    if (!supabaseMissingTablesNode) return;
    if (!isSupabaseReady()) {
      supabaseMissingTablesNode.textContent = 'Sem verificação de tabelas ainda.';
      return;
    }
    if (!missing.length && !blocked.length) {
      supabaseMissingTablesNode.textContent = 'Todas as tabelas obrigatórias foram reconhecidas no Supabase.';
      return;
    }
    const lines = [];
    if (missing.length) lines.push('Faltando criar: ' + missing.join(', ') + '.');
    if (blocked.length) lines.push('Sem acesso: ' + blocked.join(', ') + '.');
    lines.push('Use o arquivo supabase-schema.sql para criar as tabelas.');
    supabaseMissingTablesNode.textContent = lines.join(' ');
  }

  function isSupabaseReady() {
    if (FRONTEND_ONLY_MODE) return false;
    return !!(useSupabase && supabaseClient);
  }

  function isAuthenticated() {
    return !!(authUser && authUser.id);
  }

  function isAdminModeEnabled() {
    return !!(supabaseAdminModeInput && supabaseAdminModeInput.checked && adminModeAuthenticated && isAuthenticated());
  }

  function disableAdminMode(persistState) {
    adminModeAuthenticated = false;
    if (supabaseAdminModeInput) supabaseAdminModeInput.checked = false;
    if (persistState) {
      persistSupabaseSettings({ adminMode: false });
    }
  }

  function getPartnerGoalsRecordId() {
    if (isAuthenticated() && authUser && authUser.id) {
      return 'partner-goals-' + String(authUser.id);
    }
    return 'partner-goals-local';
  }

  function describeAuthUser(user) {
    if (!user) return 'Não autenticado.';
    const email = user.email || 'usuário sem e-mail';
    return 'Autenticado: ' + email;
  }

  function clearAuthPasswordField() {
    if (authPasswordInput) authPasswordInput.value = '';
  }

  async function refreshAuthSession() {
    if (!isSupabaseReady() || !supabaseClient.auth) {
      authUser = null;
      setAuthStatus('Não autenticado.', 'neutral');
      return null;
    }
    try {
      const response = await supabaseClient.auth.getSession();
      const session = response && response.data ? response.data.session : null;
      authUser = session && session.user ? session.user : null;
      setAuthStatus(describeAuthUser(authUser), authUser ? 'ok' : 'warn');
      if (!authUser) disableAdminMode(true);
      return authUser;
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      setAuthStatus('Erro de sessão. Tente reconectar.', 'error');
      return null;
    }
  }

  async function loginWithEmailPassword() {
    if (FRONTEND_ONLY_MODE) {
      setAuthStatus('Modo local ativo.', 'neutral');
      return true;
    }
    if (!isSupabaseReady() || !supabaseClient.auth) {
      alert('Conecte no Supabase antes de autenticar.');
      return false;
    }
    const email = authEmailInput ? authEmailInput.value.trim() : '';
    const password = authPasswordInput ? authPasswordInput.value : '';
    if (!email || !password) {
      alert('Informe e-mail e senha para autenticar.');
      return false;
    }
    persistSupabaseSettings({ authEmail: email });
    const response = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
    clearAuthPasswordField();
    if (response.error) {
      setAuthStatus('Falha no login: ' + response.error.message, 'error');
      return false;
    }
    authUser = response.data && response.data.user ? response.data.user : null;
    setAuthStatus(describeAuthUser(authUser), authUser ? 'ok' : 'warn');
    await loadData();
    refreshAll();
    return !!authUser;
  }

  async function registerWithEmailPassword() {
    if (FRONTEND_ONLY_MODE) {
      setAuthStatus('Modo local ativo.', 'neutral');
      return true;
    }
    if (!isSupabaseReady() || !supabaseClient.auth) {
      alert('Conecte no Supabase antes de criar conta.');
      return false;
    }
    const email = authEmailInput ? authEmailInput.value.trim() : '';
    const password = authPasswordInput ? authPasswordInput.value : '';
    if (!email || !password) {
      alert('Informe e-mail e senha para criar conta.');
      return false;
    }
    persistSupabaseSettings({ authEmail: email });
    const redirectUrl = window.location.origin + window.location.pathname;
    const response = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    clearAuthPasswordField();
    if (response.error) {
      setAuthStatus('Falha no cadastro: ' + response.error.message, 'error');
      return false;
    }
    setAuthStatus('Conta criada. Confirme seu e-mail e depois faça login.', 'ok');
    return true;
  }

  async function logoutAuthUser() {
    if (FRONTEND_ONLY_MODE) {
      authUser = null;
      setAuthStatus('Modo local ativo.', 'neutral');
      return;
    }
    if (!isSupabaseReady() || !supabaseClient.auth) return;
    await supabaseClient.auth.signOut();
    authUser = null;
    disableAdminMode(true);
    setAuthStatus('Não autenticado.', 'neutral');
    await loadData();
    refreshAll();
  }

  async function tryEnableAdminMode() {
    if (FRONTEND_ONLY_MODE) {
      disableAdminMode(true);
      setAuthStatus('Modo local ativo.', 'neutral');
      return false;
    }
    if (!isAuthenticated()) {
      alert('Faça login para ativar o Modo ADM.');
      disableAdminMode(true);
      return false;
    }
    const email = authUser && authUser.email ? String(authUser.email) : (authEmailInput ? authEmailInput.value.trim() : '');
    if (!email) {
      alert('E-mail de sessão não identificado. Faça login novamente.');
      disableAdminMode(true);
      return false;
    }
    const password = window.prompt('Confirme sua senha da conta para ativar o Modo ADM:');
    if (!password) {
      disableAdminMode(true);
      return false;
    }
    const response = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
    if (response.error) {
      disableAdminMode(true);
      alert('Senha inválida. Modo ADM não ativado.');
      return false;
    }
    adminModeAuthenticated = true;
    if (supabaseAdminModeInput) supabaseAdminModeInput.checked = true;
    persistSupabaseSettings({ adminMode: true, authEmail: email });
    setAuthStatus(describeAuthUser(response.data ? response.data.user : authUser), 'ok');
    alert('Modo ADM ativado para esta sessão.');
    return true;
  }

  function handleSupabaseWindowFocus() {
    if (!isSupabaseReady()) return;
    scheduleSupabaseSync(0);
  }

  function handleSupabaseVisibilityChange() {
    if (!isSupabaseReady()) return;
    if (document.visibilityState !== 'visible') return;
    scheduleSupabaseSync(0);
  }

  async function syncFromSupabaseNow() {
    if (!isSupabaseReady() || !isAuthenticated()) return;
    if (supabaseSyncInFlight) return;
    supabaseSyncInFlight = true;
    try {
      setSupabaseStatus('Sincronizando...', 'neutral');
      await loadDataFromSupabase({ resetUi: false });
      refreshAll();
      setSupabaseStatus('Sincronizado e atualizado.', 'ok');
    } catch (error) {
      setSupabaseStatus('Erro na sincronização. Tentando novamente...', 'warn');
    } finally {
      supabaseSyncInFlight = false;
    }
  }

  function scheduleSupabaseSync(delayMs) {
    if (!isSupabaseReady()) return;
    if (supabaseSyncTimeoutId) clearTimeout(supabaseSyncTimeoutId);
    const delay = Math.max(0, Number(delayMs || 0));
    supabaseSyncTimeoutId = setTimeout(function () {
      supabaseSyncTimeoutId = null;
      syncFromSupabaseNow();
    }, delay);
  }

  function stopSupabaseLiveSync() {
    if (supabaseSyncTimeoutId) {
      clearTimeout(supabaseSyncTimeoutId);
      supabaseSyncTimeoutId = null;
    }
    if (supabaseSyncIntervalId) {
      clearInterval(supabaseSyncIntervalId);
      supabaseSyncIntervalId = null;
    }
    window.removeEventListener('focus', handleSupabaseWindowFocus);
    document.removeEventListener('visibilitychange', handleSupabaseVisibilityChange);
    if (supabaseRealtimeChannel && supabaseClient && typeof supabaseClient.removeChannel === 'function') {
      supabaseClient.removeChannel(supabaseRealtimeChannel);
    }
    supabaseRealtimeChannel = null;
  }

  function startSupabaseLiveSync() {
    stopSupabaseLiveSync();
    if (!isSupabaseReady() || !isAuthenticated()) return;

    window.addEventListener('focus', handleSupabaseWindowFocus);
    document.addEventListener('visibilitychange', handleSupabaseVisibilityChange);
    supabaseSyncIntervalId = setInterval(function () {
      scheduleSupabaseSync(0);
    }, 30000);

    if (typeof supabaseClient.channel === 'function') {
      const tables = supabaseSyncedTables.length ? supabaseSyncedTables.slice() : [];
      if (!tables.length) return;
      const channel = supabaseClient.channel('zadoni-live-sync');
      tables.forEach(function (tableName) {
        channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: tableName
        }, function () {
          scheduleSupabaseSync(350);
        });
      });
      channel.subscribe();
      supabaseRealtimeChannel = channel;
    }
  }

  function saveProducts() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PRODUCTS, products);
      return;
    }
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  }

  function saveSales() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_SALES, sales);
      return;
    }
    localStorage.setItem(STORAGE_SALES, JSON.stringify(sales));
  }

  function syncUnifiedMovementLedger() {
    if (!DataModule || typeof DataModule.createMovementLedger !== 'function' || typeof DataModule.writeMovementLedger !== 'function') return;
    const tools = {
      calc: {
        toIsoDateFromAny: toIsoDateFromAny,
        toIsoTimestamp: toIsoTimestamp
      },
      isInventoryPurchaseType: isInventoryPurchaseType,
      generateUuid: generateUuid
    };
    movementLedgerEntries = DataModule.createMovementLedger({
      purchases: purchases,
      withdrawals: withdrawals,
      partnerContributions: partnerContributions,
      adsInvestments: adsInvestments
    }, tools);
    DataModule.writeMovementLedger(localStorage, STORAGE_MOVEMENTS, movementLedgerEntries);
  }

  function hasLegacyMovementData() {
    return purchases.length > 0
      || withdrawals.length > 0
      || partnerContributions.length > 0
      || adsInvestments.length > 0;
  }

  function hydrateMovementCollectionsFromLedgerIfNeeded() {
    if (!DataModule || typeof DataModule.readMovementLedger !== 'function' || typeof DataModule.hydrateMovementCollections !== 'function') return;
    const tools = {
      calc: {
        toIsoDateFromAny: toIsoDateFromAny,
        toIsoTimestamp: toIsoTimestamp
      },
      isInventoryPurchaseType: isInventoryPurchaseType,
      generateUuid: generateUuid
    };
    movementLedgerEntries = DataModule.readMovementLedger(localStorage, STORAGE_MOVEMENTS, tools);
    if (hasLegacyMovementData() || movementLedgerEntries.length === 0) {
      syncUnifiedMovementLedger();
      return;
    }
    const hydrated = DataModule.hydrateMovementCollections(movementLedgerEntries, tools);
    if (!hydrated || typeof hydrated !== 'object') return;
    suppressMovementLedgerSync = true;
    purchases = Array.isArray(hydrated.purchases) ? hydrated.purchases : [];
    withdrawals = Array.isArray(hydrated.withdrawals) ? hydrated.withdrawals : [];
    partnerContributions = Array.isArray(hydrated.partnerContributions) ? hydrated.partnerContributions : [];
    adsInvestments = Array.isArray(hydrated.adsInvestments) ? hydrated.adsInvestments : [];
    savePurchases();
    saveWithdrawals();
    savePartnerContributions();
    saveAdsInvestments();
    suppressMovementLedgerSync = false;
    syncUnifiedMovementLedger();
  }

  function savePurchases() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PURCHASES, purchases);
    } else {
      localStorage.setItem(STORAGE_PURCHASES, JSON.stringify(purchases));
    }
    if (!suppressMovementLedgerSync) syncUnifiedMovementLedger();
  }

  function saveWithdrawals() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_WITHDRAWALS, withdrawals);
    } else {
      localStorage.setItem(STORAGE_WITHDRAWALS, JSON.stringify(withdrawals));
    }
    if (!suppressMovementLedgerSync) syncUnifiedMovementLedger();
  }

  function savePersonalTransactions() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PERSONAL_TRANSACTIONS, personalTransactions);
      return;
    }
    localStorage.setItem(STORAGE_PERSONAL_TRANSACTIONS, JSON.stringify(personalTransactions));
  }

  function saveAdsInvestments() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_ADS_INVESTMENTS, adsInvestments);
    } else {
      localStorage.setItem(STORAGE_ADS_INVESTMENTS, JSON.stringify(adsInvestments));
    }
    if (!suppressMovementLedgerSync) syncUnifiedMovementLedger();
  }

  function saveDailyClosings() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_DAILY_CLOSINGS, dailyClosings || []);
      return;
    }
    localStorage.setItem(STORAGE_DAILY_CLOSINGS, JSON.stringify(dailyClosings || []));
  }

  function applyDataMigrations() {
    loadCanonicalIdMap();
    let migratedProducts = false;
    products = products.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedProducts = true;
      }
      const name = String(normalized.name || '').trim() || 'Produto sem nome';
      if (normalized.name !== name) {
        normalized.name = name;
        migratedProducts = true;
      }
      const description = normalizeProductDescription(normalized.description);
      if (normalized.description !== description) {
        normalized.description = description;
        migratedProducts = true;
      }
      const category = String(normalized.category || '').trim();
      if (normalized.category !== category) {
        normalized.category = category;
        migratedProducts = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, new Date().toISOString().slice(0, 10));
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedProducts = true;
      }
      normalized.costPrice = Number(normalized.costPrice || 0);
      normalized.suggestedPrice = Number(normalized.suggestedPrice || 0);
      return normalized;
    });
    if (migratedProducts) saveProducts();

    const productById = products.reduce(function (acc, product) {
      if (product && product.id) acc[product.id] = product;
      return acc;
    }, {});

    let migratedSales = false;
    sales = sales.map(function (item) {
      const normalized = Object.assign({}, item);
      const channel = normalizeSaleChannel(normalized.saleChannel);
      if (normalized.saleChannel !== channel) {
        normalized.saleChannel = channel;
        migratedSales = true;
      }
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedSales = true;
      }
      const date = toIsoDateFromAny(normalized.date || normalized.createdAt);
      if (normalized.date !== date) {
        normalized.date = date;
        migratedSales = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, date);
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedSales = true;
      }
      normalized.revenue = Number(normalized.revenue || 0);
      normalized.totalCost = Number(normalized.totalCost || 0);
      normalized.expense = Number(normalized.expense || 0);
      normalized.netProfit = Number(normalized.netProfit || 0);
      const linkedProduct = productById[normalized.productId] || null;
      const productName = String(normalized.productName || (linkedProduct ? linkedProduct.name : '') || '').trim();
      if (normalized.productName !== productName) {
        normalized.productName = productName;
        migratedSales = true;
      }
      const productDescription = normalizeProductDescription(normalized.productDescription || (linkedProduct ? linkedProduct.description : ''));
      if (normalized.productDescription !== productDescription) {
        normalized.productDescription = productDescription;
        migratedSales = true;
      }
      return normalized;
    });
    if (migratedSales) saveSales();

    let migratedPurchases = false;
    purchases = purchases.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedPurchases = true;
      }
      const purchaseDate = toIsoDateFromAny(normalized.purchaseDate || normalized.date || normalized.createdAt);
      if (normalized.purchaseDate !== purchaseDate) {
        normalized.purchaseDate = purchaseDate;
        migratedPurchases = true;
      }
      if (normalized.date !== purchaseDate) {
        normalized.date = purchaseDate;
        migratedPurchases = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, purchaseDate);
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedPurchases = true;
      }
      normalized.total = Number(normalized.total || 0);
      normalized.quantity = Number(normalized.quantity || 0);
      normalized.isOtherFunding = !!normalized.isOtherFunding;
      const inferredInventoryPurchase = isInventoryPurchaseType(normalized.type);
      if (typeof normalized.isInventoryPurchase !== 'boolean') {
        normalized.isInventoryPurchase = inferredInventoryPurchase;
        migratedPurchases = true;
      } else if (normalized.isInventoryPurchase !== inferredInventoryPurchase && normalized.type) {
        normalized.isInventoryPurchase = inferredInventoryPurchase;
        migratedPurchases = true;
      }
      if (normalized.isOtherFunding && !normalized.fundingSource) {
        normalized.fundingSource = 'Fonte externa';
        migratedPurchases = true;
      }
      return normalized;
    });
    if (migratedPurchases) savePurchases();

    let migratedWithdrawals = false;
    withdrawals = withdrawals.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedWithdrawals = true;
      }
      const withdrawalDate = toIsoDateFromAny(normalized.withdrawalDate || normalized.date || normalized.createdAt);
      if (normalized.withdrawalDate !== withdrawalDate) {
        normalized.withdrawalDate = withdrawalDate;
        migratedWithdrawals = true;
      }
      if (normalized.date !== withdrawalDate) {
        normalized.date = withdrawalDate;
        migratedWithdrawals = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, withdrawalDate);
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedWithdrawals = true;
      }
      normalized.amount = Number(normalized.amount || 0);
      normalized.isOtherFunding = !!normalized.isOtherFunding;
      const isLegacyPersonalLinked = normalized.linkedSource === 'personal' ||
        String(normalized.id || '').indexOf('personal-') === 0 ||
        normalizeText(normalized.type).indexOf('personal exit') >= 0;
      const flowType = isLegacyPersonalLinked
        ? 'transfer'
        : (normalized.flowType || classifyFlowType(normalized.type, normalized.type, normalized.notes));
      if (normalized.flowType !== flowType) {
        normalized.flowType = flowType;
        migratedWithdrawals = true;
      }
      const expectedType = flowType === 'transfer' ? TRANSFER_TYPE : (flowType === 'investment' ? INVESTMENT_TYPE : normalized.type);
      if (expectedType && normalized.type !== expectedType) {
        normalized.type = expectedType;
        migratedWithdrawals = true;
      }
      if (normalized.isOtherFunding && !normalized.fundingSource) {
        normalized.fundingSource = 'Fonte externa';
        migratedWithdrawals = true;
      }
      return normalized;
    });
    if (migratedWithdrawals) saveWithdrawals();

    let migratedContrib = false;
    partnerContributions = partnerContributions.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedContrib = true;
      }
      if (!normalized.createdAt) {
        normalized.createdAt = toIsoTimestamp('', normalized.date || new Date().toISOString().slice(0, 10));
        migratedContrib = true;
      }
      const date = toIsoDateFromAny(normalized.date || normalized.createdAt);
      if (normalized.date !== date) {
        normalized.date = date;
        migratedContrib = true;
      }
      if (!normalized.cycleKey) {
        normalized.cycleKey = resolveCycleKey(normalized.date || normalized.createdAt);
        migratedContrib = true;
      }
      normalized.amount = Number(normalized.amount || 0);
      normalized.isOtherFunding = !!normalized.isOtherFunding;
      return normalized;
    });
    if (migratedContrib) savePartnerContributions();

    let migratedPersonal = false;
    personalTransactions = personalTransactions.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.date) {
        const createdAt = String(normalized.createdAt || new Date().toISOString());
        normalized.date = createdAt.slice(0, 10);
        migratedPersonal = true;
      }
      if (!normalized.createdAt) {
        normalized.createdAt = toIsoTimestamp('', normalized.date);
        migratedPersonal = true;
      }
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedPersonal = true;
      }
      normalized.type = normalized.type === 'entry' ? 'entry' : 'exit';
      if (!normalized.category) {
        normalized.category = normalized.type === 'entry' ? 'Renda' : 'Outros';
        migratedPersonal = true;
      }
      normalized.amount = Number(normalized.amount || 0);
      normalized.usesBusinessFunds = !!normalized.usesBusinessFunds;
      if (!normalized.usesBusinessFunds && !normalized.fundingSource) {
        normalized.fundingSource = 'Fonte externa';
        migratedPersonal = true;
      }
      return normalized;
    });
    if (migratedPersonal) savePersonalTransactions();

    let migratedAds = false;
    adsInvestments = adsInvestments.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedAds = true;
      }
      const date = toIsoDateFromAny(normalized.date || normalized.createdAt);
      if (normalized.date !== date) {
        normalized.date = date;
        migratedAds = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, date);
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedAds = true;
      }
      normalized.amount = Number(normalized.amount || 0);
      return normalized;
    });
    if (migratedAds) saveAdsInvestments();

    let migratedDailyClosings = false;
    dailyClosings = dailyClosings.map(function (item) {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = generateUuid();
        migratedDailyClosings = true;
      }
      const date = toIsoDateFromAny(normalized.date || normalized.createdAt || new Date().toISOString().slice(0, 10));
      if (normalized.date !== date) {
        normalized.date = date;
        migratedDailyClosings = true;
      }
      const createdAt = toIsoTimestamp(normalized.createdAt, date);
      if (normalized.createdAt !== createdAt) {
        normalized.createdAt = createdAt;
        migratedDailyClosings = true;
      }
      normalized.responsible = String(normalized.responsible || '').trim();
      if (!normalized.responsible) {
        normalized.responsible = 'Responsável não informado';
        migratedDailyClosings = true;
      }
      normalized.status = ['green', 'yellow', 'red'].includes(String(normalized.status || ''))
        ? String(normalized.status)
        : 'yellow';
      normalized.bankCheck = ['yes', 'no'].includes(String(normalized.bankCheck || normalized.bankReconciled || ''))
        ? String(normalized.bankCheck || normalized.bankReconciled)
        : 'unknown';
      normalized.notes = String(normalized.notes || normalized.observations || '').trim();
      normalized.summary = normalized.summary && typeof normalized.summary === 'object'
        ? Object.assign({}, normalized.summary)
        : {};
      return normalized;
    }).filter(function (item) {
      return !!item.date;
    }).sort(function (a, b) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    }).slice(0, DAILY_CHECKLIST_MAX_HISTORY);
    if (migratedDailyClosings) saveDailyClosings();

    strategicLedgerCache = null;
    strategicReportCache = null;
    strategicAuditCache = null;
  }

  function applyInitialUiDefaults() {
    goalAdoniasInput.value = partnerGoals.Adonias;
    goalZaineInput.value = partnerGoals.Zaine;
    goalMayzaInput.value = partnerGoals.Mayza;
    goalDizimoInput.value = partnerGoals.Dizimo;
    if (purchaseDateInput) purchaseDateInput.value = new Date().toISOString().slice(0, 10);
    if (withdrawalDateInput) withdrawalDateInput.value = new Date().toISOString().slice(0, 10);
    if (personalDateInput) personalDateInput.value = new Date().toISOString().slice(0, 10);
    if (adsDateInput) adsDateInput.value = new Date().toISOString().slice(0, 10);
    if (dailyCloseDateInput) dailyCloseDateInput.value = new Date().toISOString().slice(0, 10);
    if (dailyCloseBankCheckInput) dailyCloseBankCheckInput.value = '';
    if (movementDateInput) movementDateInput.value = new Date().toISOString().slice(0, 10);
    if (movementKindInput && !movementKindInput.value) movementKindInput.value = 'purchase';
    if (movementQuantityInput && !movementQuantityInput.value) movementQuantityInput.value = '1';
    if (saleChannelInput) saleChannelInput.value = DEFAULT_SALE_CHANNEL;
    if (saleDateInput) saleDateInput.value = new Date().toISOString().slice(0, 10);
    selectedPartnerCycle = getCurrentCycleKey();
    updateUnifiedMovementFormByKind();
  }

  function loadLocalData() {
    products = parseJsonList(STORAGE_PRODUCTS);
    sales = parseJsonList(STORAGE_SALES);
    purchases = parseJsonList(STORAGE_PURCHASES);
    withdrawals = parseJsonList(STORAGE_WITHDRAWALS);
    personalTransactions = parseJsonList(STORAGE_PERSONAL_TRANSACTIONS);
    adsInvestments = parseJsonList(STORAGE_ADS_INVESTMENTS);
    dailyClosings = parseJsonList(STORAGE_DAILY_CLOSINGS);
    partnerContributions = parseJsonList(STORAGE_PARTNER_CONTRIBUTIONS);
    hydrateMovementCollectionsFromLedgerIfNeeded();
    partnerGoals = { Adonias: 3000, Zaine: 3000, Mayza: 3000, Dizimo: 3000 };
    applyDataMigrations();
    const goalData = parseJsonList(STORAGE_PARTNER_GOALS);
    if (goalData.length === 1 && goalData[0] && typeof goalData[0] === 'object') {
      partnerGoals = {
        Adonias: Number(goalData[0].Adonias || 0),
        Zaine: Number(goalData[0].Zaine || 0),
        Mayza: Number(goalData[0].Mayza || 0),
        Dizimo: Number(goalData[0].Dizimo || 0)
      };
    }
    applyInitialUiDefaults();
  }

  function savePartnerContributions() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PARTNER_CONTRIBUTIONS, partnerContributions);
    } else {
      localStorage.setItem(STORAGE_PARTNER_CONTRIBUTIONS, JSON.stringify(partnerContributions));
    }
    if (!suppressMovementLedgerSync) syncUnifiedMovementLedger();
  }

  function savePartnerGoals() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PARTNER_GOALS, [partnerGoals]);
      return;
    }
    localStorage.setItem(STORAGE_PARTNER_GOALS, JSON.stringify([partnerGoals]));
  }

  async function checkSupabaseSchema() {
    if (FRONTEND_ONLY_MODE) {
      return { missing: [], blocked: [] };
    }
    if (!isSupabaseReady()) {
      return { missing: [], blocked: [] };
    }
    const missing = [];
    const blocked = [];
    for (let idx = 0; idx < SUPABASE_REQUIRED_TABLES.length; idx += 1) {
      const tableName = SUPABASE_REQUIRED_TABLES[idx];
      const response = await supabaseClient.from(tableName).select('id', { head: true, count: 'exact' });
      if (!response.error) continue;
      const code = String(response.error.code || '');
      const message = String(response.error.message || '').toLowerCase();
      const missingTable = code === '42P01' || message.indexOf('does not exist') >= 0;
      if (missingTable) {
        missing.push(tableName);
      } else {
        blocked.push(tableName);
      }
    }
    setSupabaseMissingTablesMessage(missing, blocked);
    return { missing: missing, blocked: blocked };
  }

  async function fetchSupabaseCollection(entityKey, fallbackList) {
    if (FRONTEND_ONLY_MODE) {
      return Array.isArray(fallbackList) ? fallbackList : [];
    }
    if (!isSupabaseReady() || !isAuthenticated()) return Array.isArray(fallbackList) ? fallbackList : [];
    const tableName = SUPABASE_TABLES[entityKey];
    const response = await supabaseClient.from(tableName).select('id,payload,created_at').order('created_at', { ascending: false });
    if (response.error) {
      return Array.isArray(fallbackList) ? fallbackList : [];
    }
    const remoteList = (response.data || []).map(function (row) {
      const payload = row && row.payload && typeof row.payload === 'object' ? Object.assign({}, row.payload) : {};
      if (!payload.id && row.id) payload.id = row.id;
      if (!payload.createdAt && row.created_at) payload.createdAt = row.created_at;
      return payload;
    });
    return remoteList;
  }

  async function loadDataFromSupabase(options) {
    if (FRONTEND_ONLY_MODE) {
      loadLocalData();
      return;
    }
    const shouldResetUi = !options || options.resetUi !== false;
    const localProducts = parseJsonList(STORAGE_PRODUCTS);
    const localSales = parseJsonList(STORAGE_SALES);
    const localPurchases = parseJsonList(STORAGE_PURCHASES);
    const localWithdrawals = parseJsonList(STORAGE_WITHDRAWALS);
    const localPersonalTransactions = parseJsonList(STORAGE_PERSONAL_TRANSACTIONS);
    const localAdsInvestments = parseJsonList(STORAGE_ADS_INVESTMENTS);
    const localDailyClosings = parseJsonList(STORAGE_DAILY_CLOSINGS);
    const localContributions = parseJsonList(STORAGE_PARTNER_CONTRIBUTIONS);
    const localGoals = parseJsonList(STORAGE_PARTNER_GOALS);

    products = await fetchSupabaseCollection('products', localProducts);
    sales = await fetchSupabaseCollection('sales', localSales);
    purchases = await fetchSupabaseCollection('purchases', localPurchases);
    withdrawals = await fetchSupabaseCollection('withdrawals', localWithdrawals);
    personalTransactions = await fetchSupabaseCollection('personalTransactions', localPersonalTransactions);
    adsInvestments = await fetchSupabaseCollection('adsInvestments', localAdsInvestments);
    dailyClosings = localDailyClosings;
    partnerContributions = await fetchSupabaseCollection('partnerContributions', localContributions);
    partnerGoals = { Adonias: 3000, Zaine: 3000, Mayza: 3000, Dizimo: 3000 };

    const goalRows = await fetchSupabaseCollection('partnerGoals', localGoals);
    const goalObj = goalRows.length > 0 && goalRows[0] && typeof goalRows[0] === 'object' ? goalRows[0] : null;
    if (goalObj) {
      partnerGoals = {
        Adonias: Number(goalObj.Adonias || 0),
        Zaine: Number(goalObj.Zaine || 0),
        Mayza: Number(goalObj.Mayza || 0),
        Dizimo: Number(goalObj.Dizimo || 0)
      };
    }

    applyDataMigrations();
    saveProducts();
    saveSales();
    savePurchases();
    saveWithdrawals();
    savePersonalTransactions();
    saveAdsInvestments();
    saveDailyClosings();
    savePartnerContributions();
    savePartnerGoals();
    syncUnifiedMovementLedger();
    if (shouldResetUi) applyInitialUiDefaults();
  }

  async function loadData() {
    if (isSupabaseReady() && isAuthenticated()) {
      await loadDataFromSupabase();
      return;
    }
    loadLocalData();
  }

  async function connectSupabase(silent) {
    if (FRONTEND_ONLY_MODE) {
      disconnectSupabase();
      if (!silent) alert('Esta versão foi preparada para uso somente local no navegador.');
      return false;
    }
    stopSupabaseLiveSync();
    const settings = getSupabaseSettingsFromForm();
    if (!settings.url || !settings.anonKey) {
      disableAdminMode(true);
      useSupabase = false;
      supabaseClient = null;
      supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.slice();
      setSupabaseStatus('Credenciais ausentes. Funcionando em modo local.', 'neutral');
      setSupabaseMissingTablesMessage([], []);
      if (!silent) alert('Informe Supabase URL e Supabase Anon Key para conectar.');
      persistSupabaseSettings({
        url: settings.url,
        anonKey: settings.anonKey,
        authEmail: settings.authEmail,
        adminMode: settings.adminMode,
        enabled: false
      });
      return false;
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      disableAdminMode(true);
      useSupabase = false;
      supabaseClient = null;
      supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.slice();
      setSupabaseStatus('Biblioteca Supabase não carregada.', 'error');
      if (!silent) alert('A biblioteca do Supabase não foi carregada na página.');
      return false;
    }

    setSupabaseStatus('Conectando ao Supabase...', 'neutral');
    supabaseClient = window.supabase.createClient(settings.url, settings.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    useSupabase = true;
    if (supabaseAuthSubscription && typeof supabaseAuthSubscription.unsubscribe === 'function') {
      supabaseAuthSubscription.unsubscribe();
    }
    supabaseAuthSubscription = null;
    if (supabaseClient.auth && typeof supabaseClient.auth.onAuthStateChange === 'function') {
      const listener = supabaseClient.auth.onAuthStateChange(function (event, session) {
        const hadUser = !!authUser;
        authUser = session && session.user ? session.user : null;
        const hasUser = !!authUser;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && hasUser)) {
          setAuthStatus(describeAuthUser(authUser), 'ok');
          scheduleSupabaseSync(0);
        } else if (event === 'SIGNED_OUT') {
          setAuthStatus('Não autenticado.', 'neutral');
          disableAdminMode(true);
          loadData().then(refreshAll);
        }

        if (hasUser) {
          setSupabaseStatus('Conectado e Autenticado.', 'ok');
        } else {
          setSupabaseStatus('Conectado. Faça login para acessar dados.', 'warn');
        }
      });
      if (listener && listener.data && listener.data.subscription) {
        supabaseAuthSubscription = listener.data.subscription;
      }
    }
    persistSupabaseSettings({
      url: settings.url,
      anonKey: settings.anonKey,
      authEmail: settings.authEmail,
      adminMode: settings.adminMode,
      enabled: true
    });

    await refreshAuthSession();
    if (!isAuthenticated()) {
      setSupabaseStatus('Conectado ao Supabase. Faça login para acessar seus dados.', 'warn');
      if (supabaseMissingTablesNode) {
        supabaseMissingTablesNode.textContent = 'Faça login e clique em Verificar Tabelas para validar o schema.';
      }
      await loadData();
      return true;
    }

    const schema = await checkSupabaseSchema();
    supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.filter(function (tableName) {
      return schema.missing.indexOf(tableName) < 0 && schema.blocked.indexOf(tableName) < 0;
    });
    if (schema.blocked.length) {
      setSupabaseStatus('Conectado com restrições de acesso em tabelas.', 'warn');
    } else if (schema.missing.length) {
      setSupabaseStatus('Conectado, mas faltam tabelas para uso completo.', 'warn');
    } else {
      setSupabaseStatus('Conectado ao Supabase. Base remota e sincronização ativa.', 'ok');
    }
    await loadData();
    startSupabaseLiveSync();
    return true;
  }

  function disconnectSupabase() {
    stopSupabaseLiveSync();
    disableAdminMode(true);
    authUser = null;
    if (supabaseAuthSubscription && typeof supabaseAuthSubscription.unsubscribe === 'function') {
      supabaseAuthSubscription.unsubscribe();
    }
    supabaseAuthSubscription = null;
    setAuthStatus('Não autenticado.', 'neutral');
    useSupabase = false;
    supabaseClient = null;
    supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.slice();
    persistSupabaseSettings({ enabled: false });
    setSupabaseStatus('Supabase desligado. Funcionando em modo local.', 'neutral');
    setSupabaseMissingTablesMessage([], []);
  }

  async function bootstrapSupabaseConnection() {
    if (FRONTEND_ONLY_MODE) {
      localStorage.removeItem(STORAGE_SUPABASE_SETTINGS);
      useSupabase = false;
      supabaseClient = null;
      authUser = null;
      applySupabaseSettingsToForm(loadSupabaseSettings());
      disableAdminMode(false);
      setAuthStatus('Modo local.', 'neutral');
      setSupabaseStatus('Modo local ativo. Dados salvos no navegador deste dispositivo.', 'neutral');
      setSupabaseMissingTablesMessage([], []);
      return;
    }
    const settings = loadSupabaseSettings();
    applySupabaseSettingsToForm(settings);
    disableAdminMode(true);
    setAuthStatus('Não autenticado.', 'neutral');
    if (settings.enabled && settings.url && settings.anonKey) {
      await connectSupabase(true);
      return;
    }
    setSupabaseStatus('Não conectado ao Supabase. Para dados compartilhados entre dispositivos, conecte agora.', 'warn');
    setSupabaseMissingTablesMessage([], []);
  }

  function getRecordCreatedAt(record) {
    if (!record || typeof record !== 'object') return new Date().toISOString();
    if (record.createdAt) return record.createdAt;
    if (record.purchaseDate) return String(record.purchaseDate).slice(0, 10) + 'T00:00:00';
    if (record.withdrawalDate) return String(record.withdrawalDate).slice(0, 10) + 'T00:00:00';
    if (record.date) return String(record.date).slice(0, 10) + 'T00:00:00';
    return new Date().toISOString();
  }

  async function pushRecordToSupabase(entityKey, record, customId) {
    if (FRONTEND_ONLY_MODE) return true;
    if (!isSupabaseReady()) return true;
    if (!isAuthenticated()) {
      alert('Faça login para salvar no Supabase.');
      return false;
    }
    const tableName = SUPABASE_TABLES[entityKey];
    const payload = Object.assign({}, record);
    const id = String(customId || payload.id || generateUuid());
    payload.id = id;
    const row = SyncModule && typeof SyncModule.buildUpsertRow === 'function'
      ? SyncModule.buildUpsertRow(id, payload, getRecordCreatedAt(payload))
      : {
        id: id,
        payload: payload,
        created_at: getRecordCreatedAt(payload)
      };
    const response = await supabaseClient.from(tableName).upsert([row], { onConflict: 'id' });
    const supabaseError = SyncModule && typeof SyncModule.getSupabaseErrorMessage === 'function'
      ? SyncModule.getSupabaseErrorMessage(response)
      : String(response && response.error && response.error.message || '');
    if (supabaseError) {
      alert('Falha ao salvar no Supabase: ' + supabaseError);
      return false;
    }
    scheduleSupabaseSync(250);
    return true;
  }

  async function removeRecordsFromSupabase(entityKey, ids, requireAdminMode) {
    if (FRONTEND_ONLY_MODE) return true;
    if (!isSupabaseReady()) return true;
    if (!isAuthenticated()) {
      alert('Faça login para excluir no Supabase.');
      return false;
    }
    const list = SyncModule && typeof SyncModule.sanitizeIdList === 'function'
      ? SyncModule.sanitizeIdList(ids)
      : (ids || []).filter(function (id) { return !!id; });
    if (!list.length) return true;
    if (requireAdminMode && !isAdminModeEnabled()) {
      alert('Ative o Modo ADM com senha para excluir registros no Supabase.');
      return false;
    }
    const tableName = SUPABASE_TABLES[entityKey];
    const response = await supabaseClient.from(tableName).delete().in('id', list);
    const supabaseError = SyncModule && typeof SyncModule.getSupabaseErrorMessage === 'function'
      ? SyncModule.getSupabaseErrorMessage(response)
      : String(response && response.error && response.error.message || '');
    if (supabaseError) {
      alert('Falha ao excluir no Supabase: ' + supabaseError);
      return false;
    }
    scheduleSupabaseSync(250);
    return true;
  }

  function getActiveTabName() {
    const activeTab = tabs.find(function (tab) { return tab.classList.contains('is-active'); });
    return activeTab ? activeTab.getAttribute('data-tab') : 'cash';
  }

  function loadUiAdvancedModeFlag() {
    try {
      return localStorage.getItem(STORAGE_UI_ADVANCED_MODE) === '1';
    } catch (error) {
      return false;
    }
  }

  function persistUiAdvancedModeFlag(enabled) {
    try {
      localStorage.setItem(STORAGE_UI_ADVANCED_MODE, enabled ? '1' : '0');
    } catch (error) {
      // Keep UI mode resilient when local storage is unavailable.
    }
  }

  function applyUiAdvancedMode(enabled) {
    uiAdvancedMode = !!enabled;
    const advancedNodes = Array.from(document.querySelectorAll('.advanced-only'));
    advancedNodes.forEach(function (node) {
      if (UiModule && typeof UiModule.setHidden === 'function') {
        UiModule.setHidden(node, !uiAdvancedMode);
        return;
      }
      if (uiAdvancedMode) node.removeAttribute('hidden');
      else node.setAttribute('hidden', 'hidden');
    });
    if (UiModule && typeof UiModule.toggleClass === 'function') {
      UiModule.toggleClass(document.body, 'advanced-visible', uiAdvancedMode);
    } else {
      document.body.classList.toggle('advanced-visible', uiAdvancedMode);
    }
    if (toggleAdvancedModulesBtn) {
      toggleAdvancedModulesBtn.textContent = uiAdvancedMode
        ? 'Ocultar controles extras'
        : 'Mostrar controles extras';
    }
    if (uiModeStatusNode) {
      uiModeStatusNode.textContent = uiAdvancedMode
        ? 'Controles extras visíveis: compras detalhadas, potes e manual.'
        : 'Modo gestão interna ativo: painel, vendas, movimentações e análise local.';
    }
    if (!uiAdvancedMode) {
      closeHelpGuide();
    }
    const activeTabName = getActiveTabName();
    if (!uiAdvancedMode && ADVANCED_TAB_NAMES.indexOf(activeTabName) >= 0) {
      setActiveTab('cash');
    }
  }

  function printScreen(screenName) {
    const previousTab = getActiveTabName();
    document.body.setAttribute('data-print-screen', screenName);
    setActiveTab(screenName);
    window.print();
    setTimeout(function () {
      document.body.removeAttribute('data-print-screen');
      setActiveTab(previousTab);
    }, 100);
  }

  function setActiveTab(tabName) {
    const safeTabName = (!uiAdvancedMode && ADVANCED_TAB_NAMES.indexOf(tabName) >= 0) ? 'cash' : tabName;
    tabs.forEach(function (tab) {
      const active = tab.getAttribute('data-tab') === safeTabName;
      tab.classList.toggle('is-active', active);
    });

    screens.forEach(function (screen) {
      const active = screen.getAttribute('data-screen') === safeTabName;
      screen.classList.toggle('is-active', active);
    });
  }

  function getHelpModule(scope) {
    return HELP_GUIDE_CONTENT[scope] || HELP_GUIDE_CONTENT.business;
  }

  function getHelpTopics(scope) {
    const module = getHelpModule(scope);
    return Array.isArray(module.topics) ? module.topics : [];
  }

  function enrichHelpGuideContent() {
    Object.keys(HELP_GUIDE_EXTRA_QUESTIONS).forEach(function (topicId) {
      const extras = Array.isArray(HELP_GUIDE_EXTRA_QUESTIONS[topicId]) ? HELP_GUIDE_EXTRA_QUESTIONS[topicId] : [];
      if (!extras.length) return;
      ['business', 'personal'].forEach(function (scope) {
        const topics = getHelpTopics(scope);
        const topic = topics.find(function (item) { return item.id === topicId; });
        if (!topic) return;
        if (!Array.isArray(topic.quiz)) topic.quiz = [];
        extras.forEach(function (extraQuestion) {
          if (!topic.quiz.some(function (existing) { return existing.id === extraQuestion.id; })) {
            topic.quiz.push(extraQuestion);
          }
        });
      });
    });
  }

  function createDefaultHelpScopeProgress(firstTopicId) {
    return {
      selectedTopicId: firstTopicId || '',
      byTopic: {},
      totalPoints: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      lastAccessedAt: ''
    };
  }

  function loadHelpGuideProgress() {
    const defaultBusinessTopic = getHelpTopics('business')[0] ? getHelpTopics('business')[0].id : '';
    const defaultPersonalTopic = getHelpTopics('personal')[0] ? getHelpTopics('personal')[0].id : '';
    const fallback = {
      business: createDefaultHelpScopeProgress(defaultBusinessTopic),
      personal: createDefaultHelpScopeProgress(defaultPersonalTopic)
    };
    const parsed = parseJsonObject(STORAGE_HELP_GUIDE_PROGRESS, fallback);
    helpGuideProgress = {
      business: Object.assign(createDefaultHelpScopeProgress(defaultBusinessTopic), parsed.business || {}),
      personal: Object.assign(createDefaultHelpScopeProgress(defaultPersonalTopic), parsed.personal || {})
    };
  }

  function saveHelpGuideProgress() {
    localStorage.setItem(STORAGE_HELP_GUIDE_PROGRESS, JSON.stringify(helpGuideProgress || {}));
  }

  function logHelpGuideEvent(eventName, payload) {
    try {
      const list = parseJsonList(STORAGE_HELP_GUIDE_EVENTS);
      list.push({
        id: generateUuid(),
        event: String(eventName || 'unknown'),
        at: new Date().toISOString(),
        scope: helpGuideState.scope,
        payload: payload || {}
      });
      while (list.length > 300) list.shift();
      localStorage.setItem(STORAGE_HELP_GUIDE_EVENTS, JSON.stringify(list));
    } catch (error) {
      // Keep help module resilient even if telemetry storage fails.
    }
  }

  function ensureHelpScopeProgress(scope) {
    const topics = getHelpTopics(scope);
    const firstTopicId = topics[0] ? topics[0].id : '';
    if (!helpGuideProgress[scope]) {
      helpGuideProgress[scope] = createDefaultHelpScopeProgress(firstTopicId);
    }
    const scoped = helpGuideProgress[scope];
    if (!scoped.selectedTopicId || !topics.some(function (topic) { return topic.id === scoped.selectedTopicId; })) {
      scoped.selectedTopicId = firstTopicId;
    }
    if (!scoped.byTopic || typeof scoped.byTopic !== 'object' || Array.isArray(scoped.byTopic)) {
      scoped.byTopic = {};
    }
    if (typeof scoped.totalPoints !== 'number') scoped.totalPoints = 0;
    if (typeof scoped.totalAnswered !== 'number') scoped.totalAnswered = 0;
    if (typeof scoped.totalCorrect !== 'number') scoped.totalCorrect = 0;
    if (typeof scoped.lastAccessedAt !== 'string') scoped.lastAccessedAt = '';
    return scoped;
  }

  function ensureHelpTopicProgress(scope, topicId, questionCount) {
    const scoped = ensureHelpScopeProgress(scope);
    if (!scoped.byTopic[topicId]) {
      scoped.byTopic[topicId] = {
        index: 0,
        answered: {},
        total: 0,
        correct: 0,
        points: 0
      };
    }
    const topicProgress = scoped.byTopic[topicId];
    if (typeof topicProgress.index !== 'number') topicProgress.index = 0;
    if (!topicProgress.answered || typeof topicProgress.answered !== 'object' || Array.isArray(topicProgress.answered)) {
      topicProgress.answered = {};
    }
    if (typeof topicProgress.total !== 'number') topicProgress.total = 0;
    if (typeof topicProgress.correct !== 'number') topicProgress.correct = 0;
    if (typeof topicProgress.points !== 'number') topicProgress.points = 0;
    if (questionCount > 0 && topicProgress.index >= questionCount) topicProgress.index = 0;
    return topicProgress;
  }

  function getQuizLevelLabel(accuracyPct) {
    const pct = Number(accuracyPct || 0);
    if (pct >= 90) return 'Especialista';
    if (pct >= 75) return 'Avançado';
    if (pct >= 60) return 'Intermediário';
    return 'Iniciante';
  }

  function getScopeQuizStats(scope) {
    const topics = getHelpTopics(scope);
    const scoped = ensureHelpScopeProgress(scope);
    let totalQuestions = 0;
    let answeredQuestions = 0;
    let correctAnswers = 0;
    topics.forEach(function (topic) {
      const questions = Array.isArray(topic.quiz) ? topic.quiz : [];
      totalQuestions += questions.length;
      const topicProgress = ensureHelpTopicProgress(scope, topic.id, questions.length);
      const answeredMap = topicProgress.answered || {};
      questions.forEach(function (question) {
        if (typeof answeredMap[question.id] !== 'number') return;
        answeredQuestions += 1;
        if (Number(answeredMap[question.id]) === Number(question.correctIndex)) {
          correctAnswers += 1;
        }
      });
    });
    const accuracy = answeredQuestions > 0 ? roundMoney((correctAnswers / answeredQuestions) * 100) : 0;
    const completion = totalQuestions > 0 ? roundMoney((answeredQuestions / totalQuestions) * 100) : 0;
    return {
      scope: scope,
      scopeLabel: getHelpModule(scope).label,
      totalQuestions: totalQuestions,
      answeredQuestions: answeredQuestions,
      correctAnswers: correctAnswers,
      accuracy: accuracy,
      completion: completion,
      completed: totalQuestions > 0 && answeredQuestions >= totalQuestions,
      level: getQuizLevelLabel(accuracy),
      totalPoints: Number(scoped.totalPoints || 0)
    };
  }

  function getTopicQuizStats(scope, topic) {
    if (!topic) {
      return {
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        completed: false,
        level: getQuizLevelLabel(0)
      };
    }
    const questions = Array.isArray(topic.quiz) ? topic.quiz : [];
    const topicProgress = ensureHelpTopicProgress(scope, topic.id, questions.length);
    let answeredQuestions = 0;
    let correctAnswers = 0;
    const answeredMap = topicProgress.answered || {};
    questions.forEach(function (question) {
      if (typeof answeredMap[question.id] !== 'number') return;
      answeredQuestions += 1;
      if (Number(answeredMap[question.id]) === Number(question.correctIndex)) {
        correctAnswers += 1;
      }
    });
    const accuracy = answeredQuestions > 0 ? roundMoney((correctAnswers / answeredQuestions) * 100) : 0;
    return {
      totalQuestions: questions.length,
      answeredQuestions: answeredQuestions,
      correctAnswers: correctAnswers,
      accuracy: accuracy,
      completed: questions.length > 0 && answeredQuestions >= questions.length,
      level: getQuizLevelLabel(accuracy)
    };
  }

  function getBusinessQuizContextHint() {
    const referenceDate = (filterEndDateInput && filterEndDateInput.value) ? filterEndDateInput.value : new Date().toISOString().slice(0, 10);
    const safety = getDistributionSafetySnapshot(referenceDate);
    const health = calculateOperationalHealthMetrics(referenceDate, safety.operationalBalance, ALLOCATION_BASE_MODEL.operational);
    return [
      'Cenário Zadoni agora:',
      'Saldo operacional ' + toMoney(safety.operationalBalance) + '.',
      'Recompra 30d ' + toMoney(health.repurchaseNeed30Days) + ' (cobertura ' + toMultiplier(health.repurchaseCoverage) + ').',
      'Distribuível seguro ' + toMoney(safety.distributable) + '.'
    ].join(' ');
  }

  function getPersonalQuizContextHint() {
    const list = getFilteredPersonalTransactions();
    const entries = list.filter(function (item) { return item.type === 'entry'; }).reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);
    const exits = list.filter(function (item) { return item.type !== 'entry'; }).reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);
    const balance = roundMoney(entries - exits);
    const score = getPersonalHealthScore(entries, exits);
    const referenceDate = (personalFilterEndDateInput && personalFilterEndDateInput.value)
      ? personalFilterEndDateInput.value
      : new Date().toISOString().slice(0, 10);
    const proLaboreAvailable = getProLaboreBalanceAsOf(referenceDate);
    return [
      'Cenário pessoal atual:',
      'Entradas ' + toMoney(entries) + ', Saídas ' + toMoney(exits) + ', Saldo ' + toMoney(balance) + '.',
      'Índice de saúde ' + toPercent(score) + ' e Pró-labore disponível ' + toMoney(proLaboreAvailable) + '.'
    ].join(' ');
  }

  function buildQuizFeedbackMessage(scope, topic, question, correct, earnedPoints) {
    const baseText = correct ? 'Correto.' : 'Resposta não ideal.';
    const explanation = question && question.explanation ? question.explanation : 'Revise o conceito do tópico antes de avançar.';
    const example = question && question.practicalExample
      ? question.practicalExample
      : ((topic && Array.isArray(topic.examples) && topic.examples[0]) ? topic.examples[0] : 'Use os indicadores do painel para confirmar a decisão.');
    const nextStep = question && question.nextStep
      ? question.nextStep
      : ((topic && Array.isArray(topic.actions) && topic.actions[0]) ? topic.actions[0] : 'Siga para a próxima pergunta.');
    const contextHint = scope === 'personal' ? getPersonalQuizContextHint() : getBusinessQuizContextHint();
    return [
      baseText + ' ' + explanation,
      'Exemplo prático: ' + example,
      contextHint,
      'Próxima ação recomendada: ' + nextStep + '.',
      'Pontos +' + earnedPoints + '.'
    ].join(' ');
  }

  function getCurrentScopeFromUi() {
    const activeScreen = document.querySelector('.screen.is-active');
    return activeScreen && activeScreen.getAttribute('data-screen') === 'personal' ? 'personal' : 'business';
  }

  function openHelpGuide(scope) {
    const nextScope = scope === 'personal' ? 'personal' : 'business';
    helpGuideState.scope = nextScope;
    const scoped = ensureHelpScopeProgress(nextScope);
    helpGuideState.topicId = scoped.selectedTopicId;
    helpGuideState.feedback = '';
    helpGuideState.open = true;
    scoped.lastAccessedAt = new Date().toISOString();
    saveHelpGuideProgress();
    if (helpManualModal) {
      helpManualModal.classList.add('is-open');
      helpManualModal.setAttribute('aria-hidden', 'false');
    }
    renderHelpGuide();
    logHelpGuideEvent('manual_opened', { scope: nextScope });
  }

  function closeHelpGuide() {
    helpGuideState.open = false;
    if (helpManualModal) {
      helpManualModal.classList.remove('is-open');
      helpManualModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderHelpScopeButtons() {
    helpScopeButtons.forEach(function (btn) {
      const scope = btn.getAttribute('data-help-scope');
      btn.classList.toggle('is-active', scope === helpGuideState.scope);
    });
  }

  function renderHelpTopicList() {
    if (!helpTopicList) return;
    const scope = helpGuideState.scope;
    const topics = getHelpTopics(scope);
    const scoped = ensureHelpScopeProgress(scope);
    helpTopicList.innerHTML = '';
    topics.forEach(function (topic, idx) {
      const topicProgress = ensureHelpTopicProgress(scope, topic.id, (topic.quiz || []).length);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'help-topic-btn' + (topic.id === helpGuideState.topicId ? ' is-active' : '');
      button.textContent = String(idx + 1) + ') ' + topic.title + ' | ' + topicProgress.correct + '/' + topicProgress.total;
      button.addEventListener('click', function () {
        helpGuideState.topicId = topic.id;
        scoped.selectedTopicId = topic.id;
        helpGuideState.feedback = '';
        saveHelpGuideProgress();
        renderHelpGuide();
        logHelpGuideEvent('topic_viewed', { scope: scope, topicId: topic.id });
      });
      helpTopicList.appendChild(button);
    });
  }

  function renderHelpTopicContent(topic) {
    if (!helpTopicTitle || !helpTopicDefinition || !helpExamples || !helpActions) return;
    if (!topic) {
      helpTopicTitle.textContent = 'Selecione um tópico';
      helpTopicDefinition.textContent = 'As definições aparecerão aqui.';
      helpExamples.innerHTML = '';
      helpActions.innerHTML = '';
      return;
    }
    helpTopicTitle.textContent = topic.title;
    helpTopicDefinition.textContent = topic.definition;
    helpExamples.innerHTML = '';
    helpActions.innerHTML = '';
    (topic.examples || []).forEach(function (example, idx) {
      const p = document.createElement('p');
      p.textContent = 'Exemplo ' + String(idx + 1) + ': ' + example;
      helpExamples.appendChild(p);
    });
    (topic.actions || []).forEach(function (action, idx) {
      const p = document.createElement('p');
      p.textContent = 'Ação ' + String(idx + 1) + ': ' + action;
      helpActions.appendChild(p);
    });
  }

  function renderHelpQuiz(topic) {
    if (!helpQuizMeta || !helpQuizQuestion || !helpQuizOptions || !helpQuizFeedback || !helpQuizScore || !helpQuizCompletion) return;
    if (!topic) {
      helpQuizMeta.textContent = 'Treine decisões sem afetar seus dados reais.';
      helpQuizQuestion.textContent = 'Selecione um tópico para começar.';
      helpQuizOptions.innerHTML = '';
      helpQuizFeedback.textContent = 'Feedback aparecerá aqui.';
      helpQuizScore.textContent = 'Progresso: 0/0 | Pontos: 0';
      helpQuizCompletion.textContent = 'Conclua as perguntas para liberar seu nível.';
      return;
    }
    const scope = helpGuideState.scope;
    const scoped = ensureHelpScopeProgress(scope);
    const questions = Array.isArray(topic.quiz) ? topic.quiz : [];
    const topicProgress = ensureHelpTopicProgress(scope, topic.id, questions.length);
    if (!questions.length) {
      helpQuizMeta.textContent = 'Este tópico não possui perguntas no momento.';
      helpQuizQuestion.textContent = 'Sem quiz disponível.';
      helpQuizOptions.innerHTML = '';
      helpQuizFeedback.textContent = '-';
      helpQuizScore.textContent = 'Progresso do módulo: ' + scoped.totalCorrect + '/' + scoped.totalAnswered + ' | Pontos: ' + scoped.totalPoints;
      helpQuizCompletion.textContent = 'Este tópico ainda não possui trilha de conclusão.';
      return;
    }
    const questionIndex = clamp(topicProgress.index, 0, questions.length - 1);
    const question = questions[questionIndex];
    const answeredIndex = topicProgress.answered[question.id];
    const alreadyAnswered = typeof answeredIndex === 'number';
    helpQuizMeta.textContent =
      'Treino seguro: não altera lançamentos reais. ' +
      'Pergunta ' + String(questionIndex + 1) + '/' + String(questions.length) + '.';
    helpQuizQuestion.textContent = question.question;
    helpQuizOptions.innerHTML = '';
    question.options.forEach(function (optionText, idx) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'help-quiz-option';
      button.textContent = optionText;
      if (alreadyAnswered) {
        button.disabled = true;
        if (idx === question.correctIndex) button.classList.add('correct');
        if (idx === answeredIndex && answeredIndex !== question.correctIndex) button.classList.add('wrong');
      }
      button.addEventListener('click', function () {
        if (typeof topicProgress.answered[question.id] === 'number') return;
        const correct = idx === question.correctIndex;
        topicProgress.answered[question.id] = idx;
        topicProgress.total += 1;
        scoped.totalAnswered += 1;
        const earnedPoints = correct ? 10 : 3;
        topicProgress.points += earnedPoints;
        scoped.totalPoints += earnedPoints;
        if (correct) {
          topicProgress.correct += 1;
          scoped.totalCorrect += 1;
        }
        helpGuideState.feedback = buildQuizFeedbackMessage(scope, topic, question, correct, earnedPoints);
        const updatedScopeStats = getScopeQuizStats(scope);
        if (updatedScopeStats.completed) {
          helpGuideState.feedback =
            helpGuideState.feedback +
            ' Parabéns! Trilha finalizada com ' +
            updatedScopeStats.correctAnswers + '/' + updatedScopeStats.totalQuestions +
            ' acertos (' + toPercent(updatedScopeStats.accuracy) + ') e nível ' + updatedScopeStats.level + '.';
        }
        saveHelpGuideProgress();
        renderHelpTopicList();
        renderHelpQuiz(topic);
        logHelpGuideEvent('quiz_answered', {
          scope: scope,
          topicId: topic.id,
          questionId: question.id,
          correct: correct,
          points: earnedPoints
        });
      });
      helpQuizOptions.appendChild(button);
    });
    const topicStats = getTopicQuizStats(scope, topic);
    const scopeStats = getScopeQuizStats(scope);
    helpQuizFeedback.textContent = helpGuideState.feedback || 'Selecione uma opção para receber feedback.';
    helpQuizScore.textContent =
      'Tópico: ' + topicStats.correctAnswers + '/' + topicStats.answeredQuestions +
      ' | Módulo: ' + scopeStats.correctAnswers + '/' + scopeStats.answeredQuestions +
      ' | Pontos: ' + scoped.totalPoints;
    if (scopeStats.completed) {
      helpQuizCompletion.textContent =
        'Parabéns pela finalização do teste gamificado de ' + scopeStats.scopeLabel + '! ' +
        'Seu nível atual é: ' + scopeStats.level + ' (' + toPercent(scopeStats.accuracy) + ' de acerto).';
    } else if (topicStats.completed) {
      helpQuizCompletion.textContent =
        'Tópico concluído com nível ' + topicStats.level + ' (' + toPercent(topicStats.accuracy) + '). ' +
        'Faltam ' + (scopeStats.totalQuestions - scopeStats.answeredQuestions) + ' pergunta(s) para concluir a trilha completa.';
    } else {
      helpQuizCompletion.textContent =
        'Progresso da trilha: ' + scopeStats.answeredQuestions + '/' + scopeStats.totalQuestions +
        ' perguntas respondidas. Nível parcial: ' + scopeStats.level + '.';
    }
  }

  function renderHelpGuide() {
    const scope = helpGuideState.scope === 'personal' ? 'personal' : 'business';
    const topics = getHelpTopics(scope);
    const scoped = ensureHelpScopeProgress(scope);
    if (!helpGuideState.topicId || !topics.some(function (topic) { return topic.id === helpGuideState.topicId; })) {
      helpGuideState.topicId = scoped.selectedTopicId || (topics[0] ? topics[0].id : '');
    }
    const selectedTopic = topics.find(function (topic) { return topic.id === helpGuideState.topicId; }) || null;
    renderHelpScopeButtons();
    renderHelpTopicList();
    renderHelpTopicContent(selectedTopic);
    renderHelpQuiz(selectedTopic);
  }

  function initHelpGuideModule() {
    enrichHelpGuideContent();
    loadHelpGuideProgress();
    if (openGuideBtn) {
      openGuideBtn.addEventListener('click', function () {
        openHelpGuide(getCurrentScopeFromUi());
      });
    }
    if (openPersonalGuideBtn) {
      openPersonalGuideBtn.addEventListener('click', function () {
        openHelpGuide('personal');
      });
    }
    if (closeGuideBtn) {
      closeGuideBtn.addEventListener('click', function () {
        closeHelpGuide();
      });
    }
    if (helpManualModal) {
      helpManualModal.addEventListener('click', function (event) {
        if (event.target === helpManualModal) closeHelpGuide();
      });
    }
    helpScopeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const scope = button.getAttribute('data-help-scope') === 'personal' ? 'personal' : 'business';
        helpGuideState.scope = scope;
        const scoped = ensureHelpScopeProgress(scope);
        helpGuideState.topicId = scoped.selectedTopicId;
        helpGuideState.feedback = '';
        saveHelpGuideProgress();
        renderHelpGuide();
        logHelpGuideEvent('scope_changed', { scope: scope });
      });
    });
    if (helpQuizNextBtn) {
      helpQuizNextBtn.addEventListener('click', function () {
        const topics = getHelpTopics(helpGuideState.scope);
        const topic = topics.find(function (item) { return item.id === helpGuideState.topicId; });
        if (!topic || !Array.isArray(topic.quiz) || !topic.quiz.length) return;
        const progress = ensureHelpTopicProgress(helpGuideState.scope, topic.id, topic.quiz.length);
        progress.index = (progress.index + 1) % topic.quiz.length;
        helpGuideState.feedback = '';
        saveHelpGuideProgress();
        renderHelpGuide();
        logHelpGuideEvent('quiz_next', { scope: helpGuideState.scope, topicId: topic.id });
      });
    }
    if (helpQuizResetBtn) {
      helpQuizResetBtn.addEventListener('click', function () {
        const scope = helpGuideState.scope;
        const topics = getHelpTopics(scope);
        const firstTopicId = topics[0] ? topics[0].id : '';
        helpGuideProgress[scope] = createDefaultHelpScopeProgress(firstTopicId);
        helpGuideState.topicId = firstTopicId;
        helpGuideState.feedback = '';
        saveHelpGuideProgress();
        renderHelpGuide();
        logHelpGuideEvent('quiz_reset', { scope: scope });
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && helpGuideState.open) closeHelpGuide();
    });
  }

  function bindTabs() {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const tabName = tab.getAttribute('data-tab');
        if (isSupabaseReady()) scheduleSupabaseSync(0);
        setActiveTab(tabName);
        const activeTabName = getActiveTabName();
        if (activeTabName === 'dashboard' || activeTabName === 'cash') {
          refreshCash();
          return;
        }
        if (activeTabName === 'personal') {
          refreshPersonalFinance();
        }
      });
    });
  }

  function bindUiModeControls() {
    if (!toggleAdvancedModulesBtn) return;
    toggleAdvancedModulesBtn.addEventListener('click', function () {
      applyUiAdvancedMode(!uiAdvancedMode);
      persistUiAdvancedModeFlag(uiAdvancedMode);
      refreshCash();
    });
  }

  function findProductById(id) {
    return products.find(function (item) { return item.id === id; }) || null;
  }

  function resetProductFormMode() {
    editingProductId = '';
    if (productSubmitBtn) productSubmitBtn.textContent = 'Salvar Produto';
    if (productCancelEditBtn) productCancelEditBtn.hidden = true;
  }

  function resetProductForm() {
    productForm.reset();
    productSuggestedInput.value = 0;
    resetProductFormMode();
  }

  function startProductEdit(productId) {
    const product = findProductById(productId);
    if (!product) {
      alert('Produto não encontrado para edição.');
      resetProductFormMode();
      return;
    }
    editingProductId = product.id;
    productNameInput.value = String(product.name || '').trim();
    productCostInput.value = Number(product.costPrice || 0).toFixed(2);
    productSuggestedInput.value = Number(product.suggestedPrice || 0).toFixed(2);
    productCategoryInput.value = String(product.category || '').trim();
    if (productDescriptionInput) {
      productDescriptionInput.value = normalizeProductDescription(product.description);
    }
    if (productSubmitBtn) productSubmitBtn.textContent = 'Atualizar Produto';
    if (productCancelEditBtn) productCancelEditBtn.hidden = false;
  }

  function ensureProductEditModeIsValid() {
    if (!editingProductId) return;
    if (findProductById(editingProductId)) return;
    resetProductForm();
  }

  function renderProductsTable() {
    if (!products.length) {
      productsTableBody.innerHTML = '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    productsTableBody.innerHTML = products.map(function (item) {
      const display = splitDisplayProductInfo(item.name, item.description);
      return '<tr>' +
        '<td>' + renderProductIdentityCell(display.name, display.description, 'Descrição (opcional)') + '</td>' +
        '<td>' + toMoney(item.costPrice) + '</td>' +
        '<td>' + toMoney(item.suggestedPrice) + '</td>' +
        '<td>' + escapeHtml(item.category || '-') + '</td>' +
        '<td>' + renderDescriptionDetails(display.description, 'Ver descrição', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-product="' + item.id + '">Editar</button><button type="button" data-delete-product="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function renderProductSelect() {
    const currentValue = saleProductSelect.value;
    const options = ['<option value="">Selecione um produto</option>'].concat(
      products.map(function (item) {
        return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
      })
    );

    saleProductSelect.innerHTML = options.join('');
    if (products.some(function (p) { return p.id === currentValue; })) {
      saleProductSelect.value = currentValue;
    } else {
      saleCostPreviewInput.value = '';
      salePriceInput.value = '';
    }
    updateSaleProductPreview();
  }

  function getSelectedProduct() {
    const id = saleProductSelect.value;
    return products.find(function (item) { return item.id === id; }) || null;
  }

  function updateSaleProductPreview() {
    const product = getSelectedProduct();
    if (!product) {
      saleCostPreviewInput.value = '';
      salePriceInput.value = '';
      if (saleProductNamePreview) saleProductNamePreview.textContent = 'Produto selecionado: -';
      if (saleProductDescriptionPreview) saleProductDescriptionPreview.textContent = 'Sem descrição cadastrada.';
      if (saleProductDescriptionDetails) {
        saleProductDescriptionDetails.hidden = true;
        saleProductDescriptionDetails.open = false;
      }
      return;
    }

    saleCostPreviewInput.value = Number(product.costPrice).toFixed(2);
    salePriceInput.value = Number(product.suggestedPrice || product.costPrice).toFixed(2);
    if (saleProductNamePreview) saleProductNamePreview.textContent = 'Produto selecionado: ' + product.name;
    const description = normalizeProductDescription(product.description);
    if (saleProductDescriptionPreview) saleProductDescriptionPreview.textContent = description || 'Sem descrição cadastrada.';
    if (saleProductDescriptionDetails) {
      if (description) {
        saleProductDescriptionDetails.hidden = false;
      } else {
        saleProductDescriptionDetails.hidden = true;
        saleProductDescriptionDetails.open = false;
      }
    }
  }

  function computeSale(costPrice, salePrice, quantity, expense) {
    const totalCost = costPrice * quantity;
    const revenue = salePrice * quantity;

    // Margem (%) = ((Preco - Custo) / Preco) * 100 com protecao de divisao por zero.
    const margin = salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0;

    // Lucro liquido = Receita - Custo Total - Despesa variavel.
    const netProfit = revenue - totalCost - expense;

    return { totalCost, revenue, margin, netProfit };
  }

  function resetSaleFormMode() {
    editingSaleId = '';
    if (saleSubmitBtn) saleSubmitBtn.textContent = 'Salvar Venda';
    if (saleCancelEditBtn) saleCancelEditBtn.setAttribute('hidden', 'hidden');
  }

  function resetSaleForm() {
    if (saleForm) saleForm.reset();
    resetSaleFormMode();
    if (saleQuantityInput) saleQuantityInput.value = 1;
    if (saleExpenseInput) saleExpenseInput.value = 0;
    if (saleCostPreviewInput) saleCostPreviewInput.value = '';
    if (saleChannelInput) saleChannelInput.value = DEFAULT_SALE_CHANNEL;
    if (saleDateInput) saleDateInput.value = new Date().toISOString().slice(0, 10);
    updateSaleProductPreview();
  }

  function startSaleEdit(saleId) {
    const record = sales.find(function (item) { return item.id === saleId; }) || null;
    if (!record) {
      alert('Venda não encontrada para edição.');
      return;
    }
    editingSaleId = record.id;
    if (saleProductSelect) saleProductSelect.value = record.productId || '';
    updateSaleProductPreview();
    if (saleChannelInput) saleChannelInput.value = normalizeSaleChannel(record.saleChannel);
    if (saleDateInput) saleDateInput.value = toIsoDateFromAny(record.date || record.createdAt);
    if (saleQuantityInput) saleQuantityInput.value = Number(record.quantity || 1);
    if (salePriceInput) salePriceInput.value = Number(record.salePrice || 0).toFixed(2);
    if (saleExpenseInput) saleExpenseInput.value = Number(record.expense || 0).toFixed(2);
    if (saleNotesInput) saleNotesInput.value = record.notes || '';
    if (saleCostPreviewInput) saleCostPreviewInput.value = Number(record.costPrice || 0).toFixed(2);
    if (saleSubmitBtn) saleSubmitBtn.textContent = 'Atualizar Venda';
    if (saleCancelEditBtn) saleCancelEditBtn.removeAttribute('hidden');
    setActiveTab('sales');
    if (saleForm && typeof saleForm.scrollIntoView === 'function') {
      saleForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function getFilteredSales() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;
    const channel = filterSaleChannelInput ? filterSaleChannelInput.value : '';

    return sales.filter(function (item) {
      const onlyDate = String(item.date || item.createdAt || '').slice(0, 10);
      if (!onlyDate) return false;
      if (start && onlyDate < start) return false;
      if (end && onlyDate > end) return false;
      if (channel && normalizeSaleChannel(item.saleChannel) !== channel) return false;
      return true;
    });
  }

  function getFilteredSalesByDate() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;
    return sales.filter(function (item) {
      const onlyDate = String(item.date || item.createdAt || '').slice(0, 10);
      if (!onlyDate) return false;
      if (start && onlyDate < start) return false;
      if (end && onlyDate > end) return false;
      return true;
    });
  }

  function getFilteredPurchases() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;

    return purchases.filter(function (item) {
      const onlyDate = String(item.purchaseDate || '').slice(0, 10);
      if (start && onlyDate < start) return false;
      if (end && onlyDate > end) return false;
      return true;
    });
  }

  function getFilteredWithdrawals() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;

    return withdrawals.filter(function (item) {
      const onlyDate = String(item.withdrawalDate || '').slice(0, 10);
      if (start && onlyDate < start) return false;
      if (end && onlyDate > end) return false;
      return true;
    });
  }

  function getFilteredPartnerContributions() {
    const start = filterStartDateInput.value;
    const end = filterEndDateInput.value;

    return partnerContributions.filter(function (item) {
      const onlyDate = String(item.date || item.createdAt || '').slice(0, 10);
      if (!onlyDate) return false;
      if (start && onlyDate < start) return false;
      if (end && onlyDate > end) return false;
      return true;
    });
  }

  function getFilteredAdsInvestments() {
    const start = dashboardFilterStartDateInput ? dashboardFilterStartDateInput.value : '';
    const end = dashboardFilterEndDateInput ? dashboardFilterEndDateInput.value : '';
    return adsInvestments.filter(function (item) {
      const date = String(item.date || item.createdAt || '').slice(0, 10);
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }

  function renderSalesTable(list) {
    if (!list.length) {
      salesTableBody.innerHTML = '<tr><td colspan="11">Nenhuma venda no período selecionado.</td></tr>';
      return;
    }

    salesTableBody.innerHTML = list.map(function (item) {
      const productName = resolveSaleProductName(item);
      const productDescription = resolveSaleDescription(item);
      const display = splitDisplayProductInfo(productName, productDescription);
      return '<tr>' +
        '<td>' + formatDateOnly(item.date || item.createdAt) + '</td>' +
        '<td>' + formatDateTime(item.createdAt || ((item.date || '') + 'T00:00:00')) + '</td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(display.name) + '</strong>' + renderDescriptionDetails(display.description, 'Descrição (opcional)', 'product-description-details') + '</div></td>' +
        '<td>' + escapeHtml(normalizeSaleChannel(item.saleChannel)) + '</td>' +
        '<td>' + item.quantity + '</td>' +
        '<td>' + toMoney(item.costPrice) + '</td>' +
        '<td>' + toMoney(item.salePrice) + '</td>' +
        '<td>' + toMoney(item.revenue) + '</td>' +
        '<td>' + toPercent(item.margin) + '</td>' +
        '<td>' + toMoney(item.netProfit) + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-sale="' + item.id + '">Editar</button><button type="button" data-delete-sale="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function renderKpis(list, purchasesList, withdrawalsList, distributionsList) {
    const strategicReport = generateStrategicAllocationReport('custom', {
      start: filterStartDateInput ? filterStartDateInput.value : '',
      end: filterEndDateInput ? filterEndDateInput.value : ''
    });
    const totals = list.reduce(function (acc, item) {
      acc.revenue += item.revenue;
      acc.cost += item.totalCost;
      acc.expenses += item.expense;
      acc.netProfit += item.netProfit;
      return acc;
    }, { revenue: 0, cost: 0, expenses: 0, netProfit: 0 });
    const purchasesTotal = purchasesList.reduce(function (acc, item) {
      return item.isOtherFunding ? acc : acc + Number(item.total || 0);
    }, 0);
    const withdrawalsTotal = withdrawalsList.reduce(function (acc, item) {
      if (item.isOtherFunding) return acc;
      const flowType = item.flowType || classifyFlowType(item.type, item.type, item.notes);
      return flowType === 'expense' ? acc + Number(item.amount || 0) : acc;
    }, 0);
    const distributionsTotal = distributionsList.reduce(function (acc, item) {
      return item.isOtherFunding ? acc : acc + Number(item.amount || 0);
    }, 0);
    const otherFundingTotal = purchasesList.reduce(function (acc, item) {
      return item.isOtherFunding ? acc + Number(item.total || 0) : acc;
    }, 0) + withdrawalsList.reduce(function (acc, item) {
      return item.isOtherFunding ? acc + Number(item.amount || 0) : acc;
    }, 0) + distributionsList.reduce(function (acc, item) {
      return item.isOtherFunding ? acc + Number(item.amount || 0) : acc;
    }, 0);
    const operationalProfit = Number(strategicReport.summary.netOperationalProfit || 0);
    const cashBalance = Number(strategicReport.summary.operationalBalance || 0);
    const operationalAllocation = Number(strategicReport.summary.allocations.operational || 0);
    const fallbackOperationalRatio = strategicReport.growthStatus && strategicReport.growthStatus.modelRatios
      ? Number(strategicReport.growthStatus.modelRatios.operational || ALLOCATION_BASE_MODEL.operational)
      : ALLOCATION_BASE_MODEL.operational;
    const health = calculateOperationalHealthMetrics(strategicReport.range.end, cashBalance, fallbackOperationalRatio);
    const salesNetProfit = Number(totals.netProfit || 0);

    const overallMargin = totals.revenue > 0 ? ((totals.revenue - totals.cost) / totals.revenue) * 100 : 0;

    kpiRevenue.textContent = toMoney(totals.revenue);
    kpiCost.textContent = toMoney(totals.cost);
    kpiExpenses.textContent = toMoney(totals.expenses);
    kpiNetProfit.textContent = toMoney(salesNetProfit);
    kpiMargin.textContent = toPercent(overallMargin);
    if (kpiPurchases) kpiPurchases.textContent = toMoney(purchasesTotal);
    if (kpiOperationalAllocation) kpiOperationalAllocation.textContent = toMoney(operationalAllocation);
    if (kpiRealProfit) kpiRealProfit.textContent = toMoney(operationalProfit);
    if (kpiWithdrawals) kpiWithdrawals.textContent = toMoney(withdrawalsTotal);
    if (kpiDistributions) kpiDistributions.textContent = toMoney(distributionsTotal);
    if (kpiCashBalance) kpiCashBalance.textContent = toMoney(cashBalance);
    if (kpiEmergencyTarget) kpiEmergencyTarget.textContent = toMoney(health.emergencyTarget);
    if (kpiCashRunwayDays) kpiCashRunwayDays.textContent = health.dailyEssential > 0 ? toDays(health.runwayDays) : '-';
    if (kpiRepurchaseCoverage) {
      kpiRepurchaseCoverage.textContent = health.repurchaseNeed30Days > 0 ? toMultiplier(health.repurchaseCoverage) : '-';
    }
    if (kpiRuptureRisk) {
      kpiRuptureRisk.textContent = health.ruptureGap > 0 ? toMoney(health.ruptureGap) : 'Coberto';
    }
    if (kpiInventoryTurnover) kpiInventoryTurnover.textContent = toMultiplier(health.inventoryTurnover);
    const totalExits = purchasesTotal + withdrawalsTotal + distributionsTotal + otherFundingTotal;
    const cashExits = purchasesTotal + withdrawalsTotal + distributionsTotal;
    const cashShare = totalExits > 0 ? (cashExits / totalExits) * 100 : 0;
    const otherShare = 100 - cashShare;
    const badge = document.getElementById('kpiCashFundingShare');
    if (badge) {
      badge.textContent = 'Caixa cobre ' + toPercent(cashShare) + ' | Outras fontes ' + toPercent(otherShare);
    }
    return {
      operationalProfit: operationalProfit,
      cashBalance: cashBalance,
      revenue: totals.revenue,
      otherFunding: otherFundingTotal,
      health: health,
      strategicReport: strategicReport
    };
  }

  function renderCashTrafficLight(summary) {
    if (!cashTrafficLight) return;
    if (!summary || summary.revenue === 0) {
      cashTrafficLight.className = 'traffic-light neutral';
      cashTrafficLight.textContent = 'Farol financeiro aguardando dados do período.';
      return;
    }

    if (summary.operationalProfit <= 0) {
      cashTrafficLight.className = 'traffic-light red';
      cashTrafficLight.textContent = 'Vermelho: operação negativa no período. Prioridade é aumentar margem e reduzir custos.';
      return;
    }

    if (summary.cashBalance <= 0) {
      cashTrafficLight.className = 'traffic-light yellow';
      cashTrafficLight.textContent = 'Amarelo: operação positiva, mas saídas/distribuições consumiram o caixa.';
      return;
    }

    cashTrafficLight.className = 'traffic-light green';
    cashTrafficLight.textContent = 'Verde: operação e caixa positivos. Cenário saudável para crescer com controle.';
  }

  function isDateInsideCashFilter(dateValue) {
    const date = toIsoDateFromAny(dateValue);
    if (!date) return false;
    const start = filterStartDateInput ? filterStartDateInput.value : '';
    const end = filterEndDateInput ? filterEndDateInput.value : '';
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  }

  function addRankAmount(map, label, amount, meta) {
    const cleanLabel = String(label || 'Sem categoria').trim() || 'Sem categoria';
    const value = Number(amount || 0);
    if (value <= 0) return;
    if (!map[cleanLabel]) {
      map[cleanLabel] = { label: cleanLabel, value: 0, count: 0, quantity: 0, meta: meta || '' };
    }
    map[cleanLabel].value += value;
    map[cleanLabel].count += 1;
  }

  function toSortedRankRows(map) {
    return Object.keys(map).map(function (key) {
      const item = map[key];
      return {
        label: item.label,
        value: roundMoney(item.value),
        count: Number(item.count || 0),
        quantity: Number(item.quantity || 0),
        meta: item.meta || ''
      };
    }).sort(function (a, b) {
      return b.value - a.value;
    }).slice(0, 5);
  }

  function renderRankList(node, rows, emptyText, renderDetail) {
    if (!node) return;
    if (!rows.length) {
      node.innerHTML = '<li>' + escapeHtml(emptyText) + '</li>';
      return;
    }
    node.innerHTML = rows.map(function (row) {
      const detail = renderDetail ? renderDetail(row) : toMoney(row.value);
      return '<li><strong>' + escapeHtml(row.label) + '</strong><span>' + escapeHtml(detail) + '</span></li>';
    }).join('');
  }

  function buildTopSoldProducts(filteredSales) {
    const map = {};
    filteredSales.forEach(function (item) {
      const label = resolveSaleProductName(item);
      const value = Number(item.revenue || 0);
      const quantity = Number(item.quantity || 0);
      if (!map[label]) map[label] = { label: label, value: 0, count: 0, quantity: 0 };
      map[label].value += value;
      map[label].quantity += quantity;
      map[label].count += 1;
    });
    return Object.keys(map).map(function (key) {
      const item = map[key];
      return {
        label: item.label,
        value: roundMoney(item.value),
        count: Number(item.count || 0),
        quantity: Number(item.quantity || 0)
      };
    }).sort(function (a, b) {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return b.value - a.value;
    }).slice(0, 5);
  }

  function renderManagementDiagnosis(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, filteredInvestments) {
    const summary = cashSummary || {};
    const revenue = Number(summary.revenue || 0);
    const operationalProfit = Number(summary.operationalProfit || 0);
    const cashBalance = Number(summary.cashBalance || 0);
    const health = summary.health || {};
    const exitsMap = {};
    const expensesMap = {};
    const repurchaseMap = {};
    const productRows = buildTopSoldProducts(filteredSales);

    filteredPurchases.forEach(function (item) {
      if (item.isOtherFunding) return;
      const total = Number(item.total || 0);
      addRankAmount(exitsMap, 'Recompras e compras', total);
      addRankAmount(expensesMap, 'Compra: ' + (item.type || 'Sem categoria'), total);
      addRankAmount(repurchaseMap, item.item || 'Item sem nome', total);
    });

    filteredWithdrawals.forEach(function (item) {
      if (item.isOtherFunding || item.linkedSource === 'ads') return;
      const flowType = item.flowType || classifyFlowType(item.type, item.type, item.notes);
      if (flowType !== 'expense') return;
      const label = item.type || 'Saída';
      addRankAmount(exitsMap, 'Saídas operacionais', item.amount);
      addRankAmount(expensesMap, 'Saída: ' + label, item.amount);
    });

    filteredInvestments.forEach(function (item) {
      addRankAmount(exitsMap, 'Investimento em Ads', item.amount);
      addRankAmount(expensesMap, 'Ads: ' + (item.platform || 'Plataforma'), item.amount);
    });

    filteredDistributions.forEach(function (item) {
      if (item.isOtherFunding) return;
      addRankAmount(exitsMap, 'Distribuição de sócios', item.amount);
      addRankAmount(expensesMap, 'Distribuição: ' + (item.partner || 'Sócio'), item.amount);
    });

    filteredSales.forEach(function (item) {
      addRankAmount(exitsMap, 'Despesas nas vendas', item.expense);
      addRankAmount(expensesMap, 'Despesa de venda: ' + normalizeSaleChannel(item.saleChannel), item.expense);
    });

    const personalPeriod = personalTransactions.filter(function (item) {
      return isDateInsideCashFilter(item.date || item.createdAt);
    });
    const personalUsingBusinessFunds = personalPeriod.reduce(function (acc, item) {
      if (item.type !== 'exit' || !item.usesBusinessFunds) return acc;
      return acc + Number(item.amount || 0);
    }, 0);
    const personalExternal = personalPeriod.reduce(function (acc, item) {
      if (item.type !== 'exit' || item.usesBusinessFunds) return acc;
      return acc + Number(item.amount || 0);
    }, 0);
    if (personalUsingBusinessFunds > 0) {
      addRankAmount(exitsMap, 'Pessoal usando pró-labore', personalUsingBusinessFunds);
      addRankAmount(expensesMap, 'Pessoal: pró-labore usado', personalUsingBusinessFunds);
    }

    if (financeDiagnosisTitle && financeDiagnosisDetail) {
      if (revenue <= 0 && !filteredPurchases.length && !filteredWithdrawals.length) {
        financeDiagnosisTitle.textContent = 'Aguardando movimento';
        financeDiagnosisDetail.textContent = 'Lance vendas, recompras e saídas para enxergar lucro real.';
      } else if (operationalProfit > 0 && cashBalance > 0) {
        financeDiagnosisTitle.textContent = 'Lucro real positivo';
        financeDiagnosisDetail.textContent =
          'Lucro operacional: ' + toMoney(operationalProfit) +
          '. Saldo operacional: ' + toMoney(cashBalance) +
          '. Recompra 30d: ' + (health.repurchaseNeed30Days > 0 ? toMoney(health.repurchaseNeed30Days) : 'sem necessidade calculada') + '.';
      } else if (operationalProfit > 0 && cashBalance <= 0) {
        financeDiagnosisTitle.textContent = 'Lucra, mas o caixa some';
        financeDiagnosisDetail.textContent =
          'A operação vende com lucro (' + toMoney(operationalProfit) +
          '), porém saídas/recompras consumiram o saldo. Revise os Top 5 gastos.';
      } else {
        financeDiagnosisTitle.textContent = 'Atenção: lucro negativo';
        financeDiagnosisDetail.textContent =
          'Resultado operacional: ' + toMoney(operationalProfit) +
          '. Prioridade: ajustar preço, custo de produto ou gastos recorrentes.';
      }
    }

    if (personalMixTitle && personalMixDetail) {
      if (personalUsingBusinessFunds > 0) {
        personalMixTitle.textContent = 'Atenção à mistura';
        personalMixDetail.textContent =
          toMoney(personalUsingBusinessFunds) + ' de gastos pessoais usaram pró-labore no período. ' +
          'Outros gastos pessoais fora do negócio: ' + toMoney(personalExternal) + '.';
      } else {
        personalMixTitle.textContent = 'Caixas separados';
        personalMixDetail.textContent =
          'Nenhum gasto pessoal usando pró-labore no período filtrado. Gastos pessoais por outras fontes: ' + toMoney(personalExternal) + '.';
      }
    }

    renderRankList(moneyDestinationList, toSortedRankRows(exitsMap), 'Sem saídas no período.', function (row) {
      return toMoney(row.value);
    });
    renderRankList(topSoldProductsList, productRows, 'Sem vendas no período.', function (row) {
      return Number(row.quantity || 0).toLocaleString('pt-BR') + ' un. | ' + toMoney(row.value);
    });
    renderRankList(topExpensesList, toSortedRankRows(expensesMap), 'Sem gastos no período.', function (row) {
      return toMoney(row.value);
    });
    renderRankList(topRepurchaseList, toSortedRankRows(repurchaseMap), 'Sem compras no período.', function (row) {
      return toMoney(row.value);
    });
  }

  function resolveDailyItemStatus(diffValue, okLimit, warningLimit) {
    const diff = Math.abs(Number(diffValue || 0));
    if (diff <= Number(okLimit || 0)) return 'ok';
    if (diff <= Number(warningLimit || 0)) return 'warning';
    return 'error';
  }

  function toDailyOverallStatus(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return 'yellow';
    const hasError = list.some(function (item) { return item.status === 'error'; });
    if (hasError) return 'red';
    const hasWarning = list.some(function (item) { return item.status === 'warning'; });
    return hasWarning ? 'yellow' : 'green';
  }

  function toDailyStatusLabel(status) {
    if (status === 'green' || status === 'ok') return 'OK';
    if (status === 'red' || status === 'error') return 'Erro';
    if (status === 'warning') return 'Atenção';
    if (status === 'yellow') return 'Revisar';
    return 'Pendente';
  }

  function toDailyStatusClass(status) {
    if (status === 'green' || status === 'ok') return 'ok';
    if (status === 'red' || status === 'error') return 'error';
    if (status === 'yellow' || status === 'warning') return 'warning';
    return 'neutral';
  }

  function getDailyReferenceDate(strategicReport) {
    if (filterStartDateInput && filterEndDateInput && filterStartDateInput.value && filterStartDateInput.value === filterEndDateInput.value) {
      return toIsoDateFromAny(filterEndDateInput.value);
    }
    if (strategicReport && strategicReport.range && strategicReport.range.end) {
      return toIsoDateFromAny(strategicReport.range.end);
    }
    return new Date().toISOString().slice(0, 10);
  }

  function createChecklistItem(title, status, difference, details, action) {
    return {
      title: String(title || '-'),
      status: ['ok', 'warning', 'error'].includes(String(status || '')) ? status : 'warning',
      difference: roundMoney(Math.abs(Number(difference || 0))),
      details: String(details || '-'),
      action: String(action || '-')
    };
  }

  function buildDailyChecklistReport(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions) {
    const summary = cashSummary || {};
    const strategicReport = summary.strategicReport || generateStrategicAllocationReport('custom', {
      start: filterStartDateInput ? filterStartDateInput.value : '',
      end: filterEndDateInput ? filterEndDateInput.value : ''
    });
    const referenceDate = getDailyReferenceDate(strategicReport);
    const totalRevenue = Number(strategicReport.summary ? strategicReport.summary.grossRevenue : 0);
    const growth = strategicReport.growthStatus || {};
    const expected = strategicReport.expectedAllocationPercentages ||
      getExpectedAllocationPercentages(growth.model || 'base', growth.modelRatios);
    const expectedAmounts = strategicReport.expectedAllocationAmounts || null;
    const actual = strategicReport.allocationPercentageValidation || {};
    const allocationKeys = ['tithe', 'emergency', 'debt', 'proLabore', 'growth', 'operational'];
    const labelByKey = {
      tithe: 'Dízimo',
      emergency: 'Reserva',
      debt: 'Dívidas',
      proLabore: 'Pró-labore',
      growth: 'Growth',
      operational: 'Operacional'
    };

    const percentageDiffs = allocationKeys.map(function (key) {
      const current = Number(actual[key] || 0);
      const target = Number(expected[key] || 0);
      return {
        key: key,
        label: labelByKey[key] || key,
        delta: roundMoney(current - target),
        absDelta: Math.abs(roundMoney(current - target))
      };
    });
    const topPercentDiff = percentageDiffs.reduce(function (acc, item) {
      return item.absDelta > acc.absDelta ? item : acc;
    }, { key: '', label: '-', delta: 0, absDelta: 0 });
    const percentStatus = totalRevenue <= 0
      ? 'warning'
      : resolveDailyItemStatus(topPercentDiff.absDelta, DAILY_CHECKLIST_PERCENT_TOLERANCE, DAILY_CHECKLIST_PERCENT_WARNING);
    const percentAction = totalRevenue <= 0
      ? 'Sem receita no período. Feche o dia após registrar vendas ou confirme operação sem movimento.'
      : (percentStatus === 'ok'
          ? 'Percentuais alinhados com o modelo atual.'
          : 'Revisar configuração e lançamentos para aproximar os percentuais dos jarros ao modelo.');

    const allocationByMoney = allocationKeys.map(function (key) {
      const expectedMoney = expectedAmounts
        ? roundMoney(expectedAmounts[key] || 0)
        : roundMoney(totalRevenue * (Number(expected[key] || 0) / 100));
      const actualMoney = roundMoney(strategicReport.summary && strategicReport.summary.allocations ? strategicReport.summary.allocations[key] : 0);
      const deltaMoney = roundMoney(actualMoney - expectedMoney);
      return {
        key: key,
        label: labelByKey[key] || key,
        expectedMoney: expectedMoney,
        actualMoney: actualMoney,
        deltaMoney: deltaMoney,
        absDeltaMoney: Math.abs(deltaMoney)
      };
    });
    const totalMoneyDiff = roundMoney(allocationByMoney.reduce(function (acc, item) {
      return acc + item.absDeltaMoney;
    }, 0));
    const topMoneyDiff = allocationByMoney.reduce(function (acc, item) {
      return item.absDeltaMoney > acc.absDeltaMoney ? item : acc;
    }, { key: '', label: '-', deltaMoney: 0, absDeltaMoney: 0 });
    const moneyStatus = totalRevenue <= 0
      ? 'warning'
      : resolveDailyItemStatus(totalMoneyDiff, DAILY_CHECKLIST_MONEY_TOLERANCE * 6, DAILY_CHECKLIST_MONEY_WARNING * 6);

    const jars = strategicReport.jarBalanceEvolution.length
      ? strategicReport.jarBalanceEvolution[strategicReport.jarBalanceEvolution.length - 1]
      : { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 };
    const operationalFromJars = Number(jars.operational || 0);
    const operationalFromSummary = Number(strategicReport.summary ? strategicReport.summary.operationalBalance : 0);
    const operationalDiff = roundMoney(operationalFromSummary - operationalFromJars);
    const operationalStatus = resolveDailyItemStatus(operationalDiff, DAILY_CHECKLIST_MONEY_TOLERANCE, DAILY_CHECKLIST_MONEY_WARNING);

    const ledger = getStrategicLedger(false);
    const daysUntilReference = (ledger.days || []).filter(function (row) {
      return row.date <= referenceDate;
    });
    let jarsCloseDiff = 0;
    let jarsCloseStatus = 'warning';
    let jarsCloseDetail = 'Sem histórico no período para validar fechamento dos jarros.';
    let jarsCloseAction = 'Registre movimentações para habilitar validação completa do dia.';
    if (daysUntilReference.length) {
      const latestDay = daysUntilReference[daysUntilReference.length - 1];
      const jarsTotal = roundMoney(
        Number(latestDay.jarBalances.tithe || 0) +
        Number(latestDay.jarBalances.emergency || 0) +
        Number(latestDay.jarBalances.debt || 0) +
        Number(latestDay.jarBalances.proLabore || 0) +
        Number(latestDay.jarBalances.growth || 0) +
        Number(latestDay.jarBalances.operational || 0)
      );
      const expectedJarsTotal = roundMoney(daysUntilReference.reduce(function (acc, row) {
        const allocationsTotal =
          Number(row.allocations.tithe || 0) +
          Number(row.allocations.emergency || 0) +
          Number(row.allocations.debt || 0) +
          Number(row.allocations.proLabore || 0) +
          Number(row.allocations.growth || 0) +
          Number(row.allocations.operational || 0);
        return acc + allocationsTotal - Number(row.operationalExpenses || 0) - Number(row.proLaboreUsage || 0);
      }, 0));
      jarsCloseDiff = roundMoney(jarsTotal - expectedJarsTotal);
      jarsCloseStatus = resolveDailyItemStatus(jarsCloseDiff, DAILY_CHECKLIST_MONEY_TOLERANCE, DAILY_CHECKLIST_MONEY_WARNING);
      jarsCloseDetail = 'Jarros totalizam ' + toMoney(jarsTotal) + ' vs cálculo acumulado ' + toMoney(expectedJarsTotal) + '.';
      jarsCloseAction = jarsCloseStatus === 'ok'
        ? 'Fechamento matemático dos jarros consistente.'
        : 'Revisar lançamentos de saídas/uso de pró-labore e conferir registros do dia.';
    }

    const filteredSalesList = Array.isArray(filteredSales) ? filteredSales : [];
    const filteredPurchasesList = Array.isArray(filteredPurchases) ? filteredPurchases : [];
    const filteredWithdrawalsList = Array.isArray(filteredWithdrawals) ? filteredWithdrawals : [];
    const filteredDistributionsList = Array.isArray(filteredDistributions) ? filteredDistributions : [];
    const missingFundingPurchases = filteredPurchasesList.filter(function (item) {
      return item.isOtherFunding && !String(item.fundingSource || '').trim();
    });
    const missingFundingWithdrawals = filteredWithdrawalsList.filter(function (item) {
      return item.isOtherFunding && !String(item.fundingSource || '').trim();
    });
    const missingFundingDistributions = filteredDistributionsList.filter(function (item) {
      return item.isOtherFunding && !String(item.fundingSource || '').trim();
    });
    const missingSalesProduct = filteredSalesList.filter(function (item) {
      return !String(resolveSaleProductName(item) || '').trim();
    });
    const pendingCount =
      missingFundingPurchases.length +
      missingFundingWithdrawals.length +
      missingFundingDistributions.length +
      missingSalesProduct.length;
    const pendingAmount = roundMoney(
      missingFundingPurchases.reduce(function (acc, item) { return acc + Number(item.total || 0); }, 0) +
      missingFundingWithdrawals.reduce(function (acc, item) { return acc + Number(item.amount || 0); }, 0) +
      missingFundingDistributions.reduce(function (acc, item) { return acc + Number(item.amount || 0); }, 0)
    );
    const pendingStatus = pendingCount === 0 ? 'ok' : (pendingCount <= 2 ? 'warning' : 'error');

    const items = [
      createChecklistItem(
        'Percentuais dos jarros vs modelo ativo',
        percentStatus,
        topPercentDiff.absDelta * (totalRevenue / 100),
        'Maior desvio: ' + topPercentDiff.label + ' (' + toPercent(topPercentDiff.delta) + ').',
        percentAction
      ),
      createChecklistItem(
        'Valor proporcional destinado para cada jarro',
        moneyStatus,
        totalMoneyDiff,
        'Maior diferença: ' + topMoneyDiff.label + ' (' + toMoney(topMoneyDiff.deltaMoney) + ').',
        moneyStatus === 'ok'
          ? 'Distribuição proporcional em reais está alinhada.'
          : 'Conferir lançamentos e modelo de alocação para reduzir diferença entre valor esperado e realizado.'
      ),
      createChecklistItem(
        'Saldo operacional bate entre potes e resumo do sistema',
        operationalStatus,
        operationalDiff,
        'Operacional no resumo: ' + toMoney(operationalFromSummary) + ' | Operacional no pote: ' + toMoney(operationalFromJars) + '.',
        operationalStatus === 'ok'
          ? 'Saldo operacional reconciliado.'
          : 'Revisar filtros de período e lançamentos que impactam caixa operacional.'
      ),
      createChecklistItem(
        'Soma dos jarros fecha com cálculo acumulado',
        jarsCloseStatus,
        jarsCloseDiff,
        jarsCloseDetail,
        jarsCloseAction
      ),
      createChecklistItem(
        'Campos obrigatórios e fonte externa preenchidos',
        pendingStatus,
        pendingAmount,
        'Pendências: ' + pendingCount + ' registro(s) com dados obrigatórios incompletos no período.',
        pendingCount === 0
          ? 'Sem pendências de cadastro para fechamento.'
          : 'Completar fonte/categoria dos registros pendentes antes de concluir o fechamento.'
      )
    ];

    const overallStatus = toDailyOverallStatus(items);
    const errorCount = items.filter(function (item) { return item.status === 'error'; }).length;
    const warningCount = items.filter(function (item) { return item.status === 'warning'; }).length;
    const totalDifference = roundMoney(items.reduce(function (acc, item) {
      return acc + Math.abs(Number(item.difference || 0));
    }, 0));

    return {
      date: referenceDate,
      status: overallStatus,
      summaryText:
        formatDateOnly(referenceDate) + ' | ' +
        (overallStatus === 'green' ? 'Conferido' : (overallStatus === 'yellow' ? 'Revisar pontos de atenção' : 'Divergências críticas')) +
        ' | Erros: ' + errorCount + ' | Atenções: ' + warningCount + '.',
      items: items,
      totalDifference: totalDifference
    };
  }

  function renderDailyCloseHistory() {
    if (!dailyCloseHistoryBody) return;
    const list = Array.isArray(dailyClosings) ? dailyClosings.slice() : [];
    if (!list.length) {
      dailyCloseHistoryBody.innerHTML = '<tr><td colspan="6">Nenhum fechamento diário registrado.</td></tr>';
      return;
    }
    const rows = list.sort(function (a, b) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    }).slice(0, 7);
    dailyCloseHistoryBody.innerHTML = rows.map(function (item) {
      const pillClass = toDailyStatusClass(item.status);
      const notesText = normalizeOptionalFieldValue(item.notes);
      const bankCheck = ['yes', 'no'].includes(String(item.bankCheck || '')) ? String(item.bankCheck) : 'unknown';
      const bankLabel = bankCheck === 'yes' ? 'Conferido' : (bankCheck === 'no' ? 'Divergente' : 'Não informado');
      const bankClass = bankCheck === 'yes' ? 'ok' : 'warn';
      return '<tr>' +
        '<td>' + formatDateOnly(item.date) + '</td>' +
        '<td>' + escapeHtml(item.responsible || '-') + '</td>' +
        '<td><span class="daily-pill ' + pillClass + '">' + toDailyStatusLabel(item.status) + '</span></td>' +
        '<td><span class="daily-bank-flag ' + bankClass + '">' + bankLabel + '</span></td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-daily-close="' + item.id + '">Editar</button><button type="button" data-delete-daily-close="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function resetDailyCloseFormMode() {
    editingDailyClosingId = '';
    if (dailyCloseSubmitBtn) dailyCloseSubmitBtn.textContent = 'Marcar fechamento do dia';
    if (dailyCloseCancelEditBtn) dailyCloseCancelEditBtn.setAttribute('hidden', 'hidden');
  }

  function resetDailyCloseForm() {
    resetDailyCloseFormMode();
    if (dailyCloseNotesInput) dailyCloseNotesInput.value = '';
    if (dailyCloseBankCheckInput) dailyCloseBankCheckInput.value = '';
    if (dailyCloseDateInput) {
      dailyCloseDateInput.value = dailyChecklistSnapshot && dailyChecklistSnapshot.date
        ? dailyChecklistSnapshot.date
        : new Date().toISOString().slice(0, 10);
    }
  }

  function startDailyCloseEdit(closeId) {
    const record = dailyClosings.find(function (item) { return item.id === closeId; }) || null;
    if (!record) {
      alert('Fechamento diário não encontrado para edição.');
      return;
    }
    editingDailyClosingId = record.id;
    if (dailyCloseResponsibleInput) dailyCloseResponsibleInput.value = record.responsible || '';
    if (dailyCloseDateInput) dailyCloseDateInput.value = toIsoDateFromAny(record.date || record.createdAt);
    if (dailyCloseBankCheckInput) dailyCloseBankCheckInput.value = record.bankCheck || '';
    if (dailyCloseNotesInput) dailyCloseNotesInput.value = record.notes || '';
    if (dailyCloseSubmitBtn) dailyCloseSubmitBtn.textContent = 'Atualizar fechamento';
    if (dailyCloseCancelEditBtn) dailyCloseCancelEditBtn.removeAttribute('hidden');
    if (dailyCloseForm && typeof dailyCloseForm.scrollIntoView === 'function') {
      dailyCloseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderDailyChecklist(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions) {
    if (!dailyChecklistStatus || !dailyChecklistItems) return;
    const report = buildDailyChecklistReport(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions);
    dailyChecklistSnapshot = report;
    dailyChecklistStatus.className = 'daily-status ' + (report.status || 'neutral');
    dailyChecklistStatus.textContent = report.summaryText;
    dailyChecklistItems.innerHTML = report.items.map(function (item) {
      const itemClass = toDailyStatusClass(item.status);
      return '<article class="daily-check-item ' + itemClass + '">' +
        '<header><strong>' + escapeHtml(item.title) + '</strong><span class="daily-pill ' + itemClass + '">' + toDailyStatusLabel(item.status) + '</span></header>' +
        '<p>Diferença estimada: ' + toMoney(item.difference) + '</p>' +
        '<p>' + escapeHtml(item.details) + '</p>' +
        '<p>Ação sugerida: ' + escapeHtml(item.action) + '</p>' +
      '</article>';
    }).join('');
    if (dailyCloseDateInput) dailyCloseDateInput.value = report.date;
    if (dailyCloseResponsibleInput && !dailyCloseResponsibleInput.value.trim()) {
      dailyCloseResponsibleInput.value = authUser && authUser.email ? String(authUser.email) : '';
    }
    renderDailyCloseHistory();
  }

  function summarizeSalesByChannel(list) {
    const grouped = {};
    SALE_CHANNELS.forEach(function (channel) {
      grouped[channel] = { channel: channel, quantity: 0, revenue: 0, netProfit: 0 };
    });

    list.forEach(function (item) {
      const channel = normalizeSaleChannel(item.saleChannel);
      if (!grouped[channel]) {
        grouped[channel] = { channel: channel, quantity: 0, revenue: 0, netProfit: 0 };
      }
      grouped[channel].quantity += Number(item.quantity || 0);
      grouped[channel].revenue += Number(item.revenue || 0);
      grouped[channel].netProfit += Number(item.netProfit || 0);
    });

    return Object.keys(grouped).map(function (key) {
      return grouped[key];
    }).filter(function (item) {
      return item.quantity > 0 || item.revenue > 0 || item.netProfit !== 0;
    });
  }

  function renderSalesByChannelTable(rows, totalRevenue) {
    if (!rows.length) {
      salesByChannelTableBody.innerHTML = '<tr><td colspan="5">Sem dados no período.</td></tr>';
      return;
    }

    salesByChannelTableBody.innerHTML = rows.map(function (item) {
      const share = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
      return '<tr>' +
        '<td>' + item.channel + '</td>' +
        '<td>' + Number(item.quantity).toLocaleString('pt-BR') + '</td>' +
        '<td>' + toMoney(item.revenue) + '</td>' +
        '<td>' + toMoney(item.netProfit) + '</td>' +
        '<td>' + toPercent(share) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderSalesChannelPie(rows, totalRevenue) {
    if (!salesChannelPie || !salesChannelLegend) return;

    if (!rows.length || totalRevenue <= 0) {
      salesChannelPie.innerHTML =
        '<circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" stroke-width="6"></circle>' +
        '<text x="21" y="21" text-anchor="middle" dominant-baseline="middle" class="pie-center-text">0%</text>';
      salesChannelLegend.innerHTML = '<li>Sem dados para o período selecionado.</li>';
      return;
    }

    let offset = 0;
    const slices = rows.map(function (item, index) {
      const share = (item.revenue / totalRevenue) * 100;
      const dasharray = share.toFixed(2) + ' ' + (100 - share).toFixed(2);
      const color = SALE_CHANNEL_COLORS[index % SALE_CHANNEL_COLORS.length];
      const slice =
        '<circle cx="21" cy="21" r="15.915" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="butt" stroke-dasharray="' + dasharray + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 21 21)"></circle>';
      offset += share;
      return { slice: slice, color: color, share: share, channel: item.channel, revenue: item.revenue };
    });

    salesChannelPie.innerHTML =
      '<circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" stroke-width="6"></circle>' +
      slices.map(function (item) { return item.slice; }).join('') +
      '<text x="21" y="21" text-anchor="middle" dominant-baseline="middle" class="pie-center-text">100%</text>';

    salesChannelLegend.innerHTML = slices.map(function (item) {
      return '<li><span class="dot" style="background:' + item.color + ';"></span>' + item.channel + ' - ' + toPercent(item.share) + ' (' + toMoney(item.revenue) + ')</li>';
    }).join('');
  }

  function drawAxisAndGrid(ctx, width, height, minValue, maxValue) {
    const left = 42;
    const right = width - 12;
    const top = 16;
    const bottom = height - 28;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const y = top + ((bottom - top) * i / 4);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'right';
    for (let j = 0; j <= 4; j += 1) {
      const val = maxValue - ((maxValue - minValue) * j / 4);
      const yLabel = top + ((bottom - top) * j / 4) + 3;
      ctx.fillText((val / 1000 >= 1 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toString()), left - 6, yLabel);
    }
    return { left: left, right: right, top: top, bottom: bottom };
  }

  function renderLineChartCanvas(canvas, labels, series) {
    if (!canvas) return;
    if (!labels.length || !series.length) {
      drawEmptyCanvas(canvas, 'Sem dados para este período');
      return;
    }
    const canvasCtx = getCanvasContext(canvas);
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);

    const values = [];
    series.forEach(function (line) { values.push.apply(values, line.values); });
    let min = Math.min.apply(null, values);
    let max = Math.max.apply(null, values);
    if (min === max) {
      max += 1;
      min -= 1;
    }
    min = Math.min(0, min);

    const axis = drawAxisAndGrid(ctx, width, height, min, max);
    const stepX = labels.length > 1 ? (axis.right - axis.left) / (labels.length - 1) : 0;
    const valueToY = function (v) {
      return axis.bottom - ((v - min) / (max - min)) * (axis.bottom - axis.top);
    };

    series.forEach(function (line) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      line.values.forEach(function (v, i) {
        const x = axis.left + (stepX * i);
        const y = valueToY(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    ctx.fillStyle = '#475569';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    if (labels.length === 1) {
      ctx.fillText(labels[0], axis.left, height - 8);
    } else {
      const mid = Math.floor((labels.length - 1) / 2);
      ctx.fillText(labels[0], axis.left, height - 8);
      ctx.fillText(labels[mid], axis.left + (stepX * mid), height - 8);
      ctx.fillText(labels[labels.length - 1], axis.right, height - 8);
    }

    let legendX = axis.left;
    series.forEach(function (line) {
      ctx.fillStyle = line.color;
      ctx.fillRect(legendX, 4, 10, 10);
      ctx.fillStyle = '#334155';
      ctx.font = '11px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText(line.label, legendX + 14, 13);
      legendX += Math.min(140, 18 + (line.label.length * 7));
    });
  }

  function renderChannelBarChart(canvas, rows) {
    if (!canvas) return;
    if (!rows.length) {
      drawEmptyCanvas(canvas, 'Sem dados por canal');
      return;
    }
    const canvasCtx = getCanvasContext(canvas);
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);

    const axis = drawAxisAndGrid(ctx, width, height, 0, Math.max(1, Math.max.apply(null, rows.map(function (r) { return Math.max(r.revenue, r.netProfit); }))));
    const groupWidth = (axis.right - axis.left) / rows.length;
    rows.forEach(function (row, idx) {
      const centerX = axis.left + (groupWidth * idx) + (groupWidth / 2);
      const revenueH = ((row.revenue - 0) / (Math.max(1, Math.max.apply(null, rows.map(function (r) { return Math.max(r.revenue, r.netProfit); }))) - 0)) * (axis.bottom - axis.top);
      const profitH = ((Math.max(0, row.netProfit) - 0) / (Math.max(1, Math.max.apply(null, rows.map(function (r) { return Math.max(r.revenue, r.netProfit); }))) - 0)) * (axis.bottom - axis.top);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(centerX - 14, axis.bottom - revenueH, 10, revenueH);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(centerX + 4, axis.bottom - profitH, 10, profitH);
      ctx.fillStyle = '#475569';
      ctx.font = '10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(row.channel.slice(0, 10), centerX, height - 8);
    });
  }

  function renderDualBarTimeline(canvas, labels, entries, exits) {
    if (!canvas) return;
    if (!labels.length) {
      drawEmptyCanvas(canvas, 'Sem dados de fluxo');
      return;
    }
    const maxValue = Math.max(1, Math.max.apply(null, entries.concat(exits)));
    const canvasCtx = getCanvasContext(canvas);
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);
    const axis = drawAxisAndGrid(ctx, width, height, 0, maxValue);
    const groupWidth = (axis.right - axis.left) / labels.length;

    labels.forEach(function (_, idx) {
      const baseX = axis.left + (groupWidth * idx) + (groupWidth * 0.2);
      const w = Math.max(4, groupWidth * 0.25);
      const entH = (entries[idx] / maxValue) * (axis.bottom - axis.top);
      const outH = (exits[idx] / maxValue) * (axis.bottom - axis.top);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(baseX, axis.bottom - entH, w, entH);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(baseX + w + 3, axis.bottom - outH, w, outH);
    });
  }

  function renderHorizontalBarChart(canvas, rows, emptyMessage) {
    if (!canvas) return;
    if (!rows.length) {
      drawEmptyCanvas(canvas, emptyMessage || 'Sem dados');
      return;
    }
    const canvasCtx = getCanvasContext(canvas);
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);
    ctx.font = '600 11px Segoe UI';
    const displayLabels = rows.map(function (row, idx) {
      return (idx + 1) + '. ' + shortenMiddle(row.label, 30);
    });
    const maxLabelWidth = Math.max.apply(null, displayLabels.map(function (text) { return ctx.measureText(text).width; }));
    const left = Math.max(126, Math.min(width * 0.52, maxLabelWidth + 18));
    const right = width - 12;
    const top = 20;
    const gap = 8;
    const barHeight = Math.max(16, ((height - top - 10) - (gap * (rows.length - 1))) / rows.length);
    const maxValue = Math.max(1, Math.max.apply(null, rows.map(function (r) { return r.value; })));
    ctx.textBaseline = 'middle';
    rows.forEach(function (row, idx) {
      const y = top + (idx * (barHeight + gap));
      const barW = Math.max(4, ((right - left) * row.value) / maxValue);
      const textY = y + (barHeight / 2);
      const valueText = toMoney(row.value);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(left, y, barW, barHeight);
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px Segoe UI';
      ctx.textAlign = 'right';
      ctx.fillText(displayLabels[idx], left - 8, textY);

      ctx.font = '600 10px Segoe UI';
      const badgeW = ctx.measureText(valueText).width + 12;
      const badgeH = Math.max(16, barHeight - 2);
      const defaultBadgeX = left + barW + 6;
      const fitsOutside = (defaultBadgeX + badgeW) <= right;
      const badgeX = fitsOutside ? defaultBadgeX : Math.max(left + 2, left + barW - badgeW - 4);
      const badgeY = y + ((barHeight - badgeH) / 2);
      drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fillStyle = fitsOutside ? '#e2e8f0' : '#134e4a';
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.fillStyle = fitsOutside ? '#0f172a' : '#ecfeff';
      ctx.fillText(valueText, badgeX + 6, textY);
    });
  }

  function renderDashboardDonut(rows, totalRevenue) {
    if (!dashDonutChart || !dashDonutLegend) return;
    if (!rows.length || totalRevenue <= 0) {
      drawEmptyCanvas(dashDonutChart, 'Sem vendas no período');
      dashDonutLegend.innerHTML = '<li>Sem dados para o período selecionado.</li>';
      return;
    }
    const canvasCtx = getCanvasContext(dashDonutChart);
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.32;
    const inner = radius * 0.58;
    let start = -Math.PI / 2;
    const legendRows = [];
    rows.forEach(function (row, idx) {
      const val = row.revenue / totalRevenue;
      const end = start + (Math.PI * 2 * val);
      const color = SALE_CHANNEL_COLORS[idx % SALE_CHANNEL_COLORS.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      legendRows.push('<li><span class="dot" style="background:' + color + ';"></span>' + row.channel + ' - ' + toPercent(val * 100) + '</li>');
      start = end;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Vendas', cx, cy - 4);
    ctx.font = '12px Segoe UI';
    ctx.fillText(toMoney(totalRevenue), cx, cy + 14);
    dashDonutLegend.innerHTML = legendRows.join('');
  }

  function buildDashboardTimeline(filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, mode) {
    const buckets = {};
    const productMap = {};
    function ensure(key) {
      if (!buckets[key]) {
        buckets[key] = { revenue: 0, netProfit: 0, expenses: 0, purchases: 0, withdrawals: 0, distributions: 0, countSales: 0 };
      }
      return buckets[key];
    }
    filteredSales.forEach(function (item) {
      const key = getPeriodKey(item.date || item.createdAt, mode);
      if (!key) return;
      const bucket = ensure(key);
      bucket.revenue += Number(item.revenue || 0);
      bucket.netProfit += Number(item.netProfit || 0);
      bucket.expenses += Number(item.expense || 0);
      bucket.countSales += 1;
      const pname = resolveSaleProductName(item) || 'Sem nome';
      productMap[pname] = (productMap[pname] || 0) + Number(item.revenue || 0);
    });
    filteredPurchases.forEach(function (item) {
      const key = getPeriodKey(item.purchaseDate, mode);
      if (!key) return;
      if (item.isOtherFunding) return;
      ensure(key).purchases += Number(item.total || 0);
    });
    filteredWithdrawals.forEach(function (item) {
      const key = getPeriodKey(item.withdrawalDate, mode);
      if (!key) return;
      if (item.isOtherFunding) return;
      const flowType = item.flowType || classifyFlowType(item.type, item.type, item.notes);
      if (flowType !== 'expense') return;
      ensure(key).withdrawals += Number(item.amount || 0);
    });
    filteredDistributions.forEach(function (item) {
      const key = getPeriodKey(item.date || item.createdAt, mode);
      if (!key) return;
      if (item.isOtherFunding) return;
      ensure(key).distributions += Number(item.amount || 0);
    });
    const keys = Object.keys(buckets).sort();
    const labels = keys;
    const revenue = keys.map(function (k) { return buckets[k].revenue; });
    const operational = keys.map(function (k) { return buckets[k].netProfit - buckets[k].purchases; });
    const cash = keys.map(function (k) { return (buckets[k].netProfit - buckets[k].purchases - buckets[k].withdrawals - buckets[k].distributions); });
    const entries = keys.map(function (k) { return buckets[k].revenue; });
    const exits = keys.map(function (k) { return buckets[k].purchases + buckets[k].withdrawals + buckets[k].distributions + buckets[k].expenses; });
    const ticket = keys.map(function (k) {
      return buckets[k].countSales > 0 ? buckets[k].revenue / buckets[k].countSales : 0;
    });
    const topProducts = Object.keys(productMap).map(function (name) {
      return { label: name, value: productMap[name] };
    }).sort(function (a, b) {
      return b.value - a.value;
    }).slice(0, 5);
    return { labels: labels, revenue: revenue, operational: operational, cash: cash, entries: entries, exits: exits, ticket: ticket, topProducts: topProducts };
  }

  function buildFacebookAdsRoiTimeline(sourceSales, filteredInvestments, mode) {
    const buckets = {};
    sourceSales.forEach(function (item) {
      if (normalizeSaleChannel(item.saleChannel) !== 'Facebook Ads') return;
      const key = getPeriodKey(item.date || item.createdAt, mode);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { investment: 0, revenue: 0, profit: 0 };
      buckets[key].investment += Number(item.expense || 0);
      buckets[key].revenue += Number(item.revenue || 0);
      buckets[key].profit += Number(item.netProfit || 0);
    });
    filteredInvestments.forEach(function (item) {
      const key = getPeriodKey(item.date || item.createdAt, mode);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { investment: 0, revenue: 0, profit: 0 };
      buckets[key].investment += Number(item.amount || 0);
    });
    const keys = Object.keys(buckets).sort();
    const roi = keys.map(function (k) {
      const investment = buckets[k].investment;
      if (investment <= 0) return 0;
      return ((buckets[k].revenue - investment) / investment) * 100;
    });
    return { labels: keys, roi: roi };
  }

  function renderFacebookAdsRoiPanel(sourceSales, filteredInvestments) {
    const fbSales = sourceSales.filter(function (item) {
      return normalizeSaleChannel(item.saleChannel) === 'Facebook Ads';
    });

    const directInvestment = filteredInvestments.reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);

    const totals = fbSales.reduce(function (acc, item) {
      acc.investment += Number(item.expense || 0);
      acc.revenue += Number(item.revenue || 0);
      acc.profit += Number(item.netProfit || 0);
      return acc;
    }, { investment: 0, revenue: 0, profit: 0 });

    const totalInvestment = totals.investment + directInvestment;
    const adjustedProfit = totals.profit - directInvestment; // netProfit ja descontou expense, entao descontamos apenas o investimento direto
    const roi = totalInvestment > 0 ? ((totals.revenue - totalInvestment) / totalInvestment) * 100 : 0;
    const returnPerReal = totalInvestment > 0 ? (totals.revenue / totalInvestment) : 0;

    const statusInfo = (!fbSales.length && totalInvestment <= 0)
      ? {
          tone: 'neutral',
          message: 'Leitura rápida: ainda sem dados de Facebook Ads para avaliar.',
          action: 'Ação sugerida: lance pelo menos 1 investimento e as vendas do canal para iniciar a análise.'
        }
      : (totalInvestment <= 0
          ? {
              tone: 'warning',
              message: 'Leitura rápida: existem vendas, mas falta registrar gasto da campanha.',
              action: 'Ação sugerida: registrar investimento real dos anúncios para o ROI ficar confiável.'
            }
          : (roi >= 30
              ? {
                  tone: 'good',
                  message: 'Leitura rápida: campanha saudável e rentável.',
                  action: 'Ação sugerida: manter o canal ativo e escalar gradualmente com controle de custo por venda.'
                }
              : (roi >= 0
                  ? {
                      tone: 'warning',
                      message: 'Leitura rápida: campanha no zero a zero ou com lucro baixo.',
                      action: 'Ação sugerida: testar criativos/ofertas para elevar margem e retorno por real investido.'
                    }
                  : {
                      tone: 'danger',
                      message: 'Leitura rápida: campanha em prejuízo no período.',
                      action: 'Ação sugerida: pausar ajustes de escala, revisar público, criativo e custo antes de reinvestir.'
                    })));

    const panels = [
      {
        investmentNode: dashFbAdsInvestment,
        revenueNode: dashFbAdsRevenue,
        profitNode: dashFbAdsProfit,
        roiNode: dashFbAdsRoi,
        returnPerRealNode: dashFbAdsReturnPerReal,
        statusNode: dashFbAdsRoiStatus,
        actionNode: dashFbAdsRoiAction,
        noteNode: dashFbAdsRoiNote
      },
      {
        investmentNode: cashAdsRoiInvestment,
        revenueNode: cashAdsRoiRevenue,
        profitNode: cashAdsRoiProfit,
        roiNode: cashAdsRoi,
        returnPerRealNode: cashAdsRoiReturnPerReal,
        statusNode: cashAdsRoiStatus,
        actionNode: cashAdsRoiAction,
        noteNode: null
      }
    ];

    panels.forEach(function (panel) {
      if (!panel.investmentNode || !panel.revenueNode || !panel.profitNode || !panel.roiNode) return;
      panel.investmentNode.textContent = toMoney(totalInvestment);
      panel.revenueNode.textContent = toMoney(totals.revenue);
      panel.profitNode.textContent = toMoney(adjustedProfit);
      panel.roiNode.textContent = toPercent(roi);
      if (panel.returnPerRealNode) panel.returnPerRealNode.textContent = toMoney(returnPerReal);

      if (panel.noteNode) {
        if (!fbSales.length && directInvestment <= 0) {
          panel.noteNode.textContent = 'Sem dados de Facebook Ads no período filtrado. Lance vendas e investimentos para gerar leitura.';
        } else if (totalInvestment <= 0) {
          panel.noteNode.textContent = 'Há vendas em Facebook Ads sem investimento lançado. Sem gasto informado, o retorno fica incompleto.';
        } else {
          panel.noteNode.textContent =
            'Leitura prática: para cada R$ 1,00 investido, voltou ' + toMoney(returnPerReal) +
            ' em vendas. ROI atual: ' + toPercent(roi) + '.';
        }
      }

      if (panel.statusNode && panel.actionNode) {
        panel.statusNode.className = 'roi-status ' + statusInfo.tone;
        panel.statusNode.textContent = statusInfo.message;
        panel.actionNode.textContent = statusInfo.action;
      }
    });

    if (!dashFbAdsRoiChart) return;
    const timeline = buildFacebookAdsRoiTimeline(sourceSales, filteredInvestments, getCurrentPeriodMode());
    if (!timeline.labels.length) {
      drawEmptyCanvas(dashFbAdsRoiChart, 'Sem ROI de Facebook Ads no período');
      return;
    }
    renderLineChartCanvas(dashFbAdsRoiChart, timeline.labels, [
      { label: 'Retorno (%)', color: '#0f766e', values: timeline.roi }
    ]);
  }

  function getExpectedAllocationPercentages(modelName, modelRatios) {
    const model = modelRatios && typeof modelRatios === 'object'
      ? modelRatios
      : (modelName === 'growth' ? ALLOCATION_GROWTH_MODEL : ALLOCATION_BASE_MODEL);
    return {
      tithe: roundMoney(model.tithe * 100),
      emergency: roundMoney(model.emergency * 100),
      debt: roundMoney(model.debt * 100),
      proLabore: roundMoney(model.proLabore * 100),
      growth: roundMoney(model.growth * 100),
      operational: roundMoney(model.operational * 100)
    };
  }

  function renderStrategicStatusPanel(strategicReport) {
    const jars = strategicReport.jarBalanceEvolution.length
      ? strategicReport.jarBalanceEvolution[strategicReport.jarBalanceEvolution.length - 1]
      : { tithe: 0, emergency: 0, debt: 0, proLabore: 0, growth: 0, operational: 0 };

    const growth = strategicReport.growthStatus || {};
    const conditions = growth.conditions || {};
    const repurchasePolicy = growth.repurchasePolicy || {};
    const emergencyTarget = Number(growth.emergencyReserveTarget || conditions.emergencyTarget || 0);
    const failures = [];
    if (!conditions.emergencyReady) failures.push('reserva abaixo da meta (' + toMoney(emergencyTarget) + ')');
    if (!conditions.debtTrendDecreasing) failures.push('dívidas sem tendência de queda');
    if (!conditions.positiveOperational30Days) failures.push('menos de 30 dias positivos');
    const growthText = growth.enabled
      ? (
          'Growth ATIVO (' + (growth.latestDay || '-') + ')' +
          ' | Operacional dinâmico alvo: ' + toPercent(repurchasePolicy.operationalTarget || 0) +
          ' (CMV ' + toPercent(repurchasePolicy.cmvRatio || 0) + ' + buffer ' + toPercent(repurchasePolicy.safetyBuffer || 0) + ').' +
          ' | Meta reserva: ' + toMoney(emergencyTarget) + '.'
        )
      : (
          'Growth INATIVO | Pendências: ' + (failures.length ? failures.join(', ') : '-') +
          ' | Sequência positiva: ' + Number(growth.positiveOperationalStreakDays || 0) + '/30 dia(s).' +
          ' | Operacional alvo atual: ' + toPercent(repurchasePolicy.operationalTarget || 0) + '.'
        );

    const actual = strategicReport.allocationPercentageValidation || {};
    const expected = strategicReport.expectedAllocationPercentages ||
      getExpectedAllocationPercentages(growth.model || 'base', growth.modelRatios);
    const totalPct =
      Number(actual.tithe || 0) +
      Number(actual.emergency || 0) +
      Number(actual.debt || 0) +
      Number(actual.proLabore || 0) +
      Number(actual.growth || 0) +
      Number(actual.operational || 0);
    const totalValid = Math.abs(totalPct - 100) <= 0.5;
    const operationalInPolicy =
      Number(actual.operational || 0) >= (DYNAMIC_REPURCHASE_MIN_RATIO * 100 - 2) &&
      Number(actual.operational || 0) <= (DYNAMIC_REPURCHASE_MAX_RATIO * 100 + 2);
    const valid = totalValid && operationalInPolicy;
    const validationText =
      'Validação de percentuais (' + (valid ? 'OK' : 'Ajustar') + '): ' +
      'Dízimo ' + toPercent(actual.tithe) +
      ' | Reserva ' + toPercent(actual.emergency) +
      ' | Dívida ' + toPercent(actual.debt) +
      ' | Pró-labore ' + toPercent(actual.proLabore) +
      ' | Growth ' + toPercent(actual.growth) +
      ' | Operacional ' + toPercent(actual.operational) +
      ' (alvo atual ' + toPercent(expected.operational) + ').';

    function trendLabel(metric) {
      if (!metric || metric.trend === 'flat') return 'estável';
      return metric.trend === 'up' ? 'subiu' : 'caiu';
    }

    const cmp = strategicReport.comparison || {};
    const comparisonText =
      'Comparativo vs período anterior: ' +
      'Receita ' + trendLabel(cmp.grossRevenue) + ' (' + toMoney(cmp.grossRevenue ? cmp.grossRevenue.delta : 0) + '), ' +
      'Lucro Operacional ' + trendLabel(cmp.netOperationalProfit) + ' (' + toMoney(cmp.netOperationalProfit ? cmp.netOperationalProfit.delta : 0) + '), ' +
      'Saldo Operacional ' + trendLabel(cmp.operationalBalance) + ' (' + toMoney(cmp.operationalBalance ? cmp.operationalBalance.delta : 0) + ').';

    const panels = [
      {
        jarTithe: dashJarTithe,
        jarEmergency: dashJarEmergency,
        jarDebt: dashJarDebt,
        jarProLabore: dashJarProLabore,
        jarGrowth: dashJarGrowth,
        jarOperational: dashJarOperational,
        growthStatus: dashGrowthStatus,
        allocationValidation: dashAllocationValidation,
        comparisonSummary: dashComparisonSummary
      },
      {
        jarTithe: cashJarTithe,
        jarEmergency: cashJarEmergency,
        jarDebt: cashJarDebt,
        jarProLabore: cashJarProLabore,
        jarGrowth: cashJarGrowth,
        jarOperational: cashJarOperational,
        growthStatus: cashGrowthStatus,
        allocationValidation: cashAllocationValidation,
        comparisonSummary: cashComparisonSummary
      }
    ];

    panels.forEach(function (panel) {
      if (panel.jarTithe) panel.jarTithe.textContent = toMoney(jars.tithe);
      if (panel.jarEmergency) panel.jarEmergency.textContent = toMoney(jars.emergency);
      if (panel.jarDebt) panel.jarDebt.textContent = toMoney(jars.debt);
      if (panel.jarProLabore) panel.jarProLabore.textContent = toMoney(jars.proLabore);
      if (panel.jarGrowth) panel.jarGrowth.textContent = toMoney(jars.growth);
      if (panel.jarOperational) panel.jarOperational.textContent = toMoney(jars.operational);
      if (panel.growthStatus) panel.growthStatus.textContent = growthText;
      if (panel.allocationValidation) panel.allocationValidation.textContent = validationText;
      if (panel.comparisonSummary) panel.comparisonSummary.textContent = comparisonText;
    });
  }

  function renderDashboard(filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, salesByDateRange) {
    if (!dashKpiRevenue) return;
    const reportMode = getCurrentPeriodMode();
    const strategicReport = generateStrategicAllocationReport(reportMode, {
      start: dashboardFilterStartDateInput ? dashboardFilterStartDateInput.value : '',
      end: dashboardFilterEndDateInput ? dashboardFilterEndDateInput.value : ''
    });
    const totalRevenue = Number(strategicReport.summary.grossRevenue || 0);
    const operational = Number(strategicReport.summary.netOperationalProfit || 0);
    const cash = Number(strategicReport.summary.operationalBalance || 0);
    const operationalAllocation = Number(strategicReport.summary.allocations.operational || 0);
    const fallbackOperationalRatio = strategicReport.growthStatus && strategicReport.growthStatus.modelRatios
      ? Number(strategicReport.growthStatus.modelRatios.operational || ALLOCATION_BASE_MODEL.operational)
      : ALLOCATION_BASE_MODEL.operational;
    const health = calculateOperationalHealthMetrics(strategicReport.range.end, cash, fallbackOperationalRatio);
    const ticket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    dashKpiRevenue.textContent = toMoney(totalRevenue);
    dashKpiOperational.textContent = toMoney(operational);
    dashKpiCash.textContent = toMoney(cash);
    if (dashKpiOperationalAllocation) dashKpiOperationalAllocation.textContent = toMoney(operationalAllocation);
    dashKpiTicket.textContent = toMoney(ticket);
    if (dashKpiEmergencyTarget) dashKpiEmergencyTarget.textContent = toMoney(health.emergencyTarget);
    if (dashKpiRunwayDays) dashKpiRunwayDays.textContent = health.dailyEssential > 0 ? toDays(health.runwayDays) : '-';
    if (dashKpiRepurchaseCoverage) {
      dashKpiRepurchaseCoverage.textContent = health.repurchaseNeed30Days > 0 ? toMultiplier(health.repurchaseCoverage) : '-';
    }
    if (dashKpiRuptureRisk) {
      dashKpiRuptureRisk.textContent = health.ruptureGap > 0 ? toMoney(health.ruptureGap) : 'Coberto';
    }
    if (dashKpiInventoryTurnover) dashKpiInventoryTurnover.textContent = toMultiplier(health.inventoryTurnover);
    renderStrategicStatusPanel(strategicReport);

    const byChannel = summarizeSalesByChannel(filteredSales);
    renderDashboardDonut(byChannel, totalRevenue);
    renderChannelBarChart(dashChannelBarChart, byChannel);

    const timeline = buildDashboardTimeline(filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, reportMode);
    const strategicTimeline = strategicReport.chartData || { labels: [], grossRevenue: [], netOperationalProfit: [], operationalBalance: [], strategicExits: [] };
    renderLineChartCanvas(dashTrendChart, strategicTimeline.labels || [], [
      { label: 'Receita', color: '#2563eb', values: strategicTimeline.grossRevenue || [] },
      { label: 'Operacional', color: '#16a34a', values: strategicTimeline.netOperationalProfit || [] },
      { label: 'Saldo Operacional', color: '#f59e0b', values: strategicTimeline.operationalBalance || [] }
    ]);
    renderDualBarTimeline(
      dashFlowChart,
      strategicTimeline.labels || [],
      strategicTimeline.grossRevenue || [],
      strategicTimeline.strategicExits || []
    );
    renderHorizontalBarChart(dashTopProductsChart, timeline.topProducts, 'Sem produtos no período');
    updateTopProductsSummary(timeline.topProducts);
    renderLineChartCanvas(dashTicketTrendChart, timeline.labels, [
      { label: 'Ticket Médio', color: '#7c3aed', values: timeline.ticket }
    ]);
  }

  function renderPurchasesTable() {
    if (!purchases.length) {
      purchasesTableBody.innerHTML = '<tr><td colspan="9">Nenhuma compra cadastrada.</td></tr>';
      return;
    }

    purchasesTableBody.innerHTML = purchases.map(function (item) {
      const notesText = normalizeOptionalFieldValue(item.notes);
      const fundingText = item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : '';
      const mobileDetails = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(notesText, 'Observação (opcional)', 'product-description-details'),
        renderOptionalFieldDetailsIfPresent(fundingText, 'Fonte (opcional)', 'product-description-details')
      ]);
      return '<tr>' +
        '<td>' + formatDateOnly(item.purchaseDate) + '</td>' +
        '<td>' + escapeHtml(item.type) + '</td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(item.item) + '</strong>' + mobileDetails + '</div></td>' +
        '<td>' + Number(item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '</td>' +
        '<td>' + toMoney(item.total) + '</td>' +
        '<td>' + escapeHtml(item.supplier || '-') + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td>' + renderOptionalFieldDetails(fundingText, 'Ver fonte', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-purchase="' + item.id + '">Editar</button><button type="button" data-delete-purchase="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function renderWithdrawalsTable() {
    if (!withdrawals.length) {
      withdrawalsTableBody.innerHTML = '<tr><td colspan="6">Nenhuma saída cadastrada.</td></tr>';
      return;
    }

    withdrawalsTableBody.innerHTML = withdrawals.map(function (item) {
      const notesText = normalizeOptionalFieldValue(item.notes);
      const fundingText = item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : '';
      const mobileDetails = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(notesText, 'Observação (opcional)', 'product-description-details'),
        renderOptionalFieldDetailsIfPresent(fundingText, 'Fonte (opcional)', 'product-description-details')
      ]);
      return '<tr>' +
        '<td>' + formatDateOnly(item.withdrawalDate) + '</td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(item.type) + '</strong>' + mobileDetails + '</div></td>' +
        '<td>' + toMoney(item.amount) + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td>' + renderOptionalFieldDetails(fundingText, 'Ver fonte', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-withdrawal="' + item.id + '">Editar</button><button type="button" data-delete-withdrawal="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function toggleMovementField(node, visible) {
    if (!node) return;
    if (UiModule && typeof UiModule.setHidden === 'function') {
      UiModule.setHidden(node, !visible);
      return;
    }
    if (visible) node.removeAttribute('hidden');
    else node.setAttribute('hidden', 'hidden');
  }

  function updateUnifiedMovementFormByKind() {
    const kind = movementKindInput ? String(movementKindInput.value || '') : '';
    const isPurchase = kind === 'purchase';
    const isWithdrawal = kind === 'withdrawal';
    const isDistribution = kind === 'distribution';
    const isAds = kind === 'ads';

    toggleMovementField(movementPurchaseTypeWrap, isPurchase);
    toggleMovementField(movementItemWrap, isPurchase);
    toggleMovementField(movementQuantityWrap, isPurchase);
    toggleMovementField(movementSupplierWrap, isPurchase);
    toggleMovementField(movementWithdrawalTypeWrap, isWithdrawal);
    toggleMovementField(movementPartnerWrap, isDistribution);
    toggleMovementField(movementAdsPlatformWrap, isAds);
    toggleMovementField(movementAdsMethodWrap, isAds);

    if (movementPurchaseTypeInput) movementPurchaseTypeInput.required = isPurchase;
    if (movementItemInput) movementItemInput.required = isPurchase;
    if (movementQuantityInput) movementQuantityInput.required = isPurchase;
    if (movementWithdrawalTypeInput) movementWithdrawalTypeInput.required = isWithdrawal;
    if (movementPartnerInput) movementPartnerInput.required = isDistribution;
    if (movementAdsPlatformInput) movementAdsPlatformInput.required = isAds;
    if (movementAdsMethodInput) movementAdsMethodInput.required = isAds;

    const supportsExternalFunding = isPurchase || isWithdrawal || isDistribution || isAds;
    if (!supportsExternalFunding && movementOtherFundingInput) {
      movementOtherFundingInput.checked = false;
    }
    toggleMovementField(movementOtherFundingWrap, supportsExternalFunding);
    const showFundingSource = supportsExternalFunding && movementOtherFundingInput && movementOtherFundingInput.checked;
    toggleMovementField(movementFundingSourceWrap, showFundingSource);
    if (movementFundingSourceInput) {
      movementFundingSourceInput.required = showFundingSource;
      if (!showFundingSource) movementFundingSourceInput.value = '';
    }
  }

  function resetUnifiedMovementForm() {
    editingMovementSource = '';
    editingMovementId = '';
    if (movementForm) movementForm.reset();
    if (movementDateInput) movementDateInput.value = new Date().toISOString().slice(0, 10);
    if (movementKindInput) {
      movementKindInput.value = 'purchase';
      movementKindInput.disabled = false;
    }
    if (movementQuantityInput) movementQuantityInput.value = '1';
    if (movementAdsMethodInput) movementAdsMethodInput.value = 'PIX Prepaid';
    if (movementSubmitBtn) movementSubmitBtn.textContent = 'Salvar Movimentação';
    if (movementCancelEditBtn) movementCancelEditBtn.setAttribute('hidden', 'hidden');
    updateUnifiedMovementFormByKind();
  }

  function getUnifiedMovementRecord(source, id) {
    const src = String(source || '');
    const movementId = String(id || '');
    if (src === 'purchase') return purchases.find(function (item) { return item.id === movementId; }) || null;
    if (src === 'withdrawal') return withdrawals.find(function (item) { return item.id === movementId; }) || null;
    if (src === 'distribution') return partnerContributions.find(function (item) { return item.id === movementId; }) || null;
    if (src === 'ads') return adsInvestments.find(function (item) { return item.id === movementId; }) || null;
    return null;
  }

  function applyUnifiedMovementRecordToForm(source, record) {
    const src = String(source || '');
    if (!movementForm || !record) return;
    if (movementKindInput) {
      movementKindInput.value = src;
      movementKindInput.disabled = true;
    }
    if (movementDateInput) {
      movementDateInput.value = toIsoDateFromAny(record.purchaseDate || record.withdrawalDate || record.date || record.createdAt);
    }
    if (movementAmountInput) {
      movementAmountInput.value = src === 'purchase' ? Number(record.total || 0) : Number(record.amount || 0);
    }
    if (movementNotesInput) movementNotesInput.value = record.notes || '';
    if (movementOtherFundingInput) movementOtherFundingInput.checked = !!record.isOtherFunding;
    if (movementFundingSourceInput) movementFundingSourceInput.value = record.fundingSource || '';

    if (movementPurchaseTypeInput) movementPurchaseTypeInput.value = src === 'purchase' ? String(record.type || '') : '';
    if (movementItemInput) movementItemInput.value = src === 'purchase' ? String(record.item || '') : '';
    if (movementQuantityInput) movementQuantityInput.value = src === 'purchase' ? Number(record.quantity || 1) : '1';
    if (movementSupplierInput) movementSupplierInput.value = src === 'purchase' ? String(record.supplier || '') : '';
    if (movementWithdrawalTypeInput) movementWithdrawalTypeInput.value = src === 'withdrawal' ? String(record.type || '') : '';
    if (movementPartnerInput) movementPartnerInput.value = src === 'distribution' ? String(record.partner || '') : '';
    if (movementAdsPlatformInput) movementAdsPlatformInput.value = src === 'ads' ? String(record.platform || 'Facebook Ads') : 'Facebook Ads';
    if (movementAdsMethodInput) movementAdsMethodInput.value = src === 'ads' ? String(record.method || 'PIX Prepaid') : 'PIX Prepaid';
    updateUnifiedMovementFormByKind();
  }

  function startUnifiedMovementEdit(source, id) {
    const src = String(source || '');
    const record = getUnifiedMovementRecord(src, id);
    if (!record) {
      alert('Movimentação não encontrada para edição.');
      return;
    }
    editingMovementSource = src;
    editingMovementId = String(id || '');
    applyUnifiedMovementRecordToForm(src, record);
    if (movementSubmitBtn) movementSubmitBtn.textContent = 'Atualizar Movimentação';
    if (movementCancelEditBtn) movementCancelEditBtn.removeAttribute('hidden');
    setActiveTab('cash');
    if (movementForm && typeof movementForm.scrollIntoView === 'function') {
      movementForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function syncPairedAdsWithdrawal(adsRecord, previousAdsRecord) {
    if (!adsRecord || !adsRecord.id) return;
    const previousPaired = withdrawals.find(function (item) {
      return item.linkedSource === 'ads' && item.linkedTransactionId === adsRecord.id;
    });
    if (adsRecord.isOtherFunding) {
      if (previousPaired) {
        withdrawals = withdrawals.filter(function (item) { return item.id !== previousPaired.id; });
        saveWithdrawals();
      }
      return;
    }

    const notes = String(adsRecord.notes || '');
    const withdrawalRecord = {
      id: previousPaired ? previousPaired.id : generateUuid(),
      linkedSource: 'ads',
      linkedTransactionId: adsRecord.id,
      withdrawalDate: adsRecord.date,
      date: adsRecord.date,
      type: 'Ads Investment',
      flowType: 'expense',
      amount: Number(adsRecord.amount || 0),
      notes: (notes ? notes + ' - ' : '') + 'Ads via ' + String(adsRecord.platform || 'Ads') + ' (' + String(adsRecord.method || '-') + ')',
      createdAt: previousPaired && previousPaired.createdAt
        ? previousPaired.createdAt
        : (previousAdsRecord && previousAdsRecord.createdAt ? previousAdsRecord.createdAt : adsRecord.createdAt)
    };
    if (previousPaired) {
      withdrawals = withdrawals.map(function (item) {
        return item.id === previousPaired.id ? withdrawalRecord : item;
      });
    } else {
      withdrawals.unshift(withdrawalRecord);
    }
    saveWithdrawals();
  }

  async function updateUnifiedMovement(source, id, payload) {
    const src = String(source || '');
    const movementId = String(id || '');
    const original = getUnifiedMovementRecord(src, movementId);
    if (!original) {
      alert('Movimentação não encontrada para atualizar.');
      return false;
    }
    const date = String(payload && payload.date || '');
    const amount = Number(payload && payload.amount || 0);
    const notes = String(payload && payload.notes || '').trim();
    const isOtherFunding = !!(payload && payload.isOtherFunding);
    const fundingSource = String(payload && payload.fundingSource || '').trim();
    if (!date || !isValidIsoDate(date) || amount <= 0) {
      alert('Confira data e valor antes de atualizar.');
      return false;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return false;
    }

    if (src === 'purchase') {
      const type = String(payload && payload.purchaseType || '');
      const item = String(payload && payload.item || '').trim();
      const quantity = Number(payload && payload.quantity || 0);
      const supplier = String(payload && payload.supplier || '').trim();
      if (!type || !item || quantity <= 0) {
        alert('Preencha os dados da compra corretamente.');
        return false;
      }
      const record = Object.assign({}, original, {
        purchaseDate: date,
        date: date,
        type: type,
        item: item,
        quantity: quantity,
        total: amount,
        supplier: supplier,
        notes: notes,
        isInventoryPurchase: isInventoryPurchaseType(type),
        isOtherFunding: isOtherFunding,
        fundingSource: isOtherFunding ? fundingSource : ''
      });
      purchases = purchases.map(function (entry) { return entry.id === movementId ? record : entry; });
      savePurchases();
      return true;
    }

    if (src === 'withdrawal') {
      const type = String(payload && payload.withdrawalType || '');
      if (!type) {
        alert('Preencha o tipo da saída.');
        return false;
      }
      const flowType = classifyFlowType(type, type, notes);
      const normalizedType = flowType === 'transfer' ? TRANSFER_TYPE : (flowType === 'investment' ? INVESTMENT_TYPE : type);
      const record = Object.assign({}, original, {
        withdrawalDate: date,
        date: date,
        type: normalizedType,
        flowType: flowType,
        amount: amount,
        notes: notes,
        isOtherFunding: isOtherFunding,
        fundingSource: isOtherFunding ? fundingSource : ''
      });
      withdrawals = withdrawals.map(function (entry) { return entry.id === movementId ? record : entry; });
      saveWithdrawals();
      return true;
    }

    if (src === 'distribution') {
      const partner = String(payload && payload.partner || '');
      if (!PARTNERS.includes(partner)) {
        alert('Selecione um sócio válido.');
        return false;
      }
      const record = Object.assign({}, original, {
        date: date,
        partner: partner,
        amount: amount,
        notes: notes,
        isOtherFunding: isOtherFunding,
        fundingSource: isOtherFunding ? fundingSource : '',
        cycleKey: resolveCycleKey(date) || original.cycleKey || getCurrentCycleKey()
      });
      partnerContributions = partnerContributions.map(function (entry) { return entry.id === movementId ? record : entry; });
      savePartnerContributions();
      selectedPartnerCycle = record.cycleKey;
      return true;
    }

    if (src === 'ads') {
      const platform = String(payload && payload.platform || '');
      const method = String(payload && payload.method || 'PIX Prepaid');
      if (!platform) {
        alert('Preencha a plataforma de Ads.');
        return false;
      }
      const record = Object.assign({}, original, {
        date: date,
        platform: platform,
        amount: amount,
        method: method,
        notes: notes,
        isOtherFunding: isOtherFunding,
        fundingSource: isOtherFunding ? fundingSource : ''
      });
      adsInvestments = adsInvestments.map(function (entry) { return entry.id === movementId ? record : entry; });
      saveAdsInvestments();
      syncPairedAdsWithdrawal(record, original);
      return true;
    }
    return false;
  }

  function buildUnifiedMovementRows() {
    const rows = [];
    purchases.forEach(function (item) {
      const details = [
        String(item.type || 'Compra'),
        String(item.item || '-'),
        'Qtd ' + Number(item.quantity || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      ];
      if (item.supplier) details.push('Fornecedor: ' + String(item.supplier));
      rows.push({
        source: 'purchase',
        id: item.id,
        date: toIsoDateFromAny(item.purchaseDate || item.date || item.createdAt),
        createdAt: String(item.createdAt || ''),
        typeLabel: 'Compra',
        details: details.join(' | '),
        amount: Number(item.total || 0),
        notes: String(item.notes || ''),
        funding: item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : 'Caixa operacional'
      });
    });
    withdrawals.forEach(function (item) {
      if (item.linkedSource === 'ads') return;
      rows.push({
        source: 'withdrawal',
        id: item.id,
        date: toIsoDateFromAny(item.withdrawalDate || item.date || item.createdAt),
        createdAt: String(item.createdAt || ''),
        typeLabel: 'Saída',
        details: String(item.type || 'Saída'),
        amount: Number(item.amount || 0),
        notes: String(item.notes || ''),
        funding: item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : 'Caixa operacional'
      });
    });
    partnerContributions.forEach(function (item) {
      rows.push({
        source: 'distribution',
        id: item.id,
        date: toIsoDateFromAny(item.date || item.createdAt),
        createdAt: String(item.createdAt || ''),
        typeLabel: 'Distribuição',
        details: String(item.partner || 'Sócio'),
        amount: Number(item.amount || 0),
        notes: String(item.notes || ''),
        funding: item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : 'Caixa operacional'
      });
    });
    adsInvestments.forEach(function (item) {
      rows.push({
        source: 'ads',
        id: item.id,
        date: toIsoDateFromAny(item.date || item.createdAt),
        createdAt: String(item.createdAt || ''),
        typeLabel: 'Investimento Ads',
        details: String(item.platform || 'Ads') + ' | ' + String(item.method || '-'),
        amount: Number(item.amount || 0),
        notes: String(item.notes || ''),
        funding: item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : 'Caixa operacional'
      });
    });
    return rows.sort(function (a, b) {
      if (a.date === b.date) return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function getFilteredUnifiedMovementRows() {
    const start = filterStartDateInput ? filterStartDateInput.value : '';
    const end = filterEndDateInput ? filterEndDateInput.value : '';
    return buildUnifiedMovementRows().filter(function (row) {
      const date = String(row.date || '').slice(0, 10);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }

  function renderUnifiedMovementsTable() {
    if (!movementsTableBody) return;
    const rows = getFilteredUnifiedMovementRows();
    if (!rows.length) {
      movementsTableBody.innerHTML = '<tr><td colspan="7">Sem movimentações no período.</td></tr>';
      return;
    }
    movementsTableBody.innerHTML = rows.map(function (row) {
      const notesText = normalizeOptionalFieldValue(row.notes);
      return '<tr>' +
        '<td>' + formatDateOnly(row.date) + '</td>' +
        '<td>' + escapeHtml(row.typeLabel) + '</td>' +
        '<td>' + escapeHtml(row.details) + '</td>' +
        '<td>' + toMoney(row.amount) + '</td>' +
        '<td>' + escapeHtml(row.funding) + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-movement-source="' + row.source + '" data-edit-movement-id="' + row.id + '">Editar</button><button type="button" data-delete-movement-source="' + row.source + '" data-delete-movement-id="' + row.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function getFilteredPersonalTransactions() {
    const start = personalFilterStartDateInput ? personalFilterStartDateInput.value : '';
    const end = personalFilterEndDateInput ? personalFilterEndDateInput.value : '';
    return personalTransactions.filter(function (item) {
      const date = String(item.date || item.createdAt || '').slice(0, 10);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    }).sort(function (a, b) {
      const da = String(a.date || a.createdAt || '');
      const db = String(b.date || b.createdAt || '');
      if (da === db) return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      return db.localeCompare(da);
    });
  }

  function getPersonalPeriodMode() {
    const start = personalFilterStartDateInput ? personalFilterStartDateInput.value : '';
    const end = personalFilterEndDateInput ? personalFilterEndDateInput.value : '';
    if (!start || !end) return 'month';
    const diffDays = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 45) return 'day';
    if (diffDays <= 180) return 'week';
    return 'month';
  }

  function getPersonalHealthScore(totalEntries, totalExits) {
    const entries = Number(totalEntries || 0);
    const exits = Number(totalExits || 0);
    if (entries <= 0 && exits <= 0) return 50;
    if (entries <= 0 && exits > 0) return 0;
    if (entries > 0 && exits <= 0) return 100;
    const rate = Math.max(-1, Math.min(1, (entries - exits) / entries));
    return Math.round(((rate + 1) / 2) * 100);
  }

  function resetPersonalFormMode() {
    editingPersonalId = '';
    if (personalSubmitBtn) personalSubmitBtn.textContent = 'Salvar Lançamento Pessoal';
    if (personalCancelEditBtn) personalCancelEditBtn.setAttribute('hidden', 'hidden');
  }

  function resetPersonalForm() {
    if (personalForm) personalForm.reset();
    resetPersonalFormMode();
    if (personalDateInput) personalDateInput.value = new Date().toISOString().slice(0, 10);
    if (personalUseBusinessFundsInput) personalUseBusinessFundsInput.checked = false;
    if (personalFundingSourceInput) personalFundingSourceInput.value = '';
  }

  function startPersonalEdit(personalId) {
    const record = personalTransactions.find(function (item) { return item.id === personalId; }) || null;
    if (!record) {
      alert('Lançamento pessoal não encontrado para edição.');
      return;
    }
    editingPersonalId = record.id;
    if (personalDateInput) personalDateInput.value = toIsoDateFromAny(record.date || record.createdAt);
    if (personalTypeInput) personalTypeInput.value = record.type || '';
    if (personalCategoryInput) personalCategoryInput.value = record.category || '';
    if (personalAmountInput) personalAmountInput.value = Number(record.amount || 0).toFixed(2);
    if (personalNotesInput) personalNotesInput.value = record.notes || '';
    if (personalUseBusinessFundsInput) personalUseBusinessFundsInput.checked = !!record.usesBusinessFunds;
    if (personalFundingSourceInput) personalFundingSourceInput.value = record.fundingSource || '';
    if (personalSubmitBtn) personalSubmitBtn.textContent = 'Atualizar Lançamento';
    if (personalCancelEditBtn) personalCancelEditBtn.removeAttribute('hidden');
    setActiveTab('personal');
    if (personalForm && typeof personalForm.scrollIntoView === 'function') {
      personalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderPersonalTemperatureStatus(score, balance) {
    if (!personalTemperatureLabel) return;
    if (score < PERSONAL_HEALTH_THRESHOLDS.red || balance < 0) {
      personalTemperatureLabel.className = 'traffic-light red';
      personalTemperatureLabel.textContent = 'Ponto de atenção: saídas acima do ritmo saudável. Prioridade é cortar excessos e proteger o saldo.';
      return;
    }
    if (score < PERSONAL_HEALTH_THRESHOLDS.yellow) {
      personalTemperatureLabel.className = 'traffic-light yellow';
      personalTemperatureLabel.textContent = 'Atenção moderada: há equilíbrio parcial, mas ainda com risco de aperto no fim do período.';
      return;
    }
    personalTemperatureLabel.className = 'traffic-light green';
    personalTemperatureLabel.textContent = 'Equilíbrio bom: temperatura financeira saudável para Adonias seguir reorganizando a vida financeira.';
  }

  function renderPersonalGauge(canvas, score, entries, exits, balance) {
    if (!canvas) return;
    const canvasCtx = getCanvasContext(canvas);
    if (!canvasCtx) return;
    const ctx = canvasCtx.ctx;
    const width = canvasCtx.width;
    const height = canvasCtx.height;
    clearCanvas(ctx, width, height);

    const cx = width / 2;
    const cy = height * 0.72;
    const radius = Math.min(width, height) * 0.35;
    const start = -Math.PI * 0.75;
    const end = Math.PI * 0.75;
    const totalRange = end - start;
    const angle = start + (totalRange * (Math.max(0, Math.min(100, score)) / 100));

    ctx.lineWidth = 18;
    ctx.lineCap = 'round';

    function drawSegment(fromP, toP, color) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.arc(cx, cy, radius, start + (totalRange * fromP), start + (totalRange * toP));
      ctx.stroke();
    }

    drawSegment(0, 0.4, '#dc2626');
    drawSegment(0.4, 0.65, '#f59e0b');
    drawSegment(0.65, 1, '#16a34a');

    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, radius + 12, start, end);
    ctx.stroke();

    const needleLen = radius * 0.88;
    const nx = cx + (Math.cos(angle) * needleLen);
    const ny = cy + (Math.sin(angle) * needleLen);
    ctx.beginPath();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = '#0f172a';
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = '700 13px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Temperatura Financeira', cx, 30);
    ctx.font = '700 22px Segoe UI';
    ctx.fillStyle = score >= PERSONAL_HEALTH_THRESHOLDS.yellow ? '#166534' : (score >= PERSONAL_HEALTH_THRESHOLDS.red ? '#9a3412' : '#991b1b');
    ctx.fillText(score.toFixed(0) + '%', cx, 58);

    ctx.font = '11px Segoe UI';
    ctx.fillStyle = '#475569';
    ctx.fillText('Entradas: ' + toMoney(entries) + ' | Saídas: ' + toMoney(exits), cx, height - 28);
    ctx.fillText('Saldo: ' + toMoney(balance), cx, height - 12);
  }

  function buildPersonalTimeline(list, mode) {
    const buckets = {};
    list.forEach(function (item) {
      const key = getPeriodKey(item.date || item.createdAt, mode);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { entry: 0, exit: 0 };
      if (item.type === 'entry') buckets[key].entry += Number(item.amount || 0);
      else buckets[key].exit += Number(item.amount || 0);
    });
    const keys = Object.keys(buckets).sort();
    let running = 0;
    const entries = keys.map(function (k) { return buckets[k].entry; });
    const exits = keys.map(function (k) { return buckets[k].exit; });
    const balance = keys.map(function (k) {
      running += buckets[k].entry - buckets[k].exit;
      return running;
    });
    return { labels: keys, entries: entries, exits: exits, balance: balance };
  }

  function buildPersonalExitCategories(list) {
    const grouped = {};
    list.forEach(function (item) {
      if (item.type !== 'exit') return;
      const key = String(item.category || 'Outros');
      grouped[key] = (grouped[key] || 0) + Number(item.amount || 0);
    });
    return Object.keys(grouped).map(function (name) {
      return { label: name, value: grouped[name] };
    }).sort(function (a, b) {
      return b.value - a.value;
    }).slice(0, 6);
  }

  function buildPersonalFundingSplits(list) {
    const exits = list.filter(function (item) { return item.type === 'exit'; });
    if (!exits.length) return { labels: [], values: [], business: 0, otherTotal: 0 };
    let business = 0;
    const other = {};
    exits.forEach(function (item) {
      if (item.usesBusinessFunds) {
        business += Number(item.amount || 0);
      } else {
        const key = item.fundingSource || 'Outra fonte';
        other[key] = (other[key] || 0) + Number(item.amount || 0);
      }
    });
    const labels = [];
    const values = [];
    if (business > 0) {
      labels.push('Pró-labore');
      values.push(business);
    }
    Object.keys(other).sort(function (a, b) { return other[b] - other[a]; }).forEach(function (k) {
      labels.push(k);
      values.push(other[k]);
    });
    const totalOther = values.reduce(function (acc, v, idx) {
      if (labels[idx] === 'Pró-labore') return acc;
      return acc + v;
    }, 0);
    return { labels: labels, values: values, business: business, otherTotal: totalOther };
  }

  function renderPersonalTable(list) {
    if (!personalTableBody) return;
    if (!list.length) {
      personalTableBody.innerHTML = '<tr><td colspan="7">Nenhum lançamento pessoal no período selecionado.</td></tr>';
      return;
    }
    personalTableBody.innerHTML = list.map(function (item) {
      const typeClass = item.type === 'entry' ? 'entry' : 'exit';
      const typeLabel = item.type === 'entry' ? 'Entrada' : 'Saída';
      const notesText = normalizeOptionalFieldValue(item.notes);
      const fundingText = item.usesBusinessFunds ? 'Usou saldo de Pró-labore' : (item.fundingSource ? ('Outra fonte: ' + String(item.fundingSource)) : '');
      const mobileDetails = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(notesText, 'Observação (opcional)', 'product-description-details'),
        renderOptionalFieldDetailsIfPresent(fundingText, 'Fonte (opcional)', 'product-description-details')
      ]);
      return '<tr>' +
        '<td>' + formatDateOnly(item.date || item.createdAt) + '</td>' +
        '<td><span class="personal-type ' + typeClass + '">' + typeLabel + '</span></td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(item.category || '-') + '</strong>' + mobileDetails + '</div></td>' +
        '<td>' + toMoney(item.amount) + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td>' + renderOptionalFieldDetails(fundingText, 'Ver fonte', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-personal="' + item.id + '">Editar</button><button type="button" data-delete-personal="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function refreshPersonalFinance() {
    const list = getFilteredPersonalTransactions();
    renderPersonalTable(list);

    const entries = list.filter(function (item) { return item.type === 'entry'; }).reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);
    const exits = list.filter(function (item) { return item.type !== 'entry'; }).reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);
    const balance = entries - exits;
    const score = getPersonalHealthScore(entries, exits);

    if (personalKpiEntries) personalKpiEntries.textContent = toMoney(entries);
    if (personalKpiExits) personalKpiExits.textContent = toMoney(exits);
    if (personalKpiBalance) personalKpiBalance.textContent = toMoney(balance);
    if (personalKpiHealth) personalKpiHealth.textContent = toPercent(score);
    if (personalKpiProLaboreAvailable) {
      const referenceDate = personalFilterEndDateInput && personalFilterEndDateInput.value
        ? personalFilterEndDateInput.value
        : new Date().toISOString().slice(0, 10);
      personalKpiProLaboreAvailable.textContent = toMoney(getProLaboreBalanceAsOf(referenceDate));
    }
    if (personalGaugeEntries) personalGaugeEntries.textContent = toMoney(entries);
    if (personalGaugeExits) personalGaugeExits.textContent = toMoney(exits);
    if (personalGaugeBalance) personalGaugeBalance.textContent = toMoney(balance);
    renderPersonalTemperatureStatus(score, balance);
    renderPersonalGauge(personalGaugeChart, score, entries, exits, balance);

    if (personalGaugeStatus && personalGaugeAdvice) {
      if (entries === 0 && exits === 0) {
        personalGaugeStatus.textContent = 'Estado: Aguardando dados';
        personalGaugeStatus.className = 'status-label';
        personalGaugeAdvice.textContent = 'Informe entradas e saídas para calcular a temperatura financeira.';
      } else if (score < 45) {
        personalGaugeStatus.textContent = 'Estado: Crítico';
        personalGaugeStatus.className = 'status-label critical';
        personalGaugeAdvice.textContent = 'Corte saídas imediatas e busque reforço de renda.';
      } else if (score < 70) {
        personalGaugeStatus.textContent = 'Estado: Atenção';
        personalGaugeStatus.className = 'status-label warning';
        personalGaugeAdvice.textContent = 'Reduza gastos não essenciais e monitore o saldo.';
      } else {
        personalGaugeStatus.textContent = 'Estado: Saudável';
        personalGaugeStatus.className = 'status-label ok';
        personalGaugeAdvice.textContent = 'Mantenha disciplina e reserve parte das entradas.';
      }
    }

    const timeline = buildPersonalTimeline(list, getPersonalPeriodMode());
    renderLineChartCanvas(personalTimelineChart, timeline.labels, [
      { label: 'Entradas', color: '#16a34a', values: timeline.entries },
      { label: 'Saídas', color: '#dc2626', values: timeline.exits },
      { label: 'Saldo Acumulado', color: '#2563eb', values: timeline.balance }
    ]);

    const byCategory = buildPersonalExitCategories(list);
    renderHorizontalBarChart(personalCategoryChart, byCategory, 'Sem saídas por categoria no período');

    const funding = buildPersonalFundingSplits(list);
    if (personalFundingChart) {
      if (!funding.labels.length) {
        drawEmptyCanvas(personalFundingChart, 'Sem saídas pessoais no período.');
      } else {
        renderHorizontalBarChart(personalFundingChart, funding.labels.map(function (label, idx) {
          return { label: label, value: funding.values[idx] };
        }), 'Sem saídas pessoais no período');
      }
    }
    if (personalFundingNote) {
      const total = funding.values.reduce(function (a, b) { return a + b; }, 0);
      const businessPct = total > 0 ? (funding.business / total) * 100 : 0;
      const otherPct = 100 - businessPct;
      personalFundingNote.textContent = 'Pró-labore: ' + toPercent(businessPct) + ' | Outras fontes: ' + toPercent(otherPct);
    }
  }

  function getPartnerTotal(partner, cycleKey) {
    return partnerContributions.reduce(function (acc, item) {
      if (cycleKey && item.cycleKey !== cycleKey) return acc;
      return item.partner === partner ? acc + item.amount : acc;
    }, 0);
  }

  function getAvailablePartnerCycles() {
    const keys = {};
    partnerContributions.forEach(function (item) {
      if (item.cycleKey) keys[item.cycleKey] = true;
    });
    sales.forEach(function (item) {
      keys[toCycleKeyFromIso(item.date || item.createdAt)] = true;
    });
    keys[getCurrentCycleKey()] = true;
    return Object.keys(keys).sort().reverse();
  }

  function renderCurrentCycleInfo() {
    if (!partnerCurrentCycleInfo) return;
    const current = getCurrentCycleKey();
    const daysLeft = getDaysUntilNextMonth();
    partnerCurrentCycleInfo.textContent = 'Ciclo atual: ' + formatCycleLabel(current) + ' (reinicia no dia 1). Faltam ' + daysLeft + ' dia(s) para o próximo ciclo.';
  }

  function renderPartnerCycleSelect() {
    if (!partnerCycleSelect) return;
    const cycles = getAvailablePartnerCycles();
    if (!selectedPartnerCycle || !cycles.includes(selectedPartnerCycle)) {
      selectedPartnerCycle = cycles[0] || getCurrentCycleKey();
    }
    partnerCycleSelect.innerHTML = cycles.map(function (cycle) {
      return '<option value="' + cycle + '">' + formatCycleLabel(cycle) + '</option>';
    }).join('');
    partnerCycleSelect.value = selectedPartnerCycle;
  }

  function renderPartnerGoals(cycleKey) {
    PARTNERS.forEach(function (partner) {
      const total = getPartnerTotal(partner, cycleKey);
      const partnerGoal = Number(partnerGoals[partner] || 0);
      const percent = partnerGoal > 0 ? (total / partnerGoal) * 100 : 0;
      const capped = Math.max(0, Math.min(percent, 100));

      const amountNode = document.getElementById('goal' + partner + 'Amount');
      const barNode = document.getElementById('goal' + partner + 'Bar');
      const messageNode = document.getElementById('goal' + partner + 'Message');
      if (!amountNode || !barNode || !messageNode) return;

      amountNode.textContent = toMoney(total) + ' / ' + toMoney(partnerGoal);
      barNode.style.width = capped.toFixed(2) + '%';

      if (partnerGoal === 0) {
        messageNode.textContent = 'Defina uma meta para acompanhar este sócio.';
        messageNode.classList.remove('done');
      } else if (total >= partnerGoal) {
        messageNode.textContent = 'Parabéns, ' + partner + '! Meta de renda batida.';
        messageNode.classList.add('done');
      } else {
        const remaining = partnerGoal - total;
        messageNode.textContent = 'Faltam ' + toMoney(remaining) + ' para a meta.';
        messageNode.classList.remove('done');
      }
    });
  }

  function resolveCycleKey(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const iso = raw.length === 10 ? raw + 'T00:00:00' : raw;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return toCycleKeyFromDate(date);
  }

  function getCycleFinancials(cycleKey) {
    const key = cycleKey || getCurrentCycleKey();
    const range = getCycleDateRange(key);
    const report = generateStrategicAllocationReport('custom', { start: range.start, end: range.end });
    const distributed = partnerContributions.reduce(function (acc, item) {
      if (item.isOtherFunding) return acc;
      const date = toIsoDateFromAny(item.date || item.createdAt);
      if (date < range.start || date > range.end) return acc;
      return acc + Number(item.amount || 0);
    }, 0);
    const operationalBeforeDistribution = roundMoney(
      Number(report.summary.allocations.operational || 0) - Number(report.summary.operationalExpenses || 0) + distributed
    );
    const balance = roundMoney(operationalBeforeDistribution - distributed);
    return {
      totalProfit: operationalBeforeDistribution,
      totalDistributed: roundMoney(distributed),
      balance: balance
    };
  }

  function validateCycleExpense(cycleKey, amount, expenseLabel, options) {
    const opts = options || {};
    if (opts.isOtherFunding) {
      // Other funding bypasses cash validation (tracked separately)
      return true;
    }
    if (opts.isOperationalExpense === false) {
      // Transfers/investments do not consume operational jar.
      return true;
    }
    const key = cycleKey || getCurrentCycleKey();
    const value = Number(amount || 0);
    const referenceDate = toIsoDateFromAny(opts.date || new Date().toISOString().slice(0, 10));
    const availableOperational = getOperationalBalanceAsOf(referenceDate);

    if (availableOperational <= 0) {
      alert('Saldo operacional indisponível em ' + formatDateOnly(referenceDate) + ' (' + toMoney(availableOperational) + '). Não é possível lançar ' + expenseLabel + '.');
      return false;
    }
    if (value > availableOperational) {
      alert(
        'Valor da ' + expenseLabel + ' acima do saldo operacional disponível (' + formatCycleLabel(key) + '). ' +
        'Saldo em ' + formatDateOnly(referenceDate) + ': ' + toMoney(availableOperational) + '.'
      );
      return false;
    }

    if (opts.expenseKind === 'distribution') {
      const safety = getDistributionSafetySnapshot(referenceDate);
      if (value > safety.distributable) {
        alert(
          'Distribuição acima do limite seguro em ' + formatDateOnly(referenceDate) + '. ' +
          'Distribuível: ' + toMoney(safety.distributable) +
          ' | Piso obrigatório: ' + toMoney(safety.requiredFloor) +
          ' (Reserva ' + toMoney(safety.emergencyTarget) +
          ' + Recompra 30d ' + toMoney(safety.repurchaseNeed30Days) + ').'
        );
        return false;
      }
    }

    return true;
  }

  function validateProLaboreExpense(dateIso, amount, expenseLabel) {
    const referenceDate = toIsoDateFromAny(dateIso || new Date().toISOString().slice(0, 10));
    const value = Number(amount || 0);
    const availableProLabore = getProLaboreBalanceAsOf(referenceDate);
    if (availableProLabore <= 0) {
      alert('Saldo de Pró-labore indisponível em ' + formatDateOnly(referenceDate) + ' (' + toMoney(availableProLabore) + '). Não é possível lançar ' + expenseLabel + '.');
      return false;
    }
    if (value > availableProLabore) {
      alert(
        'Valor da ' + expenseLabel + ' acima do saldo de Pró-labore disponível. ' +
        'Saldo em ' + formatDateOnly(referenceDate) + ': ' + toMoney(availableProLabore) + '.'
      );
      return false;
    }
    return true;
  }

  function renderPartnerSummary(cycleKey) {
    const financials = getCycleFinancials(cycleKey);

    partnerKpiProfit.textContent = toMoney(financials.totalProfit);
    partnerKpiDistributed.textContent = toMoney(financials.totalDistributed);
    partnerKpiBalance.textContent = toMoney(financials.balance);
  }

  function renderPartnerMotivation() {
    if (!partnerMotivationMessage || !partnerForm) return;
    const submitButton = partnerForm.querySelector('button[type="submit"]');
    const referenceDate = new Date().toISOString().slice(0, 10);
    const safety = getDistributionSafetySnapshot(referenceDate);

    if (safety.distributable <= 0) {
      partnerMotivationMessage.textContent =
        'Distribuição bloqueada: preserve o piso de segurança. ' +
        'Piso atual = Reserva ' + toMoney(safety.emergencyTarget) +
        ' + Recompra 30d ' + toMoney(safety.repurchaseNeed30Days) + '.';
      partnerMotivationMessage.classList.add('warn');
      partnerMotivationMessage.classList.remove('ok');
      if (submitButton) submitButton.disabled = true;
      return;
    }

    partnerMotivationMessage.textContent =
      'Saldo distribuível com segurança: ' + toMoney(safety.distributable) + '. ' +
      'Piso preservado: ' + toMoney(safety.requiredFloor) + '.';
    partnerMotivationMessage.classList.add('ok');
    partnerMotivationMessage.classList.remove('warn');
    if (submitButton) submitButton.disabled = false;
  }

  function renderPartnerTable(cycleKey) {
    const list = partnerContributions.filter(function (item) { return item.cycleKey === cycleKey; });
    if (!list.length) {
      partnersTableBody.innerHTML = '<tr><td colspan="6">Nenhuma contribuição lançada neste ciclo.</td></tr>';
      return;
    }

    partnersTableBody.innerHTML = list.map(function (item) {
      const notesText = normalizeOptionalFieldValue(item.notes);
      const fundingText = item.isOtherFunding ? ('Outra fonte: ' + String(item.fundingSource || '-')) : '';
      const mobileDetails = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(notesText, 'Observação (opcional)', 'product-description-details'),
        renderOptionalFieldDetailsIfPresent(fundingText, 'Fonte (opcional)', 'product-description-details')
      ]);
      return '<tr>' +
        '<td>' + formatDateTime(item.createdAt) + '</td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(item.partner) + '</strong>' + mobileDetails + '</div></td>' +
        '<td>' + toMoney(item.amount) + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td>' + renderOptionalFieldDetails(fundingText, 'Ver fonte', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-partner-contribution="' + item.id + '">Editar</button><button type="button" data-delete-partner-contribution="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function refreshPartners() {
    renderCurrentCycleInfo();
    renderPartnerCycleSelect();
    renderPartnerGoals(selectedPartnerCycle);
    renderPartnerSummary(selectedPartnerCycle);
    renderPartnerTable(selectedPartnerCycle);
    renderPartnerMotivation();
  }

  function renderAdsInvestmentsTable() {
    if (!adsInvestmentsTableBody) return;
    const list = getFilteredAdsInvestments().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    if (!list.length) {
      adsInvestmentsTableBody.innerHTML = '<tr><td colspan="6">Nenhum investimento registrado no período.</td></tr>';
      return;
    }
    adsInvestmentsTableBody.innerHTML = list.map(function (item) {
      const notesText = normalizeOptionalFieldValue(item.notes);
      const mobileDetails = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(notesText, 'Observação (opcional)', 'product-description-details')
      ]);
      return '<tr>' +
        '<td>' + formatDateOnly(item.date) + '</td>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(item.platform || item.type) + '</strong>' + mobileDetails + '</div></td>' +
        '<td>' + toMoney(item.amount) + '</td>' +
        '<td>' + escapeHtml(item.method || '-') + '</td>' +
        '<td>' + renderOptionalFieldDetails(notesText, 'Ver observação', '-', 'catalog-description-details') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-ads="' + item.id + '">Editar</button><button type="button" data-delete-ads="' + item.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function refreshCash() {
    strategicLedgerCache = null;
    strategicReportCache = null;
    syncDashboardFiltersFromCash();
    const filteredSales = getFilteredSales();
    const filteredSalesByDateRange = getFilteredSalesByDate();
    const filteredPurchases = getFilteredPurchases();
    const filteredWithdrawals = getFilteredWithdrawals();
    const filteredDistributions = getFilteredPartnerContributions();
    const byChannel = summarizeSalesByChannel(filteredSales);
    const totalRevenue = filteredSales.reduce(function (acc, item) {
      return acc + Number(item.revenue || 0);
    }, 0);
    const filteredInvestments = getFilteredAdsInvestments();
    renderSalesTable(filteredSales);
    const cashSummary = renderKpis(filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions);
    renderCashTrafficLight(cashSummary);
    renderManagementDiagnosis(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, filteredInvestments);
    renderDailyChecklist(cashSummary, filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions);
    renderUnifiedMovementsTable();
    renderSalesByChannelTable(byChannel, totalRevenue);
    renderSalesChannelPie(byChannel, totalRevenue);
    renderAdsInvestmentsTable();
    renderFacebookAdsRoiPanel(Array.isArray(filteredSalesByDateRange) ? filteredSalesByDateRange : filteredSales, filteredInvestments);
    renderDashboard(filteredSales, filteredPurchases, filteredWithdrawals, filteredDistributions, filteredSalesByDateRange);
    refreshStrategicCaches();
  }

  function refreshAll() {
    ensureProductEditModeIsValid();
    renderProductsTable();
    renderProductSelect();
    renderPurchasesTable();
    renderWithdrawalsTable();
    syncDashboardFiltersFromCash();
    refreshCash();
    refreshPartners();
    refreshPersonalFinance();
  }

  function bindSupabasePanel() {
    if (supabaseConnectBtn) {
      supabaseConnectBtn.addEventListener('click', async function () {
        const connected = await connectSupabase(false);
        if (!connected) return;
        refreshAll();
      });
    }

    if (authLoginBtn) {
      authLoginBtn.addEventListener('click', async function () {
        if (!isSupabaseReady()) {
          const connected = await connectSupabase(false);
          if (!connected) return;
        }
        await loginWithEmailPassword();
      });
    }

    if (authRegisterBtn) {
      authRegisterBtn.addEventListener('click', async function () {
        if (!isSupabaseReady()) {
          const connected = await connectSupabase(false);
          if (!connected) return;
        }
        await registerWithEmailPassword();
      });
    }

    if (authLogoutBtn) {
      authLogoutBtn.addEventListener('click', async function () {
        if (!isSupabaseReady()) {
          setAuthStatus('Não autenticado.', 'neutral');
          return;
        }
        await logoutAuthUser();
      });
    }

    if (authEmailInput) {
      authEmailInput.addEventListener('change', function () {
        persistSupabaseSettings({ authEmail: authEmailInput.value.trim() });
      });
    }

    if (supabaseCheckSchemaBtn) {
      supabaseCheckSchemaBtn.addEventListener('click', async function () {
        if (!isSupabaseReady()) {
          alert('Conecte no Supabase primeiro para validar tabelas.');
          return;
        }
        if (!isAuthenticated()) {
          alert('Faça login antes de validar as tabelas.');
          return;
        }
        const schema = await checkSupabaseSchema();
        supabaseSyncedTables = SUPABASE_REQUIRED_TABLES.filter(function (tableName) {
          return schema.missing.indexOf(tableName) < 0 && schema.blocked.indexOf(tableName) < 0;
        });
        startSupabaseLiveSync();
        if (!schema.missing.length && !schema.blocked.length) {
          setSupabaseStatus('Base validada. Todas as tabelas estão prontas.', 'ok');
          return;
        }
        setSupabaseStatus('Há pendências de tabelas/acesso no Supabase.', 'warn');
      });
    }

    if (supabaseDisconnectBtn) {
      supabaseDisconnectBtn.addEventListener('click', async function () {
        disconnectSupabase();
        await loadData();
        refreshAll();
      });
    }

    if (supabaseAdminModeInput) {
      supabaseAdminModeInput.addEventListener('change', async function () {
        if (!supabaseAdminModeInput.checked) {
          disableAdminMode(true);
          return;
        }
        await tryEnableAdminMode();
      });
    }
  }

  productForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = productNameInput.value.trim();
    const costPrice = Number(productCostInput.value);
    const suggestedPrice = Number(productSuggestedInput.value || 0);
    const category = productCategoryInput.value.trim();
    const description = productDescriptionInput ? normalizeProductDescription(productDescriptionInput.value) : '';

    if (!name || costPrice < 0 || suggestedPrice < 0) {
      alert('Preencha os dados do produto corretamente.');
      return;
    }

    const editingProduct = editingProductId ? findProductById(editingProductId) : null;
    if (editingProductId && !editingProduct) {
      alert('O produto em edição não foi encontrado. Tente novamente.');
      resetProductForm();
      return;
    }

    const record = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: name,
      costPrice: costPrice,
      suggestedPrice: suggestedPrice,
      category: category,
      description: description,
      createdAt: editingProduct && editingProduct.createdAt ? editingProduct.createdAt : new Date().toISOString()
    };

    if (!(await pushRecordToSupabase('products', record))) return;
    if (editingProduct) {
      products = products.map(function (item) {
        return item.id === record.id ? record : item;
      });
    } else {
      products.unshift(record);
    }

    saveProducts();
    resetProductForm();
    refreshAll();
  });

  if (productCancelEditBtn) {
    productCancelEditBtn.addEventListener('click', function () {
      resetProductForm();
    });
  }

  saleProductSelect.addEventListener('change', updateSaleProductPreview);

  if (saleCancelEditBtn) {
    saleCancelEditBtn.addEventListener('click', function () {
      resetSaleForm();
    });
  }

  saleForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const selectedProduct = getSelectedProduct();
    if (!selectedProduct) {
      alert('Selecione um produto para lançar a venda.');
      return;
    }

    const quantity = Number(saleQuantityInput.value);
    const salePrice = Number(salePriceInput.value);
    const expense = Number(saleExpenseInput.value || 0);
    const notes = saleNotesInput.value.trim();
    const saleChannel = normalizeSaleChannel(saleChannelInput.value);
    const saleDateValue = saleDateInput ? saleDateInput.value : '';

    if (!saleChannelInput.value || !saleDateValue || quantity <= 0 || salePrice < 0 || expense < 0) {
      alert('Preencha os dados da venda corretamente.');
      return;
    }
    if (!isValidIsoDate(saleDateValue)) {
      alert('Data da venda inválida. Use o formato YYYY-MM-DD.');
      return;
    }

    const costPrice = Number(selectedProduct.costPrice);
    const calc = computeSale(costPrice, salePrice, quantity, expense);
    const createdAt = new Date().toISOString();
    const saleDate = toIsoDateFromAny(saleDateValue);

    const record = {
      id: editingSaleId || generateUuid(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productDescription: normalizeProductDescription(selectedProduct.description),
      date: saleDate,
      quantity: quantity,
      costPrice: costPrice,
      salePrice: salePrice,
      expense: expense,
      notes: notes,
      saleChannel: saleChannel,
      totalCost: calc.totalCost,
      revenue: calc.revenue,
      margin: calc.margin,
      netProfit: calc.netProfit,
      createdAt: editingSaleId
        ? ((sales.find(function (item) { return item.id === editingSaleId; }) || {}).createdAt || createdAt)
        : createdAt
    };

    if (!(await pushRecordToSupabase('sales', record))) return;
    if (editingSaleId) {
      sales = sales.map(function (item) { return item.id === editingSaleId ? record : item; });
    } else {
      sales.unshift(record);
    }

    saveSales();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de venda');
    resetSaleForm();
    refreshCash();
    setActiveTab('cash');
  });

  productsTableBody.addEventListener('click', async function (event) {
    const editBtn = event.target.closest('[data-edit-product]');
    if (editBtn) {
      const editId = editBtn.getAttribute('data-edit-product');
      startProductEdit(editId);
      return;
    }

    const deleteBtn = event.target.closest('[data-delete-product]');
    if (!deleteBtn) return;

    const id = deleteBtn.getAttribute('data-delete-product');

    const productHasSale = sales.some(function (item) { return item.productId === id; });
    if (productHasSale) {
      alert('Este produto já possui vendas. Exclua as vendas primeiro.');
      return;
    }

    if (!(await removeRecordsFromSupabase('products', [id], true))) return;
    products = products.filter(function (item) { return item.id !== id; });
    saveProducts();
    if (editingProductId === id) resetProductForm();
    refreshAll();
  });

  salesTableBody.addEventListener('click', async function (event) {
    const editBtn = event.target.closest('[data-edit-sale]');
    if (editBtn) {
      startSaleEdit(editBtn.getAttribute('data-edit-sale'));
      return;
    }
    const btn = event.target.closest('[data-delete-sale]');
    if (!btn) return;

    const id = btn.getAttribute('data-delete-sale');
    if (!(await removeRecordsFromSupabase('sales', [id], true))) return;
    sales = sales.filter(function (item) { return item.id !== id; });
    saveSales();
    if (editingSaleId === id) resetSaleForm();
    refreshCash();
  });

  clearSalesBtn.addEventListener('click', async function () {
    if (!confirm('Deseja apagar todas as vendas?')) return;
    const ids = sales.map(function (item) { return item.id; });
    if (!(await removeRecordsFromSupabase('sales', ids, true))) return;
    sales = [];
    saveSales();
    refreshCash();
    refreshPartners();
  });

  applyFiltersBtn.addEventListener('click', refreshCash);
  if (filterSaleChannelInput) {
    filterSaleChannelInput.addEventListener('change', refreshCash);
  }

  clearFiltersBtn.addEventListener('click', function () {
    filterStartDateInput.value = '';
    filterEndDateInput.value = '';
    if (filterSaleChannelInput) filterSaleChannelInput.value = '';
    syncDashboardFiltersFromCash();
    refreshCash();
  });

  if (dashboardApplyFiltersBtn) {
    dashboardApplyFiltersBtn.addEventListener('click', function () {
      applyDashboardFiltersToCash();
      refreshCash();
    });
  }

  if (dashboardClearFiltersBtn) {
    dashboardClearFiltersBtn.addEventListener('click', function () {
      if (dashboardFilterStartDateInput) dashboardFilterStartDateInput.value = '';
      if (dashboardFilterEndDateInput) dashboardFilterEndDateInput.value = '';
      if (dashboardFilterSaleChannelInput) dashboardFilterSaleChannelInput.value = '';
      applyDashboardFiltersToCash();
      refreshCash();
    });
  }

  exportCsvBtn.addEventListener('click', function () {
    const list = getFilteredSales();
    if (!list.length) {
      alert('Não há vendas para exportar no período selecionado.');
      return;
    }

    const header = ['Data da Venda', 'Registrado em', 'Produto', 'Descricao do Produto', 'Canal', 'Quantidade', 'Custo Unitario', 'Preco Unitario', 'Receita', 'Despesa', 'Margem %', 'Lucro Liquido'];
    const rows = list.map(function (item) {
      return [
        formatDateOnly(item.date || item.createdAt),
        formatDateTime(item.createdAt || ((item.date || '') + 'T00:00:00')),
        resolveSaleProductName(item),
        resolveSaleDescription(item),
        normalizeSaleChannel(item.saleChannel),
        item.quantity,
        item.costPrice.toFixed(2),
        item.salePrice.toFixed(2),
        item.revenue.toFixed(2),
        item.expense.toFixed(2),
        item.margin.toFixed(2),
        item.netProfit.toFixed(2)
      ];
    });

    const csv = [header].concat(rows).map(function (line) {
      return line.map(function (value) {
        const text = String(value).replace(/"/g, '""');
        return '"' + text + '"';
      }).join(';');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caixa-zadoni.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  printBtn.addEventListener('click', function () {
    printScreen('cash');
  });

  if (printProductsReportBtn) {
    printProductsReportBtn.addEventListener('click', function () {
      printScreen('products');
    });
  }

  if (printPurchasesReportBtn) {
    printPurchasesReportBtn.addEventListener('click', function () {
      printScreen('purchases');
    });
  }

  if (printPartnersReportBtn) {
    printPartnersReportBtn.addEventListener('click', function () {
      printScreen('partners');
    });
  }

  if (printDashboardReportBtn) {
    printDashboardReportBtn.addEventListener('click', function () {
      printScreen('dashboard');
    });
  }

  async function addUnifiedPurchaseMovement(payload) {
    const purchaseDate = String(payload && payload.date || '');
    const type = String(payload && payload.purchaseType || '');
    const item = String(payload && payload.item || '').trim();
    const quantity = Number(payload && payload.quantity || 0);
    const total = Number(payload && payload.amount || 0);
    const supplier = String(payload && payload.supplier || '').trim();
    const notes = String(payload && payload.notes || '').trim();
    const isOtherFunding = !!(payload && payload.isOtherFunding);
    const fundingSource = String(payload && payload.fundingSource || '').trim();
    const isInventoryPurchase = isInventoryPurchaseType(type);

    if (!purchaseDate || !type || !item || quantity <= 0 || total <= 0) {
      alert('Preencha os dados da compra corretamente.');
      return false;
    }
    if (!isValidIsoDate(purchaseDate)) {
      alert('Data da compra inválida. Use o formato YYYY-MM-DD.');
      return false;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return false;
    }

    const cycleKey = resolveCycleKey(purchaseDate);
    if (!validateCycleExpense(cycleKey, total, 'compra', { isOtherFunding: isOtherFunding, date: purchaseDate, isOperationalExpense: true })) return false;
    const createdAt = new Date().toISOString();
    const record = {
      id: generateUuid(),
      purchaseDate: purchaseDate,
      date: purchaseDate,
      type: type,
      item: item,
      quantity: quantity,
      total: total,
      supplier: supplier,
      notes: notes,
      isInventoryPurchase: isInventoryPurchase,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt
    };
    if (!(await pushRecordToSupabase('purchases', record))) return false;
    purchases.unshift(record);
    savePurchases();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de compra');
    renderPurchasesTable();
    return true;
  }

  async function addUnifiedWithdrawalMovement(payload) {
    const withdrawalDate = String(payload && payload.date || '');
    const type = String(payload && payload.withdrawalType || '');
    const amount = Number(payload && payload.amount || 0);
    const notes = String(payload && payload.notes || '').trim();
    const isOtherFunding = !!(payload && payload.isOtherFunding);
    const fundingSource = String(payload && payload.fundingSource || '').trim();

    if (!withdrawalDate || !type || amount <= 0) {
      alert('Preencha os dados da saída corretamente.');
      return false;
    }
    if (!isValidIsoDate(withdrawalDate)) {
      alert('Data da saída inválida. Use o formato YYYY-MM-DD.');
      return false;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return false;
    }

    const flowType = classifyFlowType(type, type, notes);
    const isOperationalExpense = flowType === 'expense';
    const normalizedType = flowType === 'transfer' ? TRANSFER_TYPE : (flowType === 'investment' ? INVESTMENT_TYPE : type);
    const cycleKey = resolveCycleKey(withdrawalDate);
    if (!validateCycleExpense(cycleKey, amount, 'saída', {
      isOtherFunding: isOtherFunding,
      isOperationalExpense: isOperationalExpense,
      date: withdrawalDate
    })) return false;
    const createdAt = new Date().toISOString();
    const record = {
      id: generateUuid(),
      withdrawalDate: withdrawalDate,
      date: withdrawalDate,
      type: normalizedType,
      flowType: flowType,
      amount: amount,
      notes: notes,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt
    };
    if (!(await pushRecordToSupabase('withdrawals', record))) return false;
    withdrawals.unshift(record);
    saveWithdrawals();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de saída');
    renderWithdrawalsTable();
    return true;
  }

  async function addUnifiedDistributionMovement(payload) {
    const date = String(payload && payload.date || '');
    const partner = String(payload && payload.partner || '');
    const amount = Number(payload && payload.amount || 0);
    const notes = String(payload && payload.notes || '').trim();
    const isOtherFunding = !!(payload && payload.isOtherFunding);
    const fundingSource = String(payload && payload.fundingSource || '').trim();

    if (!PARTNERS.includes(partner) || amount <= 0) {
      alert('Selecione um sócio e informe um valor válido.');
      return false;
    }
    if (!date || !isValidIsoDate(date)) {
      alert('Data da distribuição inválida. Use o formato YYYY-MM-DD.');
      return false;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return false;
    }

    const cycleKey = resolveCycleKey(date);
    if (!validateCycleExpense(cycleKey, amount, 'contribuição', {
      isOtherFunding: isOtherFunding,
      isOperationalExpense: true,
      expenseKind: 'distribution',
      date: date
    })) return false;
    const createdAt = new Date().toISOString();
    const record = {
      id: generateUuid(),
      date: date,
      partner: partner,
      amount: amount,
      notes: notes,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt,
      cycleKey: cycleKey || getCurrentCycleKey()
    };
    if (!(await pushRecordToSupabase('partnerContributions', record))) return false;
    partnerContributions.unshift(record);
    savePartnerContributions();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de contribuição');
    selectedPartnerCycle = record.cycleKey;
    return true;
  }

  async function addUnifiedAdsMovement(payload) {
    const date = String(payload && payload.date || '');
    const platform = String(payload && payload.platform || '');
    const amount = Number(payload && payload.amount || 0);
    const method = String(payload && payload.method || 'PIX Prepaid');
    const notes = String(payload && payload.notes || '').trim();
    const isOtherFunding = !!(payload && payload.isOtherFunding);
    const fundingSource = String(payload && payload.fundingSource || '').trim();

    if (!date || !platform || amount <= 0) {
      alert('Preencha os dados do investimento corretamente.');
      return false;
    }
    if (!isValidIsoDate(date)) {
      alert('Data do investimento inválida. Use o formato YYYY-MM-DD.');
      return false;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return false;
    }
    if (!isOtherFunding) {
      const cycleKey = resolveCycleKey(date);
      if (!validateCycleExpense(cycleKey, amount, 'investimento em ads', {
        isOperationalExpense: true,
        date: date
      })) return false;
    }

    const createdAt = new Date().toISOString();
    const record = {
      id: generateUuid(),
      date: date,
      platform: platform,
      amount: amount,
      method: method,
      notes: notes,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt
    };
    if (!(await pushRecordToSupabase('adsInvestments', record))) return false;
    adsInvestments.unshift(record);
    saveAdsInvestments();

    if (!isOtherFunding) {
      const withdrawalRecord = {
        id: generateUuid(),
        linkedSource: 'ads',
        linkedTransactionId: record.id,
        withdrawalDate: date,
        date: date,
        type: 'Ads Investment',
        flowType: 'expense',
        amount: amount,
        notes: (notes ? notes + ' - ' : '') + 'Ads via ' + platform + ' (' + method + ')',
        createdAt: record.createdAt
      };
      if (await pushRecordToSupabase('withdrawals', withdrawalRecord)) {
        withdrawals.unshift(withdrawalRecord);
        saveWithdrawals();
      }
    }
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de investimento em Ads');
    return true;
  }

  async function deleteUnifiedMovement(source, id) {
    const src = String(source || '');
    const movementId = String(id || '');
    if (!src || !movementId) return false;
    if (src === 'purchase') {
      if (!(await removeRecordsFromSupabase('purchases', [movementId], true))) return false;
      purchases = purchases.filter(function (item) { return item.id !== movementId; });
      savePurchases();
      renderPurchasesTable();
      return true;
    }
    if (src === 'withdrawal') {
      if (!(await removeRecordsFromSupabase('withdrawals', [movementId], true))) return false;
      withdrawals = withdrawals.filter(function (item) { return item.id !== movementId; });
      saveWithdrawals();
      renderWithdrawalsTable();
      return true;
    }
    if (src === 'distribution') {
      if (!(await removeRecordsFromSupabase('partnerContributions', [movementId], true))) return false;
      partnerContributions = partnerContributions.filter(function (item) { return item.id !== movementId; });
      savePartnerContributions();
      return true;
    }
    if (src === 'ads') {
      if (!(await removeRecordsFromSupabase('adsInvestments', [movementId], true))) return false;
      adsInvestments = adsInvestments.filter(function (item) { return item.id !== movementId; });
      saveAdsInvestments();
      const paired = withdrawals.find(function (w) {
        return (w.linkedSource === 'ads' && w.linkedTransactionId === movementId) || w.id === ('ads-' + movementId);
      });
      if (paired) {
        if (!(await removeRecordsFromSupabase('withdrawals', [paired.id], true))) return false;
        withdrawals = withdrawals.filter(function (w) { return w.id !== paired.id; });
        saveWithdrawals();
      }
      return true;
    }
    return false;
  }

  if (movementKindInput) {
    movementKindInput.addEventListener('change', function () {
      updateUnifiedMovementFormByKind();
    });
  }

  if (movementOtherFundingInput) {
    movementOtherFundingInput.addEventListener('change', function () {
      updateUnifiedMovementFormByKind();
    });
  }

  if (movementCancelEditBtn) {
    movementCancelEditBtn.addEventListener('click', function () {
      resetUnifiedMovementForm();
    });
  }

  if (movementForm) {
    movementForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const kind = editingMovementSource || (movementKindInput ? String(movementKindInput.value || '') : '');
      const date = movementDateInput ? movementDateInput.value : '';
      const amount = Number(movementAmountInput ? movementAmountInput.value : 0);
      const notes = movementNotesInput ? movementNotesInput.value.trim() : '';
      const isOtherFunding = movementOtherFundingInput ? movementOtherFundingInput.checked : false;
      const fundingSource = movementFundingSourceInput ? movementFundingSourceInput.value.trim() : '';
      if (!kind) {
        alert('Selecione o tipo de movimentação.');
        return;
      }
      let ok = false;
      const payload = {
        date: date,
        amount: amount,
        notes: notes,
        isOtherFunding: isOtherFunding,
        fundingSource: fundingSource,
        purchaseType: movementPurchaseTypeInput ? movementPurchaseTypeInput.value : '',
        item: movementItemInput ? movementItemInput.value : '',
        quantity: Number(movementQuantityInput ? movementQuantityInput.value : 0),
        supplier: movementSupplierInput ? movementSupplierInput.value : '',
        withdrawalType: movementWithdrawalTypeInput ? movementWithdrawalTypeInput.value : '',
        partner: movementPartnerInput ? movementPartnerInput.value : '',
        platform: movementAdsPlatformInput ? movementAdsPlatformInput.value : '',
        method: movementAdsMethodInput ? movementAdsMethodInput.value : 'PIX Prepaid'
      };

      if (editingMovementSource && editingMovementId) {
        ok = await updateUnifiedMovement(editingMovementSource, editingMovementId, payload);
      } else if (kind === 'purchase') {
        ok = await addUnifiedPurchaseMovement({
          date: date,
          purchaseType: movementPurchaseTypeInput ? movementPurchaseTypeInput.value : '',
          item: movementItemInput ? movementItemInput.value : '',
          quantity: Number(movementQuantityInput ? movementQuantityInput.value : 0),
          amount: amount,
          supplier: movementSupplierInput ? movementSupplierInput.value : '',
          notes: notes,
          isOtherFunding: isOtherFunding,
          fundingSource: fundingSource
        });
      } else if (kind === 'withdrawal') {
        ok = await addUnifiedWithdrawalMovement({
          date: date,
          withdrawalType: movementWithdrawalTypeInput ? movementWithdrawalTypeInput.value : '',
          amount: amount,
          notes: notes,
          isOtherFunding: isOtherFunding,
          fundingSource: fundingSource
        });
      } else if (kind === 'distribution') {
        ok = await addUnifiedDistributionMovement({
          date: date,
          partner: movementPartnerInput ? movementPartnerInput.value : '',
          amount: amount,
          notes: notes,
          isOtherFunding: isOtherFunding,
          fundingSource: fundingSource
        });
      } else if (kind === 'ads') {
        ok = await addUnifiedAdsMovement({
          date: date,
          platform: movementAdsPlatformInput ? movementAdsPlatformInput.value : '',
          method: movementAdsMethodInput ? movementAdsMethodInput.value : 'PIX Prepaid',
          amount: amount,
          notes: notes,
          isOtherFunding: isOtherFunding,
          fundingSource: fundingSource
        });
      }
      if (!ok) return;
      refreshCash();
      refreshPartners();
      resetUnifiedMovementForm();
      setActiveTab('cash');
    });
  }

  if (movementsTableBody) {
    movementsTableBody.addEventListener('click', async function (event) {
      const editBtn = event.target.closest('[data-edit-movement-source]');
      if (editBtn) {
        startUnifiedMovementEdit(
          editBtn.getAttribute('data-edit-movement-source'),
          editBtn.getAttribute('data-edit-movement-id')
        );
        return;
      }
      const btn = event.target.closest('[data-delete-movement-source]');
      if (!btn) return;
      const source = btn.getAttribute('data-delete-movement-source');
      const id = btn.getAttribute('data-delete-movement-id');
      if (!(await deleteUnifiedMovement(source, id))) return;
      if (editingMovementSource === source && editingMovementId === id) resetUnifiedMovementForm();
      refreshCash();
      if (source === 'distribution') refreshPartners();
    });
  }

  purchaseForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const purchaseDate = purchaseDateInput.value;
    const type = purchaseTypeInput.value;
    const item = purchaseItemInput.value.trim();
    const quantity = Number(purchaseQuantityInput.value);
    const total = Number(purchaseTotalInput.value);
    const supplier = purchaseSupplierInput.value.trim();
    const notes = purchaseNotesInput.value.trim();
    const isOtherFunding = purchaseOtherFundingInput ? purchaseOtherFundingInput.checked : false;
    const fundingSource = purchaseFundingSourceInput ? purchaseFundingSourceInput.value.trim() : '';
    const isInventoryPurchase = isInventoryPurchaseType(type);

    if (!purchaseDate || !type || !item || quantity <= 0 || total <= 0) {
      alert('Preencha os dados da compra corretamente.');
      return;
    }
    if (!isValidIsoDate(purchaseDate)) {
      alert('Data da compra inválida. Use o formato YYYY-MM-DD.');
      return;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return;
    }

    const cycleKey = resolveCycleKey(purchaseDate);
    if (!validateCycleExpense(cycleKey, total, 'compra', { isOtherFunding: isOtherFunding, date: purchaseDate, isOperationalExpense: true })) return;
    const createdAt = new Date().toISOString();

    const record = {
      id: generateUuid(),
      purchaseDate: purchaseDate,
      date: purchaseDate,
      type: type,
      item: item,
      quantity: quantity,
      total: total,
      supplier: supplier,
      notes: notes,
      isInventoryPurchase: isInventoryPurchase,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt
    };

    if (!(await pushRecordToSupabase('purchases', record))) return;
    purchases.unshift(record);

    savePurchases();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de compra');
    renderPurchasesTable();
    refreshCash();
    purchaseForm.reset();
    purchaseQuantityInput.value = '1';
    purchaseDateInput.value = new Date().toISOString().slice(0, 10);
    setActiveTab('cash');
  });

  purchasesTableBody.addEventListener('click', async function (event) {
    const editBtn = event.target.closest('[data-edit-purchase]');
    if (editBtn) {
      startUnifiedMovementEdit('purchase', editBtn.getAttribute('data-edit-purchase'));
      return;
    }
    const btn = event.target.closest('[data-delete-purchase]');
    if (!btn) return;

    const id = btn.getAttribute('data-delete-purchase');
    if (!(await removeRecordsFromSupabase('purchases', [id], true))) return;
    purchases = purchases.filter(function (item) { return item.id !== id; });
    savePurchases();
    renderPurchasesTable();
    refreshCash();
  });

  clearPurchasesBtn.addEventListener('click', async function () {
    if (!confirm('Deseja apagar todas as compras?')) return;
    const ids = purchases.map(function (item) { return item.id; });
    if (!(await removeRecordsFromSupabase('purchases', ids, true))) return;
    purchases = [];
    savePurchases();
    renderPurchasesTable();
    refreshCash();
  });

  withdrawalForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const withdrawalDate = withdrawalDateInput.value;
    const type = withdrawalTypeInput.value;
    const amount = Number(withdrawalAmountInput.value);
    const notes = withdrawalNotesInput.value.trim();
    const isOtherFunding = withdrawalOtherFundingInput ? withdrawalOtherFundingInput.checked : false;
    const fundingSource = withdrawalFundingSourceInput ? withdrawalFundingSourceInput.value.trim() : '';

    if (!withdrawalDate || !type || amount <= 0) {
      alert('Preencha os dados da saída corretamente.');
      return;
    }
    if (!isValidIsoDate(withdrawalDate)) {
      alert('Data da saída inválida. Use o formato YYYY-MM-DD.');
      return;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return;
    }

    const flowType = classifyFlowType(type, type, notes);
    const isOperationalExpense = flowType === 'expense';
    const normalizedType = flowType === 'transfer' ? TRANSFER_TYPE : (flowType === 'investment' ? INVESTMENT_TYPE : type);
    const cycleKey = resolveCycleKey(withdrawalDate);
    if (!validateCycleExpense(cycleKey, amount, 'saída', {
      isOtherFunding: isOtherFunding,
      isOperationalExpense: isOperationalExpense,
      date: withdrawalDate
    })) return;
    const createdAt = new Date().toISOString();

    const record = {
      id: generateUuid(),
      withdrawalDate: withdrawalDate,
      date: withdrawalDate,
      type: normalizedType,
      flowType: flowType,
      amount: amount,
      notes: notes,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt
    };

    if (!(await pushRecordToSupabase('withdrawals', record))) return;
    withdrawals.unshift(record);

    saveWithdrawals();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de saída');
    renderWithdrawalsTable();
    refreshCash();
    withdrawalForm.reset();
    withdrawalDateInput.value = new Date().toISOString().slice(0, 10);
  });

  withdrawalsTableBody.addEventListener('click', async function (event) {
    const editBtn = event.target.closest('[data-edit-withdrawal]');
    if (editBtn) {
      startUnifiedMovementEdit('withdrawal', editBtn.getAttribute('data-edit-withdrawal'));
      return;
    }
    const btn = event.target.closest('[data-delete-withdrawal]');
    if (!btn) return;

    const id = btn.getAttribute('data-delete-withdrawal');
    if (!(await removeRecordsFromSupabase('withdrawals', [id], true))) return;
    withdrawals = withdrawals.filter(function (item) { return item.id !== id; });
    saveWithdrawals();
    renderWithdrawalsTable();
    refreshCash();
  });

  clearWithdrawalsBtn.addEventListener('click', async function () {
    if (!confirm('Deseja apagar todas as saídas?')) return;
    const ids = withdrawals.map(function (item) { return item.id; });
    if (!(await removeRecordsFromSupabase('withdrawals', ids, true))) return;
    withdrawals = [];
    saveWithdrawals();
    renderWithdrawalsTable();
    refreshCash();
  });

  if (personalApplyFiltersBtn) {
    personalApplyFiltersBtn.addEventListener('click', function () {
      refreshPersonalFinance();
    });
  }

  if (personalClearFiltersBtn) {
    personalClearFiltersBtn.addEventListener('click', function () {
      if (personalFilterStartDateInput) personalFilterStartDateInput.value = '';
      if (personalFilterEndDateInput) personalFilterEndDateInput.value = '';
      refreshPersonalFinance();
    });
  }

  if (personalCancelEditBtn) {
    personalCancelEditBtn.addEventListener('click', function () {
      resetPersonalForm();
    });
  }

  if (personalForm) {
    personalForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const date = personalDateInput ? personalDateInput.value : '';
      const type = personalTypeInput ? personalTypeInput.value : '';
      const category = personalCategoryInput ? personalCategoryInput.value : '';
      const amount = Number(personalAmountInput ? personalAmountInput.value : 0);
      const notes = personalNotesInput ? personalNotesInput.value.trim() : '';
      const usesBusinessFunds = personalUseBusinessFundsInput ? personalUseBusinessFundsInput.checked : false;
      const fundingSource = personalFundingSourceInput ? personalFundingSourceInput.value.trim() : '';

      if (!date || (type !== 'entry' && type !== 'exit') || !category || amount <= 0) {
        alert('Preencha os dados pessoais corretamente.');
        return;
      }
      if (!isValidIsoDate(date)) {
        alert('Data do lançamento pessoal inválida. Use o formato YYYY-MM-DD.');
        return;
      }
      if (!usesBusinessFunds && !fundingSource) {
        alert('Informe a fonte da receita/gasto quando não usar saldo de Pró-labore.');
        return;
      }
      if (usesBusinessFunds && type === 'exit') {
        if (!validateProLaboreExpense(date, amount, 'saída pessoal usando Pró-labore')) return;
      }
      const createdAt = new Date().toISOString();

      const record = {
        id: editingPersonalId || generateUuid(),
        date: date,
        type: type,
        category: category,
        amount: amount,
        notes: notes,
        usesBusinessFunds: usesBusinessFunds,
        fundingSource: usesBusinessFunds ? '' : fundingSource,
        createdAt: editingPersonalId
          ? ((personalTransactions.find(function (item) { return item.id === editingPersonalId; }) || {}).createdAt || createdAt)
          : createdAt
      };

      if (!(await pushRecordToSupabase('personalTransactions', record))) return;
      if (editingPersonalId) {
        personalTransactions = personalTransactions.map(function (item) {
          return item.id === editingPersonalId ? record : item;
        });
      } else {
        personalTransactions.unshift(record);
      }
      savePersonalTransactions();
      refreshPersonalFinance();
      refreshCash();
      resetPersonalForm();
    });
  }

  if (personalTableBody) {
    personalTableBody.addEventListener('click', async function (event) {
      const editBtn = event.target.closest('[data-edit-personal]');
      if (editBtn) {
        startPersonalEdit(editBtn.getAttribute('data-edit-personal'));
        return;
      }
      const btn = event.target.closest('[data-delete-personal]');
      if (!btn) return;
      const id = btn.getAttribute('data-delete-personal');
      if (!(await removeRecordsFromSupabase('personalTransactions', [id], true))) return;
      personalTransactions = personalTransactions.filter(function (item) { return item.id !== id; });
      savePersonalTransactions();
      if (editingPersonalId === id) resetPersonalForm();

      refreshPersonalFinance();
      refreshCash();
    });
  }

  if (clearPersonalTransactionsBtn) {
    clearPersonalTransactionsBtn.addEventListener('click', async function () {
      if (!confirm('Deseja apagar todos os lançamentos pessoais?')) return;
      const ids = personalTransactions.map(function (item) { return item.id; });
      if (!(await removeRecordsFromSupabase('personalTransactions', ids, true))) return;
      personalTransactions = [];
      savePersonalTransactions();
      refreshPersonalFinance();
      refreshCash();
    });
  }

  partnerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const partner = partnerNameInput.value;
    const amount = Number(partnerAmountInput.value);
    const notes = partnerNotesInput.value.trim();
    const isOtherFunding = partnerOtherFundingInput ? partnerOtherFundingInput.checked : false;
    const fundingSource = partnerFundingSourceInput ? partnerFundingSourceInput.value.trim() : '';

    if (!PARTNERS.includes(partner) || amount <= 0) {
      alert('Selecione um sócio e informe um valor válido.');
      return;
    }
    if (isOtherFunding && !fundingSource) {
      alert('Informe a fonte do pagamento externo.');
      return;
    }

    const currentCycle = getCurrentCycleKey();
    const date = new Date().toISOString().slice(0, 10);
    if (!validateCycleExpense(currentCycle, amount, 'contribuição', {
      isOtherFunding: isOtherFunding,
      isOperationalExpense: true,
      expenseKind: 'distribution',
      date: date
    })) return;
    const createdAt = new Date().toISOString();

    const record = {
      id: generateUuid(),
      date: date,
      partner: partner,
      amount: amount,
      notes: notes,
      isOtherFunding: isOtherFunding,
      fundingSource: isOtherFunding ? fundingSource : '',
      createdAt: createdAt,
      cycleKey: currentCycle
    };

    if (!(await pushRecordToSupabase('partnerContributions', record))) return;
    partnerContributions.unshift(record);

    savePartnerContributions();
    notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de contribuição');
    partnerForm.reset();
    selectedPartnerCycle = getCurrentCycleKey();
    refreshCash();
    refreshPartners();
  });

  partnersTableBody.addEventListener('click', async function (event) {
    const editBtn = event.target.closest('[data-edit-partner-contribution]');
    if (editBtn) {
      startUnifiedMovementEdit('distribution', editBtn.getAttribute('data-edit-partner-contribution'));
      return;
    }
    const btn = event.target.closest('[data-delete-partner-contribution]');
    if (!btn) return;

    const id = btn.getAttribute('data-delete-partner-contribution');
    if (!(await removeRecordsFromSupabase('partnerContributions', [id], true))) return;
    partnerContributions = partnerContributions.filter(function (item) { return item.id !== id; });
    savePartnerContributions();
    refreshCash();
    refreshPartners();
  });

  clearPartnerContributionsBtn.addEventListener('click', async function () {
    if (!confirm('Deseja apagar as contribuições do ciclo selecionado?')) return;
    const ids = partnerContributions.filter(function (item) {
      return item.cycleKey === selectedPartnerCycle;
    }).map(function (item) {
      return item.id;
    });
    if (!(await removeRecordsFromSupabase('partnerContributions', ids, true))) return;
    partnerContributions = partnerContributions.filter(function (item) {
      return item.cycleKey !== selectedPartnerCycle;
    });
    savePartnerContributions();
    refreshCash();
    refreshPartners();
  });

  partnerGoalForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const adonias = Number(goalAdoniasInput.value);
    const zaine = Number(goalZaineInput.value);
    const mayza = Number(goalMayzaInput.value);
    const dizimo = Number(goalDizimoInput.value);

    if (adonias < 0 || zaine < 0 || mayza < 0 || dizimo < 0) {
      alert('As metas devem ser maiores ou iguais a zero.');
      return;
    }

    partnerGoals = {
      Adonias: adonias,
      Zaine: zaine,
      Mayza: mayza,
      Dizimo: dizimo
    };

    if (!(await pushRecordToSupabase('partnerGoals', partnerGoals, getPartnerGoalsRecordId()))) return;
    savePartnerGoals();
    refreshPartners();
  });

  if (adsInvestmentForm) {
    adsInvestmentForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const date = adsDateInput.value;
      const platform = adsPlatformInput.value;
      const amount = Number(adsAmountInput.value);
      const method = adsPaymentMethodInput ? adsPaymentMethodInput.value : 'PIX Prepaid';
      const notes = adsNotesInput ? adsNotesInput.value.trim() : '';

      if (!date || !platform || amount <= 0) {
        alert('Preencha os dados do investimento corretamente.');
        return;
      }
      if (!isValidIsoDate(date)) {
        alert('Data do investimento inválida. Use o formato YYYY-MM-DD.');
        return;
      }

      const cycleKey = resolveCycleKey(date);
      if (!validateCycleExpense(cycleKey, amount, 'investimento em ads', {
        isOperationalExpense: true,
        date: date
      })) return;
      const createdAt = new Date().toISOString();

      const record = {
        id: generateUuid(),
        date: date,
        platform: platform,
        amount: amount,
        method: method,
        notes: notes,
        createdAt: createdAt
      };

      if (!(await pushRecordToSupabase('adsInvestments', record))) return;
      adsInvestments.unshift(record);
      saveAdsInvestments();

      // Paired withdrawal to impact cash balance
      const withdrawalRecord = {
        id: generateUuid(),
        linkedSource: 'ads',
        linkedTransactionId: record.id,
        withdrawalDate: date,
        date: date,
        type: 'Ads Investment',
        flowType: 'expense',
        amount: amount,
        notes: (notes ? notes + ' - ' : '') + 'Ads via ' + platform + ' (' + method + ')',
        createdAt: record.createdAt
      };
      if (await pushRecordToSupabase('withdrawals', withdrawalRecord)) {
        withdrawals.unshift(withdrawalRecord);
        saveWithdrawals();
      }

      notifyNewBusinessCycleIfNeeded(record.date, 'Lançamento de investimento em Ads');

      adsInvestmentForm.reset();
      if (adsDateInput) adsDateInput.value = new Date().toISOString().slice(0, 10);
      if (adsPaymentMethodInput) adsPaymentMethodInput.value = 'PIX Prepaid';
      refreshCash();
    });
  }

  if (adsInvestmentsTableBody) {
    adsInvestmentsTableBody.addEventListener('click', async function (event) {
      const editBtn = event.target.closest('[data-edit-ads]');
      if (editBtn) {
        startUnifiedMovementEdit('ads', editBtn.getAttribute('data-edit-ads'));
        return;
      }
      const btn = event.target.closest('[data-delete-ads]');
      if (!btn) return;
      const id = btn.getAttribute('data-delete-ads');
      if (!(await removeRecordsFromSupabase('adsInvestments', [id], true))) return;
      adsInvestments = adsInvestments.filter(function (item) { return item.id !== id; });
      saveAdsInvestments();

      // Remove paired withdrawal if present
      const paired = withdrawals.find(function (w) {
        return (w.linkedSource === 'ads' && w.linkedTransactionId === id) || w.id === ('ads-' + id);
      });
      if (paired) {
        await removeRecordsFromSupabase('withdrawals', [paired.id], true);
        withdrawals = withdrawals.filter(function (w) { return w.id !== paired.id; });
        saveWithdrawals();
      }

      refreshCash();
    });
  }

  if (dailyCloseForm) {
    if (dailyCloseCancelEditBtn) {
      dailyCloseCancelEditBtn.addEventListener('click', function () {
        resetDailyCloseForm();
      });
    }

    dailyCloseForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!dailyChecklistSnapshot) {
        refreshCash();
      }
      const snapshot = dailyChecklistSnapshot;
      if (!snapshot) {
        alert('Não foi possível gerar o checklist diário. Atualize os dados e tente novamente.');
        return;
      }
      const responsibleInput = dailyCloseResponsibleInput ? dailyCloseResponsibleInput.value : '';
      const responsible = String(responsibleInput || (authUser && authUser.email ? authUser.email : '') || '').trim();
      if (!responsible) {
        alert('Informe o responsável pelo fechamento diário.');
        return;
      }
      const dateFromInput = dailyCloseDateInput ? dailyCloseDateInput.value : '';
      const referenceDate = toIsoDateFromAny(dateFromInput || snapshot.date || new Date().toISOString().slice(0, 10));
      const bankCheck = dailyCloseBankCheckInput ? String(dailyCloseBankCheckInput.value || '').trim() : '';
      if (!['yes', 'no'].includes(bankCheck)) {
        alert('Informe se a conta bancária está conciliada com os objetivos dos potes.');
        return;
      }
      const notes = String(dailyCloseNotesInput ? dailyCloseNotesInput.value : '').trim();
      if (bankCheck === 'no' && !notes) {
        alert('Ao marcar divergência bancária, descreva a diferença em Observações.');
        return;
      }
      const wasEditingDailyClose = !!editingDailyClosingId;
      const finalStatus = bankCheck === 'no' ? 'red' : snapshot.status;
      const record = {
        id: editingDailyClosingId || generateUuid(),
        date: referenceDate,
        responsible: responsible,
        status: finalStatus,
        bankCheck: bankCheck,
        notes: notes,
        createdAt: editingDailyClosingId
          ? ((dailyClosings.find(function (item) { return item.id === editingDailyClosingId; }) || {}).createdAt || new Date().toISOString())
          : new Date().toISOString(),
        summary: {
          totalDifference: Number(snapshot.totalDifference || 0),
          items: Array.isArray(snapshot.items) ? snapshot.items.length : 0,
          message: String(snapshot.summaryText || '')
        }
      };
      if (editingDailyClosingId) {
        dailyClosings = dailyClosings.map(function (item) {
          return item.id === editingDailyClosingId ? record : item;
        });
      } else {
        dailyClosings.unshift(record);
      }
      dailyClosings = dailyClosings.sort(function (a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      }).slice(0, DAILY_CHECKLIST_MAX_HISTORY);
      saveDailyClosings();
      renderDailyCloseHistory();
      resetDailyCloseForm();
      alert(
        'Fechamento diário ' + (wasEditingDailyClose ? 'atualizado' : 'registrado') + ' para ' + formatDateOnly(referenceDate) +
        ' com status ' + toDailyStatusLabel(finalStatus) + '. ' +
        'Conciliação bancária: ' + (bankCheck === 'yes' ? 'Conferida' : 'Divergente') + '.'
      );
    });
  }

  if (dailyCloseHistoryBody) {
    dailyCloseHistoryBody.addEventListener('click', function (event) {
      const editBtn = event.target.closest('[data-edit-daily-close]');
      if (editBtn) {
        startDailyCloseEdit(editBtn.getAttribute('data-edit-daily-close'));
        return;
      }
      const deleteBtn = event.target.closest('[data-delete-daily-close]');
      if (!deleteBtn) return;
      const id = deleteBtn.getAttribute('data-delete-daily-close');
      if (!confirm('Deseja excluir este fechamento diário?')) return;
      dailyClosings = dailyClosings.filter(function (item) { return item.id !== id; });
      saveDailyClosings();
      if (editingDailyClosingId === id) resetDailyCloseForm();
      renderDailyCloseHistory();
    });
  }

  partnerCycleSelect.addEventListener('change', function () {
    selectedPartnerCycle = partnerCycleSelect.value;
    refreshPartners();
  });

  bindTabs();
  bindUiModeControls();
  bindSupabasePanel();
  initHelpGuideModule();

  (async function init() {
    await bootstrapSupabaseConnection();
    if (!isSupabaseReady()) {
      await loadData();
    }
    applyUiAdvancedMode(loadUiAdvancedModeFlag());
    if (!uiAdvancedMode) setActiveTab('cash');
    refreshAll();
  })();
})();

