/* ============================================================
   Haider Mortgage LLC — shared behaviour
   - Mobile navigation toggle
   - Mortgage repayment calculator (client-side estimate)
   - Contact form submit via Formspree (progressive enhancement)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('navlinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Mortgage calculator ----------
     Standard amortising repayment: M = P·r(1+r)^n / ((1+r)^n − 1)
     P = loan (price − down payment), r = monthly rate, n = months.
     Estimate only — not a quote or an offer of finance. */
  var calc = document.getElementById('calc');
  if (calc) {
    var price = document.getElementById('c-price');
    var down = document.getElementById('c-down');
    var rate = document.getElementById('c-rate');
    var years = document.getElementById('c-years');
    var emiOut = document.getElementById('c-emi');
    var loanOut = document.getElementById('c-loan');

    var fmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });

    function recalc() {
      var P = Math.max(0, (+price.value || 0) - (+down.value || 0));
      var annual = (+rate.value || 0) / 100;
      var n = (+years.value || 0) * 12;
      var m;
      if (P <= 0 || n <= 0) {
        m = 0;
      } else if (annual === 0) {
        m = P / n;
      } else {
        var r = annual / 12;
        var pow = Math.pow(1 + r, n);
        m = P * r * pow / (pow - 1);
      }
      if (emiOut) emiOut.textContent = fmt.format(Math.round(m));
      if (loanOut) loanOut.textContent = 'Loan amount AED ' + fmt.format(P) +
        '  ·  ' + (years.value || 0) + ' yrs  ·  ' + (rate.value || 0) + '%';
    }

    [price, down, rate, years].forEach(function (el) {
      if (el) { el.addEventListener('input', recalc); }
    });
    recalc();
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  if (!form) return;

  var note = document.getElementById('formNote');
  var button = form.querySelector('.submit-btn');

  function showNote(message, isError) {
    if (!note) return;
    note.textContent = message;
    note.classList.add('show');
    note.classList.toggle('error', !!isError);
  }

  form.addEventListener('submit', function (e) {
    var endpoint = form.getAttribute('action') || '';

    // Placeholder endpoint: confirm locally so the page never looks broken.
    if (endpoint.indexOf('YOUR_FORM_ID') !== -1 || endpoint === '') {
      e.preventDefault();
      showNote('Thanks — your enquiry is ready. (Connect the form endpoint to start receiving these by email.)', false);
      form.reset();
      return;
    }

    if (window.fetch) {
      e.preventDefault();
      var data = new FormData(form);
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showNote('Thank you — your enquiry is on its way. One of our advisors will be in touch shortly.', false);
          } else {
            return res.json().then(function (d) {
              var msg = (d && d.errors && d.errors.length)
                ? d.errors.map(function (x) { return x.message; }).join(', ')
                : 'Something went wrong. Please email us directly.';
              showNote(msg, true);
            });
          }
        })
        .catch(function () {
          showNote('Network error. Please email or call us directly.', true);
        })
        .finally(function () {
          if (button) { button.disabled = false; button.textContent = 'Request a call back'; }
        });
    }
  });
})();
