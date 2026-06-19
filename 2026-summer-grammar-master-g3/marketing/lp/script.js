/* ============================================================
   中3文法マスターコース with Pomodoro — LP スクリプト
   1) 申込フォーム送信（Googleフォーム "データ箱" 連携）
   2) スクロール表示アニメーション
   ------------------------------------------------------------
   フォーム連携の手順は marketing/lp/apply_form_setup.md を参照。
   下の GOOGLE_FORM_ACTION / FIELD_MAP の2つだけ差し替えれば本番稼働します。
   未設定の間はデモ動作（送信は記録されません）。
   ============================================================ */

/* ▼ コースごとに設定するのはこの2つだけ ───────────────── */
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/＜FORM_ID＞/formResponse';
const FIELD_MAP = {
  // 'LPのname': 'entry.ID'
  'parent-name':  'entry.000000000',
  'student-name': 'entry.000000000',
  'grade':        'entry.000000000',
  'phone':        'entry.000000000',
  'email':        'entry.000000000',
  'message':      'entry.000000000',
};
/* ───────────────────────────────────────────────────────── */

const applyForm    = document.getElementById('apply-form');
const formStatus   = document.getElementById('form-status');
const submitButton = document.getElementById('btn-submit-form');

const setStatus = (type, msg) => {
  if (!formStatus) return;
  formStatus.className = 'form-status-msg' + (type ? ' ' + type : '');
  formStatus.textContent = msg;
};

const isConfigured = () =>
  !GOOGLE_FORM_ACTION.includes('＜FORM_ID＞') &&
  !Object.values(FIELD_MAP).some(v => v.includes('000000000'));

if (applyForm) {
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!applyForm.checkValidity()) { applyForm.reportValidity(); return; }

    submitButton.disabled = true;
    const original = submitButton.textContent;
    submitButton.textContent = '送信中...';
    setStatus('', '');

    const src = new FormData(applyForm);
    const payload = new FormData();
    for (const [name, entryId] of Object.entries(FIELD_MAP)) {
      const v = src.get(name);
      if (v !== null && v !== '') payload.append(entryId, v);
    }

    const done = () => {
      submitButton.disabled = false;
      submitButton.textContent = original;
      setStatus('success', 'お申し込みを受け付けました。担当より追ってご連絡いたします。');
      applyForm.reset();
    };

    if (isConfigured()) {
      fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: payload })
        .then(done)
        .catch(() => {
          submitButton.disabled = false;
          submitButton.textContent = original;
          setStatus('error', '送信に失敗しました。時間をおいて再度お試しいただくか、お電話・メールでご連絡ください。');
        });
    } else {
      console.warn('[apply-form] Googleフォーム未設定。GOOGLE_FORM_ACTION/FIELD_MAP を設定してください（apply_form_setup.md 参照）。');
      setTimeout(done, 800); // 未設定時はデモ動作（記録されません）
    }
  });
}

/* ── スクロール表示アニメーション ───────────────────────── */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}
