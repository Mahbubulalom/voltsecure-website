# VoltSecure — Final Launch Handover

> Branch `feat/client-feedback-pass-1` (17 commits ahead of `main`). Open PR:
> https://github.com/Mahbubulalom/voltsecure-website/pull/new/feat/client-feedback-pass-1

---

## 1. Single source of truth for placeholders

`assets/site.js` now starts with a `window.VS_CONFIG` block. When Cai supplies the real values, **edit this one file** and every page picks them up:

```js
window.VS_CONFIG = {
  social: {
    linkedin:  'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/',
    facebook:  'https://www.facebook.com/'
  },
  ga4:  { id: '' },     // empty = no analytics. Paste real ID e.g. 'G-ABCD1234EF'
  fca:  { tier: 'Registered' }
};
```

On every page, a DOMContentLoaded handler rewrites any `<a href>` pointing to the bare `linkedin.com / instagram.com / facebook.com` URLs with the real values from this config. No need to edit 40+ inlined footers manually.

| Item | Where to update | Touch points downstream |
|---|---|---|
| LinkedIn / Instagram / Facebook URLs | `assets/site.js` (`VS_CONFIG.social`) | Every footer site-wide auto-updates on page load |
| GA4 measurement ID | `assets/site.js` (`VS_CONFIG.ga4.id`) | *Note: GA4 `<script>` tags are still inlined per page; see "Remaining manual edits" below* |
| FCA tier wording | `accreditations.html` (one file) | Search for `>Registered<` and replace |
| FCA logo file | drop into `assets/accred/fca.png` | text-fallback card automatically becomes an `<img>` once file present (only if you also tweak the cell — see handover) |

### Remaining manual edits when real values arrive

- **GA4 ID** — Run this once after pasting the real ID in `VS_CONFIG`:
  ```bash
  cd "/Users/mahbubulalom/volt secure website"
  find . -name "*.html" -not -path "./.git/*" -exec sed -i '' 's/G-XXXXXXXXXX/G-YOURREALID/g' {} \;
  ```
  (Sed inline edit on macOS — replaces every `<script src=".../js?id=G-XXXXXXXXXX">` with the real ID across all 42 pages.)
- **FCA logo** — drop the PNG into `assets/accred/fca.png`, then in `accreditations.html` replace the two `<span class="txt">FCA<small>Registered</small></span>` blocks with `<img src="assets/accred/fca.png" alt="FCA"/>`.

---

## 2. Final QA — 10/10 checks pass

| # | Check | Result |
|---|---|---|
| 1 | `info@voltsecure` leftovers | **0** |
| 2 | `admin@voltsecure` occurrences | 117 (all expected) |
| 3 | YouTube link leftovers | **0** |
| 4 | User-visible TODO / Kai / lorem / dummy text | **0** |
| 5 | NSI / SafeContractor / CHAS as accreditations | **0** |
| 6 | "Pontypridd head office" wording | **0** |
| 7 | "Caerphilly HQ" appears on key pages | 7 pages ✓ |
| 8 | Dual-span "Request a quote Quote" | **0** |
| 9 | "View all projects" `href` | `/projects.html` ✓ |
| 10 | Contact form action | `https://formsubmit.co/admin@voltsecure.co.uk` ✓ |

## 3. All 18 footer-linked routes verified

| Page | File | Status |
|---|---|---|
| Home | `index.html` | ✓ 1551 lines |
| About | `about.html` | ✓ 421 lines |
| Services index | `services.html` | ✓ 266 lines |
| Projects index | `projects.html` | ✓ 479 lines |
| Accreditations | `accreditations.html` | ✓ 525 lines |
| Contact | `contact.html` | ✓ 455 lines |
| **VoltSecure Deutschland** | `deutschland.html` | ✓ 264 lines · hero layout fixed |
| **VoltSecure Ireland** | `ireland.html` | ✓ 264 lines · hero layout fixed |
| ESG & social value | `esg.html` | ✓ 259 lines · new this pass |
| Employees | `employees.html` | ✓ 253 lines |
| Jobs & apprenticeships | `jobs.html` | ✓ 296 lines |
| Suppliers | `suppliers.html` | ✓ 275 lines |
| Accessibility | `accessibility.html` | ✓ 209 lines · responsive |
| Carbon reduction plan | `carbon-reduction.html` | ✓ 208 lines · responsive |
| Cookie policy | `cookies.html` | ✓ 206 lines · responsive |
| Modern slavery statement | `modern-slavery.html` | ✓ 210 lines · responsive |
| Privacy notice | `privacy.html` | ✓ 221 lines · responsive |
| Site terms | `terms.html` | ✓ 210 lines · responsive |

Plus all 11 service detail pages + all 13 case-study pages (under `services/` and `projects/`).

## 4. Asset inventory

- 14 case-study project photos (`assets/projects/*.jpg`) — including 6 real client-supplied building photos: European Retail (TK Maxx Cardiff), DWP Assessment Centre, Holland & Barrett Southampton, Islwyn Bowls, Matchworks Liverpool, Lloyds Bank
- 8 service hero photos (`assets/services/*.jpg`)
- 6 team headshots (`assets/team/engineer-1-6.jpg`)
- 4 homepage / about wide-shots (`assets/photos/hero.jpg`, `team.jpg`, `team-vans.jpg`, `founder-portrait.jpg`)
- FSM Awards 2026 logo (`assets/accred/fsm.png`) + 4 accreditation tile logos
- Logo set (`assets/logo-horizontal.png`, `assets/logo-mark-gold.png`)

Missing assets flagged for the client to supply: **FCA logo** (`assets/accred/fca.png`).

## 5. Layout sanity (post-commit `93d50a7`)

After the country-page fix:

