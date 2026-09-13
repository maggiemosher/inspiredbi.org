name: Weekly AI News Update

on:
  schedule:
    # 13:00 UTC every Monday ≈ 8am Central (7am during standard time)
    - cron: '0 13 * * 1'
  workflow_dispatch: {}   # adds a manual "Run workflow" button in the Actions tab

permissions:
  contents: write

jobs:
  update-weekly-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install anthropic

      - name: Generate this week's issue
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python scripts/generate_weekly_news.py

      - name: Commit and push if changed
        run: |
          git config user.name "AI Weekly Bot"
          git config user.email "actions@github.com"
          git add weekly-news.html
          if git diff --cached --quiet; then
            echo "No changes to commit."
          else
            git commit -m "Auto: AI Weekly update $(date +%Y-%m-%d)"
            git push
          fi
