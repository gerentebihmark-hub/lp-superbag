# DOSSIÊ ESTRATÉGICO E ARQUITETURA DE CONVERSÃO — LP SUPERBAG LONDRINA

**Projeto:** Nova Landing Page Unificada de Alta Conversão (SEO + GEO + Performance B2B)  
**Cliente:** Superbag Londrina — Indústria e Comércio de Big Bags (FIBC) e Sacarias de Ráfia  
**Domínio Canônico Principal:** `https://www.superbaglondrina.com.br`  
**Domínio Secundário (Redirecionamento 301):** `https://www.superbaglda.com.br`  
**Ecossistema de Captura Rápida (Blink):** `https://superbagblink.vercel.app/`  
**Skills Ativadas:** `briefing-estrategico-master` · `copy-persuasiva` · `design-visual-persuasivo`  
**Padrão Técnico:** `PERFIL_PROFISSIONAL.md` (Iago / BMK)

---

## 1. AUDITORIA TÉCNICA E DIAGNÓSTICO DOS DOIS SITES ATUAIS

A operação digital da Superbag Londrina encontrava-se fragmentada em dois domínios distintos rodando instalações WordPress independentes, gerando **canibalização de palavras-chave**, **conflito de dados cadastrais (NAP — Name, Address, Phone)** e **dispersão de catálogo técnico**:

| Dimensão Auditada | Site 1 (`superbaglondrina.com.br`) | Site 2 (`superbaglda.com.br`) | Solução na Nova LP Unificada |
| :--- | :--- | :--- | :--- |
| **Papel na Arquitetura** | Domínio principal atual (WP + Elementor) | Domínio legado paralelo (WP + Sydney) | **Unificação total em `superbaglondrina.com.br`** com mapa 301 completo de `superbaglda.com.br`. |
| **Endereço Físico (NAP)** | **Rua Amélia Riskallah Abib Tauil, 335** – Indústrias Leves, Londrina/PR (CEP 86030-290) | Av. Jorge Casoni, 1760 (endereço antigo defasado) | Padronização estrita no endereço atual (**Rua Amélia Riskallah Abib Tauil, 335**) em HTML, Schema.org e `llms.txt`. |
| **Catálogo de Produtos** | Detalha **Modelos C1 a C6** (boca aberta, saia, válvulas), Sacaria e Baffle Bag, mas omite linhas especiais. | Detalha **Fatores de Segurança (5:1, 6:1, 8:1)**, **Gramaturas (160g, 190g, 220g)** e linhas especiais (**Laminado, Telado, Mandioca, Bulk Liner, Cocho Bag**), mas omite a série C1–C6. | **Catálogo Industrial Unificado:** Matriz técnica dos Modelos **C1 a C6** + Seletor de **Gramatura/Segurança (5:1, 6:1, 8:1)** + **7 Linhas Especializadas**. |
| **Performance & Core Web Vitals** | Excesso de DOM Elementor, múltiplos sliders pesados, scripts bloqueantes. | Tema legado, conexões HTTP mistas, ausência de dados estruturados ricos. | **Stack Vite + Vanilla HTML5/CSS3/JS**, zero dependências pesadas, ativos locais otimizados, CLS < 0.05 e LCP < 2.0s. |
| **SEO & GEO (IA Generativa)** | Sem JSON-LD de `Manufacturer`/`Product`/`FAQPage`; textos fragmentados em imagens de banner. | Sem `FAQPage` estruturado, endereço divergente prejudicando o Google Meu Negócio e citações em IA. | **Arquitetura SEO + GEO Nativa:** JSON-LD completo (`Manufacturer`, `Product`/`ItemList`, `FAQPage`), tabelas técnicas HTML semânticas (`<table>`) e arquivo `/llms.txt`. |

---

## 2. BRIEFING ESTRATÉGICO BASEADO EM EVIDÊNCIAS (`briefing-estrategico-master`)

### 2.1 Cadeia de Evidência → Insight → Decisão → Hipótese → Métrica

