#!/usr/bin/env python3
"""md2week.py · InspiredBI AI Weekly publisher
GitHub: save as  scripts/md2week.py  (inside the scripts folder of the inspiredbi.org repo).
Used by the Monday "InspiredBI AI Weekly" scheduled task to turn the issue (Markdown) into
the weekly-news.html layout and insert it at the top of the page.

Usage (run from the repo's main folder):
  python3 scripts/md2week.py ai-weekly-YYYY-MM-DD.md weekly-news.html weekly-news.html "Theme of last week's issue"

What it does: builds the <article class="week-entry"> block (podcast picks, six audience
sections with embedded videos and source links, Free AI Tools Worth Trying), puts it first,
updates the "Latest Issue" banner, adds last week's issue to Past Issues, points old
free-tools.html links to free-resources.html, and refuses to add the same week twice.
"""
import re, sys, html as H

AUD = {
    "k12": ("K-12 EDUCATORS", "K-12 Educators", "🎓"),
    "leaders": ("SCHOOL LEADERS", "School Leaders", "🏫"),
    "highered": ("HIGHER ED FACULTY", "Higher Ed Faculty", "🏛️"),
    "operations": ("OPERATIONS & FINANCE", "Operations &amp; Finance", "💼"),
    "edtech": ("ED TECH ENGINEERS", "Ed Tech Engineers", "💻"),
    "community": ("COMMUNITY", "Community", "🌍"),
}
MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

def fix_url(u):
    return u.replace("https://inspiredbi.org/free-tools.html", "https://inspiredbi.org/free-resources.html")

def inline(t):
    """markdown inline -> html (links, bold), escaping text."""
    out, pos = [], 0
    for m in re.finditer(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", t):
        out.append(bold(H.escape(t[pos:m.start()], quote=False)))
        out.append('<a href="%s" target="_blank" rel="noopener">%s</a>' % (H.escape(fix_url(m.group(2))), bold(H.escape(m.group(1), quote=False))))
        pos = m.end()
    out.append(bold(H.escape(t[pos:], quote=False)))
    return "".join(out)

def bold(s):
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)

def yt_id(url):
    m = re.search(r"(?:v=|youtu\.be/|embed/)([A-Za-z0-9_-]{6,})", url)
    return m.group(1) if m else None

def parse(md):
    lines = md.splitlines()
    meta = {}
    m = re.search(r"Week of (\w+) (\d+), (\d{4}) · Issue #(\d+)", md)
    meta["month"], meta["day"], meta["year"], meta["num"] = m.group(1), int(m.group(2)), m.group(3), int(m.group(4))
    meta["iso"] = "%s-%02d-%02d" % (meta["year"], MONTHS.index(meta["month"]) + 1, meta["day"])
    sections, cur = [], None
    for ln in lines:
        h = re.match(r"^## (.+?)(?:\s*\{#(\w+)\})?\s*$", ln)
        if h:
            cur = {"title": h.group(1), "id": h.group(2), "lines": []}
            sections.append(cur)
        elif cur is not None:
            cur["lines"].append(ln)
    return meta, sections

def podcast_block(sec):
    items, cur = [], None
    for ln in sec["lines"]:
        m = re.match(r"^\d+\.\s+\*\*(.+?):\*\*\s+(.*)$", ln)
        if m:
            cur = [m.group(1), m.group(2), ""]
            items.append(cur)
        elif ln.startswith("→") and cur:
            cur[2] = ln.lstrip("→ ").strip()
    li = "\n".join(
        '        <li>\n          <strong>%s:</strong> %s\n          <span class="pick-desc">→ %s</span>\n        </li>' % (H.escape(r), inline(l), inline(d))
        for r, l, d in items)
    return ('    <!-- ── PODCAST PICKS ─────────────────────────────────────── -->\n'
            '    <div class="podcast-picks">\n'
            '      <div class="podcast-picks-title">🎧 Podcast Picks - Which Episode Is Best for Your Role?</div>\n'
            '      <ol class="podcast-picks-list">\n%s\n      </ol>\n    </div>\n' % li)

