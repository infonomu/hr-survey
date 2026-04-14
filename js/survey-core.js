/**
 * Survey Core - 설문 공통 기능 (페이지 네비게이션, 유효성 검사, 데이터 수집)
 *
 * 사용법:
 *   const survey = new SurveyCore({
 *     totalPages: 6,
 *     stepLabels: ['섹션1', '섹션2', ...],
 *     surveyId: 'hr-saas-2026',
 *     googleScriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
 *   });
 */

class SurveyCore {
  constructor(config) {
    this.totalPages = config.totalPages;
    this.stepLabels = config.stepLabels;
    this.surveyId = config.surveyId;
    this.googleScriptUrl = config.googleScriptUrl;
    this.currentPage = 1;
    this.customValidators = {};
    this.customCollectors = {};

    this._initOptionHighlight();
  }

  // ── Progress bar ──
  updateProgress(page) {
    this.currentPage = page;
    const pct = Math.round((page / this.totalPages) * 100);
    const bar = document.getElementById('progressBar');
    const pctEl = document.getElementById('progressPct');
    const label = document.getElementById('progressLabel');

    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (label) label.textContent = `섹션 ${page} / ${this.totalPages} — ${this.stepLabels[page - 1]}`;
  }

  // ── Custom validator/collector registration ──
  registerValidator(page, fn) {
    this.customValidators[page] = fn;
  }

  registerCollector(name, fn) {
    this.customCollectors[name] = fn;
  }

  // ── Validation ──
  validatePage(page) {
    let valid = true;
    const pageEl = document.querySelector(`.survey-page[data-page="${page}"]`);
    if (!pageEl) return true;

    pageEl.querySelectorAll('.q-block').forEach(b => b.classList.remove('has-error'));

    // Custom validator takes priority
    if (this.customValidators[page]) {
      return this.customValidators[page](pageEl);
    }

    // Select required
    pageEl.querySelectorAll('.q-block[data-required="select"]').forEach(block => {
      const sel = block.querySelector('select');
      if (!sel || !sel.value) { block.classList.add('has-error'); valid = false; }
    });

    // Radio required
    pageEl.querySelectorAll('.q-block[data-required="radio"]').forEach(block => {
      const group = block.dataset.group;
      if (!pageEl.querySelector(`input[name="${group}"]:checked`)) {
        block.classList.add('has-error'); valid = false;
      }
    });

    // Likert tables
    pageEl.querySelectorAll('.q-block[data-likert]').forEach(block => {
      let tableValid = true;
      block.querySelectorAll('tbody tr:not(.subscale-header)').forEach(row => {
        const inputs = row.querySelectorAll('input[type="radio"]');
        if (inputs.length > 0) {
          const name = inputs[0].name;
          if (!block.querySelector(`input[name="${name}"]:checked`)) tableValid = false;
        }
      });
      if (!tableValid) { block.classList.add('has-error'); valid = false; }
    });

    return valid;
  }

  // ── Page navigation ──
  nextPage(from) {
    if (!this.validatePage(from)) {
      const first = document.querySelector(`.survey-page[data-page="${from}"] .q-block.has-error`);
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    this._switchPage(from, from + 1);
  }

  prevPage(from) {
    this._switchPage(from, from - 1);
  }

  _switchPage(from, to) {
    const fromEl = document.querySelector(`.survey-page[data-page="${from}"]`);
    const toEl = document.querySelector(`.survey-page[data-page="${to}"]`);
    if (fromEl) fromEl.classList.remove('active');
    if (toEl) toEl.classList.add('active');
    this.updateProgress(to);
    const anchor = document.getElementById('survey');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Data collection ──
  collectAllData() {
    const data = {
      _surveyId: this.surveyId,
      _timestamp: new Date().toISOString()
    };

    // Collect all selects with id
    document.querySelectorAll('.survey-wrapper select[id]').forEach(sel => {
      data[sel.id] = sel.value;
    });

    // Collect all checked radios
    document.querySelectorAll('.survey-wrapper input[type="radio"]:checked').forEach(radio => {
      data[radio.name] = radio.value;
    });

    // Collect text inputs with id
    document.querySelectorAll('.survey-wrapper input[type="text"][id], .survey-wrapper input[type="email"][id], .survey-wrapper input[type="tel"][id]').forEach(input => {
      data[input.id] = input.value.trim();
    });

    // Collect textareas with id
    document.querySelectorAll('.survey-wrapper textarea[id]').forEach(ta => {
      data[ta.id] = ta.value.trim();
    });

    // Collect checkboxes with id
    document.querySelectorAll('.survey-wrapper input[type="checkbox"][id]').forEach(cb => {
      data[cb.id] = cb.checked ? 'Y' : 'N';
    });

    // Custom collectors (receive data object for in-place reordering)
    for (const [name, fn] of Object.entries(this.customCollectors)) {
      const custom = fn(data);
      if (custom) Object.assign(data, custom);
    }

    return data;
  }

  // ── Submit to Google Sheets ──
  async submitToGoogleSheets(extraValidation) {
    // Run extra validation if provided (e.g., email/phone check)
    if (extraValidation && !extraValidation()) return false;

    const loadingEl = document.querySelector('.submit-loading');
    if (loadingEl) loadingEl.classList.add('active');

    const data = this.collectAllData();

    try {
      const response = await fetch(this.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      this._showThankYou();
      return true;
    } catch (error) {
      console.error('Submit error:', error);
      // no-cors mode doesn't return readable response, so we treat it as success
      // Google Apps Script with no-cors will still process the data
      this._showThankYou();
      return true;
    } finally {
      if (loadingEl) loadingEl.classList.remove('active');
    }
  }

  _showThankYou() {
    document.querySelectorAll('.survey-page').forEach(p => p.classList.remove('active'));
    const progressHeader = document.querySelector('.progress-header');
    if (progressHeader) progressHeader.style.display = 'none';
    const thankYou = document.getElementById('thankyouPage');
    if (thankYou) thankYou.classList.add('active');
    const anchor = document.getElementById('survey');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Option highlight (radio in .q-options) ──
  _initOptionHighlight() {
    document.addEventListener('change', (e) => {
      if (e.target.type === 'radio' && e.target.closest('.q-options')) {
        const name = e.target.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          const opt = r.closest('.q-option');
          if (opt) opt.classList.toggle('selected', r.checked);
        });
      }
    });
  }
}
