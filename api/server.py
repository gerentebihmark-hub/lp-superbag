#!/usr/bin/env python3
"""Backend leve para captura de leads da LP Superbag Londrina e disparo direto por e-mail."""

import csv
import hmac
import html
import io
import json
import os
import re
import signal
import smtplib
import sqlite3
import ssl
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
from collections import deque
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("API_PORT", "3001"))
BIND_HOST = os.environ.get("API_HOST", "127.0.0.1")
DATA_DIR = os.environ.get("DATA_DIR", "/data")
DB_PATH = os.path.join(DATA_DIR, "leads.db")
JSONL_PATH = os.path.join(DATA_DIR, "leads.jsonl")

NOTIFY_EMAILS = [
    addr.strip()
    for addr in os.environ.get("NOTIFY_EMAIL", "comercial@superbaglda.com.br").split(",")
    if addr.strip()
]
FROM_EMAIL = os.environ.get("FROM_EMAIL", "noreply@superbaglondrina.com.br").strip()
FROM_NAME = os.environ.get("FROM_NAME", "Site Superbag Londrina").strip()
SMTP_HELO = os.environ.get("SMTP_HELO", "vmi3661905.contaboserver.net").strip()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASS = os.environ.get("SMTP_PASS", "").strip()
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()

MAX_BODY_BYTES = 16384
RATE_LIMIT_MINUTE = 5
RATE_LIMIT_HOUR = 20
MAX_EMAIL_ATTEMPTS = 6
RETRY_DELAYS_SEC = (15, 60, 300, 900, 1800)

FALLBACK_MX = {
    "superbaglda.com.br": [
        "mx.core.locaweb.com.br",
        "mx.a.locaweb.com.br",
        "mx.b.locaweb.com.br",
        "mx.jk.locaweb.com.br",
    ]
}

BRT_TZ = timezone(timedelta(hours=-3))
CONTROL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f]+")
MULTISPACE_RE = re.compile(r"\s+")

os.makedirs(DATA_DIR, exist_ok=True)
db_lock = threading.Lock()
rate_lock = threading.Lock()
rate_buckets: dict[str, deque[float]] = {}
stop_event = threading.Event()


def log_event(level: str, action: str, **details) -> None:
    """Emite log estruturado em JSON sem expor credenciais."""
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "action": action,
        **details,
    }
    print(json.dumps(entry, ensure_ascii=False), flush=True)


def clean_text(value: object, max_len: int) -> str:
    """Remove caracteres de controle (anti header-injection) e limita o tamanho."""
    if not isinstance(value, str):
        return ""
    cleaned = CONTROL_CHARS_RE.sub(" ", value)
    cleaned = MULTISPACE_RE.sub(" ", cleaned).strip()
    return cleaned[:max_len]


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) <= 4:
        return "****"
    return f"***{digits[-4:]}"


def get_client_ip(headers, fallback: str = "unknown") -> str:
    xff = (headers.get("X-Forwarded-For") or "").strip()
    if xff:
        first_hop = xff.split(",")[0].strip()
        if first_hop:
            return first_hop[:64]
    real_ip = (headers.get("X-Real-IP") or "").strip()
    if real_ip:
        return real_ip[:64]
    return (fallback or "unknown")[:64]


