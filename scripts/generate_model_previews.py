"""Generate Open Graph preview JPEGs and lightweight /m/<slug>.html model pages.

Each WhatsApp product link includes a short preview URL (/m/<slug>) whose static
HTML exposes Open Graph metadata pointing to an optimized 1200x630 baseline JPEG
of the exact bag shown on the landing page card.
"""

from __future__ import annotations

import html
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageChops

BASE_URL = "https://superbaglondrina.com.br"
WHATSAPP_PHONE = "554333242211"

REPO_ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_DIR = REPO_ROOT / "public" / "assets" / "produtos"
OG_DIR = PRODUCTS_DIR / "og"
MODEL_PAGES_DIR = REPO_ROOT / "public" / "m"

OG_WIDTH = 1200
OG_HEIGHT = 630
SAFE_SQUARE = 580

MODELS = [
    {
        "slug": "c1",
        "title": "Big Bag Modelo C1",
        "spec": "Boca Aberta · Fundo Fechado",
        "desc": "Carregamento rápido pelo topo totalmente aberto e base plana reforçada para produtos gerais.",
        "src_image": "c1.webp",
        "wa_intro": "o Big Bag Modelo C1 (Boca Aberta / Fundo Fechado)",
    },
    {
        "slug": "c2",
        "title": "Big Bag Modelo C2",
        "spec": "Boca Aberta · Válvula Inferior",
        "desc": "Topo aberto para carga ágil e válvula inferior para descarga controlada em moegas e dosadores.",
        "src_image": "c3.webp",
        "wa_intro": "o Big Bag Modelo C2 (Boca Aberta / Válvula Inferior)",
    },
    {
        "slug": "c3",
        "title": "Big Bag Modelo C3",
        "spec": "Boca com Saia · Fundo Fechado",
        "desc": "Saia superior com amarração para fechamento total do topo, protegendo a carga contra poeira e umidade.",
        "src_image": "c2.webp",
        "wa_intro": "o Big Bag Modelo C3 (Boca com Saia / Fundo Fechado)",
    },
    {
        "slug": "c4",
        "title": "Big Bag Modelo C4",
        "spec": "Boca com Saia · Válvula Inferior",
        "desc": "O modelo mais utilizado para sementes, grãos e fertilizantes: fechamento superior com saia e descarga por válvula.",
        "src_image": "c4.webp",
        "wa_intro": "o Big Bag Modelo C4 (Boca com Saia / Válvula Inferior)",
    },
    {
        "slug": "c5",
        "title": "Big Bag Modelo C5",
        "spec": "Válvula Superior · Fundo Fechado",
        "desc": "Válvula de carregamento que acopla diretamente à bica de enchimento, evitando dispersão de pós no ambiente.",
        "src_image": "c5.webp",
        "wa_intro": "o Big Bag Modelo C5 (Válvula Superior / Fundo Fechado)",
    },
    {
        "slug": "c6",
        "title": "Big Bag Modelo C6",
        "spec": "Válvula Superior · Válvula Inferior",
        "desc": "Sistema fechado de carga e descarga projetado para linhas industriais automatizadas de alto fluxo.",
        "src_image": "c6.webp",
        "wa_intro": "o Big Bag Modelo C6 (Dupla Válvula)",
    },
    {
        "slug": "travado",
        "title": "Big Bag Travado",
        "spec": "Tecnologia Baffle · +30% de Espaço",
        "desc": "Travas internas que mantêm o formato cúbico após o envase, garantindo estabilidade e economia no frete.",
        "src_image": "baffle-bag.webp",
        "wa_intro": "o Big Bag Travado (Baffle Bag)",
    },
    {
        "slug": "laminado",
        "title": "Big Bag Laminado",
        "spec": "Barreira Contra Umidade · Linha Especial",
        "desc": "Disponível em tecido laminado impermeável, com Liner interno em polietileno ou versão Telada ventilada.",
        "src_image": "laminado.webp",
        "wa_intro": "o Big Bag Laminado ou Telado",
    },
    {
        "slug": "sacaria",
        "title": "Sacaria de Ráfia",
        "spec": "25 kg a 60 kg · Lisa ou Impressa",
        "desc": "Sacos convencionais ou laminados de alta tenacidade, com personalização da sua marca em até 3 cores.",
        "src_image": "sacaria-rafia.webp",
        "wa_intro": "a Sacaria de Ráfia (Lisa ou Impressa)",
    },
]

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>{title_esc} — {spec_esc} | Superbag Londrina</title>
  <meta name="description" content="{desc_esc}" />

  <meta property="og:site_name" content="Superbag Londrina" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="{page_url_esc}" />
  <meta property="og:title" content="{title_esc} — {spec_esc}" />
  <meta property="og:description" content="{desc_esc}" />
  <meta property="og:image" content="{og_image_esc}" />
  <meta property="og:image:secure_url" content="{og_image_esc}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="{og_w}" />
  <meta property="og:image:height" content="{og_h}" />
  <meta property="og:image:alt" content="{title_esc} — {spec_esc} | Superbag Londrina" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title_esc} — {spec_esc}" />
  <meta name="twitter:description" content="{desc_esc}" />
  <meta name="twitter:image" content="{og_image_esc}" />

  <link rel="canonical" href="{page_url_esc}" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #0b1120;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }}
    .card {{
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    }}
    .topbar {{
      background: #0f172a;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }}
    .topbar img {{ height: 34px; width: auto; display: block; }}
    .topbar a {{
      color: #cbd5e1;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
    }}
    .topbar a:hover {{ color: #ed6e1e; }}
    .media {{
      background: #ffffff;
      padding: 28px 24px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #f1f5f9;
    }}
    .media img {{
      width: 100%;
      max-width: 340px;
      height: auto;
      aspect-ratio: 1 / 1;
      object-fit: contain;
      display: block;
    }}
    .body {{ padding: 24px; }}
    .spec {{
      display: inline-block;
      background: rgba(237, 110, 30, 0.12);
      color: #c2410c;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }}
    h1 {{ font-size: 24px; line-height: 1.25; margin-bottom: 10px; color: #0f172a; }}
    p {{ font-size: 15px; line-height: 1.55; color: #475569; margin-bottom: 22px; }}
    .actions {{ display: grid; gap: 10px; }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 20px;
      border-radius: 12px;
      transition: transform 0.15s ease, background 0.15s ease;
    }}
    .btn:hover {{ transform: translateY(-1px); }}
    .btn-primary {{ background: #ed6e1e; color: #ffffff; }}
    .btn-primary:hover {{ background: #d65a0f; }}
    .btn-outline {{
      background: #f8fafc;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }}
    .btn-outline:hover {{ background: #f1f5f9; }}
  </style>
</head>
<body>
  <main class="card">
    <header class="topbar">
      <a href="/"><img src="/LOGO%20copiar%205.png" alt="Superbag Londrina" width="144" height="40" /></a>
      <a href="/#produtos">Ver todos os modelos</a>
    </header>
    <div class="media">
      <img src="/assets/produtos/{src_image_esc}" alt="{title_esc} — {spec_esc}" width="800" height="800" />
    </div>
    <div class="body">
      <span class="spec">{spec_esc}</span>
      <h1>{title_esc}</h1>
      <p>{desc_esc}</p>
      <div class="actions">
        <a href="{wa_direct_url_esc}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Cotar este modelo no WhatsApp
        </a>
        <a href="/#produtos" class="btn btn-outline">
          Voltar para a Linha Completa
        </a>
      </div>
    </div>
  </main>
</body>
</html>
"""


def build_og_jpeg(src_path: Path, dest_path: Path) -> None:
    """Center the trimmed product bag inside a 1200x630 pure-white baseline JPEG."""
    with Image.open(src_path) as raw:
        img = raw.convert("RGB")

    # Trim outer studio white so the bag itself fills the central 1:1 safe zone cleanly
    # in both WhatsApp large landscape cards and square thumbnail fallbacks.
    bg = Image.new("RGB", img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg).convert("L")
    mask = diff.point(lambda p: 255 if p > 8 else 0)
    bbox = mask.getbbox()
    subject = img.crop(bbox) if bbox else img

    scale = min(SAFE_SQUARE / subject.width, SAFE_SQUARE / subject.height)
    new_size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
    resized = subject.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), (255, 255, 255))
    offset = ((OG_WIDTH - resized.width) // 2, (OG_HEIGHT - resized.height) // 2)
    canvas.paste(resized, offset)

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest_path, format="JPEG", quality=88, optimize=True, progressive=False)


def main() -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_PAGES_DIR.mkdir(parents=True, exist_ok=True)

    for model in MODELS:
        slug = model["slug"]
        src_img = PRODUCTS_DIR / model["src_image"]
        og_img = OG_DIR / f"{slug}.jpg"
        build_og_jpeg(src_img, og_img)

        page_url = f"{BASE_URL}/m/{slug}"
        og_image_url = f"{BASE_URL}/assets/produtos/og/{slug}.jpg"
        wa_direct_text = f"Oi! Queria saber mais sobre {model['wa_intro']}."
        wa_direct_url = f"https://api.whatsapp.com/send?phone={WHATSAPP_PHONE}&text={quote(wa_direct_text, safe='')}"

        rendered = PAGE_TEMPLATE.format(
            title_esc=html.escape(model["title"]),
            spec_esc=html.escape(model["spec"]),
            desc_esc=html.escape(model["desc"]),
            page_url_esc=html.escape(page_url),
            og_image_esc=html.escape(og_image_url),
            og_w=OG_WIDTH,
            og_h=OG_HEIGHT,
            src_image_esc=html.escape(model["src_image"]),
            wa_direct_url_esc=html.escape(wa_direct_url),
        )
        (MODEL_PAGES_DIR / f"{slug}.html").write_text(rendered, encoding="utf-8")

        size_kb = og_img.stat().st_size / 1024
        print(f"generated /m/{slug}.html + og/{slug}.jpg ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
