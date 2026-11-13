/**
 * Superbag Londrina — Interações da Landing Page
 */

const WHATSAPP_NUMBER = '554333242211';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initPhoneMask();
  initProductSelection();
  initQuoteForm();
  initOperationVideo();
  initScrollReveal();
});

/**
 * 1. Header Scroll State
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * 2. Mobile Menu Toggle
 */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 3. Smooth Phone Mask (DD) 9XXXX-XXXX
 */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 11 && digits.startsWith('55')) {
        digits = digits.slice(2);
      }
      digits = digits.slice(0, 11);
      if (digits.length > 6) {
        const prefixLen = digits.length === 11 ? 7 : 6;
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2, prefixLen)}-${digits.slice(prefixLen)}`;
      } else if (digits.length > 2) {
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length > 0) {
        e.target.value = `(${digits}`;
      } else {
        e.target.value = '';
      }
    });
  });
}

/**
 * 4. Product Card CTA -> Pre-fill Lead Form & Smooth Scroll
 */
function initProductSelection() {
  const buttons = document.querySelectorAll('[data-select-product]');
  const selects = document.querySelectorAll('#lead-product, #bottom-lead-product');
  const nameInput = document.getElementById('lead-name');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenProduct = btn.getAttribute('data-select-product');
      if (!chosenProduct) return;

      selects.forEach((productSelect) => {
        let matched = false;
        Array.from(productSelect.options).forEach((opt) => {
          if (opt.value === chosenProduct) {
            productSelect.value = chosenProduct;
            matched = true;
          }
        });

        if (!matched) {
          const customOpt = document.createElement('option');
          customOpt.value = chosenProduct;
          customOpt.textContent = chosenProduct;
          productSelect.appendChild(customOpt);
          productSelect.value = chosenProduct;
        }
      });

      const heroForm = document.getElementById('quote-form');
      if (heroForm) {
        heroForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => nameInput?.focus(), 450);
      }
    });
  });
}

/**
 * 5. Lead Quote Forms (Hero & Bottom) -> Direct Backend Email Dispatch
 */
function readUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source')?.trim() || '',
    utm_medium: params.get('utm_medium')?.trim() || '',
    utm_campaign: params.get('utm_campaign')?.trim() || '',
    utm_content: params.get('utm_content')?.trim() || '',
    utm_term: params.get('utm_term')?.trim() || '',
  };
}

function setFormError(feedbackEl, message, includeFallback = false) {
  if (!feedbackEl) return;
  feedbackEl.className = 'form-feedback is-error';
  feedbackEl.textContent = message;

  if (includeFallback) {
    const link = document.createElement('a');
    link.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'falar direto no WhatsApp';
    feedbackEl.append(' Se preferir, tente ', link, '.');
  }

  feedbackEl.hidden = false;
}

function clearFormFeedback(feedbackEl) {
  if (!feedbackEl) return;
  feedbackEl.textContent = '';
  feedbackEl.hidden = true;
}

function buildWhatsAppMessage(payload) {
  return [
    'Olá, equipe comercial da *Superbag Londrina*!',
    'Acabei de enviar uma solicitação de cotação pelo site:',
    '',
    `• *Nome/Empresa:* ${payload.name}`,
    `• *WhatsApp:* ${payload.phone}`,
    `• *Produto de interesse:* ${payload.product}`,
    `• *Quantidade estimada:* ${payload.qty}`,
  ].join('\n');
}

function initQuoteForm() {
  const forms = document.querySelectorAll('#quote-form, #bottom-quote-form');
  if (!forms.length) return;

  forms.forEach((form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn?.querySelector('span');
    const defaultBtnText = submitLabel?.textContent || 'Solicitar Orçamento';
    const feedbackEl = form.querySelector('.form-feedback');

    window.addEventListener('pageshow', () => {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = defaultBtnText;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormFeedback(feedbackEl);

      const name = form.querySelector('[name="name"]')?.value?.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value?.trim() || '';
      const product = form.querySelector('[name="product"]')?.value?.trim() || '';
      const qty = form.querySelector('[name="qty"]')?.value?.trim() || 'A definir';
      const hp = form.querySelector('[name="website_url_hp"]')?.value || '';

      if (name.length < 2) {
        setFormError(feedbackEl, 'Informe seu nome ou empresa.');
        form.querySelector('[name="name"]')?.focus();
        return;
      }

      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setFormError(feedbackEl, 'Informe um WhatsApp ou telefone válido com DDD.');
        form.querySelector('[name="phone"]')?.focus();
        return;
      }

      if (!product) {
        setFormError(feedbackEl, 'Selecione a linha de produto de interesse.');
        form.querySelector('[name="product"]')?.focus();
        return;
      }

      const sourceForm = form.id === 'quote-form' ? 'hero' : 'bottom';
      const payload = {
        name,
        phone,
        product,
        qty,
        source_form: sourceForm,
        website_url_hp: hp,
        page_url: window.location.href,
        referrer: document.referrer || '',
        ...readUtmParams(),
      };

      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Enviando solicitação...';

      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setFormError(
            feedbackEl,
            data.error || 'Não foi possível enviar sua solicitação agora.',
            res.status >= 500
          );
          if (submitBtn) submitBtn.disabled = false;
          if (submitLabel) submitLabel.textContent = defaultBtnText;
          return;
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submit',
          form_id: sourceForm,
          product,
          lead_id: data.leadId || null,
        });

        try {
          sessionStorage.setItem(
            'superbag_last_lead',
            JSON.stringify({
              leadId: data.leadId || null,
              name,
              phone,
              product,
              qty,
              source_form: sourceForm,
              waText: buildWhatsAppMessage(payload),
            })
          );
        } catch {
          // Ignora indisponibilidade de sessionStorage em navegação privada restrita.
        }

        window.location.assign('/obrigada');
      } catch {
        setFormError(
          feedbackEl,
          'Falha de conexão ao enviar sua solicitação.',
          true
        );
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = defaultBtnText;
      }
    });
  });
}

/**
 * 6. Dedicated Operation Video Controls & Viewport Auto-Pause
 */
function initOperationVideo() {
  const video = document.getElementById('superbag-operation-video');
  const soundBtn = document.getElementById('video-sound-toggle');
  const soundLabel = document.getElementById('video-sound-label');
  const playBtn = document.getElementById('video-play-toggle');

  if (!video || !soundBtn || !playBtn) return;

  const syncPlayUI = () => {
    const paused = video.paused;
    playBtn.classList.toggle('is-paused', paused);
    playBtn.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  };

  const syncSoundUI = () => {
    const unmuted = !video.muted;
    soundBtn.classList.toggle('is-unmuted', unmuted);
    soundBtn.setAttribute('aria-pressed', String(unmuted));
    soundBtn.setAttribute('aria-label', unmuted ? 'Silenciar áudio do vídeo' : 'Ativar áudio do vídeo');
    if (soundLabel) {
      soundLabel.textContent = unmuted ? 'Som ativo' : 'Ativar som';
    }
  };

  const toggleSound = () => {
    if (video.muted) {
      video.muted = false;
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.muted = true;
    }
    syncSoundUI();
    syncPlayUI();
  };

  const togglePlay = () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    syncPlayUI();
  };

  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSound();
  });

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  video.addEventListener('click', () => {
    if (video.muted) {
      toggleSound();
    } else {
      togglePlay();
    }
  });

  video.addEventListener('play', syncPlayUI);
  video.addEventListener('pause', syncPlayUI);

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    videoObserver.observe(video);
  }
}

/**
 * 6. Scroll Reveal Observer
 */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}
