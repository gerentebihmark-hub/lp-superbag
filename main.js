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
      let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
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
 * 5. Lead Quote Forms (Hero & Bottom) -> Direct WhatsApp Dispatch
 */
function initQuoteForm() {
  const forms = document.querySelectorAll('#quote-form, #bottom-quote-form');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]')?.value?.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value?.trim() || '';
      const product = form.querySelector('[name="product"]')?.value?.trim() || 'Big Bags / Sacarias';
      const qty = form.querySelector('[name="qty"]')?.value?.trim() || 'A definir';

      const message = [
        'Olá, equipe comercial da *Superbag Londrina*!',
        'Solicito uma cotação pelo site:',
        '',
        `• *Nome/Empresa:* ${name}`,
        `• *WhatsApp:* ${phone}`,
        `• *Produto de interesse:* ${product}`,
        `• *Quantidade estimada:* ${qty}`
      ].join('\n');

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
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
