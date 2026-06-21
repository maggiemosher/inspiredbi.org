(function () {
  'use strict';

  /* ── Site index ─────────────────────────────────────────────────────────── */
  var INDEX = [
    {
      title: 'Home',
      url: 'index.html',
      desc: 'About InspiredBI, Dr. Maggie Mosher, top 12 AI tools, educator resources, podcast, book, and contact.',
      keys: 'home inspiredbi maggie mosher educator ai tools contact empowered by ai podcast ai advocates ku university kansas johns hopkins xr voiss curriculum teaching goblin tools mizou playlab teachaid eduaide brisk magicschool notebooklm suno napkin canva adobe capcut inworld kapwing luma runway invideo ltx animoto skybox groovelit video media top 12 tools free tools tips chatbot agentic frameworks safe secure monitoring compare'
    },
    {
      title: 'Free Resources',
      url: 'free-resources.html',
      desc: 'Free AI courses — Google, MagicSchool, Code.org, Microsoft, Mizou, Coursera, video library.',
      keys: 'free resources courses google ai essentials ai for educators notebooklm gemini magicschool certification code.org iste microsoft copilot mizou ai powered teaching chatbot coursera deeplearning andrew ng ai for everyone videos youtube ku ai advocates book study professional development curriculum strategies frameworks ethics craft goal'
    },
    {
      title: 'Free AI Tools',
      url: 'free-tools.html',
      desc: 'Free AI tools tables, podcast, tool comparison, and resource hub for educators.',
      keys: 'free tools podcast diffit mizou playlab brisk schoolai socrait voiss canva flexclip suno adobe firefly google slides nanobanana capcut invideo clipchamp elevenlabs blockade labs luma dream machine leonardo photoroom gemini inworld comparison ferpa coppa privacy agentic magicschool chatgpt claude perplexity'
    },
    {
      title: 'Tutorials',
      url: 'tutorials.html',
      desc: 'Step-by-step AI tutorials for educators — getting started, tools, and how-to guides.',
      keys: 'tutorials how to getting started guide ai tutorial educator classroom step by step walkthrough video youtube'
    },
    {
      title: 'Agentic AI',
      url: 'agentic.html',
      desc: 'Build your own agentic AI agent — no-code tools, workflow automation, and classroom applications.',
      keys: 'agentic agent ai agent no-code automation workflow build custom ai playlab education classroom zapier make n8n autonomous'
    },
    {
      title: 'Building Chatbots',
      url: 'chatbots.html',
      desc: 'Build personalized AI chatbots for students — free platforms, deployment, and how-to guides.',
      keys: 'chatbot chatbots building mizou schoolai student chatbot personalized ai assistant custom deploy student facing boodlebox magic student'
    },
    {
      title: 'Safe & Secure AI',
      url: 'safe-secure.html',
      desc: 'Safe and ethical AI in schools — FERPA, COPPA, HIPAA, data privacy, and platform security.',
      keys: 'safe secure safety ferpa coppa hipaa privacy data protection ethical monitoring student data compliance security platform pii personally identifiable'
    },
    {
      title: 'AI Monitoring',
      url: 'monitoring.html',
      desc: 'Monitor student AI use safely — MagicSchool, SchoolAI, Google for Education, and Boodlebox.',
      keys: 'monitoring safe ethical magicschool schoolai google for education boodlebox student monitoring ai use responsible guardrails visibility logs magic student remy'
    },
    {
      title: 'Frameworks',
      url: 'frameworks.html',
      desc: 'ETHICS, CRAFT, GOAL, and G.O.A.L.S. frameworks for responsible AI use in education.',
      keys: 'frameworks ethics craft goal goals framework responsible ai equity transparency human centered critical thinking design universal design learning udl'
    },
    {
      title: 'Book Study',
      url: 'book-study.html',
      desc: 'Book study guide for Empowered by AI — discussion questions for teachers, admins, parents, and PLCs.',
      keys: 'book study empowered by ai mosher dieker turpin discussion professional learning plc guide administrator teacher parent community aai publishing'
    },
    {
      title: 'Curriculum & Teaching',
      url: 'curriculum.html',
      desc: 'AI for curriculum development, instructional coaching, assessment design, and differentiated instruction.',
      keys: 'curriculum teaching lesson plan assessment differentiation coaching instructional standards unit plan rubric formative summative udl special education iep accommodation'
    },
    {
      title: 'How to Access AI Tools',
      url: 'how-to-access.html',
      desc: 'How to access and get started with free AI tools for education — sign-up guides and setup tips.',
      keys: 'how to access get started sign up account free access setup login tutorial gemini chatgpt claude notebooklm'
    },
    {
      title: 'Compare AI Tools',
      url: 'compare.html',
      desc: 'Side-by-side comparison of AI tools — features, privacy ratings, and recommendations.',
      keys: 'compare comparison versus features pricing which tool best tool chatgpt claude gemini copilot perplexity schoolai magicschool mizou'
    },
    {
      title: 'References',
      url: 'references.html',
      desc: 'Research references, citations, and peer-reviewed publications on AI in education.',
      keys: 'references research citations studies bibliography peer reviewed academic publications researchgate google scholar mosher dieker'
    }
  ];

  /* ── Highlight matching text on page load when ?q= is in the URL ─────── */
  function highlightQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q || q.length < 2) return;

    var input = document.getElementById('site-search-input');
    if (input) input.value = q;

    var escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp(escaped, 'gi');

    function inSkipTag(node) {
      var p = node.parentNode;
      while (p && p !== document.body) {
        var t = p.nodeName;
        if (t === 'SCRIPT' || t === 'STYLE' || t === 'NOSCRIPT' ||
            t === 'INPUT' || t === 'TEXTAREA' || t === 'BUTTON' || t === 'NAV') {
          return true;
        }
        p = p.parentNode;
      }
      return false;
    }

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (inSkipTag(n)) return NodeFilter.FILTER_REJECT;
        regex.lastIndex = 0;
        return regex.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);

    var firstMark = null;
    nodes.forEach(function (textNode) {
      var str = textNode.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0, match;
      regex.lastIndex = 0;
      while ((match = regex.exec(str)) !== null) {
        frag.appendChild(document.createTextNode(str.slice(last, match.index)));
        var mark = document.createElement('mark');
        mark.style.cssText = 'background:rgba(245,158,11,0.55);color:inherit;padding:0 2px;border-radius:2px;box-shadow:0 0 0 1px rgba(245,158,11,0.4);';
        mark.textContent = match[0];
        frag.appendChild(mark);
        if (!firstMark) firstMark = mark;
        last = regex.lastIndex;
      }
      frag.appendChild(document.createTextNode(str.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });

    if (firstMark) {
      setTimeout(function () {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 280);
    }
  }

  /* ── Live dropdown search ─────────────────────────────────────────────── */
  function getDropdown() { return document.getElementById('search-dropdown'); }
  function hideDropdown() { var d = getDropdown(); if (d) d.style.display = 'none'; }

  function runSearch(q) {
    var dropdown = getDropdown();
    if (!dropdown) return;
    var lower = q.toLowerCase().trim();
    if (!lower) { hideDropdown(); return; }

    var results = INDEX.filter(function (page) {
      return page.title.toLowerCase().indexOf(lower) !== -1 ||
             page.desc.toLowerCase().indexOf(lower) !== -1 ||
             page.keys.toLowerCase().indexOf(lower) !== -1;
    });

    dropdown.innerHTML = '';

    if (results.length === 0) {
      var msg = document.createElement('div');
      msg.style.cssText = 'padding:14px 16px;font-size:.875rem;color:#64748b;text-align:center;';
      msg.innerHTML = 'No results for <strong>"' + q + '"</strong>';
      dropdown.appendChild(msg);
    } else {
      results.forEach(function (page) {
        var a = document.createElement('a');
        a.href = page.url + '?q=' + encodeURIComponent(q);
        a.style.cssText = 'display:block;padding:10px 16px;border-bottom:1px solid #f1f5f9;text-decoration:none;transition:background .15s;';
        a.innerHTML =
          '<div style="font-size:.875rem;font-weight:700;color:#0f2444;margin-bottom:2px;">' + page.title + '</div>' +
          '<div style="font-size:.78rem;color:#64748b;line-height:1.4;">' + page.desc + '</div>';
        a.addEventListener('mouseenter', function () { this.style.background = '#eff6ff'; });
        a.addEventListener('mouseleave', function () { this.style.background = ''; });
        dropdown.appendChild(a);
      });
    }
    dropdown.style.display = 'block';
  }

  /* ── Wire up events after DOM is ready ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    highlightQuery();

    var input = document.getElementById('site-search-input');
    if (!input) return;

    input.addEventListener('input', function () { runSearch(this.value); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = this.value.trim();
        if (!q) return;
        var firstLink = (getDropdown() || {}).querySelector && getDropdown().querySelector('a');
        if (firstLink) window.location.href = firstLink.href;
      }
      if (e.key === 'Escape') { hideDropdown(); this.blur(); }
    });

    document.addEventListener('click', function (e) {
      var wrap = document.getElementById('search-wrap');
      if (wrap && !wrap.contains(e.target)) hideDropdown();
    });
  });

}());
