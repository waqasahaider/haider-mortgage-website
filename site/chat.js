/* ============================================================
   Haider Mortgage — website assistant widget
   - Injects a floating chat button + panel on every page.
   - Answers from a built-in mortgage knowledge base (no backend).
   - If window.HM_CHAT_ENDPOINT is set, it POSTs the conversation
     there instead and shows the AI reply (real LLM backend).
   ============================================================ */

(function () {
  'use strict';

  /* ---- Config: point this at your deployed backend to enable real AI ---- */
  var ENDPOINT = window.HM_CHAT_ENDPOINT || null;   // e.g. 'https://haidermortgage.ae/api/chat'
  var WHATSAPP = 'https://wa.me/971525204842';
  var PHONE = '+971 52 520 4842';
  var LEAD_ENDPOINT = 'https://formspree.io/f/xnpqodqy';  // callback requests → info@haidermortgage.ae

  /* ---------- Built-in knowledge base (fallback / launch mode) ---------- */
  // Each entry: keywords to match + an HTML answer. Kept in sync with the site's FAQ/services.
  var KB = [
    { k: ['hello','hi','hey','salam','assalam','good morning','good evening'],
      a: "Hello! I'm the Haider Mortgage assistant. Ask me anything about mortgages in the UAE — down payments, eligibility, fees, rates, refinancing and more. What would you like to know?" },
    { k: ['down payment','downpayment','deposit','how much do i need','upfront'],
      a: "For expats, banks usually finance up to <b>80%</b> of a first property under AED 5M — a <b>20% down payment</b>. Above AED 5M it's about 70% (30% down). UAE nationals can often get slightly more. On top of the deposit, budget roughly <b>6% in costs</b> (see fees). Want me to estimate a specific case?" },
    { k: ['eligible','eligibility','qualify','income','salary require','minimum income'],
      a: "Typical minimums: <b>salaried</b> from about <b>AED 10,000/month</b>, <b>self-employed</b> from about <b>AED 25,000/month</b>. Your borrowing power also depends on your commitments and the property. The best next step is a quick chat with an advisor — shall I share the contact details?" },
    { k: ['fee','fees','cost','costs','charges','dld','hidden'],
      a: "Beyond your down payment, plan for: <b>DLD registration ~4%</b>, <b>agency ~2%</b>, <b>mortgage registration 0.25%</b> of the loan, <b>bank arrangement fee ~1%</b> (often negotiable), <b>valuation ~AED 2,500–3,500</b>, plus life &amp; property insurance. We give you a full breakdown up front." },
    { k: ['rate','rates','interest','eibor','fixed','variable','profit rate'],
      a: "UAE mortgage rates are usually either <b>fixed</b> (stable for 1–5 years) or <b>variable</b> (EIBOR + a bank margin). Which is better depends on your plans and the market. We compare live offers across our bank panel to find your best rate — rates change often, so book a consultation for today's numbers." },
    { k: ['how long','tenure','term','years','maximum term','duration'],
      a: "Mortgage terms run up to <b>25 years</b>, subject to your age at maturity (usually up to 65 salaried / 70 self-employed). A longer term lowers the monthly payment but increases total interest." },
    { k: ['non resident','non-resident','overseas','abroad','expat','foreigner','outside uae'],
      a: "Yes — we arrange mortgages for <b>non-residents and expats</b>, working with lenders who understand overseas income and non-resident eligibility. It's one of our core services." },
    { k: ['self employed','self-employed','business owner','freelance','own company'],
      a: "Absolutely. <b>Self-employed</b> applicants can qualify with bank statements and audited financials; some lenders specialise in this. A minimum income of around AED 25,000/month is typical." },
    { k: ['refinance','buyout','balance transfer','switch bank','lower rate','remortgage'],
      a: "We handle <b>refinancing and buyouts</b> — moving your mortgage to a better rate or releasing equity. We compare whether switching genuinely saves you money once fees are counted, and manage the process with both banks." },
    { k: ['islamic','sharia','shariah','ijara','murabaha','halal'],
      a: "Yes — we arrange <b>Sharia-compliant home finance</b> (Ijara / Murabaha) from leading Islamic banks, compared side by side with conventional options so you can choose." },
    { k: ['commercial','office','warehouse','retail','business premises','shop'],
      a: "We arrange <b>commercial property finance</b> — offices, retail, warehouses and mixed-use — for owner-occupiers and investors, including company/SPV structures." },
    { k: ['off plan','off-plan','under construction','developer','payment plan'],
      a: "We arrange <b>off-plan and under-construction finance</b> that lines up with the developer's payment plan, and guide the switch to a full mortgage at handover." },
    { k: ['process','how does it work','steps','how do you work','get started','start'],
      a: "Four steps: <b>1) Consultation</b> — we learn your goals; <b>2) Compare &amp; pre-approve</b> — we shop the market and secure a pre-approval; <b>3) Application</b> — we manage the bank, valuation and paperwork; <b>4) Completion</b> — we coordinate transfer and handover. Want to start with a free consultation?" },
    { k: ['pre approval','pre-approval','preapproval','approved','how long approval'],
      a: "A <b>pre-approval</b> tells you what you can borrow before you shop, and makes your offer stronger. We can usually arrange one quickly once we have your basic documents." },
    { k: ['document','documents','paperwork','what do i need','requirements'],
      a: "Typically: <b>Emirates ID, passport &amp; visa, salary certificate, 6 months' bank statements, recent pay slips</b>, and details of any existing loans. Self-employed clients add trade licence and financials. We'll give you an exact checklist." },
    { k: ['what do you do','services','who are you','about','help with'],
      a: "Haider Mortgage is an independent UAE mortgage brokerage. We compare offers across 10+ banks and arrange <b>residential, non-resident, commercial, off-plan, Islamic, refinancing, equity release</b> and more — then manage the whole application to completion. See the <a href='/services/'>Services</a> page." },
    { k: ['your fee','charge me','cost to me','how do you get paid','commission','free'],
      a: "Your initial consultation is <b>free and no-obligation</b>. We're an independent broker paid for arranging the right mortgage — so our advice stays on your side, not the bank's." },
    { k: ['early settlement','pay off early','prepay','settle early'],
      a: "You can settle early by paying the outstanding balance (excluding future interest) plus a small early-settlement fee stated in the bank's offer letter. Most banks also allow partial early settlement each year without extra charge." },
    { k: ['calculator','calculate','monthly payment','emi','repayment','estimate'],
      a: "There's a repayment calculator on our <a href='/'>home page</a> — enter the price, down payment, term and rate for an instant monthly estimate. For an exact figure and your best rate, book a consultation." },
    { k: ['contact','talk','advisor','speak','call','phone','whatsapp','email','reach','book','consultation','appointment'],
      a: "I'd be glad to connect you. <br>📞 <b>" + PHONE + "</b> (call &amp; WhatsApp)<br>✉️ <a href='mailto:info@haidermortgage.ae'>info@haidermortgage.ae</a><br>Or <a href='/contact/'>book a free consultation</a> and an advisor will get back to you within one working day." }
  ];

  var FALLBACK = "That's a great question — it's best answered by one of our advisors for your specific situation. You can reach us on <b>" + PHONE + "</b> (call/WhatsApp), email <a href='mailto:info@haidermortgage.ae'>info@haidermortgage.ae</a>, or <a href='/contact/'>book a free consultation</a>. Is there anything else about UAE mortgages I can help with?";

  function normalise(s){ return ' ' + s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ') + ' '; }

  function localAnswer(text){
    var t = normalise(text), best = null, bestScore = 0;
    KB.forEach(function(entry){
      var score = 0;
      entry.k.forEach(function(kw){ if (t.indexOf(' ' + kw + ' ') !== -1 || t.indexOf(kw) !== -1) score += kw.split(' ').length; });
      if (score > bestScore){ bestScore = score; best = entry; }
    });
    return bestScore > 0 ? best.a : FALLBACK;
  }

  /* ---------- Build the widget DOM ---------- */
  var history = [];   // {role, content} for the backend
  var launcher, panel, log, input, sendBtn, opened = false;

  function el(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build(){
    launcher = el('button', 'hm-chat-launcher', '<span class="hm-ic">💬</span><span class="hm-lbl">Ask about mortgages</span>');
    launcher.setAttribute('aria-label', 'Open the mortgage assistant');

    panel = el('div', 'hm-chat-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Haider Mortgage assistant');
    panel.hidden = true;
    panel.innerHTML =
      '<div class="hm-chat-head">' +
        '<div><div class="hm-chat-title">Mortgage Assistant</div><div class="hm-chat-sub">Typically replies instantly</div></div>' +
        '<button class="hm-chat-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="hm-chat-log" id="hmChatLog"></div>' +
      '<div class="hm-chat-chips" id="hmChips"></div>' +
      '<form class="hm-chat-form" id="hmChatForm">' +
        '<input id="hmChatInput" type="text" autocomplete="off" placeholder="Ask a mortgage question…" aria-label="Type your question">' +
        '<button type="submit" class="hm-chat-send" aria-label="Send">➤</button>' +
      '</form>' +
      '<div class="hm-chat-disc">AI assistant — general information only, not financial advice. For personalised advice, <a href="/contact/">book a consultation</a>.</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    // Floating WhatsApp button
    var wa = document.createElement('a');
    wa.className = 'hm-wa-float';
    wa.href = WHATSAPP; wa.target = '_blank'; wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Chat with us on WhatsApp');
    wa.innerHTML = '<svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.157 5.335 5.492 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';
    document.body.appendChild(wa);

    log = panel.querySelector('#hmChatLog');
    input = panel.querySelector('#hmChatInput');
    sendBtn = panel.querySelector('.hm-chat-send');

    launcher.addEventListener('click', toggle);
    panel.querySelector('.hm-chat-close').addEventListener('click', toggle);
    panel.querySelector('#hmChatForm').addEventListener('submit', function(e){ e.preventDefault(); submit(input.value); });

    // quick-reply chips
    var chips = [['Down payment?','How much down payment do I need?'],
                 ['Am I eligible?','What income do I need to qualify?'],
                 ['Fees & costs','What fees and costs are involved?'],
                 ['Non-resident','Can I get a mortgage as a non-resident?'],
                 ['📞 Request a callback','__lead__']];
    var chipWrap = panel.querySelector('#hmChips');
    chips.forEach(function(c){
      var b = el('button', 'hm-chip', c[0]);
      b.addEventListener('click', function(){ if (c[1] === '__lead__') showLead(); else submit(c[1]); });
      chipWrap.appendChild(b);
    });
  }

  /* ---------- Lead capture (callback request) ---------- */
  function showLead(){
    addMsg('bot', "Of course — leave your name and number and one of our advisors will call you back, usually within one working day.");
    var form = el('form', 'hm-lead');
    form.innerHTML =
      '<input type="text" name="name" placeholder="Your name" autocomplete="name" required>' +
      '<input type="tel" name="phone" placeholder="Phone / WhatsApp number" autocomplete="tel" required>' +
      '<button type="submit">Request my callback</button>';
    log.appendChild(form);
    log.scrollTop = log.scrollHeight;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim();
      if (!name || !phone) return;
      var btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending…';
      var data = new FormData();
      data.append('name', name);
      data.append('phone', phone);
      data.append('_subject', 'Callback request from website chat');
      data.append('source', 'Website chat assistant');
      fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
        .then(function(){ form.remove(); addMsg('bot', "Thank you, <b>" + escapeHtml(name) + "</b> — we've got your request and an advisor will call you shortly. Meanwhile, feel free to ask me anything else."); })
        .catch(function(){ form.remove(); addMsg('bot', "Sorry — I couldn't submit that. Please call or WhatsApp us on <b>" + PHONE + "</b> and we'll help right away."); });
    });
  }

  function toggle(){
    opened = !opened;
    panel.hidden = !opened;
    launcher.classList.toggle('open', opened);
    if (opened){
      if (!log.childNodes.length){
        addMsg('bot', "👋 Hi! I'm the Haider Mortgage assistant. Ask me anything about mortgages in the UAE, or tap a question below.");
      }
      setTimeout(function(){ input.focus(); }, 50);
    }
  }

  function addMsg(who, html){
    var m = el('div', 'hm-msg hm-' + who, html);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }

  function typing(){
    var t = el('div', 'hm-msg hm-bot hm-typing', '<span></span><span></span><span></span>');
    log.appendChild(t); log.scrollTop = log.scrollHeight; return t;
  }

  function submit(text){
    text = (text || '').trim();
    if (!text) return;
    addMsg('user', escapeHtml(text));
    history.push({ role: 'user', content: text });
    input.value = '';
    var t = typing();

    if (ENDPOINT){
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      })
        .then(function(r){ return r.json(); })
        .then(function(d){
          t.remove();
          var reply = (d && d.reply) ? d.reply : FALLBACK;
          addMsg('bot', reply);
          history.push({ role: 'assistant', content: reply.replace(/<[^>]+>/g,'') });
        })
        .catch(function(){ t.remove(); addMsg('bot', FALLBACK); });
    } else {
      // Local knowledge-base mode (no backend)
      setTimeout(function(){
        t.remove();
        var reply = localAnswer(text);
        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply.replace(/<[^>]+>/g,'') });
      }, 500);
    }
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
