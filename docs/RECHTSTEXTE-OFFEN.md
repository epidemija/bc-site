# Open Required Disclosures — fill in before going live

Every value is entered in **one** place: `src/config/site.ts`, the `legal`
block. The Impressum and privacy policy both read from there — there's no
second copy that could be forgotten.

As long as even one value is still `TODO_LEGAL`, it shows up on the page as
a red **MISSING: …** bar, and `node verify.mjs` fails. That keeps the site
from accidentally being published with a gap in the Impressum.

---

## 1. Legal form — `legal.legalForm`

What does your business registration say?

- Sole proprietorship (Einzelunternehmen) → `"Einzelunternehmen"`, nothing
  further needed
- GmbH / UG → then also register court, register number and managing
  director; let me know and I'll add those fields

## 2. VAT — `legal.vatId` / `legal.taxNumber` — done (10.09.2026)

No separate VAT ID (USt-IdNr.) exists — confirmed by Bojan, based on a
Finanzamt Speyer-Germersheim letter dated 05.08.2026 assigning the
Steuernummer `41/026/85556` (also valid for Umsatzsteuer since that date,
i.e. regular taxation with quarterly Voranmeldung — **not** the § 19 UStG
Kleinunternehmer rule). `legal.vatId` is `null`; the Impressum shows the
Steuernummer instead (`legal.taxNumber`), labeled as such rather than as a
VAT ID under § 27a UStG. If a VAT ID is issued later (Bundeszentralamt für
Steuern, separate request), set `legal.vatId` to that string and it takes
priority over the Steuernummer automatically.

## 3. Professional title — `legal.profession`

"Ingenieur" (engineer) is a protected title in Germany. If it's used
publicly, the Impressum must name the chamber (Kammer).

- `chamber` → e.g. `"Ingenieurkammer Rheinland-Pfalz"`, or `null` if there's
  no membership
- `chamberId` → member/list number, or `null`
- `regulations` → which professional code applies and where it can be
  viewed, e.g. `"Ingenieurgesetz Rheinland-Pfalz, viewable at
  ingenieurkammer-rlp.de"`

If you don't actually use the title "Bauingenieur" and only present
yourself as a DEKRA-certified appraiser (Sachverständiger): let me know and
this whole section is dropped.

## 4. Professional liability insurance — `legal.insurance`

Required under § 2 para. 1 no. 11 DL-InfoV. From the policy:

- `name` → name of the insurer
- `address` → its address
- `scope` → geographic coverage, usually `"Germany"` or `"Europe"`

## 5. Contact-form data processor — `legal.formProcessor`

Only needs to be set once it's decided how the form is sent. Only then is
it clear whether a data processor even needs to be named at all.

**Status (as of the cPanel move):** the form is sent server-side via
Resend (`public/api/kontakt.php`, part of the normal site build — see
`docs/DEPLOY-CPANEL.md`). If a data-processing agreement with Resend is
needed for the privacy policy, that's the processor to name here.

---

## What's still missing, unrelated to any data field

**A qualified lawyer should read both texts once.** They're written for
this specific business and this specific website — not a template copied
from another site — but I'm not a lawyer, and the Impressum and privacy
policy are exactly the two pages where a mistake costs money.

---

## Checking

```bash
npm run build
npx serve dist -l 4321 &
node verify.mjs
```

"All checks passed" means: no remaining gap in the Impressum, no
third-party embed, no unexpected browser storage, form complete. Only then
move the domain over.