| Evidência Verificada (Fatos Reais) | Insight Estratégico | Decisão de Arquitetura / Produto | Hipótese de Conversão | Métrica de Sucesso (KPI) |
| :--- | :--- | :--- | :--- | :--- |
| **[FATO]** A empresa possui tradição desde a **década de 1970**, iniciou comercialização de Big Bags em **1999**, fabricação própria em **2004** e produz **~40.000 unidades/mês** em Londrina/PR. | Compradores industriais (Suprimentos, Engenheiros de Produção, Cooperativas) têm aversão ao risco de ruptura de estoque ou atraso na safra. | Destacar logo na 1ª dobra (Hero) e na barra de prova social a capacidade instalada de **40 mil unidades/mês**, **+3.153 clientes** e atendimento nacional. | Exibir capacidade fabril auditável reduz a percepção de risco de fornecimento e aumenta a taxa de início de cotação. | Taxa de clique no CTA primário (`cta_click`) > 12% e redução da taxa de rejeição na 1ª dobra. |
| **[FATO]** Os Big Bags possuem variações técnicas críticas: **Modelos C1 a C6** (combinações de boca aberta, saia H90cm, válvula superior e válvula inferior) e **3 faixas de segurança** (**160g 5:1**, **190g 6:1**, **220g 8:1**). | Muitos compradores sabem o produto que vão envasar (ex.: soja, fertilizante, minério, mandioca), mas têm dúvida sobre qual código C1–C6 ou gramatura especificar. | Construir um **Especificador Técnico Interativo C1–C6 + Calculadora Rápida de Cotação** que traduz a necessidade operacional em especificação pronta para o comercial. | Permitir que o lead selecione visualmente o sistema de carga/descarga (C1–C6) ou clique em "Me ajude a especificar" eleva a qualificação do lead no WhatsApp e formulário. | Aumento de > 35% em leads com especificação completa (`form_submit` + `whatsapp_click` qualificado). |
| **[FATO]** O **Big Bag Travado (Baffle Bag)** transporta e armazena **até 30% mais material** no mesmo espaço físico, otimizando contêineres e frete. | Em operações B2B, o custo do frete e da armazenagem supera em muitas vezes o custo unitário da embalagem. | Criar uma seção executiva de **Engenharia de Eficiência Logística** comparando o Big Bag Tubular vs. **Baffle Bag (+30% aproveitamento)** e **Bulk Liner Marítimo**. | Tangibilizar a economia de até 30% em espaço de frete/armazenagem atrai decisores de logística e exportação de alto ticket. | Engajamento na seção de Linhas Especializadas (`scroll_depth` 50%–75%) e cliques em cotação de Baffle Bag / Bulk Liner. |
| **[FATO]** Buscas B2B migraram para motores generativos (Google AI Overviews, ChatGPT, Perplexity) que priorizam tabelas comparativas, dados técnicos explícitos e entidades consistentes. | Sites com informações presas dentro de banners JPEG não são lidos nem citados por LLMs ou rich snippets do Google. | Implementar **Tabelas Comparativas HTML (`<table>`)** de gramatura/fator de segurança e modelos C1–C6, **JSON-LD Triplo** e arquivo **`/llms.txt`**. | Estruturar respostas diretas (*Answer-First*) e dados tabulares posiciona `superbaglondrina.com.br` como fonte primária para consultas de Big Bags no Brasil. | Crescimento de impressões orgânicas em termos técnicos ("fabricante big bag paraná", "big bag c1 a c6", "big bag travado 6:1"). |

---

## 3. ARQUITETURA DE COPYWRITING E RETÓRICA (`copy-persuasiva`)

### 3.1 Tom de Voz e Posicionamento Verbal
- **Arquétipo Verbal:** Engenharia Industrial, Solidez Fabril, Precisão Técnica e Parceria B2B Direta.
- **Regras Estritas:**
  - Zero clichês de marketing digital ou escassez artificial (proibido usar "últimas vagas", "oferta relâmpago" ou adjetivos vazios).
  - Uso de **verbos de ação industrial** (*dimensionar, envasar, movimentar, estivar, impermeabilizar, otimizar*) e **substantivos técnicos reais** (*polipropileno virgem, filme de polietileno, fator de segurança 5:1 / 6:1 / 8:1, válvula de descarga, saia superior H90cm, alças espalmadas*).

