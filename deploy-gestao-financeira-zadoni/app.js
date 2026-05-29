(function () {
  'use strict';

  const STORAGE_PERSONAL_TRANSACTIONS = 'zadoni_personal_transactions_v1';
  const STORAGE_PERSONAL_FILTERS = 'zadoni_personal_filters_v1';
  const STORAGE_META_CAIXA = 'zadoni_meta_caixa_v1';
  const STORAGE_META_HISTORY = 'zadoni_meta_history_v1';
  const STORAGE_DEBTS = 'zadoni_debts_v1';
  const ZadoniModules = window.ZadoniModules || {};
  const CalcModule = ZadoniModules.calc || {};
  const DataModule = ZadoniModules.data || {};
  const UiModule = ZadoniModules.ui || {};
  const PERSONAL_HEALTH_THRESHOLDS = { red: 45, yellow: 70 };
  const GIVING_CATEGORIES = ['Dízimos', 'Doações', 'Oferta'];
  const INVESTMENT_CATEGORIES = ['Investimentos'];
  const LIFESTYLE_CATEGORIES = ['Roupas', 'Beleza', 'Cuidados pessoais', 'Lazer'];
  const BUSINESS_GROWTH_CATEGORIES = ['Recompra para negócio', 'Tráfego pago'];
  const DEBT_CATEGORIES = ['Dívidas'];

  const tabButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-target]'));
  const screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
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
  const exportReportPdfBtn = document.getElementById('exportReportPdf');
  const reportPeriodLabel = document.getElementById('reportPeriodLabel');
  const reportGeneratedAt = document.getElementById('reportGeneratedAt');
  const personalKpiEntries = document.getElementById('personalKpiEntries');
  const personalKpiExits = document.getElementById('personalKpiExits');
  const personalKpiBalance = document.getElementById('personalKpiBalance');
  const personalKpiHealth = document.getElementById('personalKpiHealth');
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
  const personalKpiMeta = document.getElementById('personalKpiMeta');
  const personalKpiShortage = document.getElementById('personalKpiShortage');
  const personalReserveBtn = document.getElementById('personalReserveBtn');
  const personalEditMetaBtn = document.getElementById('personalEditMetaBtn');
  const personalMetaEvolutionChart = document.getElementById('personalMetaEvolutionChart');
  const personalTableBody = document.getElementById('personalTableBody');
  const clearPersonalTransactionsBtn = document.getElementById('clearPersonalTransactions');
  const wisdomStatusPill = document.getElementById('wisdomStatusPill');
  const wisdomSummary = document.getElementById('wisdomSummary');
  const wisdomScore = document.getElementById('wisdomScore');
  const wisdomNextAction = document.getElementById('wisdomNextAction');
  const wisdomNextActionDetail = document.getElementById('wisdomNextActionDetail');
  const wisdomCouplePact = document.getElementById('wisdomCouplePact');
  const wisdomCouplePactDetail = document.getElementById('wisdomCouplePactDetail');
  const wisdomPrinciple = document.getElementById('wisdomPrinciple');
  const wisdomPrincipleDetail = document.getElementById('wisdomPrincipleDetail');
  const wisdomAlerts = document.getElementById('wisdomAlerts');
  const wisdomPriorities = document.getElementById('wisdomPriorities');
  const wisdomPrinciples = document.getElementById('wisdomPrinciples');
  const debtForm = document.getElementById('debtForm');
  const debtCreditorInput = document.getElementById('debtCreditor');
  const debtOriginalAmountInput = document.getElementById('debtOriginalAmount');
  const debtNegotiatedAmountInput = document.getElementById('debtNegotiatedAmount');
  const debtPaidAmountInput = document.getElementById('debtPaidAmount');
  const debtDueDateInput = document.getElementById('debtDueDate');
  const debtNextActionDateInput = document.getElementById('debtNextActionDate');
  const debtStatusInput = document.getElementById('debtStatus');
  const debtPriorityInput = document.getElementById('debtPriority');
  const debtContactInput = document.getElementById('debtContact');
  const debtNotesInput = document.getElementById('debtNotes');
  const debtSubmitBtn = document.getElementById('debtSubmitBtn');
  const debtCancelEditBtn = document.getElementById('debtCancelEdit');
  const debtStatusPill = document.getElementById('debtStatusPill');
  const debtFreedomMessage = document.getElementById('debtFreedomMessage');
  const debtCleanProgress = document.getElementById('debtCleanProgress');
  const debtKpiCreditors = document.getElementById('debtKpiCreditors');
  const debtKpiOriginal = document.getElementById('debtKpiOriginal');
  const debtKpiNegotiated = document.getElementById('debtKpiNegotiated');
  const debtKpiPaid = document.getElementById('debtKpiPaid');
  const debtKpiRemaining = document.getElementById('debtKpiRemaining');
  const debtKpiUpcoming = document.getElementById('debtKpiUpcoming');
  const debtNegotiationChart = document.getElementById('debtNegotiationChart');
  const debtStatusChart = document.getElementById('debtStatusChart');
  const debtRabbiGuidance = document.getElementById('debtRabbiGuidance');
  const debtTableBody = document.getElementById('debtTableBody');

  let personalTransactions = [];
  let debts = [];
  let editingPersonalId = '';
  let editingDebtId = '';
  let metaCaixaMin = 5000; // valor mínimo recomendado para meta caixa
  let reservedAmount = 0; // indicador de valor reservado (apenas sinalização local)
  let metaHistory = [];
  let printOpenedDetails = [];

  function generateId() {
    return 'pt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function toMoney(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function toPercent(value) {
    return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }

  function toIsoDate(value, fallback) {
    if (CalcModule && typeof CalcModule.toIsoDateFromAny === 'function') {
      return CalcModule.toIsoDateFromAny(value, fallback);
    }
    const raw = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return String(fallback || new Date().toISOString().slice(0, 10));
  }

  function formatDateOnly(value) {
    if (!value) return '-';
    const date = new Date(value.length === 10 ? value + 'T00:00:00' : value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeOptionalFieldValue(value) {
    const text = String(value || '').trim();
    if (!text || text === '-') return '';
    return text;
  }

  function renderDescriptionDetails(description, summaryLabel, extraClass) {
    const text = String(description || '').trim();
    if (!text) return '<span class="muted-inline">Sem descrição</span>';
    const className = 'compact-details' + (extraClass ? ' ' + extraClass : '');
    return '<details class="' + className + '">' +
      '<summary>' + escapeHtml(summaryLabel || 'Ver detalhes') + '</summary>' +
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

  function getFilteredPersonalTransactions() {
    const start = personalFilterStartDateInput ? personalFilterStartDateInput.value : '';
    const end = personalFilterEndDateInput ? personalFilterEndDateInput.value : '';
    return personalTransactions.filter(function (item) {
      const date = toIsoDate(item.date || item.createdAt);
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

  function updateReportInfo(generatedAt) {
    const start = personalFilterStartDateInput ? personalFilterStartDateInput.value : '';
    const end = personalFilterEndDateInput ? personalFilterEndDateInput.value : '';
    let period = 'Período: todos os lançamentos';
    if (start && end) {
      period = 'Período: ' + formatDateOnly(start) + ' a ' + formatDateOnly(end);
    } else if (start) {
      period = 'Período: a partir de ' + formatDateOnly(start);
    } else if (end) {
      period = 'Período: até ' + formatDateOnly(end);
    }
    if (reportPeriodLabel) reportPeriodLabel.textContent = period;
    if (reportGeneratedAt) {
      const date = generatedAt || new Date();
      reportGeneratedAt.textContent = 'Gerado em: ' + date.toLocaleString('pt-BR');
    }
  }

  function handleExportReportPdf() {
    updateReportInfo(new Date());
    window.print();
  }

  function preparePrintReport() {
    updateReportInfo(new Date());
    printOpenedDetails = [];
    document.querySelectorAll('details').forEach(function (details) {
      if (!details.open) {
        printOpenedDetails.push(details);
        details.open = true;
      }
    });
  }

  function restorePrintReport() {
    printOpenedDetails.forEach(function (details) {
      details.open = false;
    });
    printOpenedDetails = [];
  }

  function activateScreen(screenName) {
    screens.forEach(function (screen) {
      if (screen.getAttribute('data-screen') === screenName) {
        screen.classList.add('is-active');
      } else {
        screen.classList.remove('is-active');
      }
    });
    tabButtons.forEach(function (button) {
      const isActive = button.getAttribute('data-tab-target') === screenName;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    refreshPersonalFinance();
    refreshDebtFreedom();
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
      window.alert('Lançamento pessoal não encontrado para edição.');
      return;
    }
    editingPersonalId = record.id;
    if (personalDateInput) personalDateInput.value = toIsoDate(record.date || record.createdAt);
    if (personalTypeInput) personalTypeInput.value = record.type || '';
    if (personalCategoryInput) personalCategoryInput.value = record.category || '';
    if (personalAmountInput) personalAmountInput.value = Number(record.amount || 0).toFixed(2);
    if (personalNotesInput) personalNotesInput.value = record.notes || '';
    if (personalUseBusinessFundsInput) personalUseBusinessFundsInput.checked = !!record.usesBusinessFunds;
    if (personalFundingSourceInput) personalFundingSourceInput.value = record.fundingSource || '';
    if (personalSubmitBtn) personalSubmitBtn.textContent = 'Atualizar Lançamento';
    if (personalCancelEditBtn) personalCancelEditBtn.removeAttribute('hidden');
    if (personalForm && typeof personalForm.scrollIntoView === 'function') {
      personalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderPersonalTemperatureStatus(score, balance) {
    if (!personalTemperatureLabel) return;
    if (score < PERSONAL_HEALTH_THRESHOLDS.red || balance < 0) {
      personalTemperatureLabel.className = 'traffic-light red';
      personalTemperatureLabel.textContent = 'Ponto de atenção: saídas acima do ritmo saudável. Reduza gastos e proteja o saldo.';
      return;
    }
    if (score < PERSONAL_HEALTH_THRESHOLDS.yellow) {
      personalTemperatureLabel.className = 'traffic-light yellow';
      personalTemperatureLabel.textContent = 'Atenção moderada: há equilíbrio parcial, mas ainda com risco ao final do período.';
      return;
    }
    personalTemperatureLabel.className = 'traffic-light green';
    personalTemperatureLabel.textContent = 'Equilíbrio saudável: mantenha disciplina e poupe sempre que possível.';
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

  function getCanvasMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function drawTooltipBox(ctx, x, y, lines) {
    if (!Array.isArray(lines) || !lines.length) return;
    const padding = 8;
    const lineHeight = 18;
    const width = Math.max.apply(null, lines.map(function (line) { return ctx.measureText(line).width; })) + padding * 2;
    const height = lines.length * lineHeight + padding;
    const offsetY = y - height - 10;
    const boxX = Math.max(10, Math.min(ctx.canvas.width / (window.devicePixelRatio || 1) - width - 10, x - width / 2));
    const boxY = offsetY < 10 ? y + 12 : offsetY;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const radius = 8;
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + width - radius, boxY);
    ctx.quadraticCurveTo(boxX + width, boxY, boxX + width, boxY + radius);
    ctx.lineTo(boxX + width, boxY + height - radius);
    ctx.quadraticCurveTo(boxX + width, boxY + height, boxX + width - radius, boxY + height);
    ctx.lineTo(boxX + radius, boxY + height);
    ctx.quadraticCurveTo(boxX, boxY + height, boxX, boxY + height - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 12px Segoe UI';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach(function (line, index) {
      ctx.fillText(line, boxX + padding, boxY + padding + (index * lineHeight));
    });
    ctx.restore();
  }

  function getNearestHoverPoint(canvas, x, y) {
    const chartData = canvas._lineChartData;
    if (!chartData || !Array.isArray(chartData.points)) return null;
    var closest = null;
    var minDistance = 1e9;
    chartData.points.forEach(function (p) {
      var dx = x - p.x;
      var dy = y - p.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= 10 && distance < minDistance) {
        minDistance = distance;
        closest = p;
      }
    });
    return closest;
  }

  function handleLineChartHover(event) {
    const canvas = event.currentTarget;
    const pos = getCanvasMousePosition(canvas, event);
    const point = getNearestHoverPoint(canvas, pos.x, pos.y);
    var chartData = canvas._lineChartData;
    if (!chartData) return;
    if (point) {
      if (chartData.activePoint && chartData.activePoint.seriesIndex === point.seriesIndex && chartData.activePoint.index === point.index) {
        return;
      }
      chartData.activePoint = point;
      renderLineChartCanvas(canvas, chartData.labels, chartData.series, point);
    } else if (chartData.activePoint) {
      chartData.activePoint = null;
      renderLineChartCanvas(canvas, chartData.labels, chartData.series);
    }
  }

  function handleLineChartLeave(event) {
    const canvas = event.currentTarget;
    var chartData = canvas._lineChartData;
    if (!chartData || !chartData.activePoint) return;
    chartData.activePoint = null;
    renderLineChartCanvas(canvas, chartData.labels, chartData.series);
  }

  function attachLineChartHover(canvas) {
    if (!canvas || canvas._lineChartHoverAttached) return;
    canvas.addEventListener('mousemove', handleLineChartHover);
    canvas.addEventListener('mouseleave', handleLineChartLeave);
    canvas._lineChartHoverAttached = true;
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

    function drawSegment(fromP, toP, color) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
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

  function getPeriodKey(isoDate, mode) {
    const date = new Date(isoDate.length === 10 ? isoDate + 'T00:00:00' : isoDate);
    if (Number.isNaN(date.getTime())) return '';
    if (mode === 'day') {
      return formatDateOnly(isoDate);
    }
    if (mode === 'week') {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      return 'Semana de ' + formatDateOnly(start.toISOString().slice(0, 10));
    }
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
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

  function drawAxisAndGrid(ctx, width, height, minValue, maxValue) {
    const left = 44;
    const right = width - 18;
    const top = 24;
    const bottom = height - 30;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let step = 0; step <= 4; step += 1) {
      const y = top + ((bottom - top) * step / 4);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
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

  function renderLineChartCanvas(canvas, labels, series, hoverPoint) {
    if (!canvas) return;
    if (!labels.length || !series.length) {
      drawEmptyCanvas(canvas, 'Sem dados para este período');
      return;
    }
    const canvasCtx = getCanvasContext(canvas);
    if (!canvasCtx) return;
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

    const points = [];
    series.forEach(function (line, seriesIndex) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      line.values.forEach(function (v, i) {
        const x = axis.left + (stepX * i);
        const y = valueToY(v);
        points.push({ x: x, y: y, value: Number(v || 0), label: String(labels[i] || ''), seriesLabel: String(line.label || ''), seriesIndex: seriesIndex, index: i });
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      line.values.forEach(function (v, i) {
        const x = axis.left + (stepX * i);
        const y = valueToY(v);
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    });

    canvas._lineChartData = {
      labels: labels.slice(),
      series: JSON.parse(JSON.stringify(series)),
      points: points,
      activePoint: hoverPoint || null
    };
    attachLineChartHover(canvas);

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

    if (hoverPoint) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0ea5a4';
      ctx.lineWidth = 2;
      ctx.arc(hoverPoint.x, hoverPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawTooltipBox(ctx, hoverPoint.x, hoverPoint.y, [hoverPoint.seriesLabel + ': ' + toMoney(hoverPoint.value), hoverPoint.label]);
    }
  }

  function renderHorizontalBarChart(canvas, rows, emptyMessage) {
    if (!canvas) return;
    if (!rows.length) {
      drawEmptyCanvas(canvas, emptyMessage || 'Sem dados');
      return;
    }
    const canvasCtx = getCanvasContext(canvas);
    if (!canvasCtx) return;
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
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(badgeX + radius, badgeY);
      ctx.lineTo(badgeX + badgeW - radius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - radius, badgeY + badgeH);
      ctx.lineTo(badgeX + radius, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
      ctx.lineTo(badgeX, badgeY + radius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
      ctx.closePath();
      ctx.fillStyle = fitsOutside ? '#e2e8f0' : '#134e4a';
      ctx.fill();
      ctx.fillStyle = fitsOutside ? '#0f172a' : '#ffffff';
      ctx.font = '600 10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(valueText, badgeX + (badgeW / 2), badgeY + (badgeH / 2));
    });
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

  function sumExitCategories(list, categories) {
    return list.filter(function (item) {
      return item.type === 'exit' && categories.indexOf(String(item.category || '')) >= 0;
    }).reduce(function (acc, item) {
      return acc + Number(item.amount || 0);
    }, 0);
  }

  function renderWisdomCards(container, items, emptyText) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<article class="wisdom-item neutral"><strong>Aguardando dados</strong><p>' + escapeHtml(emptyText) + '</p></article>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      return '<article class="wisdom-item ' + escapeHtml(item.tone || 'neutral') + '">' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<p>' + escapeHtml(item.text) + '</p>' +
      '</article>';
    }).join('');
  }

  function renderPriorities(items) {
    if (!wisdomPriorities) return;
    wisdomPriorities.innerHTML = items.map(function (item, index) {
      return '<article class="priority-item">' +
        '<span>' + (index + 1) + '</span>' +
        '<div><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.text) + '</p></div>' +
      '</article>';
    }).join('');
  }

  function renderProsperityGuidance(list, metrics) {
    if (!wisdomSummary && !wisdomAlerts && !wisdomPriorities) return;
    const entries = Number(metrics.entries || 0);
    const exits = Number(metrics.exits || 0);
    const balance = Number(metrics.balance || 0);
    const score = Number(metrics.score || 0);
    const shortage = Number(metrics.shortage || 0);
    const giving = sumExitCategories(list, GIVING_CATEGORIES);
    const investments = sumExitCategories(list, INVESTMENT_CATEGORIES);
    const lifestyle = sumExitCategories(list, LIFESTYLE_CATEGORIES);
    const businessGrowth = sumExitCategories(list, BUSINESS_GROWTH_CATEGORIES);
    const debt = sumExitCategories(list, DEBT_CATEGORIES);
    const exitsBase = Math.max(exits, 1);
    const entriesBase = Math.max(entries, 1);
    let tone = 'neutral';
    let status = 'Em leitura';
    let summary = 'Registre entradas e saídas para enxergar o caminho financeiro do casal.';

    if (list.length === 0) {
      tone = 'neutral';
      status = 'Sem dados no período';
    } else if (balance < 0 || score < PERSONAL_HEALTH_THRESHOLDS.red) {
      tone = 'critical';
      status = 'Correção urgente';
      summary = 'As saídas estão pressionando a casa. A prioridade é proteger a paz do casal, cortar vazamentos e recuperar caixa.';
    } else if (shortage > 0 || score < PERSONAL_HEALTH_THRESHOLDS.yellow) {
      tone = 'warning';
      status = 'Atenção e disciplina';
      summary = 'Há progresso, mas o caixa ainda pede vigilância. A prosperidade aqui depende de limites claros e decisão conjunta.';
    } else {
      tone = 'ok';
      status = 'Base saudável';
      summary = 'O período mostra equilíbrio. O próximo nível é fortalecer reserva, investimento e generosidade com constância.';
    }

    if (wisdomStatusPill) {
      wisdomStatusPill.className = 'wisdom-pill ' + tone;
      wisdomStatusPill.textContent = status;
    }
    if (wisdomSummary) wisdomSummary.textContent = summary;
    if (wisdomScore) wisdomScore.textContent = Math.round(score) + '%';

    const alerts = [];
    if (list.length === 0) {
      alerts.push({ tone: 'neutral', title: 'Primeira clareza', text: 'Sem lançamentos no período, não há conselho confiável. Comece registrando todas as entradas e saídas.' });
    }
    if (balance < 0) {
      alerts.push({ tone: 'critical', title: 'Saldo negativo exige contenção', text: 'Antes de expandir, interrompa gastos não essenciais e combine um teto de despesas até o saldo voltar ao positivo.' });
    }
    if (exits > entries && entries > 0) {
      alerts.push({ tone: 'critical', title: 'As saídas passaram das entradas', text: 'O lar não deve depender de improviso. Revisem juntos as maiores categorias de saída ainda esta semana.' });
    }
    if (shortage > 0) {
      alerts.push({ tone: 'warning', title: 'Meta Caixa desprotegida', text: 'Faltam ' + toMoney(shortage) + ' para a meta mínima. Trate essa recomposição como prioridade antes de novos confortos.' });
    }
    if (debt > 0) {
      alerts.push({ tone: debt / entriesBase > 0.15 ? 'warning' : 'neutral', title: 'Dívidas precisam de plano', text: 'Há ' + toMoney(debt) + ' em dívidas no período. Liste juros, vencimentos e quite primeiro o que destrói caixa mais rápido.' });
    }
    if (investments <= 0 && entries > 0 && balance > 0) {
      alerts.push({ tone: 'warning', title: 'O futuro ainda não foi pago', text: 'Houve saldo positivo, mas nenhum investimento registrado. Separe uma parte pequena e constante antes do dinheiro se dispersar.' });
    }
    if (giving <= 0 && entries > 0) {
      alerts.push({ tone: 'neutral', title: 'Generosidade planejada', text: 'Dízimos, ofertas e doações ficam mais fortes quando nascem de ordem, não de culpa. Definam um percentual possível e fiel.' });
    }
    if (lifestyle / exitsBase > 0.25 && balance <= 0) {
      alerts.push({ tone: 'warning', title: 'Estilo de vida pressionando o caixa', text: 'Roupas, beleza, cuidados pessoais e lazer estão altos para o momento. Reduzam temporariamente para preservar a casa.' });
    }
    if (businessGrowth > 0) {
      alerts.push({ tone: businessGrowth / exitsBase > 0.35 && balance < 0 ? 'warning' : 'ok', title: 'Crescimento precisa de retorno', text: 'Recompra e tráfego pago somam ' + toMoney(businessGrowth) + '. Acompanhem retorno, prazo e caixa antes de reinvestir automaticamente.' });
    }
    if (score >= PERSONAL_HEALTH_THRESHOLDS.yellow && shortage <= 0 && investments > 0 && giving > 0) {
      alerts.push({ tone: 'ok', title: 'Equilíbrio maduro', text: 'Há sinais bons: caixa protegido, investimento e generosidade aparecem juntos. Mantenham constância antes de aumentar o padrão.' });
    }

    renderWisdomCards(wisdomAlerts, alerts, 'Os alertas aparecem conforme os lançamentos do período selecionado.');

    const priorities = [];
    priorities.push(shortage > 0
      ? { title: 'Recompor Meta Caixa', text: 'Direcionar excedentes para cobrir os ' + toMoney(shortage) + ' faltantes antes de elevar gastos variáveis.' }
      : { title: 'Preservar a reserva', text: 'Manter a Meta Caixa protegida e evitar usar reserva para despesas previsíveis.' });
    if (debt > 0) priorities.push({ title: 'Atacar dívidas', text: 'Criar uma ordem de quitação por juros e vencimento, com valor fixo mensal.' });
    priorities.push(investments > 0
      ? { title: 'Aumentar investimento com prudência', text: 'Investimentos somam ' + toMoney(investments) + '. Aumente apenas se a reserva e o caixa seguirem saudáveis.' }
      : { title: 'Criar semente de investimento', text: 'Começar com um valor pequeno e recorrente. Constância educa melhor que grandes impulsos.' });
    priorities.push(giving > 0
      ? { title: 'Manter generosidade ordenada', text: 'Dízimos, ofertas e doações somam ' + toMoney(giving) + '. Mantenham como decisão do casal dentro do orçamento.' }
      : { title: 'Planejar tzedakah', text: 'Separar generosidade possível depois das obrigações básicas, com coração aberto e caixa consciente.' });
    priorities.push({ title: 'Reunião financeira semanal', text: 'Uma conversa curta, com números na mesa, protege shalom bayit e reduz decisões por emoção.' });
    renderPriorities(priorities.slice(0, 5));

    if (wisdomNextAction) wisdomNextAction.textContent = balance < 0 ? 'Cortar vazamentos agora' : (shortage > 0 ? 'Reforçar Meta Caixa' : 'Automatizar bons hábitos');
    if (wisdomNextActionDetail) wisdomNextActionDetail.textContent = balance < 0 ? 'Suspender gastos variáveis até o caixa voltar ao positivo.' : (shortage > 0 ? 'Destinar o primeiro excedente para a reserva mínima.' : 'Separar investimento e generosidade no início do período.');
    if (wisdomCouplePact) wisdomCouplePact.textContent = debt > 0 ? 'Pacto contra dívida nova' : 'Decisão conjunta antes de gastar';
    if (wisdomCouplePactDetail) wisdomCouplePactDetail.textContent = debt > 0 ? 'Nenhuma parcela nova sem consenso e plano de quitação.' : 'Compras fora do combinado passam por conversa simples e objetiva.';
    if (wisdomPrinciple) wisdomPrinciple.textContent = shortage > 0 ? 'Primeiro o recipiente, depois a bênção' : 'Fidelidade no pequeno';
    if (wisdomPrincipleDetail) wisdomPrincipleDetail.textContent = shortage > 0 ? 'Na tradição judaica, prosperidade precisa de um kli: uma estrutura capaz de conter o crescimento.' : 'A riqueza sustentável cresce quando hábitos pequenos são repetidos com integridade.';

    renderWisdomCards(wisdomPrinciples, [
      { tone: shortage > 0 ? 'warning' : 'ok', title: 'Kli: recipiente financeiro', text: 'Reserva, orçamento e limites formam o recipiente que permite receber e manter prosperidade.' },
      { tone: debt > 0 ? 'warning' : 'ok', title: 'Liberdade antes de aparência', text: 'Dívida sem plano reduz liberdade. Status não deve custar a paz da casa.' },
      { tone: giving > 0 ? 'ok' : 'neutral', title: 'Tzedakah com ordem', text: 'Generosidade é mais forte quando planejada, constante e compatível com as responsabilidades do casal.' },
      { tone: investments > 0 ? 'ok' : 'neutral', title: 'Plantar antes de colher', text: 'Investimento recorrente transforma renda em futuro, mesmo quando começa pequeno.' }
    ], 'Princípios aparecem após os primeiros lançamentos.');
  }

  function getDebtBaseAmount(debt) {
    const original = Number(debt.originalAmount || 0);
    const negotiated = Number(debt.negotiatedAmount || 0);
    return negotiated > 0 ? negotiated : original;
  }

  function getDebtRemaining(debt) {
    if (String(debt.status || '') === 'Quitado') return 0;
    return Math.max(0, getDebtBaseAmount(debt) - Number(debt.paidAmount || 0));
  }

  function getDebtMetrics() {
    const activeDebts = debts.filter(function (debt) { return String(debt.status || '') !== 'Quitado'; });
    const totalOriginal = debts.reduce(function (acc, debt) { return acc + Number(debt.originalAmount || 0); }, 0);
    const totalNegotiated = debts.reduce(function (acc, debt) { return acc + getDebtBaseAmount(debt); }, 0);
    const totalPaid = debts.reduce(function (acc, debt) { return acc + Math.min(Number(debt.paidAmount || 0), getDebtBaseAmount(debt)); }, 0);
    const totalRemaining = debts.reduce(function (acc, debt) { return acc + getDebtRemaining(debt); }, 0);
    const progress = totalNegotiated > 0 ? Math.round((Math.min(totalPaid, totalNegotiated) / totalNegotiated) * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = activeDebts.filter(function (debt) {
      const next = String(debt.nextActionDate || '');
      return next && next <= today;
    }).length;
    return {
      activeDebts: activeDebts,
      totalOriginal: totalOriginal,
      totalNegotiated: totalNegotiated,
      totalPaid: totalPaid,
      totalRemaining: totalRemaining,
      progress: progress,
      upcoming: upcoming
    };
  }

  function resetDebtFormMode() {
    editingDebtId = '';
    if (debtSubmitBtn) debtSubmitBtn.textContent = 'Salvar Credor';
    if (debtCancelEditBtn) debtCancelEditBtn.setAttribute('hidden', 'hidden');
  }

  function resetDebtForm() {
    if (debtForm) debtForm.reset();
    resetDebtFormMode();
    if (debtStatusInput) debtStatusInput.value = 'Atrasado';
    if (debtPriorityInput) debtPriorityInput.value = 'Alta';
    if (debtPaidAmountInput) debtPaidAmountInput.value = '0';
  }

  function loadDebts() {
    try {
      const raw = localStorage.getItem(STORAGE_DEBTS);
      debts = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(debts)) debts = [];
    } catch (error) {
      localStorage.removeItem(STORAGE_DEBTS);
      debts = [];
    }
  }

  function saveDebts() {
    localStorage.setItem(STORAGE_DEBTS, JSON.stringify(debts));
  }

  function startDebtEdit(debtId) {
    const debt = debts.find(function (item) { return item.id === debtId; });
    if (!debt) {
      window.alert('Credor não encontrado para edição.');
      return;
    }
    editingDebtId = debt.id;
    if (debtCreditorInput) debtCreditorInput.value = debt.creditor || '';
    if (debtOriginalAmountInput) debtOriginalAmountInput.value = Number(debt.originalAmount || 0).toFixed(2);
    if (debtNegotiatedAmountInput) debtNegotiatedAmountInput.value = Number(debt.negotiatedAmount || 0) > 0 ? Number(debt.negotiatedAmount || 0).toFixed(2) : '';
    if (debtPaidAmountInput) debtPaidAmountInput.value = Number(debt.paidAmount || 0).toFixed(2);
    if (debtDueDateInput) debtDueDateInput.value = debt.dueDate || '';
    if (debtNextActionDateInput) debtNextActionDateInput.value = debt.nextActionDate || '';
    if (debtStatusInput) debtStatusInput.value = debt.status || 'Atrasado';
    if (debtPriorityInput) debtPriorityInput.value = debt.priority || 'Alta';
    if (debtContactInput) debtContactInput.value = debt.contact || '';
    if (debtNotesInput) debtNotesInput.value = debt.notes || '';
    if (debtSubmitBtn) debtSubmitBtn.textContent = 'Atualizar Credor';
    if (debtCancelEditBtn) debtCancelEditBtn.removeAttribute('hidden');
    if (debtForm && typeof debtForm.scrollIntoView === 'function') {
      debtForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderDebtTable() {
    if (!debtTableBody) return;
    const sorted = debts.slice().sort(function (a, b) {
      const statusWeight = { 'Atrasado': 0, 'Em negociação': 1, 'Acordo ativo': 2, 'Contestar': 3, 'Quitado': 4 };
      const pa = statusWeight[a.status] || 0;
      const pb = statusWeight[b.status] || 0;
      if (pa !== pb) return pa - pb;
      return getDebtRemaining(b) - getDebtRemaining(a);
    });
    if (!sorted.length) {
      debtTableBody.innerHTML = '<tr><td colspan="8">Nenhum credor cadastrado.</td></tr>';
      return;
    }
    debtTableBody.innerHTML = sorted.map(function (debt) {
      const remaining = getDebtRemaining(debt);
      const details = renderMobileInlineDetails([
        renderOptionalFieldDetailsIfPresent(debt.contact, 'Ver contato'),
        renderOptionalFieldDetailsIfPresent(debt.notes, 'Ver acordo')
      ]);
      return '<tr>' +
        '<td><div class="sale-product-cell"><strong class="product-name-cell">' + escapeHtml(debt.creditor || '-') + '</strong>' + details + '</div></td>' +
        '<td><span class="debt-status-badge ' + escapeHtml(String(debt.status || '').toLowerCase().replace(/\s+/g, '-')) + '">' + escapeHtml(debt.status || '-') + '</span></td>' +
        '<td>' + toMoney(debt.originalAmount) + '</td>' +
        '<td>' + toMoney(getDebtBaseAmount(debt)) + '</td>' +
        '<td>' + toMoney(debt.paidAmount) + '</td>' +
        '<td>' + toMoney(remaining) + '</td>' +
        '<td>' + (debt.nextActionDate ? formatDateOnly(debt.nextActionDate) : '-') + '</td>' +
        '<td class="no-print"><div class="actions-inline"><button type="button" class="ghost" data-edit-debt="' + debt.id + '">Editar</button><button type="button" data-delete-debt="' + debt.id + '">Excluir</button></div></td>' +
      '</tr>';
    }).join('');
  }

  function renderDebtGuidance(metrics) {
    const items = [];
    if (!debts.length) {
      items.push({ tone: 'warning', title: 'Mapear todos os credores', text: 'Antes de negociar, tragam tudo para a luz: nome do credor, valor aproximado, atraso e próximo contato. Sem mapa, a dívida governa a casa.' });
    }
    if (metrics.totalRemaining > 0) {
      items.push({ tone: 'critical', title: 'Não negociar no impulso', text: 'Só aceite acordo que cabe no caixa. Um acordo quebrado machuca o nome duas vezes: pela dívida e pela perda de confiança.' });
      items.push({ tone: 'warning', title: 'Priorizar nome sujo e juros', text: 'Comecem por credores que negativaram o CPF, juros maiores ou risco de cobrança agressiva. Pequenas quitações rápidas também dão ânimo.' });
    }
    if (metrics.upcoming > 0) {
      items.push({ tone: 'warning', title: 'Ações vencendo hoje', text: metrics.upcoming + ' credor(es) precisam de contato ou revisão. A disciplina do calendário é parte da cura financeira.' });
    }
    if (metrics.progress >= 100 && debts.length) {
      items.push({ tone: 'ok', title: 'Nome em restauração', text: 'Todos os registros estão quitados. O próximo passo é guardar comprovantes, acompanhar baixa nos birôs e reconstruir crédito sem pressa.' });
    }
    if (metrics.progress > 0 && metrics.progress < 100) {
      items.push({ tone: 'ok', title: 'Progresso real', text: 'Vocês já pagaram ' + toMoney(metrics.totalPaid) + '. Honrar compromissos em ordem abre espaço para paz e prosperidade.' });
    }
    items.push({ tone: 'neutral', title: 'Princípio de teshuvá financeira', text: 'Reparar começa com verdade, plano e retorno ao caminho correto. Sem culpa estéril: cada credor cadastrado vira um passo de libertação.' });
    renderWisdomCards(debtRabbiGuidance, items, 'Cadastre os credores para receber o roteiro de negociação.');
  }

  function refreshDebtFreedom() {
    const metrics = getDebtMetrics();
    if (debtKpiCreditors) debtKpiCreditors.textContent = String(debts.length);
    if (debtKpiOriginal) debtKpiOriginal.textContent = toMoney(metrics.totalOriginal);
    if (debtKpiNegotiated) debtKpiNegotiated.textContent = toMoney(metrics.totalNegotiated);
    if (debtKpiPaid) debtKpiPaid.textContent = toMoney(metrics.totalPaid);
    if (debtKpiRemaining) debtKpiRemaining.textContent = toMoney(metrics.totalRemaining);
    if (debtKpiUpcoming) debtKpiUpcoming.textContent = String(metrics.upcoming);
    if (debtCleanProgress) debtCleanProgress.textContent = metrics.progress + '%';

    let tone = 'neutral';
    let label = 'Mapeamento necessário';
    let message = 'Cadastre cada credor, mesmo valores pequenos. O primeiro milagre financeiro aqui é trocar vergonha por ordem.';
    if (debts.length && metrics.progress >= 100) {
      tone = 'ok';
      label = 'Nome limpo encaminhado';
      message = 'Pendências quitadas no controle. Agora guardem comprovantes, acompanhem baixa nos órgãos de crédito e reconstruam limite com prudência.';
    } else if (metrics.totalRemaining > 0 && metrics.progress >= 40) {
      tone = 'warning';
      label = 'Saída em andamento';
      message = 'Já existe progresso. O foco agora é não quebrar acordos e transformar pagamentos em rotina do casal.';
    } else if (metrics.totalRemaining > 0) {
      tone = 'critical';
      label = 'Vermelho mapeado';
      message = 'A dívida ainda pesa. A prioridade é negociar com verdade, pagar o que cabe e impedir novos atrasos.';
    }
    if (debtStatusPill) {
      debtStatusPill.className = 'wisdom-pill ' + tone;
      debtStatusPill.textContent = label;
    }
    if (debtFreedomMessage) debtFreedomMessage.textContent = message;

    if (debtNegotiationChart) {
      if (!debts.length) {
        drawEmptyCanvas(debtNegotiationChart, 'Cadastre credores para ver a evolução.');
      } else {
        renderHorizontalBarChart(debtNegotiationChart, [
          { label: 'Original', value: metrics.totalOriginal },
          { label: 'Negociado', value: metrics.totalNegotiated },
          { label: 'Pago', value: metrics.totalPaid },
          { label: 'Falta', value: metrics.totalRemaining }
        ], 'Sem dívidas cadastradas');
      }
    }
    if (debtStatusChart) {
      const grouped = {};
      debts.forEach(function (debt) {
        const key = String(debt.status || 'Atrasado');
        grouped[key] = (grouped[key] || 0) + 1;
      });
      const rows = Object.keys(grouped).map(function (key) {
        return { label: key, value: grouped[key] };
      });
      renderHorizontalBarChart(debtStatusChart, rows, 'Sem status cadastrados');
    }
    renderDebtGuidance(metrics);
    renderDebtTable();
  }

  function handleDebtSubmit(event) {
    event.preventDefault();
    const creditor = debtCreditorInput ? String(debtCreditorInput.value || '').trim() : '';
    const originalAmount = Number(debtOriginalAmountInput ? debtOriginalAmountInput.value : 0);
    const negotiatedAmount = Number(debtNegotiatedAmountInput ? debtNegotiatedAmountInput.value : 0);
    const paidAmount = Number(debtPaidAmountInput ? debtPaidAmountInput.value : 0);
    const status = debtStatusInput ? String(debtStatusInput.value || 'Atrasado') : 'Atrasado';
    if (!creditor || originalAmount <= 0) {
      window.alert('Informe credor e valor original da dívida.');
      return;
    }
    if (paidAmount < 0 || negotiatedAmount < 0) {
      window.alert('Valores não podem ser negativos.');
      return;
    }
    const now = new Date().toISOString();
    const debt = {
      id: editingDebtId || generateId(),
      creditor: creditor,
      originalAmount: originalAmount,
      negotiatedAmount: negotiatedAmount,
      paidAmount: paidAmount,
      dueDate: debtDueDateInput ? debtDueDateInput.value : '',
      nextActionDate: debtNextActionDateInput ? debtNextActionDateInput.value : '',
      status: status,
      priority: debtPriorityInput ? String(debtPriorityInput.value || 'Alta') : 'Alta',
      contact: debtContactInput ? String(debtContactInput.value || '').trim() : '',
      notes: debtNotesInput ? String(debtNotesInput.value || '').trim() : '',
      createdAt: editingDebtId ? (debts.find(function (item) { return item.id === editingDebtId; }) || {}).createdAt || now : now,
      updatedAt: now
    };
    if (status === 'Quitado') {
      debt.paidAmount = getDebtBaseAmount(debt);
    }
    if (editingDebtId) {
      debts = debts.map(function (item) { return item.id === editingDebtId ? debt : item; });
    } else {
      debts.push(debt);
    }
    saveDebts();
    resetDebtForm();
    refreshDebtFreedom();
  }

  function handleDebtTableClick(event) {
    if (!event || !event.target) return;
    const editButton = event.target.closest('[data-edit-debt]');
    if (editButton) {
      startDebtEdit(editButton.getAttribute('data-edit-debt'));
      return;
    }
    const deleteButton = event.target.closest('[data-delete-debt]');
    if (deleteButton) {
      const debtId = deleteButton.getAttribute('data-delete-debt');
      if (!window.confirm('Excluir este credor do plano?')) return;
      debts = debts.filter(function (item) { return item.id !== debtId; });
      saveDebts();
      refreshDebtFreedom();
    }
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
    if (personalGaugeEntries) personalGaugeEntries.textContent = toMoney(entries);
    if (personalGaugeExits) personalGaugeExits.textContent = toMoney(exits);
    if (personalGaugeBalance) personalGaugeBalance.textContent = toMoney(balance);
    updateReportInfo();

    // Meta Caixa: compute across all transactions (not only filtered)
    const totalBalance = getTotalBalanceAll();
    const availableBalance = totalBalance - (Number(reservedAmount) || 0);
    const shortage = Math.max(0, (Number(metaCaixaMin) || 0) - availableBalance);
    if (personalKpiMeta) personalKpiMeta.textContent = toMoney(metaCaixaMin);
    if (personalKpiShortage) personalKpiShortage.textContent = toMoney(shortage);
    if (personalKpiShortage && shortage > 0) {
      personalKpiShortage.parentElement && personalKpiShortage.parentElement.classList.add('kpi-focus');
    } else if (personalKpiShortage) {
      personalKpiShortage.parentElement && personalKpiShortage.parentElement.classList.remove('kpi-focus');
    }
    renderProsperityGuidance(list, {
      entries: entries,
      exits: exits,
      balance: balance,
      score: score,
      shortage: shortage
    });

    renderPersonalTemperatureStatus(score, balance);
    renderPersonalGauge(personalGaugeChart, score, entries, exits, balance);

    if (personalGaugeStatus && personalGaugeAdvice) {
      if (entries === 0 && exits === 0) {
        personalGaugeStatus.textContent = 'Estado: Aguardando dados';
        personalGaugeStatus.className = 'status-label';
        personalGaugeAdvice.textContent = 'Informe entradas e saídas para calcular a temperatura financeira.';
      } else if (score < PERSONAL_HEALTH_THRESHOLDS.red) {
        personalGaugeStatus.textContent = 'Estado: Crítico';
        personalGaugeStatus.className = 'status-label critical';
        personalGaugeAdvice.textContent = 'Corte saídas imediatas e busque reforço de renda.';
      } else if (score < PERSONAL_HEALTH_THRESHOLDS.yellow) {
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
      const otherPct = total > 0 ? 100 - businessPct : 0;
      personalFundingNote.textContent = 'Pró-labore: ' + toPercent(businessPct) + ' | Outras fontes: ' + toPercent(otherPct);
    }
    // render meta evolution chart
    if (personalMetaEvolutionChart) {
      loadMetaHistory();
      renderMetaEvolution(personalMetaEvolutionChart, metaHistory || []);
    }
  }

  function savePersonalTransactions() {
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PERSONAL_TRANSACTIONS, personalTransactions);
      return;
    }
    localStorage.setItem(STORAGE_PERSONAL_TRANSACTIONS, JSON.stringify(personalTransactions));
  }

  function savePersonalFilters() {
    const filters = {
      startDate: personalFilterStartDateInput ? personalFilterStartDateInput.value : '',
      endDate: personalFilterEndDateInput ? personalFilterEndDateInput.value : ''
    };
    if (DataModule && typeof DataModule.saveJson === 'function') {
      DataModule.saveJson(localStorage, STORAGE_PERSONAL_FILTERS, filters);
      return;
    }
    localStorage.setItem(STORAGE_PERSONAL_FILTERS, JSON.stringify(filters));
  }

  function loadPersonalTransactions() {
    if (DataModule && typeof DataModule.parseJsonList === 'function') {
      personalTransactions = DataModule.parseJsonList(localStorage, STORAGE_PERSONAL_TRANSACTIONS);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_PERSONAL_TRANSACTIONS);
      personalTransactions = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(personalTransactions)) personalTransactions = [];
    } catch (error) {
      localStorage.removeItem(STORAGE_PERSONAL_TRANSACTIONS);
      personalTransactions = [];
    }
  }

  function loadPersonalFilters() {
    try {
      const raw = localStorage.getItem(STORAGE_PERSONAL_FILTERS);
      const filters = raw ? JSON.parse(raw) : { startDate: '', endDate: '' };
      if (personalFilterStartDateInput) personalFilterStartDateInput.value = String(filters.startDate || '');
      if (personalFilterEndDateInput) personalFilterEndDateInput.value = String(filters.endDate || '');
    } catch (error) {
      localStorage.removeItem(STORAGE_PERSONAL_FILTERS);
      if (personalFilterStartDateInput) personalFilterStartDateInput.value = '';
      if (personalFilterEndDateInput) personalFilterEndDateInput.value = '';
    }
  }

  function saveMetaCaixa() {
    const obj = { min: Number(metaCaixaMin || 0), reserved: Number(reservedAmount || 0) };
    try {
      localStorage.setItem(STORAGE_META_CAIXA, JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  }

  function loadMetaCaixa() {
    try {
      const raw = localStorage.getItem(STORAGE_META_CAIXA);
      const obj = raw ? JSON.parse(raw) : null;
      if (obj && typeof obj === 'object') {
        metaCaixaMin = Number(obj.min || metaCaixaMin);
        reservedAmount = Number(obj.reserved || 0);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_META_CAIXA);
      metaCaixaMin = 5000;
      reservedAmount = 0;
    }
    if (personalKpiMeta) personalKpiMeta.textContent = toMoney(metaCaixaMin);
  }

  function saveMetaHistoryEntry(value, at) {
    try {
      const entry = { ts: (at || new Date()).toISOString(), value: Number(value || 0) };
      metaHistory = metaHistory || [];
      metaHistory.push(entry);
      localStorage.setItem(STORAGE_META_HISTORY, JSON.stringify(metaHistory));
    } catch (e) {
      // ignore
    }
  }

  function loadMetaHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_META_HISTORY);
      metaHistory = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(metaHistory)) metaHistory = [];
    } catch (e) {
      localStorage.removeItem(STORAGE_META_HISTORY);
      metaHistory = [];
    }
  }

  function renderMetaEvolution(canvas, history) {
    if (!canvas) return;
    history = Array.isArray(history) ? history : [];
    const cleanHistory = history
      .map(function (h) {
        return {
          ts: String((h && h.ts) || new Date().toISOString()),
          value: Number((h && h.value) || 0)
        };
      })
      .filter(function (h) { return h.value > 0; });
    if (!cleanHistory.length) {
      cleanHistory.push({ ts: new Date().toISOString(), value: Number(metaCaixaMin || 0) });
    }
    const labels = cleanHistory.map(function (h) { return formatDateOnly(h.ts.slice(0,10)); });
    const values = cleanHistory.map(function (h) { return Number(h.value || 0); });
    renderLineChartCanvas(canvas, labels, [ { label: 'Meta Mínima', color: '#0ea5a4', values: values } ]);
  }

  function getTotalBalanceAll() {
    const entries = personalTransactions.filter(function (item) { return item.type === 'entry'; }).reduce(function (acc, item) { return acc + Number(item.amount || 0); }, 0);
    const exits = personalTransactions.filter(function (item) { return item.type !== 'entry'; }).reduce(function (acc, item) { return acc + Number(item.amount || 0); }, 0);
    return entries - exits;
  }

  function handlePersonalSubmit(event) {
    event.preventDefault();
    if (!personalForm) return;

    const date = toIsoDate(personalDateInput ? personalDateInput.value : '');
    const type = personalTypeInput ? personalTypeInput.value : '';
    const category = personalCategoryInput ? String(personalCategoryInput.value || '').trim() : '';
    const amount = Number(personalAmountInput ? personalAmountInput.value : 0);
    const notes = personalNotesInput ? String(personalNotesInput.value || '').trim() : '';
    const usesBusinessFunds = personalUseBusinessFundsInput ? personalUseBusinessFundsInput.checked : false;
    const fundingSource = personalFundingSourceInput ? String(personalFundingSourceInput.value || '').trim() : '';

    if (!date || !type || !category || amount <= 0) {
      window.alert('Preencha data, tipo, categoria e valor antes de salvar.');
      return;
    }
    if (!usesBusinessFunds && !fundingSource) {
      window.alert('Informe a fonte de financiamento se não usar saldo de Pró-labore.');
      return;
    }

    // Se for saída, verificar se após a saída o disponível fica abaixo da meta caixa
    if (type === 'exit') {
      const projected = getTotalBalanceAll() - Number(amount || 0);
      if ((projected - (Number(reservedAmount) || 0)) < Number(metaCaixaMin || 0)) {
        if (!window.confirm('Este lançamento deixará o caixa disponível abaixo da meta de ' + toMoney(metaCaixaMin) + '. Deseja continuar?')) {
          return;
        }
      }
    }

    const transaction = {
      id: editingPersonalId || generateId(),
      date: date,
      type: type,
      category: category,
      amount: Number(amount || 0),
      notes: notes,
      usesBusinessFunds: usesBusinessFunds,
      fundingSource: usesBusinessFunds ? '' : fundingSource,
      createdAt: new Date().toISOString()
    };

    if (editingPersonalId) {
      personalTransactions = personalTransactions.map(function (item) {
        return item.id === editingPersonalId ? transaction : item;
      });
    } else {
      personalTransactions.push(transaction);
    }

    savePersonalTransactions();
    resetPersonalForm();
    refreshPersonalFinance();
  }

  function handlePersonalTableClick(event) {
    if (!event || !event.target) return;
    const editButton = event.target.closest('[data-edit-personal]');
    if (editButton) {
      const personalId = editButton.getAttribute('data-edit-personal');
      startPersonalEdit(personalId);
      return;
    }
    const deleteButton = event.target.closest('[data-delete-personal]');
    if (deleteButton) {
      const personalId = deleteButton.getAttribute('data-delete-personal');
      if (!window.confirm('Excluir este lançamento pessoal?')) return;
      personalTransactions = personalTransactions.filter(function (item) { return item.id !== personalId; });
      savePersonalTransactions();
      refreshPersonalFinance();
    }
  }

  function handleClearTransactions() {
    if (!window.confirm('Limpar todos os lançamentos pessoais? Esta ação não pode ser desfeita.')) return;
    personalTransactions = [];
    savePersonalTransactions();
    refreshPersonalFinance();
  }

  function init() {
    if (personalDateInput) personalDateInput.value = new Date().toISOString().slice(0, 10);
    loadPersonalTransactions();
    loadPersonalFilters();
    loadMetaCaixa();
    loadMetaHistory();
    loadDebts();
    resetDebtForm();
    if (personalForm) personalForm.addEventListener('submit', handlePersonalSubmit);
    if (debtForm) debtForm.addEventListener('submit', handleDebtSubmit);
    if (debtCancelEditBtn) debtCancelEditBtn.addEventListener('click', function () {
      resetDebtForm();
    });
    if (personalCancelEditBtn) personalCancelEditBtn.addEventListener('click', function () {
      resetPersonalForm();
    });
    if (personalReserveBtn) personalReserveBtn.addEventListener('click', function () {
      const total = getTotalBalanceAll();
      if (!reservedAmount || reservedAmount === 0) {
        if (total >= metaCaixaMin) {
          reservedAmount = Number(metaCaixaMin);
          saveMetaCaixa();
          refreshPersonalFinance();
          window.alert('Meta caixa marcada como reservada (indicador local).');
        } else {
          window.alert('Saldo insuficiente para reservar a meta caixa.');
        }
      } else {
        reservedAmount = 0;
        saveMetaCaixa();
        refreshPersonalFinance();
        window.alert('Reserva de meta caixa removida.');
      }
    });
    if (personalEditMetaBtn) personalEditMetaBtn.addEventListener('click', function () {
      const raw = window.prompt('Informe o valor mínimo para Meta Caixa (em R$).', String(metaCaixaMin));
      if (!raw) return;
      const v = Number(String(raw).replace(/[^0-9\,\.]/g, '').replace(',', '.'));
      if (Number.isNaN(v) || v < 0) {
        window.alert('Valor inválido.');
        return;
      }
      metaCaixaMin = Math.round(v * 100) / 100;
      saveMetaCaixa();
      saveMetaHistoryEntry(metaCaixaMin);
      refreshPersonalFinance();
      window.alert('Meta Caixa atualizada para ' + toMoney(metaCaixaMin));
    });
    // update meta evolution chart initially
    if (personalMetaEvolutionChart) renderMetaEvolution(personalMetaEvolutionChart, metaHistory || []);
    if (personalApplyFiltersBtn) personalApplyFiltersBtn.addEventListener('click', function () { savePersonalFilters(); refreshPersonalFinance(); });
    if (personalClearFiltersBtn) personalClearFiltersBtn.addEventListener('click', function () {
      if (personalFilterStartDateInput) personalFilterStartDateInput.value = '';
      if (personalFilterEndDateInput) personalFilterEndDateInput.value = '';
      savePersonalFilters();
      refreshPersonalFinance();
    });
    if (exportReportPdfBtn) exportReportPdfBtn.addEventListener('click', handleExportReportPdf);
    if (personalTableBody) personalTableBody.addEventListener('click', handlePersonalTableClick);
    if (debtTableBody) debtTableBody.addEventListener('click', handleDebtTableClick);
    if (clearPersonalTransactionsBtn) clearPersonalTransactionsBtn.addEventListener('click', handleClearTransactions);
    tabButtons.forEach(function (button) {
      button.setAttribute('role', 'tab');
      button.addEventListener('click', function () {
        activateScreen(button.getAttribute('data-tab-target'));
      });
    });
    window.addEventListener('beforeprint', preparePrintReport);
    window.addEventListener('afterprint', restorePrintReport);
    window.addEventListener('resize', function () {
      refreshPersonalFinance();
      refreshDebtFreedom();
    });
    refreshPersonalFinance();
    refreshDebtFreedom();
  }

  init();
})();
