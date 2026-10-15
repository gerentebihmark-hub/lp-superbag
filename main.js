/**
 * SUPERBAG LONDRINA — LÓGICA INTERATIVA, ESPECIFICADOR B2B, LGPD & TELEMETRIA
 * Domínio Canônico: https://www.superbaglondrina.com.br
 */

const WHATSAPP_NUMBER = '554333242211';
const CONSENT_STORAGE_KEY = 'superbag_lgpd_consent_v1';
const GA4_ID = 'G-WDDGDY6BDY';

/**
 * Sanitiza strings removendo tags HTML ou caracteres potencialmente perigosos
 */
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Dispara eventos para dataLayer / gtag (quando consentimento analítico ativo)
 */
function trackEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
    timestamp: new Date().toISOString(),
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Inicializa Google Analytics 4 mediante consentimento LGPD
 */
function loadAnalyticsIfConsented(consentObj) {
  if (!consentObj || !consentObj.analytics) return;
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID, { anonymize_ip: true });
  trackEvent('page_view', { page_title: document.title, page_location: window.location.href });
}

document.addEventListener('DOMContentLoaded', () => {
  // Atualiza ano no rodapé
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // =========================================================================
  // 1. MENU MOBILE ACESSÍVEL
  // =========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================================================
  // 2. SIMULADOR / ESPECIFICADOR TÉCNICO B2B (HERO)
  // =========================================================================
  const simSetor = document.getElementById('sim-setor');
  const simCondicao = document.getElementById('sim-condicao');
  const simRadios = document.querySelectorAll('input[name="sim-gramatura"]');
  const simRecCode = document.getElementById('sim-rec-code');
  const simRecText = document.getElementById('sim-rec-text');
  const btnApplySim = document.getElementById('btn-apply-sim');
  const btnWppSim = document.getElementById('btn-wpp-sim');

  const recommendationsMap = {
    'graos-sementes': {
      modelSelect: 'Modelo C4 (Saia H90cm + Válvula Inferior)',
      codeLabel: 'MODELOS C4 / C6 OU TRAVADO',
      desc: 'Para grãos, café, sementes e rações, recomendamos os <strong>Modelos C4 ou C6</strong> (com válvula de descarga inferior controlada) ou o <strong>Big Bag Travado (Baffle Bag)</strong> para ganhar até 30% de espaço no caminhão e armazém.',
      utilizacaoDefault: 'Armazenamento e transporte de Grãos / Sementes / Rações',
    },
    'fertilizantes-quimicos': {
      modelSelect: 'Big Bag Laminado (Com Filme Impermeabilizante PE)',
      codeLabel: 'BIG BAG LAMINADO + C5 / C6',
      desc: 'Para fertilizantes e químicos higroscópicos, recomendamos o <strong>Big Bag Laminado</strong> (com filme impermeabilizante de polietileno PE) combinado ao sistema de válvula superior/inferior (<strong>C5 ou C6</strong>).',
      utilizacaoDefault: 'Envase de Fertilizantes / Produtos Químicos',
    },
    'minerios-construcao': {
      modelSelect: 'Modelo C3 (Boca Aberta + Válvula Inferior)',
      codeLabel: 'SÉRIE C1 / C3 · REFORÇADO 220g (8:1)',
      desc: 'Para minérios, cimento e agregados pesados, recomendamos construção reforçada em <strong>220 g/m² (Fator de Segurança 8:1)</strong> nos <strong>Modelos C1 ou C3</strong> para máxima resistência mecânica no içamento.',
      utilizacaoDefault: 'Movimentação de Minérios / Construção Civil',
    },
    'pos-finos-exportacao': {
      modelSelect: 'Big Bag Travado (Baffle Bag - +30% Capacidade)',
      codeLabel: 'BAFFLE BAG (+30% CARGA) / BULK LINER',
      desc: 'Para pós finos (farinhas, cimentos) e estufagem de contêineres marítimos, recomendamos o <strong>Big Bag Travado (Baffle Bag)</strong> que transporta até 30% mais material sem deformar, ou o <strong>Bulk Liner Marítimo</strong>.',
      utilizacaoDefault: 'Pós Finos / Otimização de Frete e Exportação',
    },
    'hortifruti-ventilado': {
      modelSelect: 'Big Bag Telado (Netbag / Gardelon Arejado)',
      codeLabel: 'BIG BAG TELADO (NETBAG / GARDELON)',
      desc: 'Para batata, cebola, amendoim e erva-mate, recomendamos o <strong>Big Bag Telado (Netbag / Gardelon)</strong> em malha PEAD + PP que garante circulação contínua de ar através da carga.',
      utilizacaoDefault: 'Armazenamento ventilado (Batata, Cebola, Amendoim ou Mate)',
    },
    'mandioca-raiz': {
      modelSelect: 'Big Bag para Mandioca (Tecido Carijó + Argolas)',
      codeLabel: 'BIG BAG MANDIOCA (TECIDO CARIJÓ)',
      desc: 'Para colheita e transporte de raízes, recomendamos o <strong>Big Bag para Mandioca</strong> em tecido PP padrão "carijó", lavável e equipado com argolas metálicas ou de tecido para amarração traseira.',
      utilizacaoDefault: 'Colheita e transporte de Mandioca (Raiz)',
    },
    'confinamento-bovino': {
      modelSelect: 'Cocho Bag (Ráfia PP para Confinamento Bovino)',
      codeLabel: 'COCHO BAG PECUÁRIA (RÁFIA PP)',
      desc: 'Para suplementação e engorda de bovinos, recomendamos o <strong>Cocho Bag Superbag</strong> em ráfia de polipropileno de alta durabilidade que não acumula água da chuva e evita perda de ração.',
      utilizacaoDefault: 'Confinamento e engorda de bovinos (Cocho Bag)',
    },
  };

  function getSelectedSimGramatura() {
    const checked = document.querySelector('input[name="sim-gramatura"]:checked');
    return checked ? checked.value : '190g - Fator 6:1 (Multi Way)';
  }

  function updateSimulatorUI() {
    if (!simSetor || !simRecCode || !simRecText) return;
    const key = simSetor.value;
    const rec = recommendationsMap[key] || recommendationsMap['graos-sementes'];
    const gram = getSelectedSimGramatura();
    const cond = simCondicao ? simCondicao.value : 'Big Bag Novo Sob Medida';

    const shortGram = gram.split(' ')[0];
    simRecCode.textContent = `${rec.codeLabel} · ${shortGram}`;
    simRecText.innerHTML = `${rec.desc} <br/><strong>Fornecimento selecionado:</strong> ${sanitizeText(cond)} (${sanitizeText(gram)}).`;
  }

  if (simSetor) {
    simSetor.addEventListener('change', () => {
      // Se selecionou minérios, sugere automaticamente 220g 8:1
      if (simSetor.value === 'minerios-construcao') {
        const radio220 = document.querySelector('input[name="sim-gramatura"][value^="220g"]');
        if (radio220) radio220.checked = true;
      }
      updateSimulatorUI();
    });
  }

  if (simCondicao) {
    simCondicao.addEventListener('change', updateSimulatorUI);
  }

  simRadios.forEach((radio) => {
    radio.addEventListener('change', updateSimulatorUI);
  });

  // Botão "Carregar Especificação na Cotação"
  if (btnApplySim) {
    btnApplySim.addEventListener('click', () => {
      const key = simSetor ? simSetor.value : 'graos-sementes';
      const rec = recommendationsMap[key] || recommendationsMap['graos-sementes'];
      const gram = getSelectedSimGramatura();
      const cond = simCondicao ? simCondicao.value : '';

      const formModelo = document.getElementById('lead-modelo');
      const formGramatura = document.getElementById('lead-gramatura');
      const formUtilizacao = document.getElementById('lead-utilizacao');
      const formMensagem = document.getElementById('lead-mensagem');

      if (formModelo) {
        if (cond.includes('Higienizado')) {
          formModelo.value = 'Big Bag Higienizado (Semi-novo)';
        } else if (cond.includes('Sacaria')) {
          formModelo.value = 'Sacarias de Ráfia (Convencional ou Laminada)';
        } else {
          formModelo.value = rec.modelSelect;
        }
      }

      if (formGramatura) {
        formGramatura.value = gram;
      }

      if (formUtilizacao && !formUtilizacao.value) {
        formUtilizacao.value = rec.utilizacaoDefault;
      }

      if (formMensagem && cond) {
        formMensagem.value = `Modalidade simulada: ${cond}.`;
      }

      const quoteSection = document.getElementById('cotacao-tecnica');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nomeInput = document.getElementById('lead-nome');
          if (nomeInput) nomeInput.focus();
        }, 550);
      }
    });
  }

  // Botão "Cotar Esta Configuração no WhatsApp" (Simulador Hero)
  if (btnWppSim) {
    btnWppSim.addEventListener('click', () => {
      const key = simSetor ? simSetor.value : 'graos-sementes';
      const rec = recommendationsMap[key] || recommendationsMap['graos-sementes'];
      const gram = getSelectedSimGramatura();
      const cond = simCondicao ? simCondicao.value : 'Big Bag Novo Sob Medida';

      const msg = [
        'Olá, equipe comercial da *Superbag Londrina*!',
        'Fiz o pré-dimensionamento no site oficial e gostaria de uma cotação:',
        '',
        `• *Aplicação/Carga:* ${rec.utilizacaoDefault}`,
        `• *Linha Recomendada:* ${rec.modelSelect}`,
        `• *Gramatura/Segurança:* ${gram}`,
        `• *Modalidade:* ${cond}`,
        '',
        'Podemos avançar com o orçamento?',
      ].join('\n');

      trackEvent('whatsapp_click', { location: 'hero_simulator', model: rec.modelSelect });
      window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    });
  }

  // =========================================================================
  // 3. CATÁLOGO C1 A C6: FILTROS E ALTERNADOR FOTO vs DESENHO TÉCNICO
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';

      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      productCards.forEach((card) => {
        const cats = card.getAttribute('data-categories') || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      trackEvent('catalog_filter', { filter_selected: filter });
    });
  });

  // Alternar Foto Real vs Desenho Técnico Cotado nos cards C1-C6
  document.querySelectorAll('.js-toggle-view').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      const card = btn.closest('.product-card');
      if (!card) return;

      const photoImg = card.querySelector('.js-img-photo');
      const specImg = card.querySelector('.js-img-spec');
      const allBtns = card.querySelectorAll('.js-toggle-view');

      allBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (view === 'spec') {
        if (photoImg) photoImg.classList.remove('is-visible');
        if (specImg) specImg.classList.add('is-visible');
      } else {
        if (specImg) specImg.classList.remove('is-visible');
        if (photoImg) photoImg.classList.add('is-visible');
      }
    });
  });

  // Botões ".js-select-spec" em cards de produtos, fatores de segurança e tabelas
  document.querySelectorAll('.js-select-spec').forEach((btn) => {
    btn.addEventListener('click', () => {
      const model = btn.getAttribute('data-model');
      const gram = btn.getAttribute('data-gram');

      const formModelo = document.getElementById('lead-modelo');
      const formGramatura = document.getElementById('lead-gramatura');

      if (formModelo && model) {
        formModelo.value = model;
      }
      if (formGramatura && gram) {
        formGramatura.value = gram;
      }

      trackEvent('cta_click', { location: 'product_select', model_selected: model || '' });

      const quoteSection = document.getElementById('cotacao-tecnica');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nomeInput = document.getElementById('lead-nome');
          if (nomeInput) nomeInput.focus();
        }, 550);
      }
    });
  });

  // =========================================================================
  // 4. MÁSCARA DE TELEFONE E VALIDAÇÃO DO FORMULÁRIO B2B
  // =========================================================================
  const phoneInput = document.getElementById('lead-whatsapp');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (digits.length > 10) {
        e.target.value = digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (digits.length > 6) {
        e.target.value = digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (digits.length > 2) {
        e.target.value = digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (digits.length > 0) {
        e.target.value = digits.replace(/^(\d*)/, '($1');
      } else {
        e.target.value = '';
      }
    });
  }

  function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (input) {
      if (message) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      }
    }
    if (err) {
      err.textContent = message || '';
    }
  }

  function collectAndValidateForm(requireAllFields = true) {
    // Verifica Honeypot anti-bot
    const hp = document.getElementById('website_url_hp');
    if (hp && hp.value.trim() !== '') {
      return { valid: false, bot: true };
    }

    const nome = sanitizeText(document.getElementById('lead-nome')?.value);
    const empresa = sanitizeText(document.getElementById('lead-empresa')?.value);
    const whatsapp = sanitizeText(document.getElementById('lead-whatsapp')?.value);
    const email = sanitizeText(document.getElementById('lead-email')?.value);
    const modelo = sanitizeText(document.getElementById('lead-modelo')?.value);
    const gramatura = sanitizeText(document.getElementById('lead-gramatura')?.value);
    const quantidade = sanitizeText(document.getElementById('lead-quantidade')?.value);
    const medidas = sanitizeText(document.getElementById('lead-medidas')?.value);
    const utilizacao = sanitizeText(document.getElementById('lead-utilizacao')?.value);
    const mensagem = sanitizeText(document.getElementById('lead-mensagem')?.value);
    const lgpdChecked = Boolean(document.getElementById('lead-lgpd')?.checked);

    let isValid = true;

    // Limpa erros anteriores
    ['nome', 'whatsapp', 'email', 'quantidade', 'medidas', 'utilizacao', 'lgpd'].forEach((f) => {
      setFieldError(`lead-${f}`, `err-${f}`, '');
    });

    if (requireAllFields) {
      if (!nome || nome.length < 2) {
        setFieldError('lead-nome', 'err-nome', 'Por favor, informe seu nome.');
        isValid = false;
      }

      const phoneDigits = whatsapp.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setFieldError('lead-whatsapp', 'err-whatsapp', 'Informe um telefone ou WhatsApp válido com DDD.');
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setFieldError('lead-email', 'err-email', 'Informe um endereço de e-mail válido.');
        isValid = false;
      }

      if (!quantidade || Number(quantidade) < 1) {
        setFieldError('lead-quantidade', 'err-quantidade', 'Informe a quantidade estimada (unidades).');
        isValid = false;
      }

      if (!medidas) {
        setFieldError('lead-medidas', 'err-medidas', 'Informe as medidas aproximadas ou peso suportado.');
        isValid = false;
      }

      if (!utilizacao) {
        setFieldError('lead-utilizacao', 'err-utilizacao', 'Informe o produto envasado ou cidade de entrega.');
        isValid = false;
      }

      if (!lgpdChecked) {
        setFieldError('lead-lgpd', 'err-lgpd', 'É necessário concordar com a Política de Privacidade (LGPD).');
        isValid = false;
      }
    }

    const protocol = `SBG-${Math.floor(100000 + Math.random() * 900000)}`;

    const wppLines = [
      `Olá, equipe comercial da *Superbag Londrina*! (Protocolo *#${protocol}*)`,
      'Gostaria de solicitar uma cotação técnica:',
      '',
      `• *Nome:* ${nome || 'Não informado'}`,
      empresa ? `• *Empresa:* ${empresa}` : null,
      whatsapp ? `• *WhatsApp/Tel:* ${whatsapp}` : null,
      email ? `• *E-mail:* ${email}` : null,
      `• *Modelo/Linha:* ${modelo || 'A definir'}`,
      `• *Gramatura/Segurança:* ${gramatura || 'A definir'}`,
      `• *Quantidade:* ${quantidade ? `${quantidade} unidades` : 'A definir'}`,
      `• *Medidas/Peso:* ${medidas || 'Sob consulta'}`,
      `• *Utilização/Destino:* ${utilizacao || 'Sob consulta'}`,
      mensagem ? `• *Observações:* ${mensagem}` : null,
    ].filter(Boolean);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(wppLines.join('\n'))}`;

    return {
      valid: isValid,
      bot: false,
      payload: {
        protocol,
        nome,
        empresa,
        whatsapp,
        email,
        modelo,
        gramatura,
        quantidade,
        medidas,
        utilizacao,
        mensagem,
        whatsappUrl,
      },
    };
  }

  const quoteForm = document.getElementById('quote-form');
  const btnFormWhatsapp = document.getElementById('btn-form-whatsapp');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = collectAndValidateForm(true);
      if (result.bot || !result.valid) {
        const firstInvalid = quoteForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      try {
        sessionStorage.setItem('superbag_last_quote', JSON.stringify(result.payload));
      } catch (err) {
        // Continua caso sessionStorage esteja restrito
      }

      trackEvent('form_submit', {
        model: result.payload.modelo,
        gramatura: result.payload.gramatura,
        quantidade: result.payload.quantidade,
      });

      window.location.href = '/obrigado.html';
    });
  }

  if (btnFormWhatsapp) {
    btnFormWhatsapp.addEventListener('click', () => {
      const result = collectAndValidateForm(false);
      if (result.bot) return;

      trackEvent('whatsapp_click', {
        location: 'quote_form_direct',
        model: result.payload.modelo,
      });

      window.open(result.payload.whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // =========================================================================
  // 5. ACORDEÃO DE FAQ ACESSÍVEL
  // =========================================================================
  document.querySelectorAll('.faq-item__trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const icon = trigger.querySelector('.faq-item__icon');

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) {
        panel.hidden = expanded;
      }
      if (icon) {
        icon.textContent = expanded ? '+' : '−';
      }
    });
  });

  // =========================================================================
  // 6. MODAIS ACESSÍVEIS (LGPD E TERMOS DE USO)
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach((modal) => {
      modal.hidden = true;
    });
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.inline-modal-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-modal');
      if (targetId) openModal(targetId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeAllModals);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      if (navMenu && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // =========================================================================
  // 7. BANNER DE COOKIES LGPD GRANULAR & EVENTOS DE TELEMETRIA
  // =========================================================================
  const cookieBanner = document.getElementById('cookie-banner');
  const chkAnalytics = document.getElementById('cookie-analytics');
  const chkMarketing = document.getElementById('cookie-marketing');
  const btnCookieAccept = document.getElementById('btn-cookie-accept');
  const btnCookieSave = document.getElementById('btn-cookie-save');
  const btnCookieReject = document.getElementById('btn-cookie-reject');
  const btnReopenCookies = document.getElementById('btn-reopen-cookies');

  function saveConsent(analytics, marketing) {
    const consentObj = {
      necessary: true,
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentObj));
    } catch (e) {
      // Silencioso
    }
    if (cookieBanner) cookieBanner.hidden = true;
    loadAnalyticsIfConsented(consentObj);
  }

  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      loadAnalyticsIfConsented(parsed);
    } else if (cookieBanner) {
      cookieBanner.hidden = false;
    }
  } catch (e) {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  if (btnCookieAccept) {
    btnCookieAccept.addEventListener('click', () => saveConsent(true, true));
  }
  if (btnCookieSave) {
    btnCookieSave.addEventListener('click', () => {
      saveConsent(chkAnalytics?.checked, chkMarketing?.checked);
    });
  }
  if (btnCookieReject) {
    btnCookieReject.addEventListener('click', () => saveConsent(false, false));
  }
  if (btnReopenCookies) {
    btnReopenCookies.addEventListener('click', () => {
      if (cookieBanner) cookieBanner.hidden = false;
    });
  }

  // Rastreamento declarativo de cliques (data-track)
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const evt = el.getAttribute('data-track');
      const loc = el.getAttribute('data-location') || 'page';
      if (evt) trackEvent(evt, { location: loc });
    });
  });

  // Rastreamento de Scroll Depth (25%, 50%, 75%, 90%)
  const scrollMilestones = new Set();
  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);
      [25, 50, 75, 90].forEach((m) => {
        if (pct >= m && !scrollMilestones.has(m)) {
          scrollMilestones.add(m);
          trackEvent('scroll_depth', { percent_scrolled: m });
        }
      });
    },
    { passive: true }
  );
});