### 3.2 Figuras de Retórica Aplicadas na Página
1. **Entimema (Silogismo Retórico no Hero e Seção Logística):**
   - *Premissa implícita:* Uma embalagem que rompe na empilhadeira ou deforma no caminhão custa muito mais caro do que o valor do próprio bag.
   - *Enunciado na LP:* *"Na operação industrial e na safra, o custo real de um Big Bag não está apenas na compra — está na segurança do içamento e no aproveitamento de cada metro cúbico de frete. Por isso fabricamos até 40.000 unidades/mês em polipropileno de alta tenacidade com fatores de segurança certificados de 5:1, 6:1 e 8:1."*
2. **Hipófora (Pergunta seguida de resposta técnica imediata no Catálogo C1–C6):**
   - *Enunciado:* *"Como escolher entre os Modelos C1 a C6 sem errar no sistema de envase? A definição depende de duas variáveis da sua planta: como o material entra (boca aberta, saia H90cm ou válvula superior) e como ele escoa (fundo fechado ou válvula de descarga inferior com trava de segurança)."*
3. **Antítese Operacional (Comparativo de Eficiência):**
   - *Enunciado:* *"Menos volume perdido no caminhão. Até 30% mais carga útil por viagem com a tecnologia de travas internas (Baffle Bag)."*

---

## 4. DIREÇÃO VISUAL E SISTEMA DE DESIGN (`design-visual-persuasivo` + `PERFIL_PROFISSIONAL.md`)