def is_rate_limited(ip: str) -> bool:
    now = time.monotonic()
    with rate_lock:
        bucket = rate_buckets.setdefault(ip, deque())
        while bucket and now - bucket[0] > 3600:
            bucket.popleft()
        recent_minute = sum(1 for ts in bucket if now - ts <= 60)
        if recent_minute >= RATE_LIMIT_MINUTE or len(bucket) >= RATE_LIMIT_HOUR:
            return True
        bucket.append(now)
    return False


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                source_form TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                product TEXT NOT NULL,
                qty TEXT NOT NULL,
                page_url TEXT NOT NULL,
                referrer TEXT NOT NULL,
                utm_source TEXT NOT NULL,
                utm_medium TEXT NOT NULL,
                utm_campaign TEXT NOT NULL,
                utm_content TEXT NOT NULL,
                utm_term TEXT NOT NULL,
                ip TEXT NOT NULL,
                user_agent TEXT NOT NULL,
                email_status TEXT NOT NULL DEFAULT 'pending',
                email_attempts INTEGER NOT NULL DEFAULT 0,
                email_error TEXT NOT NULL DEFAULT '',
                email_sent_at TEXT NOT NULL DEFAULT '',
                next_retry_at REAL NOT NULL DEFAULT 0
            )
            """
        )
        conn.commit()


def validate_lead(payload: object) -> tuple[dict | None, str]:
    if not isinstance(payload, dict):
        return None, "Dados inválidos."

    if clean_text(payload.get("website_url_hp", ""), 80):
        return {"_honeypot": True}, ""

    name = clean_text(payload.get("name", ""), 120)
    phone = clean_text(payload.get("phone", ""), 30)
    product = clean_text(payload.get("product", ""), 120) or "Big Bags / Sacarias"
    qty = clean_text(payload.get("qty", ""), 80) or "A definir"
    source_form = clean_text(payload.get("source_form", ""), 30) or "lp"

    if len(name) < 2:
        return None, "Informe seu nome ou empresa."

    digits = re.sub(r"\D", "", phone)
    if len(digits) < 10 or len(digits) > 13:
        return None, "Informe um telefone ou WhatsApp válido com DDD."

    return {
        "_honeypot": False,
        "source_form": source_form,
        "name": name,
        "phone": phone,
        "product": product,
        "qty": qty,
        "page_url": clean_text(payload.get("page_url", ""), 500),
        "referrer": clean_text(payload.get("referrer", ""), 500),
        "utm_source": clean_text(payload.get("utm_source", ""), 100),
        "utm_medium": clean_text(payload.get("utm_medium", ""), 100),
        "utm_campaign": clean_text(payload.get("utm_campaign", ""), 100),
        "utm_content": clean_text(payload.get("utm_content", ""), 100),
        "utm_term": clean_text(payload.get("utm_term", ""), 100),
    }, ""


def insert_lead(lead: dict, ip: str, user_agent: str) -> dict:
    created_at = datetime.now(timezone.utc).isoformat()
    with db_lock, sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            """
            INSERT INTO leads (
                created_at, source_form, name, phone, product, qty,
                page_url, referrer, utm_source, utm_medium, utm_campaign,
                utm_content, utm_term, ip, user_agent, email_status,
                email_attempts, email_error, email_sent_at, next_retry_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, '', '', 0)
            """,
            (
                created_at,
                lead["source_form"],
                lead["name"],
                lead["phone"],
                lead["product"],
                lead["qty"],
                lead["page_url"],
                lead["referrer"],
                lead["utm_source"],
                lead["utm_medium"],
                lead["utm_campaign"],
                lead["utm_content"],
                lead["utm_term"],
                ip,
                user_agent,
            ),
        )
        lead_id = cur.lastrowid
        conn.commit()

    record = {
        "id": lead_id,
        "created_at": created_at,
        **{k: v for k, v in lead.items() if k != "_honeypot"},
        "ip": ip,
    }
    try:
        with db_lock, open(JSONL_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except OSError as exc:
        log_event("warn", "jsonl_append_failed", leadId=lead_id, error=str(exc))

    return record


def build_wa_link(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits and not digits.startswith("55") and len(digits) <= 11:
        digits = f"55{digits}"
    return f"https://wa.me/{digits}" if digits else ""


def format_brt_timestamp(iso_ts: str) -> str:
    try:
        dt = datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
        return dt.astimezone(BRT_TZ).strftime("%d/%m/%Y às %H:%M:%S (BRT)")
    except ValueError:
        return iso_ts


def render_email_bodies(lead: dict) -> tuple[str, str, str]:
    subject = clean_text(f"Nova cotação pelo site — {lead['name']} ({lead['product']})", 180)
    when_brt = format_brt_timestamp(lead["created_at"])
    source_labels = {
        "hero": "Formulário Topo (Hero)",
        "bottom": "Formulário Rodapé (Contato)",
    }
    source_label = source_labels.get(
        lead.get("source_form", ""),
        f"Formulário ({lead.get('source_form') or 'lp'})",
    )
    wa_link = build_wa_link(lead["phone"])
    page_url = lead.get("page_url") or "Não informada"
    referrer = lead.get("referrer") or "Acesso direto"

    utm_pairs = [
        (k, lead[k])
        for k in ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term")
        if lead.get(k)
    ]
    utm_text = ", ".join(f"{k}={v}" for k, v in utm_pairs) or "Não informado"

    text_lines = [
        "NOVA SOLICITAÇÃO DE COTAÇÃO — SUPERBAG LONDRINA",
        "==================================================",
        f"Lead ID: #{lead['id']}",
        f"Data/Hora: {when_brt}",
        f"Origem na página: {source_label}",
        "",
        f"Nome / Empresa: {lead['name']}",
        f"WhatsApp / Telefone: {lead['phone']}",
        *([f"Abrir conversa no WhatsApp: {wa_link}"] if wa_link else []),
        f"Linha de Interesse: {lead['product']}",
        f"Quantidade Estimada: {lead['qty']}",
        "",
        f"Página de Origem: {page_url}",
        f"Origem do Acesso (Referrer): {referrer}",
        f"UTMs: {utm_text}",
    ]

    esc = html.escape
    wa_html = (
        f' <a href="{esc(wa_link)}" style="color:#D95B10;font-weight:700;text-decoration:underline;">Abrir WhatsApp</a>'
        if wa_link
        else ""
    )

    html_body = f"""<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#F6F3EC;font-family:Arial,Helvetica,sans-serif;color:#18191C;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:14px;border:1px solid #E5E0D5;overflow:hidden;">
    <tr>
      <td style="background:#131519;padding:22px 26px;border-bottom:4px solid #F37021;">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#F37021;font-weight:700;">Superbag Londrina</div>
        <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;">Nova solicitação de cotação (#{lead['id']})</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 26px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;width:165px;font-size:13px;color:#71757F;font-weight:700;">Nome / Empresa</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:15px;font-weight:700;color:#18191C;">{esc(lead['name'])}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">WhatsApp / Fone</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:15px;color:#18191C;">{esc(lead['phone'])}{wa_html}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Linha de Interesse</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:15px;color:#18191C;">{esc(lead['product'])}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Quantidade Estimada</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:15px;color:#18191C;">{esc(lead['qty'])}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Origem / Formulário</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#4A4D55;">{esc(source_label)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Data e Hora</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#4A4D55;">{esc(when_brt)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Página de Origem</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:12px;color:#71757F;word-break:break-all;">{esc(page_url)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:13px;color:#71757F;font-weight:700;">Referrer</td>
            <td style="padding:10px 0;border-bottom:1px solid #EFECE4;font-size:12px;color:#71757F;word-break:break-all;">{esc(referrer)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:13px;color:#71757F;font-weight:700;">Rastreio (UTMs)</td>
            <td style="padding:10px 0;font-size:12px;color:#71757F;">{esc(utm_text)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return subject, "\n".join(text_lines), html_body


def build_email_message(subject: str, text_body: str, html_body: str, recipient: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = recipient
    msg["Date"] = formatdate(localtime=False)
    msg["Message-ID"] = make_msgid(domain=FROM_EMAIL.split("@", 1)[-1])
    msg.set_content(text_body, charset="utf-8")
    msg.add_alternative(html_body, subtype="html", charset="utf-8")
    return msg


def resolve_mx_hosts(domain: str) -> list[str]:
    records: list[tuple[int, str]] = []
    try:
        proc = subprocess.run(
            ["dig", "+short", "MX", domain],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        for line in proc.stdout.splitlines():
            parts = line.strip().split()
            if len(parts) == 2 and parts[0].isdigit():
                host = parts[1].rstrip(".")
                if host:
                    records.append((int(parts[0]), host))
    except Exception as exc:
        log_event("warn", "mx_lookup_failed", domain=domain, error=str(exc))

    if records:
        records.sort(key=lambda item: item[0])
        return [host for _, host in records]
    return list(FALLBACK_MX.get(domain.lower(), []))


def send_via_mx(msg: EmailMessage, recipient: str) -> None:
    domain = recipient.split("@", 1)[1].strip().lower()
    mx_hosts = resolve_mx_hosts(domain)
    if not mx_hosts:
        raise RuntimeError(f"Nenhum MX encontrado para {domain}")

    last_err: Exception | None = None
    for mx_host in mx_hosts:
        try:
            with smtplib.SMTP(mx_host, 25, local_hostname=SMTP_HELO, timeout=15) as smtp:
                smtp.ehlo()
                if smtp.has_extn("starttls"):
                    # Entrega direta MTA-para-MTA (RFC 3207): gateways MX (ex.: Locaweb *.correio.biz) podem apresentar SAN diferente do host MX.
                    tls_ctx = ssl.create_default_context()
                    tls_ctx.check_hostname = False
                    tls_ctx.verify_mode = ssl.CERT_NONE
                    smtp.starttls(context=tls_ctx)
                    smtp.ehlo()
                refused = smtp.send_message(msg, from_addr=FROM_EMAIL, to_addrs=[recipient])
                if refused:
                    raise RuntimeError(f"Destinatário recusado por {mx_host}: {refused}")
                return
        except Exception as exc:
            last_err = exc
            log_event("warn", "mx_attempt_failed", mx=mx_host, error=str(exc))
    raise RuntimeError(f"Falha em todos os MX ({', '.join(mx_hosts)}): {last_err}")


def send_via_smtp(msg: EmailMessage, recipient: str) -> None:
    tls_ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=tls_ctx, timeout=15) as smtp:
            if SMTP_USER and SMTP_PASS:
                smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(msg, from_addr=FROM_EMAIL, to_addrs=[recipient])
        return

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        smtp.ehlo()
        if smtp.has_extn("starttls"):
            smtp.starttls(context=tls_ctx)
            smtp.ehlo()
        if SMTP_USER and SMTP_PASS:
            smtp.login(SMTP_USER, SMTP_PASS)
        smtp.send_message(msg, from_addr=FROM_EMAIL, to_addrs=[recipient])


def send_via_resend(subject: str, text_body: str, html_body: str, recipients: list[str]) -> None:
    payload = json.dumps(
        {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": recipients,
            "subject": subject,
            "text": text_body,
            "html": html_body,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        if resp.status >= 300:
            raise RuntimeError(f"Resend HTTP {resp.status}")


def fetch_lead_by_id(lead_id: int) -> dict | None:
    with db_lock, sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
    return dict(row) if row else None


def dispatch_lead_email(lead_id: int) -> None:
    lead = fetch_lead_by_id(lead_id)
    if not lead or lead["email_status"] == "sent":
        return

    attempts = int(lead["email_attempts"]) + 1
    subject, text_body, html_body = render_email_bodies(lead)

    try:
        if RESEND_API_KEY:
            send_via_resend(subject, text_body, html_body, NOTIFY_EMAILS)
            transport = "resend"
        elif SMTP_HOST:
            for recipient in NOTIFY_EMAILS:
                msg = build_email_message(subject, text_body, html_body, recipient)
                send_via_smtp(msg, recipient)
            transport = "smtp"
        else:
            for recipient in NOTIFY_EMAILS:
                msg = build_email_message(subject, text_body, html_body, recipient)
                send_via_mx(msg, recipient)
            transport = "direct_mx"

        sent_at = datetime.now(timezone.utc).isoformat()
        with db_lock, sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """
                UPDATE leads
                SET email_status = 'sent', email_attempts = ?, email_error = '', email_sent_at = ?, next_retry_at = 0
                WHERE id = ?
                """,
                (attempts, sent_at, lead_id),
            )
            conn.commit()
        log_event("info", "lead_email_sent", leadId=lead_id, transport=transport, attempts=attempts)
    except Exception as exc:
        err_msg = clean_text(str(exc), 400)
        if attempts >= MAX_EMAIL_ATTEMPTS:
            status = "failed"
            next_retry = 0.0
            level = "error"
        else:
            delay = RETRY_DELAYS_SEC[min(attempts - 1, len(RETRY_DELAYS_SEC) - 1)]
            status = "retry"
            next_retry = time.time() + delay
            level = "warn"

        with db_lock, sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """
                UPDATE leads
                SET email_status = ?, email_attempts = ?, email_error = ?, next_retry_at = ?
                WHERE id = ?
                """,
                (status, attempts, err_msg, next_retry, lead_id),
            )
            conn.commit()
        log_event("error" if level == "error" else "warn", "lead_email_failed", leadId=lead_id, status=status, attempts=attempts, error=err_msg)


def retry_worker() -> None:
    while not stop_event.wait(20):
        now_epoch = time.time()
        stale_cutoff = (datetime.now(timezone.utc) - timedelta(seconds=45)).isoformat()
        with db_lock, sqlite3.connect(DB_PATH) as conn:
            rows = conn.execute(
                """
                SELECT id FROM leads
                WHERE (email_status = 'retry' AND next_retry_at <= ?)
                   OR (email_status = 'pending' AND created_at <= ?)
                ORDER BY id ASC
                LIMIT 10
                """,
                (now_epoch, stale_cutoff),
            ).fetchall()
        for (lead_id,) in rows:
            if stop_event.is_set():
                break
            dispatch_lead_email(lead_id)


def csv_safe_cell(val: object) -> str:
    txt = str(val or "")
    if txt.startswith(("=", "+", "-", "@")):
        return f"'{txt}"
    return txt


class LeadAPIHandler(BaseHTTPRequestHandler):
    server_version = "SuperbagLeadAPI/1.0"

    def log_message(self, format: str, *args) -> None:
        return

    def _send_json(self, code: int, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def _is_authorized(self, qs: dict[str, list[str]]) -> bool:
        if not ADMIN_TOKEN:
            return False
        auth = (self.headers.get("Authorization") or "").strip()
        bearer = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
        query_tok = (qs.get("token") or [""])[0].strip()
        candidate = bearer or query_tok
        return bool(candidate) and hmac.compare_digest(candidate, ADMIN_TOKEN)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == "/api/health":
            try:
                with db_lock, sqlite3.connect(DB_PATH) as conn:
                    conn.execute("SELECT 1").fetchone()
                self._send_json(200, {"ok": True})
            except Exception as exc:
                log_event("fatal", "healthcheck_db_failed", error=str(exc))
                self._send_json(500, {"ok": False})
            return

        if parsed.path == "/api/leads":
            qs = urllib.parse.parse_qs(parsed.query)
            if not self._is_authorized(qs):
                self._send_json(403, {"ok": False, "error": "Forbidden"})
                return

            with db_lock, sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                rows = [
                    dict(r)
                    for r in conn.execute("SELECT * FROM leads ORDER BY id DESC LIMIT 1000").fetchall()
                ]

            if (qs.get("format") or [""])[0].lower() == "csv":
                buf = io.StringIO()
                fields = [
                    "id", "created_at", "source_form", "name", "phone", "product",
                    "qty", "utm_source", "utm_medium", "utm_campaign", "email_status",
                    "email_attempts", "email_sent_at", "email_error",
                ]
                writer = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
                writer.writeheader()
                for row in rows:
                    writer.writerow({k: csv_safe_cell(row.get(k, "")) for k in fields})
                raw = ("\ufeff" + buf.getvalue()).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/csv; charset=utf-8")
                self.send_header("Content-Disposition", 'attachment; filename="leads-superbag.csv"')
                self.send_header("Content-Length", str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)
                return

            self._send_json(200, {"ok": True, "count": len(rows), "leads": rows})
            return

        self._send_json(404, {"ok": False, "error": "Not Found"})

    def do_POST(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path != "/api/lead":
            self._send_json(404, {"ok": False, "error": "Not Found"})
            return

        ip = get_client_ip(self.headers, self.client_address[0] if self.client_address else "unknown")
        if is_rate_limited(ip):
            log_event("warn", "rate_limited", ip=ip)
            self._send_json(
                429,
                {
                    "ok": False,
                    "error": "Muitas solicitações seguidas. Aguarde um minuto e tente novamente.",
                },
            )
            return

        try:
            content_len = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"ok": False, "error": "Requisição inválida."})
            return

        if content_len <= 0 or content_len > MAX_BODY_BYTES:
            self._send_json(413 if content_len > MAX_BODY_BYTES else 400, {"ok": False, "error": "Payload inválido."})
            return

        ctype = (self.headers.get("Content-Type") or "").lower()
        if "application/json" not in ctype:
            self._send_json(415, {"ok": False, "error": "Formato inválido."})
            return

        try:
            raw_body = self.rfile.read(content_len)
            payload = json.loads(raw_body.decode("utf-8"))
        except Exception:
            self._send_json(400, {"ok": False, "error": "JSON inválido."})
            return

        lead, err = validate_lead(payload)
        if err:
            self._send_json(400, {"ok": False, "error": err})
            return

        if lead and lead.get("_honeypot"):
            log_event("warn", "honeypot_blocked", ip=ip)
            self._send_json(200, {"ok": True})
            return

        user_agent = clean_text(self.headers.get("User-Agent", ""), 250)
        record = insert_lead(lead, ip, user_agent)
        log_event(
            "info",
            "lead_captured",
            leadId=record["id"],
            sourceForm=record["source_form"],
            phone=mask_phone(record["phone"]),
        )

        threading.Thread(
            target=dispatch_lead_email,
            args=(record["id"],),
            daemon=True,
        ).start()

        self._send_json(200, {"ok": True, "leadId": record["id"]})


def main() -> None:
    if not NOTIFY_EMAILS:
        log_event("fatal", "missing_notify_email")
        sys.exit(1)

    init_db()
    server = ThreadingHTTPServer((BIND_HOST, PORT), LeadAPIHandler)

    def handle_shutdown(signum, _frame) -> None:
        stop_event.set()
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)

    threading.Thread(target=retry_worker, daemon=True).start()
    log_event(
        "info",
        "api_started",
        bind=f"{BIND_HOST}:{PORT}",
        recipientsCount=len(NOTIFY_EMAILS),
        mode="resend" if RESEND_API_KEY else ("smtp" if SMTP_HOST else "direct_mx"),
    )

    try:
        server.serve_forever()
    finally:
        stop_event.set()
        server.server_close()


if __name__ == "__main__":
    main()
