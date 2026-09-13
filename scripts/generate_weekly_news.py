#!/usr/bin/env python3
"""
FREE version of the AI Weekly generator for inspiredbi.org.

No paid API keys, no signups:
  - Real headlines come from Google News RSS (free, no key required).
  - The writing/formatting is done by GitHub Models (free for personal
    GitHub accounts, authenticated with the GITHUB_TOKEN every Actions
    run already has automatically).

Requires: pip install openai
Requires: the workflow must grant `permissions: models: read`
(GITHUB_TOKEN is provided automatically by Actions -- nothing to add).
"""

import os
import re
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import date, timedelta, datetime, timezone
from email.utils import parsedate_to_datetime
from openai import OpenAI

NEWS_FILE = "weekly-news.html"

# GitHub Models catalog id. If this workflow ever starts failing with a
# "model not found" style error, check https://github.com/marketplace/models
# for the current id and update this line.
MODEL = "openai/gpt-4o-mini"
ENDPOINT = "https://models.github.ai/inference"

# (css class, emoji, display name, search query)
AUDIENCES = [
    ("k12", "\U0001F393", "K-12 Educators", "AI in K-12 classrooms schools"),
    ("leaders", "\U0001F3EB", "School Leaders", "AI school district leadership policy"),
    ("highered", "\U0001F393", "Higher Ed Faculty", "AI higher education university faculty"),
    ("operations", "\U0001F4CA", "Operations & Finance", "AI school operations finance budgeting"),
    ("edtech", "\U0001F4BB", "Ed Tech Engineers", "AI edtech tools platforms engineering"),
    ("community", "\U0001F310", "Community", "AI education nonprofit community access equity"),
]


def fetch_headlines(query, max_items=5, max_age_days=10):
    """Pull real, recent headlines from Google News RSS. Returns [] on any
    failure rather than raising -- a quiet miss here just means that
    audience's section will be shorter this week, not a broken run."""
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"}
    )
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 (compatible; InspiredBIWeeklyBot/1.0)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
    except Exception as e:
        print(f"  (headline fetch failed for '{query}': {e})", file=sys.stderr)
        return []

    try:
        root = ET.fromstring(data)
    except ET.ParseError as e:
        print(f"  (RSS parse failed for '{query}': {e})", file=sys.stderr)
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    items = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date_raw = item.findtext("pubDate")
        source_el = item.find("source")
        source = source_el.text.strip() if source_el is not None and source_el.text else ""
        if not title or not link:
            continue
        pub_dt = None
        if pub_date_raw:
            try:
                pub_dt = parsedate_to_datetime(pub_date_raw)
                if pub_dt.tzinfo is None:
                    pub_dt = pub_dt.replace(tzinfo=timezone.utc)
            except Exception:
                pub_dt = None
        if pub_dt and pub_dt < cutoff:
            continue
        items.append({"title": title, "link": link, "source": source})
        if len(items) >= max_items:
            break
    return items


def next_monday_from(today: date) -> date:
    offset = today.weekday()  # Monday = 0
    return today - timedelta(days=offset)


def compute_issue_number(html: str) -> int:
    nums = [int(n) for n in re.findall(r"Issue #(\d+)", html)]
    return (max(nums) + 1) if nums else 1


