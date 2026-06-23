(function () {
  'use strict';

  var STORAGE_KEY = 'inspiredbi_guide_key';
  var MODEL = 'claude-haiku-4-5-20251001';

  var SYSTEM_PROMPT = [
    'You are the InspiredBI AI Guide — a warm, practical expert assistant for K-12 and university educators learning to use agentic AI and Claude Code in their teaching practice.',
    '',
    '## About InspiredBI',
    'InspiredBI (inspiredbi.org) is Dr. Maggie Mosher\'s free resource hub for educators. It focuses on agentic AI — AI that works autonomously on your behalf — and provides no-code-to-low-code tools, frameworks, and sample code educators can use immediately.',
    '',
    '## Site Pages',
    '- tutorials.html — main tutorials hub, start here',
    '- agentic.html — G.O.A.L.S. framework, Claude Cowork setup, multi-agent workflows, PlayLab, Mizou, Google Workspace Agents, GitHub Copilot for educators',
    '- chatbots.html — no-code chatbot builders (PlayLab, Mizou, MagicSchool) for classrooms',
    '- frameworks.html — C.R.A.F.T. and other prompting frameworks',
    '- compare.html — side-by-side AI tool comparison for educators',
    '- free-tools.html — curated free AI tools for educators',
    '- free-resources.html — free courses, videos, and learning guides',
    '- monitoring.html — how to supervise and assess AI use in the classroom',
    '- safe-secure.html — AI safety, data privacy, and responsible use for educators',
    '- curriculum.html — AI-aligned curriculum design resources',
    '- sample-code.html — ready-to-use CLAUDE.md templates: build a professional website with AI, syllabus chatbot, feedback pipeline, course Q&A agent',
    '',
    '## Key Concepts',
    '- G.O.A.L.S. Framework: Goal, Output Path, Autonomy Directive, Limits & Guardrails, Sources & Exemplars — the InspiredBI framework for directing agentic AI to run to completion without constant hand-holding',
    '- Claude Cowork: Anthropic\'s agentic desktop app that works with your actual files on your computer; available on Pro/Max/Team/Enterprise plans',
    '- Claude Code: Anthropic\'s CLI tool where you drop a CLAUDE.md file in a project folder and it builds software autonomously — no IDE needed',
    '- CLAUDE.md files: plain-text instruction briefs you drop in a project folder; Claude Code reads them as standing instructions and builds your project end-to-end',
    '- PlayLab / Mizou: no-code educator platforms for building AI classroom chatbots — no API key needed, student-safe',
    '- C.R.A.F.T. Framework: Context, Role, Action, Format, Tone — for structured single-turn prompts (different from agentic prompting)',
    '',
    '## How to Guide Educators',
    '- First message only: greet warmly, ask what brings them here',
    '- Match their question to the best page/resource on the site and give one concrete next step',
    '- For "how do I build X with Claude Code" → sample-code.html has CLAUDE.md templates they can copy and run immediately',
    '- For "I want a chatbot for my class but no coding" → chatbots.html for PlayLab/Mizou',
    '- For "how do I give Claude an autonomous task" → agentic.html, specifically the G.O.A.L.S. framework and Claude Cowork sections',
    '- For complete beginners → tutorials.html first, then agentic.html',
    '- Keep every response to 2-4 sentences max. Educators are time-constrained.',
    '- One idea per message. Never overwhelm.',
    '- If something is outside your knowledge, point to index.html#contact',
    '',
    '## Your Personality',
    '- Warm, direct, expert — like a knowledgeable colleague who has already figured out the hard parts',
    '- Never salesy. Never pad responses.',
    '- Always end with one clear, actionable next step'
  ].join('\n');

  /* ── CSS ── */
  var css = [
    '#ibi-guide-btn {',
    '  position: fixed; bottom: 28px; right: 28px; z-index: 999;',
    '  width: 56px; height: 56px; border-radius: 50%;',
    '  background: linear-gradient(135deg, #1A2744, #3B7DD8);',
    '  border: 2px solid rgba(255,255,255,0.2);',
    '  color: #fff; font-size: 22px; cursor: pointer;',
    '  box-shadow: 0 4px 20px rgba(26,39,68,0.4);',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '  line-height: 1;',
    '}',
    '#ibi-guide-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(26,39,68,0.5); }',
    '#ibi-guide-btn .ibi-pulse {',
    '  position: absolute; top: -3px; right: -3px;',
    '  width: 14px; height: 14px; border-radius: 50%;',
    '  background: #C9963A;',
    '  animation: ibi-pulse-ring 2s ease-in-out infinite;',
    '}',
    '@keyframes ibi-pulse-ring {',
    '  0%,100%{transform:scale(1);opacity:1}',
    '  50%{transform:scale(1.4);opacity:0.6}',
    '}',
    '#ibi-guide-panel {',
    '  position: fixed; bottom: 96px; right: 28px; z-index: 998;',
    '  width: 360px; max-height: 540px;',
    '  background: #fff; border-radius: 16px;',
    '  box-shadow: 0 16px 48px rgba(26,39,68,0.22);',
    '  border: 1px solid #E8E2D8;',
    '  display: flex; flex-direction: column;',
    '  transform: translateY(20px) scale(0.97); opacity: 0;',
    '  pointer-events: none;',
    '  transition: transform 0.25s ease, opacity 0.25s ease;',
    '  overflow: hidden;',
    '}',
    '#ibi-guide-panel.ibi-open {',
    '  transform: translateY(0) scale(1); opacity: 1; pointer-events: all;',
    '}',
    '.ibi-header {',
    '  background: linear-gradient(135deg, #1A2744 0%, #2a3f6b 100%);',
    '  padding: 14px 18px;',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  flex-shrink: 0;',
    '}',
    '.ibi-header-left { display: flex; align-items: center; gap: 10px; }',
    '.ibi-avatar {',
    '  width: 32px; height: 32px; border-radius: 50%;',
    '  background: linear-gradient(135deg, #C9963A, #F0C060);',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-size: 14px; flex-shrink: 0;',
    '}',
    '.ibi-title { color: #fff; font-weight: 700; font-size: 14px; font-family: Inter, sans-serif; }',
    '.ibi-status { color: rgba(255,255,255,0.6); font-size: 11px; font-family: Inter, sans-serif; }',
    '.ibi-online-dot {',
    '  display: inline-block; width: 7px; height: 7px;',
    '  border-radius: 50%; background: #4ade80;',
    '  margin-right: 4px; vertical-align: middle;',
    '}',
    '.ibi-close-btn {',
    '  background: rgba(255,255,255,0.1); border: none; color: #fff;',
    '  width: 28px; height: 28px; border-radius: 50%; cursor: pointer;',
    '  font-size: 16px; display: flex; align-items: center; justify-content: center;',
    '  transition: background 0.2s; flex-shrink: 0;',
    '}',
    '.ibi-close-btn:hover { background: rgba(255,255,255,0.2); }',
    '.ibi-messages {',
    '  flex: 1; overflow-y: auto; padding: 16px;',
    '  display: flex; flex-direction: column; gap: 12px;',
    '  scroll-behavior: smooth;',
    '}',
    '.ibi-messages::-webkit-scrollbar { width: 4px; }',
    '.ibi-messages::-webkit-scrollbar-track { background: transparent; }',
    '.ibi-messages::-webkit-scrollbar-thumb { background: #E8E2D8; border-radius: 4px; }',
    '.ibi-msg {',
    '  max-width: 88%; line-height: 1.55;',
    '  font-size: 13.5px; font-family: Inter, sans-serif;',
    '}',
    '.ibi-msg.ibi-user {',
    '  align-self: flex-end;',
    '  background: linear-gradient(135deg, #1A2744, #2a3f6b);',
    '  color: #fff; padding: 10px 14px;',
    '  border-radius: 16px 16px 4px 16px;',
    '}',
    '.ibi-msg.ibi-assistant {',
    '  align-self: flex-start;',
    '  background: #F4F1EB; color: #1A1A2E;',
    '  padding: 10px 14px;',
    '  border-radius: 4px 16px 16px 16px;',
    '}',
    '.ibi-typing {',
    '  align-self: flex-start;',
    '  background: #F4F1EB; padding: 10px 16px;',
    '  border-radius: 4px 16px 16px 16px;',
    '  display: flex; gap: 5px; align-items: center;',
    '}',
    '.ibi-typing span {',
    '  width: 7px; height: 7px; border-radius: 50%; background: #C9963A;',
    '  animation: ibi-bounce 1.2s ease-in-out infinite;',
    '}',
    '.ibi-typing span:nth-child(2) { animation-delay: 0.2s; }',
    '.ibi-typing span:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes ibi-bounce {',
    '  0%,80%,100%{transform:translateY(0)}',
    '  40%{transform:translateY(-6px)}',
    '}',
    '.ibi-input-area {',
    '  padding: 12px 14px 14px;',
    '  border-top: 1px solid #E8E2D8;',
    '  display: flex; gap: 8px; align-items: flex-end;',
    '  flex-shrink: 0;',
    '}',
    '#ibi-input {',
    '  flex: 1; border: 1.5px solid #E8E2D8; border-radius: 10px;',
    '  padding: 9px 12px; font-family: Inter, sans-serif; font-size: 13.5px;',
    '  color: #1A1A2E; resize: none; outline: none;',
    '  transition: border-color 0.2s; min-height: 40px; max-height: 100px;',
    '  line-height: 1.5;',
    '}',
    '#ibi-input:focus { border-color: #3B7DD8; }',
    '#ibi-input::placeholder { color: #9CA3AF; }',
    '#ibi-send {',
    '  width: 38px; height: 38px; border-radius: 10px; border: none;',
    '  background: linear-gradient(135deg, #C9963A, #F0C060);',
    '  color: #1A2744; cursor: pointer; font-size: 16px;',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: opacity 0.2s, transform 0.15s; flex-shrink: 0;',
    '}',
    '#ibi-send:hover:not(:disabled) { transform: translateY(-1px); }',
    '#ibi-send:disabled { opacity: 0.45; cursor: not-allowed; }',
    '.ibi-setup {',
    '  flex: 1; padding: 20px 18px; display: flex; flex-direction: column; gap: 12px;',
    '  justify-content: center;',
    '}',
    '.ibi-setup p { font-size: 13px; color: #5A6070; line-height: 1.6; font-family: Inter, sans-serif; }',
    '.ibi-setup strong { color: #1A2744; }',
    '.ibi-setup a { color: #3B7DD8; font-weight: 600; }',
    '#ibi-key-input {',
    '  border: 1.5px solid #E8E2D8; border-radius: 8px;',
    '  padding: 9px 12px; font-family: monospace; font-size: 12px;',
    '  width: 100%; outline: none; color: #1A2744;',
    '  transition: border-color 0.2s;',
    '}',
    '#ibi-key-input:focus { border-color: #3B7DD8; }',
    '#ibi-key-submit {',
    '  background: linear-gradient(135deg, #1A2744, #2a3f6b);',
    '  color: #fff; border: none; border-radius: 8px;',
    '  padding: 10px 16px; font-family: Inter, sans-serif;',
    '  font-size: 13px; font-weight: 700; cursor: pointer;',
    '  transition: opacity 0.2s;',
    '}',
    '#ibi-key-submit:hover { opacity: 0.88; }',
    '.ibi-key-error { color: #dc2626; font-size: 12px; font-family: Inter, sans-serif; display: none; }',
    '.ibi-reset-key {',
    '  font-size: 11px; color: #9CA3AF; text-align: right;',
    '  font-family: Inter, sans-serif; cursor: pointer; text-decoration: underline;',
    '  background: none; border: none; padding: 0;',
    '}',
    '@media (max-width: 480px) {',
    '  #ibi-guide-panel { right: 12px; bottom: 84px; width: calc(100vw - 24px); }',
    '  #ibi-guide-btn { right: 16px; bottom: 20px; }',
    '}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── DOM ── */
  var btn = document.createElement('button');
  btn.id = 'ibi-guide-btn';
  btn.setAttribute('aria-label', 'Open AI Guide');
  btn.innerHTML = '<span class="ibi-pulse"></span>💬';

  var panel = document.createElement('div');
  panel.id = 'ibi-guide-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'InspiredBI AI Guide');
  panel.innerHTML = [
    '<div class="ibi-header">',
    '  <div class="ibi-header-left">',
    '    <div class="ibi-avatar">🎓</div>',
    '    <div>',
    '      <div class="ibi-title">InspiredBI Guide</div>',
    '      <div class="ibi-status"><span class="ibi-online-dot"></span>Ready to help</div>',
    '    </div>',
    '  </div>',
    '  <button class="ibi-close-btn" id="ibi-close" aria-label="Close guide">✕</button>',
    '</div>',
    '<div id="ibi-body"></div>'
  ].join('');

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  /* ── State ── */
  var messages = [];
  var isLoading = false;
  var isOpen = false;
  var hasShownPulse = false;

  function getApiKey() { return localStorage.getItem(STORAGE_KEY) || ''; }
  function setApiKey(k) { localStorage.setItem(STORAGE_KEY, k.trim()); }

  /* ── Setup Screen ── */
  function renderSetup() {
    var body = document.getElementById('ibi-body');
    body.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;';
    body.innerHTML = [
      '<div class="ibi-setup">',
      '  <p><strong>Welcome to the InspiredBI AI Guide</strong> — your on-page assistant for agentic AI in education.</p>',
      '  <p>This guide uses the Anthropic Claude API. Enter your API key below — it\'s stored only in your browser and used only to call Anthropic\'s servers directly.</p>',
      '  <p>Need a key? <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Get one free at console.anthropic.com</a> (new accounts get $5 credit).</p>',
      '  <input id="ibi-key-input" type="password" placeholder="sk-ant-..." autocomplete="off" />',
      '  <div class="ibi-key-error" id="ibi-key-error">Invalid key format. Anthropic keys start with sk-ant-</div>',
      '  <button id="ibi-key-submit">Start Guide →</button>',
      '</div>'
    ].join('');

    document.getElementById('ibi-key-submit').addEventListener('click', function () {
      var val = document.getElementById('ibi-key-input').value.trim();
      if (!val.startsWith('sk-ant-') && !val.startsWith('sk-')) {
        document.getElementById('ibi-key-error').style.display = 'block';
        return;
      }
      setApiKey(val);
      renderChat();
    });

    document.getElementById('ibi-key-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('ibi-key-submit').click();
    });
  }

  /* ── Chat Screen ── */
  function renderChat() {
    var body = document.getElementById('ibi-body');
    body.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;';
    body.innerHTML = [
      '<div id="ibi-messages" class="ibi-messages"></div>',
      '<div class="ibi-input-area">',
      '  <textarea id="ibi-input" rows="1" placeholder="Ask me anything…" maxlength="500"></textarea>',
      '  <button id="ibi-send" aria-label="Send">➤</button>',
      '</div>',
      '<div style="text-align:center;padding:4px 0 8px;flex-shrink:0;">',
      '  <button class="ibi-reset-key" id="ibi-reset-key">Change API key</button>',
      '</div>'
    ].join('');

    document.getElementById('ibi-reset-key').addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEY);
      messages = [];
      renderSetup();
    });

    var sendBtn = document.getElementById('ibi-send');
    var inputEl = document.getElementById('ibi-input');

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    sendBtn.addEventListener('click', handleSend);

    if (messages.length === 0) {
      addMessage('assistant', 'Hi! I\'m the InspiredBI AI Guide. I\'m here to help you find the right agentic AI resources for your teaching. What brings you here today?');
    } else {
      messages.forEach(function (m) { renderMessage(m.role, m.content); });
    }
  }

  function renderMessage(role, content) {
    var el = document.createElement('div');
    el.className = 'ibi-msg ibi-' + role;
    el.textContent = content;
    var container = document.getElementById('ibi-messages');
    if (container) {
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
    return el;
  }

  function addMessage(role, content) {
    messages.push({ role: role, content: content });
    renderMessage(role, content);
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'ibi-typing';
    el.id = 'ibi-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    var container = document.getElementById('ibi-messages');
    if (container) {
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
  }

  function hideTyping() {
    var el = document.getElementById('ibi-typing');
    if (el) el.remove();
  }

  function handleSend() {
    if (isLoading) return;
    var inputEl = document.getElementById('ibi-input');
    if (!inputEl) return;
    var text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    var sendBtn = document.getElementById('ibi-send');
    if (sendBtn) sendBtn.disabled = true;

    addMessage('user', text);
    isLoading = true;
    showTyping();

    var payload = {
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.filter(function (m) { return m.role === 'user' || m.role === 'assistant'; })
    };

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (e) { throw new Error(e.error && e.error.message || 'API error ' + res.status); });
        }
        return res.json();
      })
      .then(function (data) {
        hideTyping();
        var reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I couldn\'t generate a response.';
        addMessage('assistant', reply);
      })
      .catch(function (err) {
        hideTyping();
        var errMsg = err.message || 'Something went wrong.';
        if (errMsg.indexOf('401') !== -1 || errMsg.indexOf('invalid') !== -1) {
          errMsg = 'Invalid API key. Click "Change API key" below to update it.';
        }
        addMessage('assistant', '⚠️ ' + errMsg);
      })
      .finally(function () {
        isLoading = false;
        if (sendBtn) sendBtn.disabled = false;
        if (inputEl) inputEl.focus();
      });
  }

  /* ── Toggle ── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('ibi-open');
    btn.innerHTML = '✕';
    btn.querySelector && (btn.innerHTML = '✕');
    var pulse = btn.querySelector('.ibi-pulse');
    if (pulse) pulse.remove();

    if (!document.getElementById('ibi-messages') && !document.getElementById('ibi-key-input')) {
      if (getApiKey()) {
        renderChat();
      } else {
        renderSetup();
      }
    }
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('ibi-open');
    btn.innerHTML = '<span class="ibi-pulse"></span>💬';
    if (hasShownPulse) {
      var pulse = btn.querySelector('.ibi-pulse');
      if (pulse) pulse.style.animation = 'none';
    }
    hasShownPulse = true;
  }

  btn.addEventListener('click', function () {
    if (isOpen) { closePanel(); } else { openPanel(); }
  });

  document.getElementById('ibi-close').addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* Stop pulse after 6s on first load */
  setTimeout(function () {
    if (!isOpen) {
      var pulse = btn.querySelector('.ibi-pulse');
      if (pulse) pulse.style.animation = 'none';
      hasShownPulse = true;
    }
  }, 6000);

})();
