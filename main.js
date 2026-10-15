/**
 * Superbag Londrina — Interações da Landing Page
 */

const WHATSAPP_NUMBER = '554333242211';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initCatalogTabs();
  initSpecToggles();
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
 * 3. Product Category Tabs (Todos / Modelos C1 a C6 / Especiais & Sacarias)
 */
function initCatalogTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.prod-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * 4. Toggle Photo <-> Technical Spec Drawing (C1 a C6)
 */
function initSpecToggles() {
  const toggles = document.querySelectorAll('.spec-toggle');
  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.prod-media');
      const img = card?.querySelector('img');
      if (!img) return;

      const photoSrc = btn.getAttribute('data-photo');
      const specSrc = btn.getAttribute('data-spec');
      const isShowingSpec = btn.classList.toggle('active');

      if (isShowingSpec && specSrc) {
        img.src = specSrc;
        btn.textContent = 'Ver foto';
      } else if (photoSrc) {
        img.src = photoSrc;
        btn.textContent = 'Ver desenho';
      }
    });
  });
}

/**
 * 5. Product Card CTA -> Pre-fill Lead Form or Open WhatsApp
 */
function initProductSelection() {
  const buttons = document.querySelectorAll('[data-select-product]');
  const productSelect = document.getElementById('lead-product');
  const nameInput = document.getElementById('lead-name');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenProduct = btn.getAttribute('data-select-product');
      if (!chosenProduct) return;

      if (productSelect) {
        // Ensure option exists or add dynamic option
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
      }

      const heroForm = document.getElementById('quote-form');
      if (heroForm) {
        heroForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => nameInput?.focus(), 450);
      }
    });
  });
}

/**
 * 6. Lead Quote Forms (Hero & Bottom) -> Direct WhatsApp Dispatch
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
 * 7. Scroll Reveal Observer
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
    { threshold: 0.12 }
  );

  elements.forEach((el) => observer.observe(el));
}
