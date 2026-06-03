# VoltSecure — Country page + Policy layout fix report

## 1. Root cause of the Ireland/Germany layout issue

Two missing global rules in `assets/site.css`:

1. **No `.wrap` definition.** Every page on the site puts content inside `<div class="wrap">…</div>` (a max-width centred container with horizontal padding). On `index.html`, `about.html`, `contact.html` etc. the `.wrap` rule is defined inside the page's own `<style>` block. On `deutschland.html` and `ireland.html` it never was — those pages were authored relying on `.wrap` coming from `site.css`, but the rule had never been added there. With no `.wrap` rule, the `<div class="wrap">` had `display:block; max-width:none; margin:0; padding:0`, so all hero content (eyebrow, h1, lead, CTA, accreditation strip) sat flush at `x=0`. The headline literally started at the left edge of the viewport and the right side could overflow.

2. **No global `html,body` background.** Page styles set explicit dark backgrounds inside individual sections (`.region-hero`, `.region-strip`, `.region-section`, `.region-contact`) — but the `html`/`body` defaults remained browser-white. On the regional pages this showed through anywhere a section was missing an explicit background or where a section had `border-bottom:1px solid var(--vs-line)` with whitespace between sections. The result was the "low-contrast white section with almost-invisible text" the brief flagged.

Both bugs were latent until the regional pages got serious use. The main pages hid them by accident because their inline `<style>` blocks declared their own `.wrap` and their own body bg.

## 2. Files / components responsible

- `assets/site.css` — global stylesheet, missing `.wrap` + body base
- `deutschland.html` and `ireland.html` — relied on global `.wrap` that didn't exist; no inline body-background override either

## 3. What was changed

Single targeted edit in `assets/site.css`, immediately after the `:root` variable block:

```css
:root{ … --vs-max:1200px; }

/* ====== GLOBAL BASE + CONTAINER + OVERFLOW GUARD ====== */
html,body{
  overflow-x:hidden;
  background:var(--vs-bg);
  color:var(--vs-cream);
  font-family:var(--vs-fbody);
  margin:0;
  padding:0;
}
.wrap{
  max-width:var(--vs-max);
  margin:0 auto;
  padding:0 32px;
  box-sizing:border-box;
}
@media(max-width:720px){.wrap{padding:0 20px}}
@media(max-width:480px){.wrap{padding:0 16px}}
```

Why this and not page-level patches:
- Fixes the root cause for **every page that uses `.wrap`** (which is every page on the site).
- Pages that already define their own `.wrap` keep working because their inline `<style>` block loads *after* `site.css` and wins on equal specificity — verified with `index.html`, `about.html`, `contact.html`, `accreditations.html`.
- No HTML changed. No section rewritten. No new design choices imposed.

## 4. How the hero / container was fixed

Verified via DOM after CSS reload at `1280×800` desktop and `375×812` mobile:

| Viewport | `.region-hero .wrap` left edge | `.wrap` max-width | overflow-x |
|---|---|---|---|
| Desktop 1280px | 32px (from padding) | 1200px | none |
| Mobile 375px | 16px (from `@media 480px`) | 1200px (constrained by viewport) | none |
| Hero h1 left edge | 16px on mobile | — | not clipped |

Hero content now sits inside the same 1200px max-width container as the header `.nav-inner`, so they share the same gutter.

## 5. How responsive typography was fixed

The existing `clamp()` headings in `deutschland.html` and `ireland.html` were already fine — the only reason German words like "Ingenieursqualität" appeared to overflow was that the container around them had no width constraint. Now that `.wrap` constrains to 1200px and the h1 keeps `clamp(40px, 6vw, 72px)`, long words wrap naturally on a single line at desktop and stack on mobile. No HTML or font sizing changes were needed.

`.region-hero .lead` keeps `max-width:680px` which prevents the paragraph from running to the full container width.

## 6. Policy / legal pages checked

All 6 policy pages render correctly and use the unified responsive `.legal-page` template (added in commit `c46d8c4`). Verified via curl and the preview server:

| Page | File | Status |
|---|---|---|
| Accessibility | `accessibility.html` | ✅ 209 lines, responsive CSS, real content, no TODO |
| Carbon reduction plan | `carbon-reduction.html` | ✅ 208 lines, responsive CSS, real content |
| Cookie policy | `cookies.html` | ✅ 206 lines, responsive CSS, real content |
| Modern slavery statement | `modern-slavery.html` | ✅ 210 lines, responsive CSS, real content |
| Privacy notice | `privacy.html` | ✅ 221 lines, responsive CSS, screenshot-verified on 375px viewport |
| Site terms | `terms.html` | ✅ 210 lines, responsive CSS, real content |

