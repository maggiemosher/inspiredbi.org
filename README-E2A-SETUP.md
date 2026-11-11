# E2A Reviewer Prototype: setup on inspiredbi.org

## What to put in GitHub

Upload **one file** to your inspiredbi.org repository:

```
e2a/index.html
```

That's all. Once it's committed, the page is live at **https://inspiredbi.org/e2a/**.

Steps in the GitHub website:
1. Open the inspiredbi.org repository and choose **Add file → Upload files**.
2. Drag in the `e2a` folder (it holds `index.html`). If the upload only takes files, choose **Add file → Create new file**, type `e2a/index.html` as the name, and paste in the contents of the file.
3. Commit to the main branch. Give Cloudflare/GitHub Pages 1–2 minutes, then open https://inspiredbi.org/e2a/.

## Login

- **Reviewer access code:** `Ci3T-E2A-Review-2026`
- The whole dashboard is **encrypted** inside `index.html` (AES-256-GCM, PBKDF2 key with 600,000 iterations). Without the code, nobody can read the content, even from the page source or the public repo.
- Reviewers stay signed in until they close the tab or select **Sign out**.
- To change the code, run: `python3 build_encrypt.py "NewCode" src/dashboard.html dist/e2a/index.html`, then upload the new `index.html`. (Or send me the new code and I'll rebuild it.)

**Important:** Do **not** upload `dashboard.html` (the unencrypted source) to a public repo. Keep it on your computer.

## Optional: individual reviewer logins (Cloudflare Access)

Your domain already runs through Cloudflare, so if you want each reviewer to sign in with their own email instead of a shared code:
1. In the Cloudflare dashboard, open **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Domain: `inspiredbi.org`, path: `e2a`.
3. Add a policy: **Allow** → **Emails** → list reviewer addresses. Login method: **One-time PIN** (emailed code).

The free Zero Trust plan covers up to 50 users. You can use this together with the access code or on its own.

## What reviewers see

| Page | Shows |
|---|---|
| How E2A works | Architecture diagram, the four agents, Grounded Plane, the daily cycle, who does what |
| Leadership dashboard | The concept image, made interactive: KPIs, data signals, emerging issues, AI summary with clickable sources, resources, evidence trace, implementation planner |
| 1 · Diagnostic Agent | Overnight run log, three data dimensions, ranked brief with “why flagged” statistics, confirm/dismiss checkpoints, charts |
| 2 · Synthesis Agent | Cited synthesis, Ci3T modules (live ci3t.org links), local curriculum alignment, Q&A with blocked-question examples |
| 3 · Planning Agent | Strategy re-ranking, generated blueprint (goals, timeline, owners, resources, PL, decision rules), co-pilot revisions, approval |
| 4 · Evaluation Agent | Week slider, fidelity, attendance as a leading indicator, ODRs, alerts, tuning sent back through the Grounded Plane |
| Grounded Plane | Six guardrails, grounding check demo, role-based privacy views, approval queue, live audit ledger |
| Ci3T resources | Ci3T measures (https://www.ci3t.org/measures/) and modules |
| Reviewer guide | 10-minute tour, Phase One outcomes map, team, feedback form (emails contactinspiredbi@gmail.com) |

Accessibility: designed to meet WCAG 2.2 AA (keyboard operation, skip link, landmarks, visible focus, 4.5:1 text contrast, data tables for every chart, no color-only meaning) with dark mode, high contrast, reduced motion, and text-size controls. All data is simulated.
