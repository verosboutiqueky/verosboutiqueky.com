# Vero's Boutique UI Patterns Reference

## Purpose

This document serves as the official visual system specification for Vero's Boutique across all pages. It captures established design patterns from production pages and provides reusable CSS classes, markup structures, and implementation guidelines for future pages.

**Last Updated:** February 2026  
**Status:** Live (validated on event-planning-quinceaneras-weddings-richmond-ky & wedding-prom-florist-richmond-ky)

---

## 1. Image Container Standard

### Specification

| Property | Value | Purpose |
|----------|-------|---------|
| **Border Radius** | 8px | Consistent rounded corners throughout design |
| **Background** | `#f9f7f4` | Soft warm beige tile background (fixes white gaps behind images) |
| **Overflow** | `hidden` | Clips images to rounded corners, prevents image bleed |
| **Aspect Ratio** | `4 / 3` or `5 / 6` | Maintains responsive image dimensions without hardcoded heights |
| **Object-Fit** | `cover` | Fills container while preserving aspect ratio—no distortion or letterboxing |
| **Hover Effect** | `transform: translateY(-4px)` | Subtle lift animation creates depth and interactivity |
| **Transition** | `var(--transition-base)` (300ms ease-out) | Smooth motion, professional feel |

### CSS Pattern

```css
.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f9f7f4;
  transition: transform var(--transition-base);
}

.image-container:hover {
  transform: translateY(-4px);
}

.image-container img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;  /* Use 5 / 6 for portrait crops */
  object-fit: cover;
  display: block;
}
```

### Recommended Markup

```astro
<div class="image-container">
  <img
    src="/path/to/image.webp"
    alt="Descriptive text for SEO"
    width={600}
    height={450}
    loading="lazy"
    decoding="async"
    class="image"
  />
  <p class="label">Optional Caption</p>
</div>
```

### Caption Overlay Pattern

When labels are required, use this gradient overlay:

```css
.label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  margin: 0;
  padding: var(--space-6) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: var(--ls-tight);
}
```

### Notes

- **Never skip aspect-ratio**: Prevents layout shift (CLS) on image load
- **Always use `loading="lazy"`**: Defers offscreen image requests
- **Background color is intentional**: Provides visual consistency if image fails to load
- **Object-fit prevents distortion**: All images fill container perfectly regardless of source dimensions

---

## 2. Gallery Grid Standard

### Specification

**Responsive Breakpoints:**

| Breakpoint | Columns | Gap | Auto-rows |
|-----------|---------|-----|-----------|
| Mobile (0–639px) | 1 | var(--space-8) (32px) | auto / 300px |
| Tablet (640–1023px) | 2 | var(--space-8) (32px) | auto / 320px |
| Desktop (1024px+) | 4 | var(--space-8) (32px) | auto / 360px |

### CSS Pattern

```css
.gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  margin: var(--space-12) 0;
}

@media (min-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gallery-item {
  /* Use Image Container Standard (see section 1) */
}
```

### Max-Width Container

All galleries must be wrapped in `.container`:

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

This ensures consistent spacing on all screen sizes and prevents content from stretching on ultra-wide displays.

### Performance Guardrails

- **No auto-fit/auto-fill**: Use explicit breakpoints instead for predictable layout
- **Image height consistency**: Set `auto-rows: 300px` (mobile) on grid to prevent jumping
- **Gap consistency**: Always use `var(--space-8)` to match design system
- **Lazy loading**: All images in galleries must have `loading="lazy"`

---

## 3. Card Component Standard

### Specification

| Property | Value |
|----------|-------|
| **Padding** | `var(--space-8)` (32px) |
| **Border Radius** | `8px` |
| **Background** | `white` |
| **Border** | `2px solid var(--color-gold)` OR `1px solid var(--color-gold)` |
| **Typography** | `text-align: center` for pricing/service cards |
| **Hover Effect** | Optional: `transform: translateY(-4px)` for link cards |

### CSS Patterns

#### Pricing Card

```css
.pricing-card {
  padding: var(--space-8);
  border: 2px solid var(--color-gold);
  background-color: white;
  border-radius: 8px;
  text-align: center;
}

.pricing-card h3 {
  color: var(--color-navy);
  margin-bottom: var(--space-4);
}

.pricing-card__price {
  font-size: 1.5rem;
  color: var(--color-gold);
  font-weight: 600;
  margin: var(--space-4) 0 var(--space-2);
}
```

#### Feature Card (with hover)

