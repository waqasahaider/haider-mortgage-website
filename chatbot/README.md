# Haider Mortgage — AI chat assistant

The website has a chat widget on every page (`site/chat.js`). It runs in two modes:

- **Launch mode (now, default):** answers from a built-in knowledge base baked into `chat.js`.
  No backend, no API key, no cost. Good enough to go live.
- **AI mode (optional):** the widget POSTs the conversation to a small backend that calls
  Claude and returns a smart, natural answer. This needs an API key + a running backend.

Nothing is live yet. This folder holds the backend, ready to deploy when you choose.

---

## Turning on true AI

### 1. Get an Anthropic API key
Create one at console.anthropic.com. Treat it like a password — it must live **only** on the
server, never in the website code.

### 2. Run the backend
This is a ~90-line Node service (`server.js`). It keeps the key secret and talks to Claude with
a mortgage-specific, guard-railed prompt (UAE mortgages only, no invented rates/approvals,
adds "not financial advice", points people to a consultation).

```bash
cd chatbot
npm init -y && npm install express
ANTHROPIC_API_KEY=sk-ant-xxxxx  node server.js     # listens on :8080, endpoint /api/chat
```

On your Hostinger VPS this fits your existing Docker/Traefik setup as one more small service
routed at `haidermortgage.ae/api/chat` — the same pattern as the CRM and n8n. (Alternatively,
your **n8n** can BE the backend: a Webhook → Anthropic node → Respond-to-Webhook flow, no code.)

**Model:** defaults to `claude-haiku-4-5-20251001` (fast, very low cost — ideal for FAQ chat).
Set `HM_MODEL=claude-sonnet-5` for richer answers.

### 3. Point the website at it
Add one line to each page **before** `chat.js` loads, or hard-code it at the top of `chat.js`:

```html
<script>window.HM_CHAT_ENDPOINT = 'https://haidermortgage.ae/api/chat';</script>
```

That's it — the widget switches from the built-in answers to live Claude replies. Remove the
line to fall back to launch mode.

---

## Cost & safety notes
- Haiku is inexpensive per message; add simple rate-limiting (e.g. per-IP) before heavy traffic.
- The system prompt forbids inventing live rates, guaranteeing approvals, or asking for
  sensitive data, and always frames answers as general info, not financial advice.
- The widget shows a permanent disclaimer and a "book a consultation" link.
- CORS is locked to `https://haidermortgage.ae` (change via `HM_ALLOW_ORIGIN`).