def build_prompt(iso_date, long_date, issue_num, month_year, headlines_by_audience):
    audience_blocks = []
    for css_class, emoji, name, _query in AUDIENCES:
        items = headlines_by_audience.get(css_class, [])
        if items:
            lines = "\n".join(f"  - \"{it['title']}\" ({it['source']}) -> {it['link']}" for it in items)
        else:
            lines = "  (no fresh real items found this week for this audience)"
        audience_blocks.append(
            f"### {css_class} / {emoji} / {name}\nReal items you may reference (do not invent others):\n{lines}"
        )
    audiences_text = "\n\n".join(audience_blocks)

    return f"""You are writing ONE new issue of "AI Weekly," a newsletter on inspiredbi.org
for six audiences interested in AI and education. Below, for each audience, is a
list of REAL headlines pulled from Google News in the last ~10 days. Use ONLY
these real items for links -- do not invent, guess, or fabricate any URL, video,
or headline that is not listed. If an audience has no items listed, write a
short (2-3 sentence) general, encouraging "what's new in AI & education" note
for that audience with NO extra-links and NO video-grid rather than making
something up.

{audiences_text}

Output ONLY the HTML for a single <article class="week-entry"> block, with NO
markdown fencing and NO commentary before or after, wrapped exactly between
these two marker lines (the markers themselves must appear on their own lines):

<!--BEGIN_WEEK-->
<!--END_WEEK-->

Follow this exact shape, reusing these CSS classes verbatim (they already exist
in the page's stylesheet). Repeat the <section class="audience-section ..."> block
once for each of the six audiences above, in the order given:

<article class="week-entry" id="week-{iso_date}">
  <div class="week-banner">
    <span class="week-label">Latest Issue</span>
    <span class="week-date">\U0001F4C5 Week of {long_date}</span>
    <span class="week-num">Issue #{issue_num}</span>
  </div>

  <section class="audience-section CSSCLASS" id="CSSCLASS-{iso_date}">
    <div class="audience-header CSSCLASS-header">
      <div class="audience-icon">EMOJI</div>
      <div class="audience-header-text">
        <h2>AUDIENCE NAME</h2>
        <p class="subtitle">a short one-line hook for this week, specific to the real items above</p>
      </div>
    </div>
    <div class="audience-body">
      <div class="whats-new">
        <span class="badge">What's New · {month_year}</span>
        <p>2-4 sentences summarizing the real items above for this audience, warm and
        practical in tone for busy educators. Name real sources by their outlet name.</p>
      </div>
      <div class="extra-links">
        <!-- one <a href="REAL_LINK" target="_blank" rel="noopener">short label</a> per
        real item you used above; omit this whole div if there were no real items -->
      </div>
    </div>
  </section>

  (repeat the section above for each audience, replacing CSSCLASS / EMOJI / AUDIENCE NAME
  per the list at the top, then close with:)
</article>
"""


def main():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("ERROR: GITHUB_TOKEN not set (should be automatic in Actions)", file=sys.stderr)
        sys.exit(1)

    with open(NEWS_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    week_date = next_monday_from(date.today())
    iso_date = week_date.isoformat()

    if f'id="week-{iso_date}"' in html:
        print(f"An entry for {iso_date} already exists — skipping, nothing to do.")
        return

    issue_num = compute_issue_number(html)
    long_date = week_date.strftime("%B %-d, %Y")
    month_year = week_date.strftime("%B %Y")

    print("Fetching real headlines...")
    headlines_by_audience = {}
    for css_class, _emoji, _name, query in AUDIENCES:
        headlines_by_audience[css_class] = fetch_headlines(query)
        print(f"  {css_class}: {len(headlines_by_audience[css_class])} item(s)")

    prompt = build_prompt(iso_date, long_date, issue_num, month_year, headlines_by_audience)

    client = OpenAI(base_url=ENDPOINT, api_key=token)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=6000,
    )
    full_text = resp.choices[0].message.content or ""

    m = re.search(r"<!--BEGIN_WEEK-->(.*?)<!--END_WEEK-->", full_text, re.DOTALL)
    if not m:
        print("ERROR: model did not return a properly marked week block.", file=sys.stderr)
        print(full_text[:2000], file=sys.stderr)
        sys.exit(1)

    new_block = m.group(1).strip()

    html = html.replace(
        '<span class="week-label">Latest Issue</span>',
        '<span class="week-label">Previous Issue</span>',
        1,
    )

    marker = '<div class="weeks-container">'
    idx = html.find(marker)
    if idx == -1:
        print("ERROR: could not find weeks-container insertion point.", file=sys.stderr)
        sys.exit(1)
    insert_at = idx + len(marker)
    html = html[:insert_at] + "\n" + new_block + "\n" + html[insert_at:]

    with open(NEWS_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Inserted Issue #{issue_num} for {iso_date}.")


if __name__ == "__main__":
    main()