```css
.feature-card {
  padding: var(--space-8);
  border: 1px solid var(--color-gold);
  background-color: white;
  border-radius: 8px;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

#### Service Card (with left border accent)

```css
.service-card {
  padding: var(--space-8);
  background-color: white;
  border-radius: 8px;
  border-top: 4px solid var(--color-gold);
}

.service-card h4 {
  color: var(--color-navy);
  margin-bottom: var(--space-6);
}
```

### Spacing Within Cards

```css
.card-list {
  list-style: none;
  padding: var(--space-6) 0;
  margin: var(--space-6) 0;
  border-top: 1px solid var(--color-gold);
  border-bottom: 1px solid var(--color-gold);
}

.card-list li {
  padding: var(--space-2) 0;
  padding-left: var(--space-6);
  position: relative;
  font-size: var(--text-secondary);
  color: var(--color-gray-medium);
}

.card-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-gold);
  font-weight: bold;
}
```

---

## 4. Pricing Grid Pattern

### Specification

| Property | Value |
|----------|-------|
| **Grid Layout** | `repeat(auto-fit, minmax(280px, 1fr))` OR `repeat(auto-fit, minmax(300px, 1fr))` |
| **Gap** | `var(--space-8)` |
| **Card Style** | See Card Component Standard (section 3) |
| **Pricing Display** | `font-size: 1.5rem`, `color: var(--color-gold)`, `font-weight: 600` |
| **Description** | `font-size: var(--text-secondary)`, `color: var(--color-gray-medium)` |

### CSS Pattern

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  margin: var(--space-12) 0;
}

.pricing-card {
  padding: var(--space-8);
  border: 2px solid var(--color-gold);
  background-color: white;
  border-radius: 8px;
  text-align: center;
}

.pricing-card__features {
  list-style: none;
  text-align: left;
  padding: var(--space-6) 0;
  margin: var(--space-6) 0;
  border-top: 1px solid var(--color-gold);
  border-bottom: 1px solid var(--color-gold);
}

.pricing-card__features li {
  padding: var(--space-2) 0;
  font-size: 0.95rem;
  color: var(--color-gray-medium);
  padding-left: var(--space-6);
  position: relative;
}

.pricing-card__features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-gold);
  font-weight: bold;
}
```

### Recommended Markup

```astro
<section class="pricing-section">
  <div class="container">
    <h2>Pricing Packages</h2>
    
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Essential</h3>
        <p class="pricing-card__price">Starting at $800</p>
        <p class="pricing-card__description">Day-of Coordination</p>
        <ul class="pricing-card__features">
          <li>Feature one</li>
          <li>Feature two</li>
          <li>Feature three</li>
        </ul>
        <a href="#contact" class="button button--primary">Select Package</a>
      </div>
      
      <!-- Additional cards -->
    </div>
  </div>
</section>
```

---

## 5. Section Rhythm Rules

### Section Spacing

All major page sections follow this consistent rhythm:

```css
section {
  padding: var(--space-16) var(--space-6);
  margin-bottom: var(--space-16);
}

/* Alternate: use var(--color-ivory) or var(--color-white) for visual separation */
section:nth-child(even) {
  background-color: var(--color-ivory);
}

section:nth-child(odd) {
  background-color: white;
}
```

### Heading Spacing

```css
h2 {
  text-align: center;
  margin-bottom: var(--space-6);
}

/* Intro paragraph under h2 */
.section-intro {
  font-size: var(--text-body);
  line-height: var(--lh-loose);
  max-width: 90ch;
  margin: var(--space-6) auto var(--space-12);
  color: var(--color-charcoal);
  text-align: center;
}
```

### Container Max-Width

All sections must use `.container` for proper centering:

```astro
<section class="pricing-section">
  <div class="container">
    <!-- Content here -->
  </div>
</section>
```

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

### Vertical Spacing Between Components

| Element | Spacing |
|---------|---------|
| Section to section | `var(--space-16)` (64px) |
| H2 to intro text | `var(--space-6)` (24px) |
| Intro text to content | `var(--space-12)` (48px) |
| Gallery item to gallery item | `var(--space-8)` (32px) |
| CTA sections between content | `var(--space-12)` (48px) |

---

## 6. Motion Guidelines

### Allowed Transitions

All animations must use CSS variables for consistency:

```css
--transition-fast: 300ms ease-out;      /* Quick interactions */
--transition-normal: 500ms cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth transitions */
--transition-slow: 700ms ease-out;      /* Entrance animations */
```

### Recommended Hover Effects

#### Image Zoom on Hover (Gallery Items)

```css
.gallery-item:hover {
  transform: translateY(-4px);
}
```

Not `scale(1.05)` on the container—only lift the entire tile. Let image fill container naturally.

#### Card Elevation

