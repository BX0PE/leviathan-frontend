# LEVIATHAN — Demo Guide

**Prerequisite:** Railway backend must have `DEMO_MODE=True` in env vars.

## Demo login

1. Open the app → **"Iepazīties ar demo"** button (under "Pieteikties ar BIS")
2. You're auto-logged in as **Demo Koordinators** of **LEVIATHAN Demo Būvniecība** company
3. You land directly in `/cases` — no role picker, no onboarding needed

## Seed data (auto-populated on first demo login)

**Company:** LEVIATHAN Demo Būvniecība (reg 40203DEMO01)

**Cases (2):**

| Case | Positions | Entries | Progress |
|------|-----------|---------|----------|
| Dzīvojamā māja, Brīvības 45, Rīga (BIS-BV-5-338-25-K) | 8 across 3 sections | 9 entries over last week | ~40% |
| Biroju ēka, K. Valdemāra 12, Rīga (BIS-BV-5-891-25-K) | 0 (empty on purpose) | 0 | 0% |

**Materials library (5):**

- Betons C25/30 (2 DoP) — Betmaster
- Metāla dakstiņi Ruukki Classic — ArcelorMittal
- Frakcionēta smilts 0/4 — Latvijas Karjeri
- PE-RC caurule De63x3.8 — PipeLife
- Kabelis NYM-J 3x2.5 — NKT Cables

## Demo scripts

### Script A — Full flow on empty case (Biroju ēka)

1. `/cases` → click **Biroju ēka, K. Valdemāra 12** — opens coordinator view
2. **Augšupielādēt tāmi** → drop any `.xlsx` → **Augšupielādēt**
   - Result: 7 positions across 3 sections (Zemes / Betona / Jumta darbi)
3. **Atgriezties pie objekta** → progress card now shows 0/7 poz.
4. **Augšupielādēt dokumentus** → drop any 4 PDF files → **Augšupielādēt**
   - Result: 4 processed, 3–4 matched to positions by keyword
5. **Atgriezties pie objekta** → 4 documents shown, 3–4 auto-linked
6. **Ievadīt izpildītos darbus** → foreman-mode
7. Fill description, enter quantities → **Nosūtīt uz BIS**
8. **ConfirmSubmit** → **✓ Nosūtīt**
9. **SubmitStatus** shows: *"BIS API pagaidām nav pieejams. Ieraksts saglabāts un tiks nosūtīts automātiski."*
10. **Skatīt vēsturi →** shows the new entry with `⏳ rinda` badge

### Script B — Live data view (Dzīvojamā māja)

1. `/cases` → click **Dzīvojamā māja, Brīvības 45**
2. Coordinator view already shows:
   - ~40% progress overall
   - Per-section bars (Zemes: 100%, Betona: 60%, Jumta: 0%)
   - Jaunākie ieraksti — 5 recent entries with dates
   - Darbību žurnāls — audit trail
3. **Ievadīt izpildītos darbus** → foreman-mode
   - Description prefilled from last entry
4. Add a new entry → same flow as Script A → history now shows entries across multiple days

## Key demo talking points

**For coordinator audience:**

> Instead of typing each material into BIS by hand — just upload the Excel tāme and PDF certificates. The system automatically parses positions and matches documents to them.

**For the "when BIS is down" story:**

> Look at the message after Nosūtīt: BIS integration works transparently even when their API is temporarily unavailable. The entry is saved locally and syncs automatically when access is restored. No lost work.

**For the audit story:**

> Everything is traced — the Darbību žurnāls at the bottom shows every action on the case in chronological order.

## Reset demo data

If demo data gets weird, call:

```
DELETE https://leviathan-backend-production.up.railway.app/api/demo/reset
```

Next demo login re-seeds everything from scratch.
