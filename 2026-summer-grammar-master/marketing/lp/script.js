/* ============================================================
   中1文法マスターコース with Pomodoro — LP スクリプト
   1) 申込フォーム送信（Googleフォーム "データ箱" 連携）
   2) スクロール表示アニメーション
   ------------------------------------------------------------
   フォーム連携の手順は marketing/lp/apply_form_setup.md を参照。
   下の GOOGLE_FORM_ACTION / FIELD_MAP の2つだけ差し替えれば本番稼働します。
   未設定の間はデモ動作（送信は記録されません）。
   ============================================================ */

/* ▼ コースごとに設定するのはこの2つだけ ───────────────── */
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSe3sQ_2vTGoBQKFEY3hHoyjikGI7oLvPe7lajggHv20OM2GDA/formResponse';
const FIELD_MAP = {
  // 'LPのname': 'entry.ID'（Googleフォームの質問順＝LP項目順で対応。prefill 1〜6 で取得）
  'parent-name':  'entry.1636043139',
  'student-name': 'entry.1547602997',
  'grade':        'entry.161042839',
  'phone':        'entry.1881063438',
  'email':        'entry.714027678',
  'message':      'entry.936693703',
};
/* ───────────────────────────────────────────────────────── */

/* ▼ コンバージョン計測の設定 ─────────────────────────────────
   index.html <head> の gtag.js（GA4 + Google広告）と連動。
   ・GA4_ENABLED        … GA4 の generate_lead を送るか（全流入で送信。流入元はGA4側で分離）
   ・ADS_CONVERSION_SEND_TO … Google広告のコンバージョン送信先 'AW-XXXXXXXXX/ラベル'。
        コンバージョンアクション作成画面の「タグを自分で追加する > gtag」に表示される
        send_to の値をそのまま貼り付ける。XXXX を含む間は発火しない（=未設定スキップ）。
   ・CONVERSION_VALUE   … 1件あたりの金額（ROAS算出用）。通常¥30,000／早割期間は27000に変更可。
   ※ ポータル/内部配布からの流入は gclid を持たないため、タグが発火しても
      Google広告側で広告CVには計上されない（アトリビューションが自動判定）。 */
const GA4_ENABLED            = true;
const ADS_CONVERSION_SEND_TO = 'AW-10891662628/rLtzCI3ag4AbEKSqxsko';
const CONVERSION_VALUE       = 30000;

/* 申込フォーム送信成功時に1回だけ呼ぶ。計測失敗は申込完了をブロックしない。 */
const fireConversions = () => {
  try {
    if (typeof window.gtag !== 'function') return;
    // GA4：全申込をリードとして記録（source/medium はGA4が自動付与＝後から流入元別に分離可能）
    if (GA4_ENABLED) {
      window.gtag('event', 'generate_lead', {
        currency: 'JPY',
        value: CONVERSION_VALUE,
        course: 'chu1-grammar-pomodoro',
      });
    }
    // Google広告：コンバージョン。gclidのある広告クリック由来のみ計上される（ポータル流入は除外）
    if (ADS_CONVERSION_SEND_TO && !ADS_CONVERSION_SEND_TO.includes('XXXX')) {
      window.gtag('event', 'conversion', {
        send_to: ADS_CONVERSION_SEND_TO,
        value: CONVERSION_VALUE,
        currency: 'JPY',
      });
    }
  } catch (err) {
    console.warn('[apply-form] コンバージョン計測の発火に失敗（申込自体は完了）:', err);
  }
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

    const done = (isRealSubmit) => {
      submitButton.disabled = false;
      submitButton.textContent = original;
      setStatus('success', 'お申し込みを受け付けました。ご入力のメールアドレス宛てに「控えメール」を自動送信しています。数分たっても控えメールが届かない場合は、受付ができていない可能性がありますので、お手数ですが info.winbe.umegaoka@gmail.com までご連絡ください。（迷惑メール・プロモーションタブもご確認ください）');
      // 本番送信（Googleフォームへ実際にPOST）が成功した時のみコンバージョンを計測。
      // デモ動作（フォーム未設定）では発火しない。
      if (isRealSubmit) fireConversions();
      applyForm.reset();
    };

    if (isConfigured()) {
      fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: payload })
        .then(() => done(true))   // 本番送信成功 → コンバージョン計測あり
        .catch(() => {
          submitButton.disabled = false;
          submitButton.textContent = original;
          setStatus('error', '送信に失敗しました。時間をおいて再度お試しいただくか、お電話・メールでご連絡ください。');
        });
    } else {
      console.warn('[apply-form] Googleフォーム未設定。GOOGLE_FORM_ACTION/FIELD_MAP を設定してください（apply_form_setup.md 参照）。');
      setTimeout(() => done(false), 800); // 未設定時はデモ動作（記録もコンバージョン計測もされません）
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
