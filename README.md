# KYS Finance Desk — MVP

A user-friendly, offline-first browser MVP for the financial-entry workflow described in the SRS.

## Run locally

Open PowerShell in this folder and run:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173` in a browser.

## What is working

- Role preview for Clerk, Petty Cashier, Store Keeper, Admin, and Managing Director.
- Plain-language transaction forms; the debit/credit mapping is applied automatically.
- Pending → approved/rejected workflow with audit history.
- Automated Profit & Loss, balanced Trial Balance, and Capital/WIP reports.
- Account-code master list, CSV export, browser-data backup, and offline-safe assets.

## Important MVP limitation

This version intentionally saves to the current browser's `localStorage`, so it is a working interaction prototype—not yet the shared office system. A production rollout needs the next phase: a Django/PostgreSQL server on the office PC, real user login, server-side permissions, centralized backups, receipt uploads, and access through the office Wi-Fi.
