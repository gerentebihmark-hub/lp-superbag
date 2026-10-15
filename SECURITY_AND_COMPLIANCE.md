# Segurança, Privacidade (LGPD) e Conformidade — LP Superbag Londrina

Este documento descreve os protocolos de segurança da informação, proteção de dados pessoais (Lei nº 13.709/2018 — LGPD) e governança técnica aplicados na nova Landing Page unificada da **Superbag Londrina** (`https://www.superbaglondrina.com.br`).

---

## 1. Governança de Credenciais e Repositório
- **Zero Segredos Hardcoded:** Nenhuma chave privada, token de banco de dados ou credencial sensível reside no código-fonte.
- **Proteção Git (`.gitignore`):** Configurado antes da inicialização do repositório (`git init`) para bloquear arquivos `.env*`, certificados (`*.pem`, `*.key`), pastas de build (`dist/`) e `node_modules/`.
- **IDs Públicos de Rastreamento:** Apenas identificadores públicos de telemetria front-end (`G-WDDGDY6BDY` e `GTM-M8SSCBKD`) são carregados mediante consentimento ou configuração de tag.

---

## 2. Conformidade com a LGPD (Lei nº 13.709/2018)
- **Minimização de Dados:** O formulário técnico de cotação B2B solicita estritamente os dados necessários para o dimensionamento comercial e retorno de orçamento:
  - Nome e Empresa
  - WhatsApp / Telefone corporativo
  - E-mail comercial (opcional para envio rápido via WhatsApp, obrigatório para cotação formal)
  - Especificação técnica do pedido (Modelo/Linha, Gramatura/Fator de Segurança, Quantidade estimada e Produto envasado)
- **Consentimento Explícito (Opt-in):**
  - O formulário possui checkbox de consentimento desmarcado por padrão, vinculado ao modal de Política de Privacidade e Termos de Uso.
  - O **Banner de Cookies LGPD** oferece controle granular para categorias **Necessários** (sempre ativos), **Analíticos (GA4)** e **Marketing**, armazenando o registro de consentimento em `localStorage` (`superbag_lgpd_consent_v1`).
- **Canal de Direitos do Titular:** Solicitações de acesso, retificação ou exclusão de dados podem ser encaminhadas diretamente para `comercial@superbaglda.com.br` ou pelo telefone `(43) 3324-2211`.

---

## 3. Segurança Front-End e Prevenção de Abuso
- **Sanitização de Inputs:** Todos os campos do configurador e do formulário passam por sanitização no cliente (`trim`, remoção de tags HTML/scripts injetados e validação estrita de formato) antes da montagem do payload de cotação.
- **Proteção Anti-Spam (Honeypot):** Campo oculto (`website_url_hp`) com `tabindex="-1"` e `aria-hidden="true"` para interceptar preenchimento automatizado por bots sem degradar a experiência de compradores reais com CAPTCHAs intrusivos.
- **Links Externos Seguros:** Todos os links com `target="_blank"` utilizam obrigatoriamente `rel="noopener noreferrer"`.
- **Headers HTTP de Segurança (via `vercel.json`):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