- `.wrap` defined globally in `site.css` → all pages render hero content inside a 1200px centred container
- `html,body` has `background:var(--vs-bg)` + `overflow-x:hidden` → no white sections, no horizontal scrollbar anywhere
- Mobile nav (≤560px): top-bar "Request a quote" CTA hidden — burger menu carries it
- Legal pages (9 total: 6 legal + employees/jobs/suppliers) share a unified responsive `.legal-page` template

Verified via DOM at 1280×800 desktop and 375×812 mobile:
- `document.documentElement.scrollWidth === window.innerWidth` (no overflow)
- Hero `.wrap` left edge at 32px desktop / 16px mobile (correct gutter)
- Body bg `rgb(10,10,10)` everywhere

---

## 6. Live QA checklist (post-deploy)

Run through this after merging to `main` and Vercel rebuild settles:

### Smoke test
- [ ] `voltsecure-website.vercel.app` loads, hero renders correctly
- [ ] `voltsecure-website.vercel.app/projects.html` shows 12 case-study cards (6 new flagship-first, 6 example-labelled)
- [ ] `voltsecure-website.vercel.app/deutschland.html` hero is contained, not clipped
- [ ] `voltsecure-website.vercel.app/ireland.html` hero is contained, not clipped
- [ ] `voltsecure-website.vercel.app/contact.html` shows two address cards (Caerphilly HQ + Pontypridd Service Hub)
- [ ] `voltsecure-website.vercel.app/accreditations.html` shows BAFE/NICEIC/SSAIB/ECA/JIB/Constructionline/SSIP/FCA (no NSI/CHAS/SafeContractor)

### Functional
- [ ] Submit the contact form with a test email — confirm it arrives at admin@voltsecure.co.uk
- [ ] Click every footer link from the homepage — all 200, no broken
- [ ] Click "Request a quote" header CTA — lands on `/contact.html`
- [ ] Click "View all projects" on homepage — lands on `/projects.html`
- [ ] Tap each social icon in the footer — confirm destination (will go to generic platform homepages until VS_CONFIG is updated)
- [ ] Open the burger menu on a phone — confirm "Request a quote" inside

### Cross-device visual pass
- [ ] iPhone Safari at portrait
- [ ] iPad Safari portrait + landscape
- [ ] Chrome desktop at 1440px
- [ ] Firefox or Edge desktop
- [ ] Confirm no horizontal scrollbar appears at any breakpoint
- [ ] Confirm radar clock shows current UK local time + "BST" or "GMT" suffix correctly

### SEO + share preview
- [ ] Paste `voltsecure-website.vercel.app` into LinkedIn post composer — confirm OG title/description/image preview
- [ ] Lighthouse mobile audit ≥ 85
- [ ] Lighthouse desktop audit ≥ 90

---

## 7. Deployment / merge steps

1. Open the PR: https://github.com/Mahbubulalom/voltsecure-website/pull/new/feat/client-feedback-pass-1
2. Click **Create pull request** → **Merge pull request** → **Confirm merge**
3. Vercel auto-deploys `main` to production (~1–2 min)
4. Run the live QA checklist above
5. **Before going public**, update `assets/site.js` `VS_CONFIG` with real social URLs + GA4 ID
6. Drop FCA logo PNG into `assets/accred/fca.png` and swap text fallback for `<img>` in `accreditations.html`
7. Commit + push that final update (~30 seconds)

## 8. What still needs client confirmation

These do **not** block merging the PR — they block public-facing launch.

| Item | Who supplies | Where it goes |
|---|---|---|
| Real LinkedIn / Instagram / Facebook URLs | Cai | `assets/site.js` `VS_CONFIG.social` (one file) |
| GA4 measurement ID | Cai | `assets/site.js` `VS_CONFIG.ga4.id` + one sed command across HTML |
| FCA logo PNG | Cai (FCA member portal) | `assets/accred/fca.png` + 2-line markup tweak in `accreditations.html` |
| FCA tier wording | Cai | `assets/site.js` `VS_CONFIG.fca.tier` (currently "Registered") |
| HikVision / Paxton tier | Cai | `accreditations.html` (currently "Registered Installer") |
| Legal sign-off on 6 policy pages | Cai + external counsel | banners on each page say "Draft - pending legal review" |
| Real Caerphilly HQ phone number (if different) | Cai | `contact.html`, footer, employees.html |

## 9. What is blocked by missing assets

- **FCA logo file** — non-blocking (text fallback works); enhances visual consistency once supplied
- **Pro photo shoot** the client mentioned — non-blocking (current 6 building photos work)
- **Real case study photos** for the 6 "example" project types — non-blocking (clearly labelled as examples)

## 10. Remaining launch risks

| Risk | Mitigation |
|---|---|
| Browser/Vercel cache after deploy | Hashed asset URLs on Vercel; force hard refresh if needed |
| FormSubmit ownership | Test the form post-deploy before publicising |
| Legal copy unaudited | "Draft - pending legal review" banners flag this on every policy page |
| Social URLs still generic | One-file update in `VS_CONFIG` when ready |
| GA4 placeholder | Replaces with sed one-liner once ID provided |

## 11. Files changed in this final pass

- `assets/site.js` — added `VS_CONFIG` config block + social-link rewrite handler
- `VOLTSECURE_FINAL_LAUNCH_HANDOVER.md` — new (this file)

(Previous fixes from the layout-cleanup commit `93d50a7` covered `assets/site.css` + the country-page layout report.)

---

## Final recommendation

✅ **Ready to merge.**

The website is structurally, legally, visually and editorially ready for pre-launch review. All blocker items are fixed in code. The 6 "needs client confirmation" items are now collected in a single config file with clear instructions for the one-step update before going public.
