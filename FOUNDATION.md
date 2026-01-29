# Vero's Boutique | Foundation Architecture

## Overview
Clean, centralized design system for consistent styling and easy future expansions. No hardcoded values, single source of truth for all design tokens.

---

## Global Design System

### Token Location
**Primary:** `src/styles/global.css` (lines 1-100)  
**Imports:** `src/layouts/BaseLayout.astro` → all pages inherit

### Design Tokens (by Category)

#### Colors
```css
--color-ivory: #FDFCFB;        /* Main background */
--color-champagne: #F7E7CE;     /* Warm accent highlights */
--color-black: #1A1A1A;         /* Primary text */
--color-gold: #C5A059;          /* Brand accent, hover states */
--color-charcoal: #2B2B2B;      /* Secondary text (subheadings) */
--color-gray-dark: #333333;     /* Dark neutrals */
--color-gray-medium: #666666;   /* Medium neutrals */
--color-gray-light: #999999;    /* Light neutrals */
--color-gray-lighter: #CCCCCC;  /* Lighter neutrals */
```

#### Typography
```css
--font-serif: 'Playfair Display', serif;    /* Headings (luxury) */
--font-sans: 'Inter', sans-serif;           /* Body text (readable) */
```

#### Spacing Scale (0.25rem = 4px base)
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
--space-40: 10rem;     /* 160px */
```

#### Layout
```css
--header-height: 70px;           /* Fixed header height (sync'd with main padding-top) */
--header-max-width: 1380px;      /* Desktop nav max-width for brand centering */
```

#### Transitions
```css
--transition-fast: 300ms ease-out;
--transition-normal: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 700ms ease-out;
```

---

## File Structure & Responsibilities

### Layout (`src/layouts/BaseLayout.astro`)
- **Purpose:** Authoritative layout wrapper for all pages
- **Responsibilities:**
  - HTML document shell (doctype, head, meta, fonts)
  - Header component inclusion
  - Main padding-top offset (exactly once: `padding-top: var(--header-height)`)
  - Global style import
- **Rule:** All pages MUST use BaseLayout — no exceptions
- **Critical Line:** `main { padding-top: var(--header-height); }` — this is the ONLY place header offset is set

### Global Styles (`src/styles/global.css`)
- **Purpose:** Single source of truth for design tokens and base resets
- **Sections:**
  - `:root` tokens (colors, typography, spacing, layout, transitions)
  - Reset styles (`*`, `html`, `body`)
  - Typography rules (`h1–h6`, `.font-serif`)
  - Component-specific styles (hero, header, banner)
  - Utility classes (buttons, containers)

### Components

#### Header (`src/components/Header.astro`)
- **Purpose:** Fixed, premium navigation with scroll detection
- **Key Features:**
  - Fixed position, z-index 100, 70px height
  - CSS Grid 3-column layout: `grid-template-cols: 1fr auto 1fr`
  - Brand centered via `justify-self: center`
  - Desktop nav hidden at breakpoints < 1024px
  - Mobile hamburger menu with slide-over
  - Scroll state: white → dark (rgba 0,0,0,0.55) + blur(10px)
  - Gold hover on nav links and CTA button
- **Centering Formula:** Grid ensures mathematical center at all widths — no transform hacks

#### Hero (`src/components/hero/Hero.astro`)
- **Purpose:** Reusable hero section with image backdrop, overlay, and CTAs
- **Key Features:**
  - Prop-driven content (title, subtitle, CTAs, categories)
  - Mobile: flex layout, single column
  - Desktop: CSS Grid 45% image | 55% text (grid-template-columns)
  - Image: grayscale(5%), no blur, crisp
  - Mobile overlay: Transparent gradient (rgba 245, 241, 233, 0.55→0.35), attached to text-block
  - **Critical:** Hero has `padding-top: 0` — main already provides header offset
- **Customizable Props:** `title`, `titleItalic`, `subtitle`, `primaryCTA`, `secondaryCTA`, `location`, `categories`, `heroImage`

#### OpeningBanner (`src/components/OpeningBanner.astro`)
- **Purpose:** Temporary pre-launch banner (home page only)
- **Key Features:**
  - Single-line text: "Opening February 2026"
  - Warm champagne background gradient (rgba 245, 241, 233, 0.55→0.35)
  - Gold accent lines (top/bottom borders)
  - Dark charcoal text (#2B2B2B), serif font, tracking: 0.15em
  - Responsive padding: 1rem (mobile) → 1.125rem (tablet) → 2.25rem (desktop)
- **Temp Status:** Marked with `<!-- TEMP: REMOVE AFTER OPENING -->` comment
- **Removal:** Delete component file + remove 1 import + 1 tag in `src/pages/index.astro`

---

## Page Structure

### All Pages
- **Must use:** `import BaseLayout from '../layouts/BaseLayout.astro'`
- **Wrap in:** `<BaseLayout title={...} description={...}>`
- **Content:** Placed in `<slot />` within main

### Home Page (`src/pages/index.astro`)
- Includes: Header (via BaseLayout) → OpeningBanner → Hero → Other sections
- **Flow:** Header (70px fixed) → Banner (in main with padding-top offset) → Hero (padding-top: 0)

### CTA Destination Pages (13 pages)
- All route to "OPENING FEBRUARY 2026" message page
- Consistent styling: dark charcoal (#2B2B2B) text, font-weight 500
- Pages: `/book-an-appointment`, `/visit-the-boutique`, `/about-veros-boutique`, `/contact`, `/gallery`, `/faq`, `/formal-gowns-richmond-ky`, `/wedding-dresses-richmond-ky`, `/quinceanera-dresses-richmond-ky`, `/event-planning-richmond-ky`, `/event-decor-florals-richmond-ky`, `/privacy-policy`, `/terms`

---

## Spacing & Layout Rules

### Fixed Header Offset (Critical!)
- Header is `position: fixed` and 70px tall
- **ONLY place this offset is set:** `main { padding-top: 70px; }`
- All child elements (OpeningBanner, Hero, sections) assume this offset exists
- **Never add padding-top to Hero or other components** — causes double offset white bars

### Component Spacing
- Hero: `padding-top: 0` (inherits main offset), `padding-bottom: 2rem (mobile) / 4rem (desktop)`
- OpeningBanner: Own padding for visual breathing room (not affected by header offset, sits within main)
- Sections: Use `--space-*` tokens for consistent spacing

### No Hardcoded Values
- All colors → `var(--color-*)`
- All spacing → `var(--space-*)`
- All transitions → `var(--transition-*)`
- All fonts → `var(--font-*)`

---

## Responsive Breakpoints

### Key Widths
- **Mobile default:** < 640px
- **Tablet:** 640px – 1024px
- **Desktop:** ≥ 1024px (header nav visible)
- **Large desktop:** ≥ 1280px (increased padding/gaps)

### Header Behavior
- **< 1024px:** Hamburger menu (fixed width)
- **≥ 1024px:** Full desktop nav with 3-column grid, max-width 1380px, centered brand

---

## Audit Results

✅ **No duplicate tokens** — all variables centralized in `:root`  
✅ **No double padding offsets** — main padding-top is authoritative  
✅ **Header brand is mathematically centered** — grid-based centering (no transforms)  
✅ **No white gaps** — spacing layered consistently (header offset → banner → hero)  
✅ **All pages use BaseLayout** — 14 pages, all inherit consistently  
✅ **Hero overlay is subtle** — crisp image, transparent gradient scrim on mobile  
✅ **OpeningBanner is removable** — 1 component file + 1 import/tag = clean deletion  
✅ **Responsive behavior is consistent** — hamburger at 1024px, desktop grid at 1024px+  

---

## How to Extend

### Add a New Color
1. Edit `src/styles/global.css`, add to `:root`:
   ```css
   --color-new-color: #HEXCODE;
   ```
2. Use in components:
   ```css
   color: var(--color-new-color);
   ```

### Add New Spacing
1. Edit `src/styles/global.css`, add to `:root`:
   ```css
   --space-28: 7rem;  /* 112px */
   ```
2. Use in components:
   ```css
   padding: var(--space-28);
   ```

### Add New Component
1. Create `src/components/ComponentName.astro`
2. Use existing color, spacing, and transition tokens
3. Add to a page via import:
   ```astro
   import ComponentName from '../components/ComponentName.astro';
   <ComponentName prop="value" />
   ```

### Create New Page
1. Create file in `src/pages/route-name/index.astro`
2. Wrap in BaseLayout:
   ```astro
   import BaseLayout from '../../layouts/BaseLayout.astro';
   <BaseLayout title="Page Title" description="...">
     {/* content here */}
   </BaseLayout>
   ```

---

## Future Considerations

- **Tailwind Migration:** If needed later, the current CSS variable system maps cleanly to Tailwind config
- **Dark Mode:** Add `@media (prefers-color-scheme: dark)` overrides to `:root` without touching components
- **Animation Library:** Transitions are pre-defined; add `--transition-*` variants as needed
- **Performance:** Global CSS is loaded once; component styles are scoped via Astro

