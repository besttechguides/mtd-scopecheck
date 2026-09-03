# MTD ScopeCheck

Static, one-screen helper for sole traders and landlords who want a calm view of whether **Making Tax Digital for Income Tax** may apply, which wave they fall into, and a printable readiness checklist.

**Not tax advice. Not affiliated with HMRC.** Always use the official GOV.UK guidance and checker.

## Run locally

No build step. From this directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/` (or the port you chose).

Files: `index.html`, `styles.css`, `app.js`.

## What it does

- Asks: Self Assessment registered? Sole-trader turnover (£), UK property gross income (£), tax year (2024–25 / 2025–26 / 2026–27), optional sign-up status.
- Treats **qualifying income** as combined **turnover before expenses** (not profit).
- Shows in-scope Y/N, wave, start date (and whether that date is already past as of 3 Sep 2026), standard quarterly windows, disclaimer with GOV.UK links, and an 8-item checklist.
- Print via browser / CSS `@media print`.

## GOV.UK sources (verified / fetched 3 Sep 2026)

| Topic | URL |
| --- | --- |
| Who / when / thresholds / official checker | https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax |
| Qualifying income (turnover before expenses) | https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax |
| Quarterly update periods & deadlines | https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax/send-quarterly-updates |
| Sign up (sole traders & landlords) | https://www.gov.uk/guidance/sign-up-for-making-tax-digital-for-income-tax |
| Exemptions | https://www.gov.uk/guidance/find-out-if-you-can-get-an-exemption-from-making-tax-digital-for-income-tax |
| Apply for exemption | https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-income-tax |

### Thresholds hardcoded from guidance

- Over £50,000 for 2024 to 2025 → from 6 April 2026  
- Over £30,000 for 2025 to 2026 → from 6 April 2027  
- Over £20,000 for 2026 to 2027 → from 6 April 2028  

Partnerships: timeline not set. Exemptions exist — linked, not enumerated from memory.

## Out of scope

No auth, Stripe, HMRC API, AI, accounts, email capture, or invoice/CIS tools.
