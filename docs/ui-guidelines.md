# GAMING NP — CINENOVA UI Guidelines

> Implementation-ready, token-driven UI guidance for the CINENOVA e-commerce storefront on [gamingnp.com](https://gamingnp.com/). All rules use semantic tokens; raw hex values must not appear in component code.

---

## 1. Context and Goals

### 1.1 Design Intent
Deliver a structured, content-first storefront for online shoppers that is fast to build, consistent across pages, and verifiably accessible at WCAG 2.2 AA.

### 1.2 Goals
- **Consistency**: every screen composes from the same token set and component states.
- **Accessibility**: keyboard-first interactions, visible focus, and tested contrast on every surface.
- **Velocity**: contributors must compose UI from documented primitives — no one-off styles.
- **Commerce clarity**: product, price, stock, and CTA states must always be unambiguous.

### 1.3 Scope
- Storefront pages (landing, category, product detail, cart, checkout, account).
- Component density per typical page: **42 links, 9 buttons, 5 cards, 4 lists, 3 inputs, 2 navigation regions**. Components must perform under this density without layout shift or focus-order regressions.

### 1.4 Audience
Frontend engineers, designers, QA, and content authors shipping CINENOVA features.

---

## 2. Design Tokens and Foundations

Tokens are the **only** allowed values in component code. References below use the canonical token names; build pipelines (Tailwind, CSS variables, etc.) must export these names verbatim.

### 2.1 Typography Tokens

| Token | Value |
|---|---|
| `font.family.primary` | `Poppins` |
| `font.family.stack` | `Poppins, sans-serif` |
| `font.size.base` | `16px` |
| `font.weight.base` | `400` |
| `font.lineHeight.base` | `25.6px` |
| `font.size.xs` | `13.6px` |
| `font.size.sm` | `14.4px` |
| `font.size.md` | `15.2px` |
| `font.size.lg` | `15.68px` |
| `font.size.xl` | `16px` |
| `font.size.2xl` | `17.6px` |
| `font.size.3xl` | `20px` |
| `font.size.4xl` | `20.8px` |

**Rules**
- Body copy must use `font.size.base` with `font.lineHeight.base`.
- Component labels must not introduce sizes outside this scale.
- Headings should map: H1 → `font.size.4xl`, H2 → `font.size.3xl`, H3 → `font.size.2xl`, H4/H5 → `font.size.xl`/`font.size.lg`.
- Long-form prose should not exceed 75 characters per line.

### 2.2 Color Tokens (Semantic)

| Token | Value | Usage |
|---|---|---|
| `color.text.primary` | `#ffffff` | Default body and heading text |
| `color.text.secondary` | `#f5f5f5` | Supporting copy, captions |
| `color.text.tertiary` | `#ff1744` | Accent, price, sale, danger |
| `color.text.inverse` | `#b0b0b0` | Text on raised surfaces, muted meta |
| `color.surface.base` | `#000000` | Page background |
| `color.surface.muted` | `#1e293b` | Section backgrounds, separators |
| `color.surface.raised` | `#2a2a2a` | Cards, popovers, dropdowns |
| `color.surface.strong` | `#0a0a0a` | Sticky headers, modals |
| `color.border.muted` | `rgb(255,255,255) rgb(255,255,255) rgb(255,255,255) rgba(0,0,0,0)` | Default border (top/right/bottom transparent-left) |

**Rules**
- Components must reference tokens by name, never raw hex.
- `color.text.tertiary` is a **signal color** (price, error, sale). It must not be used for body copy or decorative fills.
- Text must meet ≥4.5:1 contrast on its surface. Large text (≥`font.size.3xl` bold) must meet ≥3:1.
- Disabled text must retain ≥3:1 contrast (use `color.text.inverse` on `color.surface.raised`).

### 2.3 Spacing Tokens

| Token | Value |
|---|---|
| `space.1` | `1px` |
| `space.2` | `4px` |
| `space.3` | `5px` |
| `space.4` | `6px` |
| `space.5` | `8px` |
| `space.6` | `10px` |
| `space.7` | `12px` |
| `space.8` | `12.8px` |

**Rules**
- Component internal padding must use `space.5`–`space.8`.
- Stack gaps between primitives must use `space.4`–`space.7`.
- Hairlines and borders must use `space.1`.
- One-off spacing values are prohibited.

### 2.4 Radius, Shadow, Motion

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | `10px` | Inputs, chips |
| `radius.sm` | `12px` | Buttons, small cards |
| `radius.md` | `16px` | Cards, dialogs |
| `radius.lg` | `30px` | Pill controls |
| `radius.xl` | `50px` | Avatars, circular badges |
| `shadow.1` | `rgba(220,20,60,0.25) 0 12px 30px 0` | Hover lift on primary CTAs |
| `shadow.2` | `rgba(220,20,60,0.4) 0 0 20px 0` | Focus glow on primary CTAs |
| `shadow.3` | `rgba(243,156,18,0.3) 0 4px 10px 0` | Promotional / featured cards |
| `shadow.4` | `rgba(0,0,0,0.15) 0 4px 20px 0` | Default card elevation |

**Motion**
- Default transition duration: 150ms; ease: `ease-out`. Components should animate `transform`, `opacity`, and `box-shadow` only.
- All motion must respect `prefers-reduced-motion: reduce` and collapse to opacity-only transitions ≤80ms.

---

## 3. Global Component Rules

These apply to every component before its specific anatomy.

- Every component **must** define: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`.
- Every component **must** be operable by keyboard, pointer, and touch.
- Touch targets **must** be ≥44×44 CSS pixels.
- Focus rings **must** use `shadow.2` or a 2px outline in `color.text.tertiary` with a 2px offset; focus must never be removed without a visible replacement.
- Loading states **must** preserve the component’s footprint to avoid layout shift.
- Error states **must** include a textual message; color alone is not sufficient.
- Components should compose; one-off variants are prohibited without an additive token proposal.

---

## 4. Component-Level Rules

### 4.1 Link

**Anatomy**: text label, optional leading icon, optional trailing icon (e.g., external).

**Variants**: `inline` (within prose), `standalone` (nav/menu), `meta` (footer/legal).

**Typography & spacing**
- Label: `font.size.md`, weight `font.weight.base`.
- Inline links must underline by default; standalone links must underline on hover and focus.

**States**
| State | Token |
|---|---|
| default | `color.text.secondary` |
| hover | `color.text.primary`, underline |
| focus-visible | 2px outline `color.text.tertiary`, offset 2px |
| active | `color.text.tertiary` |
| disabled | `color.text.inverse`, `aria-disabled="true"`, no pointer cursor |
| loading | not applicable; use a button instead |
| error | not applicable |

**Behavior**
- Keyboard: reachable via `Tab`; activated via `Enter`.
- Pointer: cursor `pointer`; click target equals visible text plus `space.5` padding on each side when standalone.
- Touch: hit area ≥44×44; adjacent links must have ≥`space.5` between targets.
- External links must include `rel="noopener noreferrer"` and a visually-hidden “opens in new tab” for screen readers.

**Edge cases**
- Long labels must wrap; truncation is allowed only on single-line nav, with a `title` attribute exposing the full text.
- A page may render up to **42 links** — focus order must follow DOM order; skip-link must precede primary nav.

---

### 4.2 Button

**Anatomy**: leading icon (optional), label, trailing icon (optional), spinner slot (loading).

**Variants**: `primary`, `secondary`, `ghost`, `destructive`, `icon-only`.

**Sizing**: `sm` (36px height), `md` (44px height, default), `lg` (52px height). Touch targets must remain ≥44×44 even for `sm` via padding.

**Typography & spacing**
- Label: `font.size.md` (`md` size), `font.size.sm` (`sm`), `font.size.lg` (`lg`); weight 500–600.
- Internal padding: `space.7` horizontal, `space.5` vertical (md).
- Radius: `radius.sm` for rectangular; `radius.lg` for pill; `radius.xl` for icon-only round.

**States**
| State | Primary | Secondary | Ghost |
|---|---|---|---|
| default | `color.surface.raised` bg, `color.text.primary` label | transparent bg, `color.text.tertiary` border, `color.text.tertiary` label | transparent bg, `color.text.secondary` label |
| hover | apply `shadow.1`, lift 1px | bg → `color.surface.muted` | label → `color.text.primary` |
| focus-visible | apply `shadow.2` + 2px offset outline | same | same |
| active | translate Y +1px, dim 8% | same | same |
| disabled | opacity 0.5, cursor `not-allowed`, `aria-disabled` | same | same |
| loading | spinner replaces leading icon, label retained, `aria-busy="true"`, button width preserved | same | same |
| error | red border via `color.text.tertiary`, error message rendered adjacent | same | same |

**Behavior**
- Keyboard: `Tab` to focus, `Enter`/`Space` to activate; `Esc` cancels in modal contexts.
- Pointer: cursor `pointer` only when enabled.
- Touch: ≥44×44; press feedback within 100ms.
- A page may render up to **9 buttons** — only one button per region should be `primary`.

**Edge cases**
- Long labels must wrap to two lines max; truncation requires a `title`.
- Loading state must not change button width by more than `space.2`.
- Icon-only buttons must include `aria-label`.

---

### 4.3 Card (Product Card primary use)

**Anatomy**: media slot (16:9 or 1:1), badge slot, title, supporting text, price, CTA, footer meta.

**Variants**: `product`, `promo` (uses `shadow.3`), `feature`, `compact`.

**Typography & spacing**
- Title: `font.size.2xl`, weight 600, max 2 lines.
- Supporting: `font.size.sm`, `color.text.secondary`.
- Price: `font.size.3xl`, `color.text.tertiary`, weight 700.
- Internal padding: `space.7` all sides; gap between primitives: `space.5`.
- Radius: `radius.md`. Background: `color.surface.raised`. Default elevation: `shadow.4`.

**States**
| State | Behavior |
|---|---|
| default | `shadow.4`, no transform |
| hover | elevate to `shadow.1`, translate Y −2px |
| focus-visible (when card itself is a link) | outline 2px `color.text.tertiary`, offset 2px |
| active | translate Y 0, dim 4% |
| disabled (out of stock) | opacity 0.6, CTA replaced by “Notify me”, badge “Out of stock” using `color.text.tertiary` |
| loading (skeleton) | shimmer over media, title, price; preserves height |
| error | inline message inside card body, CTA disabled |

**Behavior**
- Keyboard: if the entire card is a link, only one focus stop; if card has internal CTA, focus stops are `card link` then `CTA`.
- Pointer: hover state must not depend on JS.
- Touch: hover styling must collapse on touch devices (`@media (hover: hover)`).
- Up to **5 cards** per page section; grids must fall back to single column ≤640px.

**Edge cases**
- Missing media: render `color.surface.muted` placeholder with brand glyph.
- Long titles: clamp to 2 lines, ellipsis, full title in `title` attribute.
- Price ranges (e.g., variants): show `From {price}` using `color.text.tertiary`.

---

### 4.4 List

**Anatomy**: list container, optional header, list items (with leading visual, primary text, secondary text, trailing action).

**Variants**: `nav-list`, `data-list` (e.g., order history), `bullet-list` (prose), `selection-list` (with checkbox).

**Typography & spacing**
- Item primary: `font.size.md`. Secondary: `font.size.sm`, `color.text.inverse`.
- Item padding: `space.7` vertical, `space.7` horizontal.
- Dividers (when used): 1px (`space.1`) using `color.surface.muted`.

**States**
| State | Behavior |
|---|---|
| default | transparent bg |
| hover (interactive lists) | bg → `color.surface.muted` |
| focus-visible | outline 2px `color.text.tertiary`, offset −2px (inset) |
| active | bg → `color.surface.raised` |
| selected | left bar 3px `color.text.tertiary`, label weight 600 |
| disabled | opacity 0.5, no hover bg |
| loading | 3 skeleton items minimum |
| error | replace list with inline error region; do not render partial state silently |

**Behavior**
- Keyboard: `selection-list` and `nav-list` must support `ArrowUp`/`ArrowDown`, `Home`/`End`; activation via `Enter` or `Space`.
- Pointer: full row is the click target.
- Touch: row height ≥44px.
- Up to **4 lists** per page; nested lists are limited to 2 levels.

**Edge cases**
- Empty state: render an illustration or icon, an `font.size.lg` heading, and a primary action.
- Long labels: wrap to 2 lines max.
- Virtualization should be applied for lists >50 items to maintain scroll performance.

---

### 4.5 Input (Text, Email, Password, Search, Number)

**Anatomy**: label, input field, helper text, error text, leading icon, trailing icon/affordance.

**Variants**: `text`, `email`, `password` (with reveal toggle), `search` (with submit affordance), `number`.

**Typography & spacing**
- Label: `font.size.sm`, weight 500, `color.text.secondary`.
- Input value: `font.size.md`, `color.text.primary`.
- Helper / error: `font.size.xs`.
- Field height: 44px. Padding: `space.7` horizontal, `space.5` vertical. Radius: `radius.xs`.
- Background: `color.surface.raised`. Border: 1px `color.text.inverse`.

**States**
| State | Behavior |
|---|---|
| default | border `color.text.inverse`, label above |
| hover | border `color.text.secondary` |
| focus-visible | border `color.text.tertiary`, `shadow.2` |
| active (typing) | border `color.text.tertiary` |
| disabled | opacity 0.5, cursor `not-allowed`, `aria-disabled` |
| loading (async validate) | trailing spinner, `aria-busy="true"` |
| error | border `color.text.tertiary`, message rendered below with `role="alert"` |

**Behavior**
- Keyboard: `Tab` to focus; `Esc` clears in `search` variant; password reveal toggle must be reachable via `Tab` and announce state via `aria-pressed`.
- Pointer: cursor `text` over the input area, `pointer` on icons/affordances.
- Touch: full field is the focus target; iOS zoom must be prevented by maintaining `font.size.base`.
- Up to **3 inputs** per page section; longer forms must group inputs into fieldsets.

**Edge cases**
- Long values: horizontal scroll within the field; do not visually truncate without preserving the value.
- Autofill: styled state must match `default`; never hide autofilled text.
- Validation: errors must appear on blur or submit, never on first keystroke.

---

### 4.6 Navigation (Primary Header + Secondary/Footer)

**Anatomy**: brand mark, primary nav links, search input, account menu, cart button, secondary nav (footer or category rail).

**Variants**: `primary` (sticky top), `secondary` (footer/sidebar).

**Typography & spacing**
- Link label: `font.size.md`, weight 500.
- Region padding: `space.7`–`space.8`. Background: `color.surface.strong` (primary), `color.surface.muted` (secondary).
- Cart badge: `font.size.xs`, `color.text.primary` on `color.text.tertiary` background, `radius.xl`.

**States**
| State | Behavior |
|---|---|
| default | links use `color.text.secondary` |
| hover | label → `color.text.primary`, underline |
| focus-visible | 2px outline `color.text.tertiary`, offset 2px |
| active | label → `color.text.tertiary` |
| current page | label → `color.text.primary`, weight 600, `aria-current="page"` |
| disabled | not used in nav; remove the item instead |
| loading | skeleton row preserving height |
| error (e.g., cart fetch) | cart icon shows red dot, tooltip with retry CTA |

**Behavior**
- Keyboard: `Tab` follows DOM order; skip-link to `<main>` must be the first focus stop. Mobile menu must trap focus when open and close on `Esc`.
- Pointer: hover reveal must not be the sole disclosure mechanism — items must also open on click/tap.
- Touch: hamburger ≥44×44; menu drawer must close on outside tap.
- **2 navigation regions** per page maximum (primary + footer/secondary).

**Edge cases**
- Overflow: collapse extra primary links into a “More” menu beyond 7 items.
- Sticky header must not occlude focused content; ensure `scroll-margin-top` on anchors.
- RTL: navigation must mirror without manual overrides.

---

## 5. Accessibility Requirements (WCAG 2.2 AA)

Every rule below **must** be testable in implementation.

| ID | Rule | Pass / Fail Check |
|---|---|---|
| A11Y-1 | All text meets ≥4.5:1 contrast (≥3:1 for large bold text) | Run axe / Lighthouse contrast audit; zero violations |
| A11Y-2 | Every interactive element has a visible focus indicator | Tab through page; every stop shows `shadow.2` or 2px outline |
| A11Y-3 | All actionable elements are keyboard operable | No mouse-only interactions; verify with keyboard-only walkthrough |
| A11Y-4 | Touch targets ≥44×44 CSS pixels | Inspect computed sizes; fail if any `<44` |
| A11Y-5 | Form inputs have programmatic labels | Every `<input>` has `<label for>` or `aria-labelledby` |
| A11Y-6 | Errors are announced to assistive tech | Error region has `role="alert"` or `aria-live="assertive"` |
| A11Y-7 | Loading states announce busy status | Component sets `aria-busy="true"` while loading |
| A11Y-8 | Focus is trapped in modals and drawers | Tab cycles within container; `Esc` closes |
| A11Y-9 | Color is never the sole indicator | Errors include text/icon; selection includes weight or bar |
| A11Y-10 | `prefers-reduced-motion` is honored | Animations collapse to opacity ≤80ms when reduced |
| A11Y-11 | Skip-link to `<main>` is present and visible on focus | First Tab reveals skip-link |
| A11Y-12 | Language is set on `<html>` | `lang` attribute present and correct |
| A11Y-13 | Headings form a logical outline | No skipped levels; one `<h1>` per page |
| A11Y-14 | Images have meaningful `alt` or `alt=""` if decorative | No empty product images without `alt` |
| A11Y-15 | Auto-updating content can be paused | Carousels expose pause/stop controls |

---

## 6. Content and Tone Standards

**Voice**: concise, confident, implementation-focused. Speak to shoppers as informed peers.

**Rules**
- CTAs must use action verbs: “Add to cart”, “Checkout”, “Track order”. Avoid “Click here”, “Submit”, “OK”.
- Error messages must explain *what* went wrong and *what to do next*.
- Sentence case for buttons, links, and headings; reserve title case for the brand name “CINENOVA”.
- Pricing must always show currency and units; never display a bare number.

**Examples**

| Do | Don’t |
|---|---|
| “Add to cart” | “Click here to add” |
| “Card declined. Try another payment method.” | “Error 402” |
| “No orders yet. Browse the latest drops.” | “Empty.” |
| “Save 20% on selected GPUs” | “Discount available!!!” |

---

## 7. Anti-Patterns and Prohibited Implementations

The following **must not** ship:

- Raw hex, rgb, or px values inside component code where a token exists.
- Removing focus outlines without an equivalent visible replacement.
- Hover-only disclosure for primary navigation or critical actions.
- Disabled buttons with no explanation of why they are disabled.
- Loading spinners that change layout dimensions.
- Errors communicated only via color.
- Truncating product titles without exposing the full title to assistive tech.
- One-off spacing/radius/shadow values not present in this document.
- Mixing icon-only buttons without `aria-label`.
- Auto-playing carousels without pause controls or reduced-motion handling.
- Inline `style` attributes overriding tokenized styles.

**Migration notes**
- Legacy components using raw colors must migrate to semantic tokens before any new feature work in the same file.
- Legacy components without explicit `focus-visible` must add it as part of any touched PR.
- Where a legacy variant cannot be expressed in tokens, the proposal must add a new token before merging — never inline.

---

## 8. QA Checklist

Before any PR touching UI is approved, every item below must pass:

**Tokens**
- [ ] No raw color, spacing, radius, or shadow values introduced.
- [ ] Typography uses only documented sizes and the Poppins family.

**States**
- [ ] All seven states (default, hover, focus-visible, active, disabled, loading, error) implemented per touched component.
- [ ] Loading states preserve component dimensions.
- [ ] Error states include a text message, not just color.

**Keyboard & Input**
- [ ] Full flow operable by keyboard alone.
- [ ] Focus order matches DOM order and visual order.
- [ ] Skip-link present and reaches `<main>`.
- [ ] Modals/drawers trap focus and close on `Esc`.

**Pointer & Touch**
- [ ] All interactive elements ≥44×44.
- [ ] Hover styles collapse on touch devices.
- [ ] Adjacent targets have ≥`space.5` separation.

**Accessibility**
- [ ] axe / Lighthouse run with zero critical violations.
- [ ] Contrast verified for text on each surface used.
- [ ] `prefers-reduced-motion` reduces animation as specified.
- [ ] All inputs have programmatic labels.
- [ ] Live regions used for async error/success.

**Density & Responsiveness**
- [ ] Page renders correctly at known density (≤42 links, ≤9 buttons, ≤5 cards, ≤4 lists, ≤3 inputs, 2 nav regions).
- [ ] Layout reflows to single column ≤640px without horizontal scroll.
- [ ] Sticky header does not occlude focused or anchored content.

**Content**
- [ ] CTAs use action verbs.
- [ ] Pricing includes currency.
- [ ] Empty states include heading, supporting text, and a primary action.

**Anti-patterns**
- [ ] No inline styles overriding tokens.
- [ ] No hover-only disclosure for required interactions.
- [ ] No disabled controls without an accessible explanation.

---

## Appendix A — Token Cheatsheet

```text
Typography  : font.family.primary | font.family.stack | font.size.{xs,sm,md,lg,xl,2xl,3xl,4xl,base} | font.weight.base | font.lineHeight.base
Color text  : color.text.{primary,secondary,tertiary,inverse}
Color surf  : color.surface.{base,muted,raised,strong}
Color brdr  : color.border.muted
Spacing     : space.{1..8}
Radius      : radius.{xs,sm,md,lg,xl}
Shadow      : shadow.{1,2,3,4}
```

## Appendix B — State Matrix Template

When documenting a new component, copy and complete this matrix:

| State | Background | Text | Border | Shadow | Motion | A11y attribute |
|---|---|---|---|---|---|---|
| default | | | | | | |
| hover | | | | | | |
| focus-visible | | | | | | |
| active | | | | | | |
| disabled | | | | | | `aria-disabled="true"` |
| loading | | | | | | `aria-busy="true"` |
| error | | | | | | `role="alert"` on message |
