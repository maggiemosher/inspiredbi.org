/*
  access-gate.js · InspiredBI reviewer access screen
  ─────────────────────────────────────────────────────────────
  GitHub: save this file as  access-gate.js  in the main folder of the repo
          (same folder as index.html).
  To protect a page: paste this ONE line as the first line inside its <head>:
          <script src="access-gate.js"></script>
  Uses the SAME access code as e2a.html. Signing in once on any protected page
  (or on e2a.html) unlocks the others in that browser tab until it is closed.
  To change the code: put the SHA-256 hash of the new code in ACCESS_HASH below
  AND in e2a.html (search e2a.html for ACCESS_HASH).
  Note: this keeps casual visitors out; the page text is still in the page source.
*/
(function () {
  'use strict';

  var ACCESS_HASH = '9e3f70a3682beb384ea2c37d43eefdf613d13e46003dd033dd7dd29001e95c61';

  function unlocked() {
    try { return sessionStorage.getItem('e2a_ok') === '1' || !!sessionStorage.getItem('e2a_key'); }
    catch (e) { return false; }
  }
  if (unlocked()) return;

  // ── Hide the page right away, before anything shows ──
  var root = document.documentElement;
  root.classList.add('gate-locked');
  var css = document.createElement('style');
  css.textContent =
    'html.gate-locked body > *:not(#access-gate){display:none !important}' +
    '#access-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;' +
      'background:radial-gradient(ellipse 80% 60% at 70% 40%,rgba(8,145,178,.2) 0%,transparent 70%),linear-gradient(135deg,#0f2444 0%,#1a3a6b 50%,#0c2d55 100%);' +
      'font-family:Inter,"Segoe UI",Arial,sans-serif;line-height:1.5;color:#334155;text-align:left}' +
    '#access-gate *{box-sizing:border-box;margin:0;padding:0}' +
    '#access-gate .ag-card{background:#fff;border-radius:16px;padding:32px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}' +
    '#access-gate .ag-logo{height:44px;width:auto;margin-bottom:16px;background:#0f2444;padding:6px 12px;border-radius:10px;display:block}' +
    '#access-gate h1{font-family:"Playfair Display",Georgia,serif;font-size:1.5rem;line-height:1.25;color:#0f2444;font-weight:800}' +
    '#access-gate p{font-size:.92rem;margin-top:8px;color:#475569}' +
    '#access-gate label{display:block;font-weight:700;font-size:.9rem;margin-top:18px;color:#0f2444}' +
    '#access-gate input[type=password],#access-gate input[type=text]{width:100%;font:inherit;font-size:1rem;padding:11px 12px;border:2px solid #cbd5e1;border-radius:9px;margin-top:6px;color:#0f172a;background:#fff}' +
    '#access-gate .ag-show{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:.85rem}' +
    '#access-gate .ag-show label{margin:0;font-weight:500;color:#475569}' +
    '#access-gate button{margin-top:18px;width:100%;font:inherit;font-weight:700;font-size:1rem;padding:12px;border-radius:9999px;border:0;background:#0e7490;color:#fff;cursor:pointer}' +
    '#access-gate button:hover{background:#0f2444}' +
    '#access-gate :focus-visible{outline:3px solid #f59e0b;outline-offset:2px}' +
    '#access-gate .ag-msg{min-height:1.4em;margin-top:12px;font-weight:600;font-size:.88rem;color:#b02a2a}' +
    '#access-gate .ag-foot{font-size:.78rem;border-top:1px solid #e2e8f0;padding-top:12px;margin-top:18px}' +
    '#access-gate a{color:#0e7490;text-decoration:underline}';
  document.head.appendChild(css);

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  // ── Build the sign-in screen once the page body exists ──
  function buildGate() {
    var title = (document.title || 'InspiredBI').split(/\s[—|-]\s/)[0];
    var gate = document.createElement('div');
    gate.id = 'access-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'ag-title');
    gate.innerHTML =
      '<div class="ag-card">' +
        '<img class="ag-logo" src="images/logo-banner.png" alt="InspiredBI" onerror="this.style.display=\'none\'" />' +
        '<h1 id="ag-title"></h1>' +
        '<p>This page is for grant reviewers and invited partners. Enter the access code you received to continue.</p>' +
        '<form id="ag-form" novalidate>' +
          '<label for="ag-pw">Access code</label>' +
          '<input id="ag-pw" type="password" autocomplete="current-password" aria-describedby="ag-msg" />' +
          '<div class="ag-show"><input type="checkbox" id="ag-show" /><label for="ag-show">Show access code</label></div>' +
          '<button type="submit">Open page</button>' +
          '<p id="ag-msg" class="ag-msg" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<p class="ag-foot">Need access? Email <a href="mailto:contactinspiredbi@gmail.com?subject=Reviewer%20access%20request">contactinspiredbi@gmail.com</a>. &nbsp;<a href="projects.html">← Back to Projects &amp; Research</a></p>' +
      '</div>';
    gate.querySelector('#ag-title').textContent = title;
    document.body.insertBefore(gate, document.body.firstChild);

    var pw = gate.querySelector('#ag-pw'), msg = gate.querySelector('#ag-msg');
    gate.querySelector('#ag-show').addEventListener('change', function (e) { pw.type = e.target.checked ? 'text' : 'password'; });
    gate.querySelector('#ag-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!pw.value) { msg.textContent = 'Please enter the access code.'; pw.focus(); return; }
      if (!window.crypto || !crypto.subtle) { msg.textContent = 'Please open this page at https://inspiredbi.org.'; return; }
      sha256(pw.value).then(function (h) {
        if (h === ACCESS_HASH) {
          try { sessionStorage.setItem('e2a_ok', '1'); } catch (err) {}
          gate.remove();
          root.classList.remove('gate-locked');
          window.dispatchEvent(new Event('resize'));
        } else {
          msg.textContent = 'That access code didn’t work. Please check it and try again.';
          pw.select();
        }
      });
    });
    pw.focus();
  }
  if (document.body) buildGate();
  else document.addEventListener('DOMContentLoaded', buildGate);
})();
