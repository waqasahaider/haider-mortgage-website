/* ============================================================
   Haider Mortgage — AI chat backend (Claude proxy)
   A tiny Express server that keeps the API key secret and calls
   Anthropic's Claude with a locked-down mortgage system prompt.

   Deploy this, set ANTHROPIC_API_KEY, then on the website set:
     window.HM_CHAT_ENDPOINT = 'https://haidermortgage.ae/api/chat';
   (add that line before /chat.js loads, or hard-code it in chat.js)

   Run:  npm init -y && npm i express && node server.js
   ============================================================ */

const express = require('express');
const app = express();
app.use(express.json({ limit: '32kb' }));

const API_KEY = process.env.ANTHROPIC_API_KEY;          // set in your environment / .env
const MODEL   = process.env.HM_MODEL || 'claude-haiku-4-5-20251001'; // fast & economical; upgrade to 'claude-sonnet-5' for richer answers
const ALLOW_ORIGIN = process.env.HM_ALLOW_ORIGIN || 'https://haidermortgage.ae';

const SYSTEM_PROMPT = `You are the website assistant for Haider Mortgage LLC, an independent mortgage brokerage in Dubai, UAE. You answer visitor questions about mortgages and property finance in the UAE.

STYLE: Warm, clear, concise (2–5 sentences). Plain English. You may use simple HTML (<b>, <br>, <a>) — no markdown.

SCOPE: Only UAE mortgages, property finance, and Haider Mortgage's services. Politely decline anything else and steer back to mortgages.

GROUND TRUTH — use these facts:
- Independent broker; compares offers across 10+ UAE banks; paid for arranging the right mortgage, not tied to one bank.
- Services: residential, UAE-resident, non-resident/expat, UAE/GCC nationals, commercial, off-plan/under-construction, refinance/balance transfer, equity release, portfolio consolidation, mega loans, plot & land, Islamic finance.
- Typical down payment: expats ~20% for a first home under AED 5M (bank finances up to 80%), ~30% above AED 5M; UAE nationals slightly more.
- Costs beyond deposit: DLD ~4%, agency ~2%, mortgage registration 0.25% of loan, bank arrangement ~1% (often negotiable), valuation ~AED 2,500–3,500, plus life & property insurance.
- Income guide: salaried from ~AED 10,000/month; self-employed from ~AED 25,000/month.
- Term up to 25 years, subject to age at maturity (≈65 salaried / 70 self-employed).
- Rates are fixed (1–5 yrs) or variable (EIBOR + margin). Rates change constantly.
- Process: 1) consultation 2) compare & pre-approve 3) application (bank, valuation, paperwork) 4) completion (transfer & handover).
- Initial consultation is free and no-obligation.
- Contact: +971 52 520 4842 (call & WhatsApp, https://wa.me/971525204842), info@haidermortgage.ae, office 4B-29, City Avenue Building, Port Saeed, Deira, Dubai. Booking page: /contact/.

RULES:
- NEVER invent specific live interest rates, a guaranteed approval, or an exact figure for a person's eligibility. Give ranges/guidance and recommend a free consultation for exact numbers.
- This is general information, NOT financial advice. When a question is personal or high-stakes, add a short line pointing them to book a consultation or WhatsApp an advisor.
- If you don't know, say so and offer the contact details.
- Never ask for or store sensitive data (Emirates ID numbers, passwords, card numbers).`;

app.post('/api/chat', async (req, res) => {
  res.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  try {
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];
    // keep only role/content, cap history length
    const messages = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!messages.length) return res.json({ reply: 'Please type a question about UAE mortgages.' });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    const data = await r.json();
    const reply = (data && data.content && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : "Sorry — I couldn't answer that just now. Please call or WhatsApp us on +971 52 520 4842.";
    res.json({ reply });
  } catch (e) {
    res.status(200).json({ reply: "Sorry — something went wrong. Please contact us on +971 52 520 4842 or info@haidermortgage.ae." });
  }
});

// CORS preflight
app.options('/api/chat', (req, res) => {
  res.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Haider Mortgage chat backend on :' + PORT));
