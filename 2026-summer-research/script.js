document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     Header Scroll Effect
     ========================================================================== */
  const header = document.getElementById('main-header');
  
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();


  /* ==========================================================================
     Mobile Navigation Menu
     ========================================================================== */
  const menuToggle = document.getElementById('btn-mobile-menu');
  const mainNav = document.getElementById('main-nav');
  const navLinks = mainNav.querySelectorAll('a');

  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    
    if (mainNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('active')) {
        toggleMenu();
      }
    });
  });


  /* ==========================================================================
     Schedule Tabs (Day Switcher)
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedDay = button.getAttribute('data-day');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      const targetPanel = document.querySelector(`.tab-panel[data-day="${selectedDay}"]`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });


  /* ==========================================================================
     FAQ Accordion Control
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });


  /* ==========================================================================
     Terms / Cancellation Policy Link
     ========================================================================== */
  const termsLink = document.getElementById('terms-link');
  const termsDetails = document.querySelector('.terms-details');

  if (termsLink && termsDetails) {
    const openTerms = (e) => {
      e.preventDefault();
      e.stopPropagation();
      termsDetails.open = true;
      termsDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    termsLink.addEventListener('click', openTerms);
    // Keyboard activation (Enter / Space) since this <a> has no href
    termsLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        openTerms(e);
      }
    });
  }


  /* ==========================================================================
     Scroll Reveal Animation (Intersection Observer)
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-up'
  );

  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(element => {
    revealOnScroll.observe(element);
  });


  /* ==========================================================================
     Gentle Parallax Mouse Interaction for Background Watercolor Orbs
     ========================================================================== */
  const orbs = {
    orb1: document.getElementById('bg-orb-1'),
    orb2: document.getElementById('bg-orb-2'),
    orb3: document.getElementById('bg-orb-3')
  };

  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    // Shift orbs very gently for a subtle light-theme effect
    if (orbs.orb1) {
      orbs.orb1.style.transform = `translate(${mouseX * 25}px, ${mouseY * 25}px) scale(1)`;
    }
    if (orbs.orb2) {
      orbs.orb2.style.transform = `translate(${mouseX * -30}px, ${mouseY * -30}px) scale(1.05)`;
    }
    if (orbs.orb3) {
      orbs.orb3.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px) scale(0.95)`;
    }
  });


  /* ==========================================================================
     Application Form → Google Forms 送信
     --------------------------------------------------------------------------
     ▼▼▼ 設定はここだけ ▼▼▼
     1) Googleフォームを作成（項目は docs/apply_form_setup.md 参照）
     2) フォームの「事前入力したURLを取得」で各項目の entry.XXXXXXX を調べる
     3) 下の GOOGLE_FORM_ACTION と FIELD_MAP に貼り付ける
        - GOOGLE_FORM_ACTION: フォームURLの末尾 viewform → formResponse に変える
        - FIELD_MAP: 左がこのLPの項目名（変更不可）、右がGoogleの entry.XXXXXXX
     未設定（PASTE_... のまま）の間は、送信は記録されず画面だけ成功表示になります。
     ========================================================================== */
  const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdnPhS4uY3WTnU1yxiPD3IOF1OcLoMmGrGX6qXA7FZl9RHgow/formResponse';

  const FIELD_MAP = {
    'parent-name':   'entry.752585946',   // 保護者氏名
    'student-name':  'entry.1994788581',  // お子様氏名
    'student-kana':  'entry.375791212',   // ふりがな
    'student-grade': 'entry.393125758',   // 学年
    'email':         'entry.241606270',   // メール
    'tel':           'entry.896728426',   // 電話
    'status':        'entry.610315389',   // 新規/在籍
    'track1':        'entry.731741117',   // 第1希望トラック
    'track2':        'entry.1372744177',  // 第2希望トラック
    'allergy':       'entry.1633929541',  // アレルギー・配慮
    'photo-consent': 'entry.741448726',   // 写真掲載可否
    'message':       'entry.1095227754',  // ご質問・ご要望
    'agree':         'entry.268083157'    // 同意
  };

  const isFormConfigured = () =>
    !GOOGLE_FORM_ACTION.startsWith('PASTE_') &&
    !Object.values(FIELD_MAP).some(v => v.includes('PASTE_ID'));

  const applyForm = document.getElementById('apply-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.getElementById('btn-submit-form');

  const setStatus = (type, msg) => {
    formStatus.className = 'form-status-msg' + (type ? ' ' + type : '');
    formStatus.textContent = msg;
  };

  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // ネイティブのバリデーション（必須・メール形式・ラジオ・同意チェック）
      if (!applyForm.checkValidity()) {
        applyForm.reportValidity();
        return;
      }

      submitButton.disabled = true;
      const originalBtnText = submitButton.textContent;
      submitButton.textContent = '送信中...';
      setStatus('', '');

      // LPの項目名 → Googleの entry.ID に詰め替え
      const src = new FormData(applyForm);
      const payload = new FormData();
      for (const [localName, entryId] of Object.entries(FIELD_MAP)) {
        const value = src.get(localName);
        if (value !== null && value !== '') {
          payload.append(entryId, value);
        }
      }

      // 控えメールは Google 側の Apps Script（onFormSubmit）が、保護者の入力
      // メール（entry.241606270）宛に自動返信する。詳細は docs/apply_form_setup.md。

      const finish = () => {
        submitButton.disabled = false;
        submitButton.textContent = originalBtnText;
        setStatus('success', 'お申し込みを受け付けました。ご入力のメールアドレス宛てに「控えメール」を自動送信しています。数分たっても控えメールが届かない場合は、受付ができていない可能性がありますので、お手数ですが info.winbe.umegaoka@gmail.com までご連絡ください。（迷惑メール・プロモーションタブもご確認ください）');
        applyForm.reset();
      };

      if (isFormConfigured()) {
        // no-cors 送信（Googleフォームは応答を返さないため fire-and-forget）
        fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: payload })
          .then(finish)
          .catch(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalBtnText;
            setStatus('error', '送信に失敗しました。お手数ですが、お電話または時間をおいて再度お試しください。');
          });
      } else {
        // 未設定（デモ）：実送信せず成功表示のみ
        console.warn('[apply-form] Googleフォーム未設定のため送信はスキップされました。script.js の GOOGLE_FORM_ACTION / FIELD_MAP を設定してください。');
        setTimeout(finish, 800);
      }
    });
  }

});
