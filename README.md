# IPB Pipeline

Internal CRM, quoting and install portal for Independent Power Bahamas.

**Read `MANUAL.md` first.** It is the plain-language guide and covers everything,
including how the follow-up sequence behaves and how profit is calculated.

## Quick start

Open `public/index.html` in a browser. It runs with no server, seeded with demo leads.

## Deploy

Push to GitHub, connect the repo in Netlify, deploy. `netlify.toml` handles the config.
Data goes to Netlify Blobs with a dated backup written on every save.

## Stack

Vanilla JS in one HTML file. No build step, no framework. Two Netlify Functions.
One dependency (`@netlify/blobs`).

## Where to change things

| What | Where |
|---|---|
| Passcodes | `ROLES` block, `public/index.html` |
| Installer spec sheet wording | `viewSpecSheet()` and the `.doc` CSS block |
| Real customer data | `seed()` block |
| Package prices, costs, freight, specs | `PACKAGES` block, `public/index.html` |
| VAT, duty, VAT registration | `VAT`, `DUTY`, `VAT_REGISTERED` constants |
| Hardware sizes and clearances | `HARDWARE` and `CLEAR` blocks |
| Follow-up messages and timing | `SEQUENCE` and `QUARTERLY` blocks |
| Shipment broadcast wording | `BROADCAST` constant |
| Sales, payment, fulfilment stages | `SALES_STAGES`, `PAY_STAGES`, `FUL_STAGES` |
| JotForm field matching (both forms) | `MAP` block, `netlify/functions/jotform-intake.js` |

## Known limits in v1

Role separation is enforced in the interface, not the database. Quote PDFs come from the
existing external tool. WhatsApp and Messenger intake is manual. All three are v2 items,
documented in `MANUAL.md` section 9.