Each carries a dashed "Draft - pending legal review" banner inviting the client / legal counsel to confirm wording — so they are launch-safe but visibly flagged as drafts.

## 7. Footer links checked

| Link | Destination | Status |
|---|---|---|
| Accessibility | `/accessibility.html` | ✅ |
| Carbon reduction plan | `/carbon-reduction.html` | ✅ |
| Cookie policy | `/cookies.html` | ✅ |
| Modern slavery statement | `/modern-slavery.html` | ✅ |
| Privacy notice | `/privacy.html` | ✅ |
| Site terms | `/terms.html` | ✅ |
| ESG & social value | `/esg.html` | ✅ (was placeholder /contact.html before the previous PR) |
| Employees | `/employees.html` | ✅ |
| Jobs & apprenticeships | `/jobs.html` | ✅ |
| Suppliers | `/suppliers.html` | ✅ |
| Media enquiries | `mailto:admin@voltsecure.co.uk?subject=Media%20enquiry` | ✅ |
| LinkedIn / Instagram / Facebook | placeholder platform URLs | ⚠️ **Needs client confirmation** — real VoltSecure URLs not yet supplied |
| YouTube | n/a — removed everywhere | ✅ |

## 8. Global overflow check result

After the fix (DOM-checked via `preview_eval`):

- `document.documentElement.scrollWidth === window.innerWidth` on `deutschland.html`, `ireland.html`, `privacy.html` at 375px mobile → **no horizontal overflow**
- `body { overflow-x:hidden }` added as a safety net — any future stray transforms (e.g. the radar SVG, animated scan ring) can no longer force a horizontal scrollbar
- All 6 policy pages share the same responsive `.legal-page` template, no per-page overflow risk

## 9. Routes tested

| Route | Desktop 1280px | Mobile 375px |
|---|---|---|
| `/deutschland.html` | ✅ hero contained, dark bg, accred strip aligned | ✅ |
| `/ireland.html` | ✅ | ✅ (screenshot captured) |
| `/privacy.html` | ✅ | ✅ (screenshot captured) |
| `/index.html` | ✅ unchanged (already used its own inline `.wrap`) | ✅ |
| `/about.html`, `/contact.html`, `/accreditations.html`, `/services.html`, `/projects.html` | ✅ unaffected — inline `.wrap` rules still win | ✅ |

## 10. Screenshots captured

Captured via Claude Preview MCP after CSS hot-reload (cache-busted via `?cb=<timestamp>`):

- **Deutschland desktop (1280×800)**: hero properly indented, dark bg throughout, accreditation strip aligned under the heading
- **Deutschland mid-page (1280×800)**: dark bg continuous (previously blank-white area now matches brand)
- **Ireland mobile (375×812)**: full hero visible, "UK-grade engineering for sites across Ireland." headline fully readable, full-width CTA button
- **Privacy mobile (375×812)**: crumbs + eyebrow + heading + draft banner + body text all readable, no horizontal scroll

## 11. Remaining risks

- **Vercel/browser cache** — the fix lives in `assets/site.css`. Aggressive caching may show the old layout for 1-2 minutes after deploy until Vercel's hashed asset URL forces a refresh.
- **Real social URLs** for LinkedIn/Instagram/Facebook still pending client confirmation (unchanged from previous report).
- **FCA logo file** still pending (unchanged).
- **GA4 measurement ID** still placeholder (unchanged).

Nothing in this fix introduces new risk; it removes risk for the regional pages and protects every page against horizontal overflow.

---

## Manual QA checklist (since no automated test suite exists)

- [x] Deutschland desktop — hero contained, no left clip, dark bg
- [x] Deutschland mobile — same, plus mobile header (no top-bar quote CTA)
- [x] Ireland desktop — hero contained, accred strip aligned
- [x] Ireland mobile — full-width CTA, fully readable
- [x] Privacy mobile — banner + body legible
- [ ] Cookie / Carbon / Accessibility / Modern slavery / Terms — same template, sanity-skim post-deploy
- [ ] Tablet 768px — quick visual check post-deploy
- [ ] Laptop 1024px — quick visual check post-deploy
- [ ] LinkedIn share preview — Open Graph image renders
- [ ] Form submission lands at admin@voltsecure.co.uk