### 4.1 Diretrizes Obrigatórias do Perfil Profissional
1. **Light Mode Obrigatório (Industrial Daylight System):**
   - Superfícies claras de altíssima legibilidade técnica (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`), projetadas para compradores em ambiente de escritório industrial ou em campo sob luz solar intensa.
2. **Proibição Absoluta de Pílulas Decorativas (`border-radius: 9999px`):**
   - Nenhum selo, tag técnica, badge de fator de segurança ou botão utiliza formato de pílula arredondada. Todos os componentes seguem geometria técnica industrial (`border-radius: 4px` para tags/badges, `6px` para botões e inputs, `8px` para cards técnicos).
3. **Alinhamento Visual com o Ecossistema Superbag (`superbag-blink`):**
   - Preserva a assinatura cromática da marca (**Laranja Industrial Superbag `#F37021` / `#EA580C`** + **Azul Petróleo/Ardósia Industrial `#0F172A` / `#1E293B`** + **Verde Operacional `#15803D`** para indicadores de disponibilidade e WhatsApp) e a dupla tipográfica de engenharia (**Space Grotesk** para títulos/métricas tabulares + **Plus Jakarta Sans** para leitura técnica fluida + **JetBrains Mono** para códigos de modelo C1–C6 e especificações de gramatura).

### 4.2 Tokens de Design (CSS Custom Properties)
- `--bg-primary`: `#FFFFFF` (Fundo principal limpo)
- `--bg-secondary`: `#F8FAFC` (Seções técnicas alternadas)
- `--bg-tertiary`: `#F1F5F9` (Superfícies de tabelas e painéis de especificação)
- `--text-primary`: `#0F172A` (Contraste > 15:1 sobre branco — WCAG AAA)
- `--text-secondary`: `#334155` (Contraste > 8.5:1 — leitura de fichas técnicas)
- `--text-muted`: `#475569` (Contraste > 5.8:1 — metadados e legendas)
- `--brand-orange`: `#EA580C` / `#F37021` (Ação primária e destaques técnicos)
- `--brand-orange-hover`: `#C2410C`
- `--brand-navy`: `#0F172A` (Cabeçalhos técnicos, faixa de autoridade industrial e rodapé)
- `--border-subtle`: `#E2E8F0`
- `--border-strong`: `#CBD5E1`

---

## 5. MAPA DE SEÇÕES E FLUXO DE CONVERSÃO DA LP (`index.html`)

1. **Topbar Técnica & Header Fixo (`<header>`):**
   - Informações operacionais diretas: Produção em Londrina/PR · Entrega Nacional · Horário de Atendimento · Telefones `(43) 3324-2211` e `(11) 99917-5005` · CTA rápido de Cotação.
2. **Dobra 1 — Hero Industrial de Alta Conversão (`#inicio`):**
   - Eyebrow técnico retangular (`[ FABRICANTE DE BIG BAGS (FIBC) E SACARIAS DE RÁFIA · DESDE A DÉCADA DE 1970 ]`).
   - Headline focada em escala fabril, segurança de carga e fornecimento nacional.
   - Subheadline com especificações reais (160g 5:1, 190g 6:1, 220g 8:1, novos e higienizados, produção de ~40.000 un/mês).
   - Dupla de CTAs: Primário (`Solicitar Cotação Técnica`) + Secundário (`Explorar Modelos C1 a C6`).
   - **Painel Visual + Configurador Rápido de Especificação** já visível para captura imediata de intenção B2B.
3. **Faixa de Prova Social e Capacidade Fabril Auditável:**
   - 4 indicadores industriais com `font-variant-numeric: tabular-nums`: **~40.000 un./mês** (Capacidade Instalada em Londrina/PR), **+30 Anos** (Tradição em Big Bags / Origem nos Anos 70), **+3.153** (Clientes Atendidos no Brasil), **99%** (Índice de Satisfação Operacional).
4. **Dobra 2 — Engenharia de Segurança: Matriz de Gramaturas e Fatores de Segurança (`#engenharia-seguranca`):**
   - Comparativo técnico estruturado das 3 classes de resistência do tecido de polipropileno (PP):
     - **One Way (Descartável):** 160 g/m² · Fator de Segurança **5:1**
     - **Multi Way (Reutilizável):** 190 g/m² · Fator de Segurança **6:1**
     - **Multi Way Reforçado:** 220 g/m² · Fator de Segurança **8:1**
   - Opções de fornecimento: **Big Bags Novos Sob Medida** (com impressão de logomarca) e **Big Bags Usados Higienizados** (inspecionados para redução de custo operacional).
5. **Dobra 3 — Catálogo Técnico Interativo: Série Convencional C1 a C6 (`#catalogo-c1-c6`):**
   - Filtro interativo e cards técnicos com imagem real + diagrama esquemático (`c1-spec.webp` a `c6-spec.webp`) detalhando Boca Superior, Fundo Inferior, Tampa e Alças de cada modelo (**C1, C2, C3, C4, C5 e C6**).
   - Botão em cada card: **"Cotar Modelo C[X]"** que seleciona automaticamente o modelo no formulário de cotação e rola suavemente até o fechamento.
6. **Dobra 4 — Linhas Especializadas e Soluções por Operação (`#linhas-especializadas`):**
   - Unificação completa do portfólio do segundo domínio (`superbaglda.com.br` + `superbaglondrina.com.br`):
     1. **Big Bag Travado (Baffle Bag):** Até **30% mais capacidade** no mesmo espaço, estabilidade cúbica para exportação e pós finos.
     2. **Big Bag Laminado:** Revestimento interno de PE impermeabilizante contra umidade e trocas térmicas.
     3. **Big Bag Telado (Netbag / Gardelon):** Tecido arejado PEAD + PP para ventilação de batata, cebola, amendoim e mate.
     4. **Big Bag para Mandioca (Raiz):** Tecido PP "carijó" lavável com argolas metálicas ou de tecido para amarração traseira no campo.
     5. **Bulk Liner Marítimo:** Revestimento interno para contêineres de 20'/40' para granéis sólidos secos (café, açúcar, malte, soja, polímeros).
     6. **Cocho Bag (Confinamento Bovino):** Cocho em ráfia de PP que não acumula água da chuva e evita perda de ração/sal.
     7. **Sacarias de Ráfia (Convencional e Laminada):** Alta resistência ao rasgo e perfuração para grãos, sementes, rações e fertilizantes.
7. **Dobra 5 — Setores Atendidos & Protocolo de Manuseio Seguro (`#setores-e-manuseio`):**
   - Aplicações por indústria (Agronegócio, Químico e Petroquímico, Minérios, Fertilizantes, Sementes e Farinhas, Construção Civil, Pecuária).
   - Guia Técnico Ilustrado de Manuseio por Empilhadeira (usando os diagramas oficiais da Superbag para reduzir avarias na operação do cliente).
8. **Dobra 6 — Tabela Síntese para Compradores & GEO (`#especificacoes-geo`):**
   - Tabela HTML semântica (`<table>`) consolidando todos os modelos, aberturas, fechamentos, gramaturas e aplicações — desenhada especificamente para compradores técnicos e para extração direta por motores de IA Generativa (GEO).
9. **Dobra 7 — Tradição Industrial desde a Década de 1970 (`#sobre-superbag`):**
   - Linha do tempo verificada: **Década de 1970** (Sacarias para café e cereais no PR, SP, MG, ES, BA e RO) → **1999** (Comercialização e higienização de Big Bags) → **2004** (Fabricação própria de Big Bags novos) → **Hoje** (~40 mil unidades/mês em Londrina/PR atendendo todo o Brasil).
10. **Dobra 8 — Central de Cotação Técnica B2B + Envio Direto (`#cotacao-tecnica`):**
    - Formulário B2B com pré-preenchimento inteligente a partir dos cards clicados, máscara de telefone, validação inline acessível, proteção Honeypot, consentimento LGPD e dupla saída: envio formal com redirecionamento para `obrigado.html` (com resumo do pedido e protocolo) ou envio imediato estruturado para o WhatsApp Comercial `(43) 3324-2211`.
11. **Dobra 9 — Perguntas Frequentes Técnicas (FAQ Estruturado SEO/GEO) (`#faq`):**
    - 8 perguntas reais respondidas de forma direta (*Answer-First*) sobre fatores de segurança, diferença entre modelos C1–C6, ganho do Baffle Bag, prazos, personalização de logo e entregas nacionais.

---

## 6. ESTRATÉGIA DE UNIFICAÇÃO SEO + GEO (GENERATIVE ENGINE OPTIMIZATION)

1. **Dados Estruturados JSON-LD (`<script type="application/ld+json">`):**
   - `Organization` & `LocalBusiness` (`Manufacturer`) com endereço unificado (`Rua Amélia Riskallah Abib Tauil, 335, Londrina - PR, 86030-290`), geolocalização, telefones `(43) 3324-2211` / `(11) 99917-5005`, e-mail `comercial@superbaglda.com.br` e `sameAs` para todas as redes oficiais.
   - `ItemList` contendo os produtos `Product` (Modelos C1 a C6, Big Bag Travado, Laminado, Telado, Mandioca, Bulk Liner, Cocho Bag e Sacaria de Ráfia).
   - `FAQPage` espelhando exatamente as 8 perguntas técnicas da página.
2. **Arquivo `/llms.txt` Nativo (`public/llms.txt`):**
   - Documento em Markdown estruturado na raiz do domínio para agentes de IA (ChatGPT Search, Perplexity, Claude, Google Gemini), declarando o domínio canônico `https://www.superbaglondrina.com.br`, desambiguando o domínio antigo `superbaglda.com.br` e listando especificações exatas de produtos e contatos.
3. **Mapa de Redirecionamentos 301 (`vercel.json`):**
   - Todas as URLs antigas de `superbaglondrina.com.br` (`/super-bag-c1/` até `/super-bag-c6-2/`, `/produtos-superbag/`, `/sacarias/`, `/cotacao-superbag/`, `/sobre-nos/`) e todas as URLs de `superbaglda.com.br` (`/big-bags/`, `/big-bag-convencional/`, `/big-bag-travado/`, `/big-bag-laminado/`, `/big-bag-telado/`, `/big-bag-para-mandioca/`, `/bulk-liner/`, `/cocho-bag/`, `/institucional/`, `/contato/`) mapeadas com redirecionamento permanente (`301`) para as respectivas âncoras sem perda de *link equity*.