```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

#### Link Hover

```css
a:hover {
  color: var(--color-gold);
}
```

#### Button Hover

```css
.button--primary:hover {
  background-color: var(--color-gray-dark);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Animation Duration Rules

| Animation Type | Duration | Timing |
|---|---|---|
| Hover state change | 300ms | `ease-out` |
| Page transition | 500ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Entrance animation | 700ms | `ease-out` |
| Scroll trigger | No smooth-scroll | Use instant (Lighthouse LCP impact) |

### Performance Constraints

- **No blur effects**: Avoid `filter: blur()` (expensive GPU operation)
- **No multiple transforms**: Use single `transform` property
- **No heavy JS-triggered animations**: CSS animations only
- **Max animation count**: 1 animation per component
- **No animation-delay stagger on page load**: Impacts perception of slowness

---

## 7. Performance Guardrails

### Image Size Targets

| Use Case | Format | Max Size | Dimensions |
|----------|--------|----------|-----------|
| Gallery thumbnail (4:3) | WebP | 40–60 KB | 600×450 |
| Gallery thumbnail (5:6) | WebP | 50–70 KB | 500×600 |
| Hero background | WebP | 100–150 KB | 1920×1080 |
| Portrait image | WebP | 60–80 KB | 800×600 |

### Image Optimization Checklist

- ✅ **Convert to WebP**: Use `cwebp` or online converter
- ✅ **Set `width` & `height`**: Prevents CLS (Cumulative Layout Shift)
- ✅ **Use `loading="lazy"`**: Defer offscreen images
- ✅ **Use `decoding="async"`**: Non-blocking image decode
- ✅ **Add descriptive alt text**: SEO + accessibility
- ✅ **Aspect-ratio container**: Reserves space before image loads

### Video Compression Rules

If using video (hero sections, background loops):

- **Format**: WebM (primary) + MP4 (fallback)
- **Codec**: VP9 (WebM) or H.264 (MP4)
- **Max bitrate**: 2 Mbps
- **Resolution**: 1920×1080 max
- **Poster frame**: Once per video element (`poster="/path/to/poster.webp"`)

### CLS Prevention

```css
/* GOOD: Reserves space, prevents shift */
.gallery-container {
  aspect-ratio: 4 / 3;
  background-color: #f9f7f4;
}

.gallery-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* BAD: No aspect ratio, causes shift when image loads */
.gallery-container img {
  width: 100%;
  height: auto;  /* ← Causes CLS! */
}
```

### Lazy Loading Rules

```astro
<!-- All images below the fold MUST have loading="lazy" -->
<img
  src="/path/to/image.webp"
  alt="..."
  loading="lazy"
  decoding="async"
/>

<!-- Hero/above-fold images: omit loading="lazy" for LCP -->
<img
  src="/path/to/hero.webp"
  alt="..."
  /* no loading attribute */
/>
```

---

## 8. Future Page Implementation Instructions

### Step-by-Step Process

#### Step 1: Create Page File

```
src/pages/your-page-name/index.astro
```

#### Step 2: Use BaseLayout & Scoped Styles

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Your Page Title (60 chars max)"
  description="Your meta description (155 chars max)"
>
  <!-- Content -->
</BaseLayout>

<style scoped>
  /* All styles must be SCOPED (no global CSS modifications) */
  /* Import patterns from this reference */
</style>
```

#### Step 3: Section Structure

Follow this pattern for each major section:

```astro
<section class="your-section-name">
  <div class="container">
    <h2>Section Title</h2>
    <p class="section-intro">Brief description of section content...</p>
    
    <!-- Your content grid/cards/gallery here -->
  </div>
</section>

<style scoped>
  .your-section-name {
    padding: var(--space-16) var(--space-6);
    background-color: white; /* or var(--color-ivory) */
    margin-bottom: var(--space-16);
  }

  .your-section-name h2 {
    text-align: center;
  }

  /* Additional component styles follow UI Patterns */
</style>
```

#### Step 4: Gallery Implementation

```astro
<section class="portfolio-section">
  <div class="container">
    <h2>Our Portfolio</h2>
    
    <div class="gallery-grid">
      <div class="gallery-item">
        <img
          src="/media/portfolio-1.webp"
          alt="Portfolio item description"
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          class="gallery-image"
        />
        <p class="gallery-label">Item Title</p>
      </div>
      
      <!-- Repeat for each gallery item -->
    </div>
  </div>
</section>

<style scoped>
  /* Use Gallery Grid Standard (Section 2) */
  .gallery-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-8);
    margin: var(--space-12) 0;
  }

  @media (min-width: 640px) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .gallery-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Use Image Container Standard (Section 1) */
  .gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    background-color: #f9f7f4;
    transition: transform var(--transition-base);
  }

  .gallery-item:hover {
    transform: translateY(-4px);
  }

  .gallery-image {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
  }

  .gallery-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    margin: 0;
    padding: var(--space-6) var(--space-4);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: var(--ls-tight);
  }
