# LP Superbag Londrina — Unificação Oficial (SEO + GEO + Alta Conversão B2B)

Nova Landing Page institucional e comercial de alta conversão desenvolvida para a **Superbag Londrina** (`https://www.superbaglondrina.com.br`), unificando o conteúdo, catálogo técnico e autoridade de domínio dos dois sites anteriores (`superbaglondrina.com.br` e `superbaglda.com.br`) e alinhada ao ecossistema de captura rápida (`superbag-blink`).

---

## 1. Arquitetura Estratégica e Documentação do Projeto

- [`DOSSIE_ESTRATEGICO.md`](./DOSSIE_ESTRATEGICO.md) — Documento executivo consolidando a auditoria dos 2 sites, matriz `Evidência → Insight → Decisão → Hipótese → Métrica` (`briefing-estrategico-master`), engenharia retórica B2B (`copy-persuasiva`), sistema de design Light Mode sem pílulas (`design-visual-persuasivo`) e estratégia de SEO + GEO.
- [`PERFIL_PROFISSIONAL.md`](./PERFIL_PROFISSIONAL.md) — Diretrizes técnicas, estéticas e de segurança do projeto.
- [`SECURITY_AND_COMPLIANCE.md`](./SECURITY_AND_COMPLIANCE.md) — Governança de dados, LGPD (Lei nº 13.709/2018), sanitização de inputs e headers HTTP.
- [`public/llms.txt`](./public/llms.txt) — Manifesto estruturado para motores de busca generativa (ChatGPT Search, Perplexity, Google AI Overviews, Claude).

---

## 2. Destaques Técnicos da Solução

1. **Unificação de Portfólio e Dados Cadastrais (NAP):**
   - Consolidação do endereço fabril atual (**Rua Amélia Riskallah Abib Tauil, 335 – Indústrias Leves, Londrina/PR – CEP 86030-290**).
   - Unificação da **Série Convencional C1 a C6** (com alternador interativo entre Foto do Produto e Desenho Técnico Cotado), **3 Classes de Fator de Segurança** (`5:1 · 160g One Way`, `6:1 · 190g Multi Way`, `8:1 · 220g Reforçado`) e **7 Linhas Especializadas** (`Big Bag Travado Baffle Bag`, `Laminado`, `Telado Netbag/Gardelon`, `Mandioca Carijó`, `Bulk Liner Marítimo`, `Cocho Bag` e `Sacarias de Ráfia`).
2. **Simulador / Especificador Técnico B2B na 1ª Dobra:**
   - Orienta o comprador por tipo de carga, regime de uso e modalidade (Novo ou Higienizado), pré-preenchendo o formulário técnico ou abrindo o atendimento estruturado direto no WhatsApp `(43) 3324-2211`.
3. **Fundação Sólida em SEO + GEO (Generative Engine Optimization):**
   - Triplo Schema.org JSON-LD (`Manufacturer`/`LocalBusiness`, `ItemList`/`Product` com 13 itens e `FAQPage` com 8 perguntas técnicas).
   - Tabelas HTML semânticas (`<table>`) para extração direta por LLMs e *rich snippets*.
   - Matriz completa de redirecionamentos permanentes (`301`) em [`vercel.json`](./vercel.json) preservando o *link equity* das URLs antigas de ambos os domínios.

---

## 3. Como Executar Localmente e Gerar Build de Produção

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# 3. Gerar build otimizado de produção (pasta dist/)
npm run build

# 4. Visualizar build de produção localmente
npm run preview
```
