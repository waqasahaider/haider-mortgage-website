# Haider Mortgage — Go-Live Runbook

Static site (`site/`) deployed to the **Hostinger VPS**, behind the **same Traefik**
that already serves `hbsdigital.ae`, the CRM and n8n. Domain DNS is at **Tasjeel**.

> ⚠️ The only hard-to-undo step is the DNS change at Tasjeel (Step 3).
> ⚠️ **Do NOT touch the MX / email DNS records — Zoho email must stay exactly as it is.**
> The CRM, n8n and the hbsdigital.ae site on this VPS are untouched by this deploy.

---

## 1. Put the code on GitHub (from your Mac, once)

```bash
cd "/Volumes/Business/AI/Haider Mortgage/website"
git init && git add -A && git commit -m "Haider Mortgage website"
gh repo create haider-mortgage-website --private --source="." --remote=origin --push
```
(Private repo on the VPS → add a read-only deploy key, same as the HBS site.)

## 2. Bring it up on the VPS (behind the existing Traefik)

```bash
cd /docker
git clone <repo-url> haider-site
cd haider-site
docker compose up -d
docker compose ps          # haider-site-web-1 should be running
```
The container is now running and Traefik knows the route, but the TLS certificate
can only be issued once DNS points at the VPS — that's the next step.

## 3. ⚠️ DNS at Tasjeel — point haidermortgage.ae at the VPS

Add / update **only these A records** for `haidermortgage.ae`:

| Type | Name | Value        | TTL  |
|------|------|--------------|------|
| A    | `@`  | `<VPS_IP>`   | 3600 |
| A    | `www`| `<VPS_IP>`   | 3600 |

- `<VPS_IP>` is the same Hostinger VPS IP used for hbsdigital.ae.
- **Leave every MX record and any mail CNAME/TXT (SPF/DKIM/Zoho) exactly as-is.**
  Changing the A records does not affect email — Zoho keeps working.
- Propagation: 30 min – a few hours. Check: `dig +short haidermortgage.ae`.

Once DNS resolves to the VPS, Traefik completes the Let's Encrypt challenge
automatically. Then:

```bash
curl -I https://haidermortgage.ae     # expect HTTP/2 200
```

Open **https://haidermortgage.ae** — valid padlock, all pages load, `http→https`
and `www→apex` redirects work.

## 4. Contact form & chatbot callbacks
Both already deliver to **info@haidermortgage.ae** via Formspree
(form ID `xnpqodqy`). No server needed. Verify one test submission after launch.

## 5. Updating the site later
```bash
# edit files in site/, then:
git commit -am "Update copy" && git push
cd /docker/haider-site && ./deploy.sh
```
`site/` is bind-mounted → new files serve instantly, zero downtime.

## 6. (Optional, later) Turn on the true-AI chatbot
See `chatbot/README.md`. Deploy `chatbot/server.js` as one more Traefik-routed
service (or an n8n webhook), set `ANTHROPIC_API_KEY`, then add to the pages:
`<script>window.HM_CHAT_ENDPOINT='https://haidermortgage.ae/api/chat';</script>`.
Until then the chatbot runs on its built-in knowledge base (no cost).

---

## ✅ Go-live checklist
- [ ] Repo pushed to GitHub
- [ ] Cloned to `/docker/haider-site`, `docker compose up -d`
- [ ] A records `@` and `www` → VPS IP at Tasjeel (MX/email untouched)
- [ ] `dig +short haidermortgage.ae` returns the VPS IP
- [ ] `https://haidermortgage.ae` serves with a valid cert; redirects work
- [ ] hbsdigital.ae, CRM, n8n still work — unaffected
- [ ] Zoho email still sending/receiving — unaffected
- [ ] Test contact-form + chatbot callback arrive at info@haidermortgage.ae