</style>
```

#### Step 5: Pricing/Card Grid

```astro
<section class="pricing-section">
  <div class="container">
    <h2>Service Packages</h2>
    
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Standard</h3>
        <p class="pricing-card__price">Starting at $1,000</p>
        <p class="pricing-card__description">Service description</p>
        
        <ul class="pricing-card__features">
          <li>Feature included</li>
          <li>Feature included</li>
          <li>Feature included</li>
        </ul>
        
        <a href="/contact?service=standard" class="button button--primary">
          Get Started
        </a>
      </div>
      
      <!-- Repeat pattern for each tier -->
    </div>
  </div>
</section>

<style scoped>
  /* Use Card Component Standard (Section 3) & Pricing Grid Pattern (Section 4) */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-8);
    margin: var(--space-12) 0;
  }

  .pricing-card {
    padding: var(--space-8);
    border: 2px solid var(--color-gold);
    background-color: white;
    border-radius: 8px;
    text-align: center;
  }

  .pricing-card h3 {
    color: var(--color-navy);
    margin-bottom: var(--space-4);
  }

  .pricing-card__price {
    font-size: 1.5rem;
    color: var(--color-gold);
    font-weight: 600;
    margin: var(--space-4) 0 var(--space-2);
  }

  .pricing-card__features {
    list-style: none;
    text-align: left;
    padding: var(--space-6) 0;
    margin: var(--space-6) 0;
    border-top: 1px solid var(--color-gold);
    border-bottom: 1px solid var(--color-gold);
  }

  .pricing-card__features li {
    padding: var(--space-2) 0;
    font-size: 0.95rem;
    color: var(--color-gray-medium);
    padding-left: var(--space-6);
    position: relative;
  }

  .pricing-card__features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--color-gold);
    font-weight: bold;
  }
</style>
```

#### Step 6: JSON-LD Schema

Always include schema for SEO:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Vero's Boutique",
  "description": "Your service description",
  "areaServed": ["Madison County", "Lexington", "Berea"],
})} />
```

### Validation Checklist Before Publishing

- ✅ All sections use `.container` wrapper
- ✅ All sections have alternating `background-color` (white/ivory)
- ✅ All images have `width`, `height`, `alt`, `loading="lazy"`, `decoding="async"`
- ✅ All aspect-ratio containers set with `aspect-ratio` CSS property
- ✅ Gallery uses explicit breakpoint media queries (not auto-fit)
- ✅ Gallery items have hover `transform: translateY(-4px)`
- ✅ All text has sufficient contrast (WCAG AA minimum)
- ✅ CTA buttons use `.button--primary` class
- ✅ No global CSS modifications (only scoped `<style>`)
- ✅ Build runs: `npm run build` produces 0 errors
- ✅ Mobile responsive: test 375px, 768px, 1024px viewports
- ✅ Lighthouse score ≥ 90 (Performance + Accessibility + Best Practices)

---

## Reference: CSS Variables (Global Design System)

### Colors
```css
--color-ivory: #FDFCFB;
--color-gold: #C5A059;
--color-black: #1A1A1A;
--color-charcoal: #2B2B2B;
--color-navy: #1B3A52;
--color-gray-medium: #666666;
```

### Spacing Scale (multiples of 0.25rem)
```css
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

### Typography
```css
--font-serif: 'Playfair Display', serif;
--font-sans: 'Inter', sans-serif;
--text-body: 1.0625rem;
--text-secondary: 0.9375rem;
--font-size-sm: 0.875rem;
```

### Transitions
```css
--transition-fast: 300ms ease-out;
--transition-normal: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 700ms ease-out;
```

---

## Questions & Support

**Pattern not documented?**  
Review the production pages:
- `/wedding-prom-florist-richmond-ky/` (florist events, prom section, pricing)
- `/event-planning-quinceaneras-weddings-richmond-ky/` (quinceañera, wedding coordination)
- `/formal-gowns-richmond-ky/` (dress galleries)

**Need to add new pattern?**  
1. Implement on a production page
2. Validate: run `npm run build`, test mobile
3. Document here with CSS + markup snippet
4. Update this file and commit with message: `docs: add [pattern-name] to ui-patterns.md`

---

**Document Version:** 1.0  
**Last Verified:** February 2026  
**Status:** Production Ready ✅
