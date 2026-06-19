// 2026年サマーコースお申し込みフォーム 送信ハンドラ (Googleフォーム連携)

// ▼ コースごとに設定するのはこの2つだけ (プレイブック準拠)
// ※ 本番用のGoogleフォームを作成後、以下の URL と entry.ID を差し替えてください。
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScI2pFrwUCmW0R5rN3Rj2wED6JGzyP1rEQ4vumf-TwD2CstnQ/formResponse';
const FIELD_MAP = {
  // 'LPのname属性': 'Googleフォームのentry.ID'（質問順＝LP項目順。prefill 1〜7 で取得）
  'parent-name':   'entry.679370873',
  'child-name':    'entry.765484457',
  'child-grade':   'entry.1103397327',
  'email':         'entry.1516849777',
  'phone':         'entry.170209855',
  'course-choice': 'entry.173148745',
  'message':       'entry.845920842',
};

const applyForm = document.getElementById('apply-form');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('btn-submit-form');

const setStatus = (type, msg) => {
  if (!type) {
    formStatus.style.display = 'none';
    formStatus.className = 'form-status-msg';
    formStatus.textContent = '';
    return;
  }
  formStatus.className = 'form-status-msg ' + type;
  formStatus.textContent = msg;
  formStatus.style.display = 'block';
};

const isConfigured = () =>
  !GOOGLE_FORM_ACTION.includes('＜FORM_ID＞') &&
  !Object.values(FIELD_MAP).some(v => v.includes('000000000'));

if (applyForm) {
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // バリデーションチェック
    if (!applyForm.checkValidity()) {
      applyForm.reportValidity();
      return;
    }

    // キャンセルポリシー同意チェック（明示的なカスタム検証）
    const policyAgree = document.getElementById('policy-agree');
    if (policyAgree && !policyAgree.checked) {
      setStatus('error', 'お申し込みにはキャンセルポリシーへの同意が必要です。');
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = '送信中...';
    setStatus('', '');

    const src = new FormData(applyForm);
    const payload = new FormData();
    for (const [name, entryId] of Object.entries(FIELD_MAP)) {
      const v = src.get(name);
      if (v !== null && v !== '') {
        payload.append(entryId, v);
      }
    }

    const done = () => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      setStatus('success', 'お申し込みを受け付けました。ご入力いただいたメールアドレス宛てに控えメールを自動送信いたしました。担当より追ってご連絡いたします。');
      applyForm.reset();
    };

    if (isConfigured()) {
      // 本番動作用：GoogleフォームのレスポンスエンドポイントへPOST送信
      fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        body: payload
      })
      .then(done)
      .catch((error) => {
        console.error('送信エラー:', error);
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        setStatus('error', '送信に失敗しました。ネットワーク状況を確認の上、時間をおいて再度お試しください。');
      });
    } else {
      // Googleフォーム未設定時：成功と誤認させないよう、プレビュー（準備中）を明示する。
      // ※ 本番運用前に GOOGLE_FORM_ACTION と FIELD_MAP を実値へ差し替えること。
      console.warn('[apply-form] Googleフォーム未設定。プレビュー（準備中）モードで動作しています。本番運用の際は GOOGLE_FORM_ACTION と FIELD_MAP を設定してください。');
      console.log('送信データ（擬似）:');
      for (const [name, entryId] of Object.entries(FIELD_MAP)) {
        console.log(`${name} (${entryId}) => ${src.get(name)}`);
      }
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        setStatus('error', '【プレビュー】申込フォームは現在準備中です。送信内容は記録されていません。お急ぎの場合はお電話（03-5426-3006）またはメールにてお問い合わせください。');
      }, 800);
    }
  });
}