def audience_block(sec, meta):
    aid = sec["id"]
    label, name, icon = AUD[aid]
    body = [l for l in sec["lines"]]
    # paragraphs separated by blank lines
    paras, buf = [], []
    for l in body + [""]:
        if l.strip() == "":
            if buf: paras.append(" ".join(buf)); buf = []
        else:
            buf.append(l.strip())
    badge = paras[0]                      # "What's New · November 2026"
    headline = paras[1]
    rest = paras[2:]
    text_ps, videos, links = [], [], ""
    i = 0
    while i < len(rest):
        p = rest[i]
        if p.startswith("🎬"):
            # "🎬 **Title** (Channel) - desc https://youtube..."
            m = re.match(r"🎬\s+\*\*(.+?)\*\*\s*(.*?)\s+(https?://\S+)$", p)
            videos.append((m.group(1), m.group(2).strip(), m.group(3)))
        elif re.match(r"^\[[^\]]+\]\(https?://", p) and not text_ps == [] and p.count("](") >= 1 and p.startswith("["):
            links = p
        else:
            text_ps.append(p)
        i += 1
    wn = "\n".join("          <p>%s</p>" % inline(p) for p in text_ps)
    vids = []
    for title, extra, url in videos:
        vid = yt_id(url)
        cap = extra
        mm = re.match(r"^\((.+?)\)\s*-\s*(.*)$", extra)
        if mm:
            cap = "%s (%s)" % (mm.group(2), mm.group(1))
        vids.append(
            '          <div class="video-card">\n'
            '            <p class="video-label">🎬 %s</p>\n'
            '            <p class="video-caption">%s</p>\n'
            '            <div class="video-wrapper">\n'
            '              <iframe src="https://www.youtube.com/embed/%s" title="%s" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>\n'
            '            </div>\n          </div>' % (H.escape(title, quote=False), inline(cap), vid, H.escape(title)))
    link_html = "\n".join('          <a href="%s" target="_blank" rel="noopener">%s</a>' % (H.escape(fix_url(u)), H.escape(t, quote=False))
                          for t, u in re.findall(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", links))
    return ('    <!-- ── %s %s -->\n'
            '    <section class="audience-section %s" id="%s-%s">\n'
            '      <div class="audience-header %s-header">\n'
            '        <div class="audience-icon">%s</div>\n'
            '        <div class="audience-header-text">\n'
            '          <h2>%s</h2>\n'
            '          <p class="subtitle">%s</p>\n'
            '        </div>\n      </div>\n'
            '      <div class="audience-body">\n\n'
            '        <div class="whats-new">\n'
            '          <span class="badge">%s</span>\n%s\n        </div>\n\n'
            '        <div class="video-grid">\n%s\n        </div>\n\n'
            '        <div class="extra-links">\n%s\n        </div>\n'
            '      </div>\n    </section>\n') % (
        label, "─" * max(4, 52 - len(label)), aid, aid, meta["iso"], aid, icon, name,
        H.escape(headline, quote=False), H.escape(badge, quote=False), wn, "\n".join(vids), link_html)

def tools_block(sec, meta):
    paras, buf = [], []
    for l in sec["lines"] + [""]:
        if l.strip() == "":
            if buf: paras.append(buf); buf = []
        else:
            buf.append(l.strip())
    intro = " ".join(paras[0])
    cards = []
    for p in paras[1:]:
        head = p[0]
        rows = []
        for r in p[1:]:
            m = re.match(r"^\*\*(.+?[:?])\*\*\s*(.*)$", r)
            if m:
                rows.append('            <p><strong>%s</strong> %s</p>' % (H.escape(m.group(1)), inline(m.group(2))))
        cards.append('          <div class="tool-review">\n            <h3>%s</h3>\n%s\n          </div>' % (inline(head), "\n".join(rows)))
    return ('    <!-- ── FREE AI TOOLS WORTH TRYING ────────────────────────── -->\n'
            '    <section class="audience-section freetools" id="freetools-%s">\n'
            '      <div class="audience-header freetools-header">\n'
            '        <div class="audience-icon">🆓</div>\n'
            '        <div class="audience-header-text">\n'
            '          <h2>Free AI Tools Worth Trying</h2>\n'
            '          <p class="subtitle">Honest reviews of free tools for teaching and learning</p>\n'
            '        </div>\n      </div>\n'
            '      <div class="audience-body">\n'
            '        <p class="tools-intro">%s</p>\n'
            '        <div class="tool-grid">\n%s\n        </div>\n'
            '      </div>\n    </section>\n') % (meta["iso"], inline(intro), "\n".join(cards))

TOOLS_CSS = """
    /* -- Free AI Tools Worth Trying (added Issue #21) -- */
    .freetools-header { background: linear-gradient(90deg, #8a6100, #e8ac00); }
    .freetools .tools-intro { font-size: 0.95rem; color: #555; margin-bottom: 18px; }
    .freetools .tools-intro a { color: #1f5493; font-weight: 600; text-decoration: underline; }
    .tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; }
    .tool-review { background: #fffaf0; border: 1px solid #f3dca0; border-left: 4px solid #e8ac00; border-radius: 10px; padding: 16px 18px; }
    .tool-review h3 { font-size: 1.02rem; font-weight: 800; color: #1f5493; margin-bottom: 8px; line-height: 1.35; }
    .tool-review h3 a, .tool-review p a { color: #1f5493; text-decoration: underline; }
    .tool-review p { font-size: 0.9rem; line-height: 1.55; margin-top: 6px; color: #333; }
    .whats-new p + p { margin-top: 12px; }
    .whats-new a { color: #1f5493; font-weight: 600; text-decoration: underline; }
"""

def build(md_path, page_path, out_path, theme_prev, theme_prev2=None):
    md = open(md_path, encoding="utf-8").read()
    page = open(page_path, encoding="utf-8").read()
    meta, secs = parse(md)
    if 'id="week-%s"' % meta["iso"] in page:
        sys.exit("Issue for week %s is already on the page; nothing changed." % meta["iso"])
    parts = []
    for s in secs:
        if s["title"].startswith("🎧"):
            parts.append(podcast_block(s))
        elif s["id"] in AUD:
            parts.append(audience_block(s, meta))
        elif "Free AI Tools" in s["title"]:
            parts.append(tools_block(s, meta))
    date_txt = "%s %d, %s" % (meta["month"], meta["day"], meta["year"])
    block = ('  <!-- ══════════ WEEK #%d - %s ══════════ -->\n'
             '  <article class="week-entry" id="week-%s">\n\n%s\n  </article>\n'
             '  <!-- ══════════ END WEEK #%d ══════════ -->\n\n') % (meta["num"], date_txt, meta["iso"], "\n".join(parts), meta["num"])
    # insert at top of weeks container (after filter bar if present)
    anchor = re.search(r'<div class="weeks-container">\n(?:<div class="filter-bar">.*?</div>\n)?', page, re.S)
    page = page[:anchor.end()] + block + page[anchor.end():]
    # banner
    page = re.sub(r'<span class="week-date">📅 Week of [^<]*</span>', '<span class="week-date">📅 Week of %s</span>' % date_txt, page)
    old_num = int(re.search(r'<span class="week-num">Issue #(\d+)', page).group(1))
    page = re.sub(r'<span class="week-num">Issue #\d+\s*</span>', '<span class="week-num">Issue #%d</span>' % meta["num"], page)
    # archive: add the previous latest issue(s) at the top of the list if missing
    def arch_item(num, iso, label, theme):
        return ('    <li><a href="#week-%s">📅 Issue #%d - Week of %s <span style="margin-left:auto;font-size:.8rem;color:#aaa;">%s</span></a></li>\n'
                % (iso, num, label, H.escape(theme, quote=False)))
    adds = []
    for num, theme in ((old_num, theme_prev), (old_num - 1, theme_prev2)):
        if not theme: continue
        m = re.search(r'<!-- ══════════ WEEK #%d - (\w+) (\d+), (\d{4}) ══════════ -->' % num, page)
        if m and ('Issue #%d -' % num) not in page:
            iso = "%s-%02d-%02d" % (m.group(3), MONTHS.index(m.group(1)) + 1, int(m.group(2)))
            adds.append(arch_item(num, iso, "%s %s, %s" % (m.group(1), m.group(2), m.group(3)), theme))
    if adds:
        page = page.replace('<ul class="archive-list" id="archive-list">\n', '<ul class="archive-list" id="archive-list">\n' + "".join(adds), 1)
    if "freetools-header" not in page.split("</style>")[0]:
        page = page.replace("  </style>", TOOLS_CSS + "  </style>", 1)
    open(out_path, "w", encoding="utf-8").write(page)
    print("Inserted issue #%d (%s); banner updated; archive +%d" % (meta["num"], meta["iso"], len(adds)))

if __name__ == "__main__":
    build(*sys.argv[1:])
