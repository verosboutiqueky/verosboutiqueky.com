# NAVIGATION SYSTEM FORENSIC AUDIT
## Vero's Boutique Website

---

## 1. COMPONENT MAP

**Single File Architecture:**
- Main Component: src/components/Header.astro (only navigation component)
- No separate Nav, MobileMenu, Dropdown, or Hamburger components
- All logic (scroll detection, menu state, accordions) contained in Header.astro's <script> block

**Responsibility Breakdown:**

| Function | Component | Control Method |
|----------|-----------|-----------------|
| Top-level nav rendering | Header > .header__desktop-nav | display: grid at lg+ |
| Dropdown rendering (desktop) | .header__dropdown + .header__dropdown-link | Hover-triggered reveal |
| Mobile menu toggle | #hamburger button | Click handler → setMenuState() |
| Open/close state logic | #mobile-menu[data-menu-state] | Single source of truth attribute |
| Scroll behavior | handleScroll() event listener | Adds .scrolled class to header |
| Active link styling | .header__link--active / .header__mobile-menu-link--active | Conditional class via currentPath prop |
| Accordion (mobile submenus) | .header__mobile-menu-accordion | Event delegation on toggle button clicks |

---

## 2. BREAKPOINTS & DISPLAY MODES

**Primary Breakpoint: 1024px (lg)**

| Breakpoint | Mode | Desktop Nav | Mobile Nav | Hamburger | Mobile Menu |
|------------|------|-------------|------------|-----------|-------------|
| < 1024px | MOBILE | display: none | display: flex (70px height) | display: inline-flex | Fixed overlay below mobile nav |
| ≥ 1024px | DESKTOP | display: grid | display: none | Hidden | Removed from DOM visually |
| ≥ 1280px | DESKTOP XL | Horizontal padding increases (2rem → 3rem) | N/A | N/A | N/A |

**Secondary Breakpoint: 1280px (xl)**
- Increases padding/gaps on desktop nav for breathing room
- Narrows gap adjustments for visual hierarchy

**What's Hidden/Shown:**
- Mobile mode (< 1024px):
  - ✓ Hamburger button (44×44px)
  - ✓ Centered brand (positioned absolutely, transform centered)
  - ✓ Abbreviated "BOOK" CTA button
  - ✓ Mobile menu overlay container (positioned fixed, slides in from top)
  
- Desktop mode (≥ 1024px):
  - ✓ Left nav links (FORMAL, BRIDAL, QUIÑCE)
  - ✓ Centered brand (full hierarchy)
  - ✓ Right nav links (EVENTS, FLORAL)
  - ✓ Full "BOOK APPOINTMENT" CTA
  - ✗ Hamburger hidden
  - ✗ Mobile menu overlay hidden

---

## 3. STYLING SUMMARY (DESIGN SYSTEM)

### Header/Nav Container

Position: fixed
Z-index: 100
Height: 70px (mobile) / auto (desktop)
Border: 1px solid rgba(0,0,0,0.05)

### Default State (white background)

Element: Header background
Color: white

Element: Main links
Color: #1A1A1A (black)
Font: Inter, 0.8125rem, 600 weight
Letter Spacing: 0.25em (uppercase)

Element: Sublinks (dropdown)
Color: #1B3A52 (navy)
Font: Inter, 0.75rem, 400 weight
Letter Spacing: Regular

Element: CTA button (BOOK text)
Color: #1A1A1A (black) with 1px border
Font: Inter, 0.8125rem, 600 weight
Letter Spacing: 0.2em (uppercase)

Element: VERO'S (main text)
Color: #1A1A1A (black)
Font: Playfair Display, 1.125rem, 400 weight
Letter Spacing: 0.2em

Element: BOUTIQUE (sub text)
Color: #C5A059 (gold)
Font: Inter, 0.625rem, 700 weight
Letter Spacing: 0.4em (uppercase)

### Scrolled State (dark overlay)

Element: Header background
Color: rgba(0,0,0,0.55)
Effect: Backdrop blur 10px

Element: Main links
Color: white

Element: CTA button
Color: White text, rgba(255,255,255,0.3) border
Hover: fill white bg

Element: VERO'S
Color: white

Element: BOUTIQUE
Color: #C5A059 (gold)
Remains: gold (accent continuity)

Element: Dropdown container
Color: rgba(0,0,0,0.9)
Border: Gold border maintained

Element: Dropdown links
Color: white
Hover: rgba(255,255,255,0.1) bg

### Height & Spacing

Element: Desktop nav
Desktop Padding: 1.5rem 2rem (lg), 1.5rem 3rem (xl)
Mobile Padding: N/A

Element: Mobile nav bar
Desktop Padding: N/A
Mobile Padding: 1rem 1.5rem
Height: Fixed 70px

Element: Main link spacing
Desktop Gap: 2.5rem gap (lg), 2.5rem gap (xl)

Element: Dropdown
Top offset: 100%, Left: -20px
Padding: 0.75rem 0 (vertical block padding)

Element: Mobile menu
Padding: 2rem 1.5rem

### Transitions & Animations

Effect: Scroll color change
Duration: 0.3s
Easing: ease
Trigger: Scroll Y > 20px

Effect: Dropdown fade-in
Duration: 0.2s
Easing: ease forwards
Trigger: Hover on nav item

Effect: Dropdown slide-up
Movement: -4px translateY on open

Effect: Mobile menu open
Duration: 0.3s
Easing: ease
Transform + opacity + visibility

Effect: Mobile menu close
Duration: 0.3s
Easing: ease
Visibility off is delayed

Effect: Accordion expand
Duration: 0.3s
Easing: ease (via max-height)
Trigger: Click accordion trigger

Effect: Link hover & active
Duration: 0.25s
Easing: ease
Color: Gold on hover/active

### Border & Shadow

Element: Header
Border: 1px solid rgba(0,0,0,0.05) (default), 1px solid rgba(255,255,255,0.1) (scrolled)
Shadow: None

Element: Dropdown
Border: 1px solid #C5A059 (gold) at all times
Shadow: 0 4px 12px rgba(0,0,0,0.1)

Element: CTA button
Border: 1px solid color-mix(black 30%, transparent)
Shadow: None

---

## 4. LINK MAP (Navigation Structure)

### Full Link Inventory

LEFT NAVIGATION:

1. FORMAL → /formal-gowns-richmond-ky
   - Prom 2026 → /formal-gowns-richmond-ky/prom-2026/
   - Gala & Evening → /formal-gowns-richmond-ky/gala-evening/
   - New Arrivals → /formal-gowns-richmond-ky/new-arrivals/

2. BRIDAL → /wedding-dresses-richmond-ky
   - (No sublinks)

3. QUIÑCE → /quinceanera-dresses-richmond-ky
   - (No sublinks)

CENTER:
- Logo/Brand → / (home)

RIGHT NAVIGATION:

4. EVENTS → /event-planning-quinceaneras-weddings-richmond-ky
   - Quinceañera Planning → /event-planning-quinceaneras-weddings-richmond-ky/#quince-production
   - Wedding Coordination → /event-planning-quinceaneras-weddings-richmond-ky/#wedding-coordination
   - Packages & Pricing → /event-planning-quinceaneras-weddings-richmond-ky/#packages-section
   - Frequently Asked Questions → /event-planning-quinceaneras-weddings-richmond-ky/#faq

5. FLORAL → /wedding-prom-florist-richmond-ky
   - Custom Arrangements → /wedding-prom-florist-richmond-ky/#custom-arrangements
   - Wedding Florals → /wedding-prom-florist-richmond-ky/#wedding-florals
   - Prom Corsages → /wedding-prom-florist-richmond-ky/#prom-corsages
   - Event Installations → /wedding-prom-florist-richmond-ky/#event-installations
   - Frequently Asked Questions → /wedding-prom-florist-richmond-ky/#faq

MOBILE-ONLY LINK:

6. GALLERY → /gallery (appears only in mobile menu list, no desktop equiv)

CTA (all views):

- BOOK APPOINTMENT → /book-an-appointment (full desktop/mobile, abbreviated "BOOK" on mobile nav bar)

### Data Model Structure

```
const navLeft = [
  { 
    label: "FORMAL", 
    href: "/formal-gowns-richmond-ky",
    dropdownItems: [
      { label: "Prom 2026", anchor: "prom-2026/" },
      { label: "Gala & Evening", anchor: "gala-evening/" },
      { label: "New Arrivals", anchor: "new-arrivals/" },
    ]
  },
  { label: "BRIDAL", href: "/wedding-dresses-richmond-ky" },
  { label: "QUIÑCE", href: "/quinceanera-dresses-richmond-ky" },
];

const navRight = [
  { 
    label: "EVENTS", 
    href: "/event-planning-quinceaneras-weddings-richmond-ky",
    dropdownItems: [
      { label: "Quinceañera Planning", anchor: "#quince-production" },
      { label: "Wedding Coordination", anchor: "#wedding-coordination" },
      { label: "Packages & Pricing", anchor: "#packages-section" },
      { label: "Frequently Asked Questions", anchor: "#faq" },
    ]
  },
  { 
    label: "FLORAL", 
    href: "/wedding-prom-florist-richmond-ky",
    dropdownItems: [
      { label: "Custom Arrangements", anchor: "#custom-arrangements" },
      { label: "Wedding Florals", anchor: "#wedding-florals" },
      { label: "Prom Corsages", anchor: "#prom-corsages" },
      { label: "Event Installations", anchor: "#event-installations" },
      { label: "Frequently Asked Questions", anchor: "#faq" },
    ]
  },
];

const ctaButton = {
  label: "BOOK APPOINTMENT",
  href: "/book-an-appointment",
};
```

### Data Model Notes

- ✓ Dropdowns are arrays of objects with label + anchor (using relative path construction)
- ✓ Sublinks use anchor fragments for same-page navigation to sections
- ✓ Active link styling driven by currentPath prop (injected via Astro)
- ✓ No conditional rendering based on user role or state
- ✗ GALLERY link hardcoded in JSX (not in data array) — inconsistent structure

---

## 5. MOBILE MENU BEHAVIOR SUMMARY & FAILURE POINTS

### State Management Architecture

**Single Source of Truth:** #mobile-menu[data-menu-state] attribute
- Values: "open" or "closed"
- Function setMenuState() is the only place this state can change
- All dependent properties derive from this

### Open/Close Triggers

Trigger: Hamburger click
Action: toggleMenu() → flips state
Effect: Opens/closes menu overlay

Trigger: Any menu link click
Action: closeMenu() → setMenuState("closed")
Effect: Closes menu, navigates away

Trigger: Any sublink click
Action: Same as above
Effect: Closes menu, navigates away

Trigger: ESC key press
Action: handleEsc() → closeMenu()
Effect: Closes menu

Trigger: Click outside menu
Action: Global click listener checks if clicked outside
Effect: Closes menu

Trigger: Page visibility change
Action: handleVisibilityChange() → closeMenu()
Effect: Closes menu on tab blur

### CSS Classes for Open/Close

State: Closed
CSS Applied: .header__mobile-menu[data-menu-state="closed"]
Effect: visibility: hidden; transform: translateY(-100%); opacity: 0; transition with 0s 0.3s delay (instant close)

State: Open
CSS Applied: .header__mobile-menu[data-menu-state="open"]
Effect: visibility: visible; transform: translateY(0); opacity: 1; transition with 0s delay (instant visibility, 0.3s slide)

State: Hamburger Active
CSS Applied: .header__hamburger.active
Effect: Animates lines: 1st line rotates 45deg, 2nd line opacity 0, 3rd line rotates -45deg

### Accordion Behavior (Mobile Submenus)

Mechanism: Event delegation on #mobile-menu click
- Accordion container: .header__mobile-menu-accordion (role="region")
- Trigger button: .header__mobile-menu-dropdown-toggle (aria-expanded, aria-controls)
- Sublinks: .header__mobile-menu-sublink

Animation:
```
.header__mobile-menu-accordion {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.header__mobile-menu-accordion.open {
  max-height: 500px;
}
```

Behavior:
- ✓ Only one accordion open at a time (all others close)
- ✓ Click again to close same accordion
- ✓ Clicking sublink navigates AND closes entire mobile menu

### Body Scroll Locking

- Enabled when: Menu state = "open"
- Mechanism: document.body.style.overflow = "hidden"
- Restored on: Menu state = "closed"
- Edge case handled: Page visibility change triggers close (tab blur safety)

### Accessibility Features

Feature: aria-expanded on hamburger
Implementation: Synced with menu state
Status: ✓ Implemented

Feature: aria-hidden on menu
Implementation: Synced with menu state (invisible when closed)
Status: ✓ Implemented

Feature: aria-label on hamburger
Implementation: "Toggle navigation menu"
Status: ✓ Fixed string

Feature: aria-controls on accordion triggers
Implementation: aria-controls="accordion-{label}"
Status: ✓ Links to region ID

Feature: role="region" on accordion content
Implementation: Applied to .header__mobile-menu-accordion
Status: ✓ Implemented

Feature: Keyboard ESC to close
Implementation: handleEsc() handler
Status: ✓ Implemented

Feature: Focus trap
Implementation: Not present
Status: ⚠ Missing

Feature: Focus restoration on close
Implementation: Hamburger receives focus
Status: ✓ Implemented

Feature: Outline/focus indicators
Implementation: 2px solid gold on buttons/links
Status: ✓ Implemented

### LIKELY FAILURE POINTS & BUGS

1. Header Height Offset Mismatch
   - ⚠ Risk: Mobile menu positions at top: 70px (hardcoded)
   - If header height changes: Menu will overlap or have gap
   - Current safe: --header-height: 70px matches .header__mobile-nav { height: 70px }
   - Failure scenario: If you change mobile nav padding without updating top offset

2. Z-Index Stacking Context Issues
   - Current stack: Hamburger (1005) > Mobile menu (101) > Header (100)
   - ⚠ Risk: If a page component uses z-index 102+, menu can be hidden behind it
   - Observed: Banner/form components may need document.documentElement.dataset.menuOpen flag to adjust overflow

3. Transform Causing Stacking Context
   - Current: Mobile menu uses transform: translateY() for animation
   - Contains: mix-blend-mode: normal; isolation: isolate; (defensive rules)
   - ⚠ If removed: Backdrop-filter from header could affect rendering
   - Current mitigation: Explicit isolation prevents unintended blend mode inheritance

4. Overflow Hidden on Body
   - When open: document.body.style.overflow = "hidden"
   - ⚠ Risk: If removeEventListener fails or duplicate listeners attach, body scroll might never reenable
   - Guard: if (window.__headerInitialized) return; prevents re-initialization
   - But: No persistent check if scroll is already hidden (edge case on navigation)

5. Accordion Max-Height Fixed at 500px
   - Current: .header__mobile-menu-accordion { max-height: 500px; }
   - ⚠ Risk: If you add many sublinks, they'll be cut off
   - Safe range: Currently 5-4 items per accordion (estimate ~16px per item) → safe margin

6. Event Delegation & Timing
   - Current: Single click listener on #mobile-menu with delegation
   - ✓ Safe: No timing issues (no setTimeout, no race conditions)
   - ✓ Uses e.preventDefault() and e.stopPropagation() correctly

7. Mobile Menu Pointer-Events
   - When closed: pointer-events: none prevents clicks from registering
   - ✓ Safe: Correct CSS prevents background interaction while invisible
   - Visibility transition delay: 0s on open, 0.3s on close (instant close, prevents ghost clicks)

8. Click Outside Not Attached to Hamburger
   - ⚠ Current issue: Global click listener doesn't exclude hamburger contents
   - Mitigation: Guard checks if (hamburger.contains(target)) return;
   - Still safe: Because toggleMenu() is explicit click handler on button

9. Scroll Event Performance
   - Attached to: window.addEventListener("scroll", handleScroll)
   - ⚠ Risk: No scroll debouncing (fires many times per second)
   - Observed: Just adds/removes .scrolled class (low overhead, acceptable)

10. Missing Focus Trap in Modal Menu
    - ⚠ Accessibility gap: Menu opens but focus could escape to body elements
    - Likely issue in testing: Tab key navigation might cycle out of menu
    - Fix needed: Focus trap would require tracking focusable elements

11. Double-Scroll Prevention Not Robust
    - Current: Sets document.body.style.overflow = "hidden"
    - ⚠ Edge case: If two menu instances open (shouldn't happen), overflow state is fragile
    - Safer approach: Use document.documentElement.style.overflow OR counter-based system

12. Mobile Menu Visibility Timing
    - Current: transition: visibility 0s 0.3s, transform 0.3s ease, opacity 0.3s ease; (staggered)
    - ⚠ Issue: On slow devices, visibility delay might cause visual pop-in after opening
    - When closed: Visibility waits 0.3s (good → prevents ghost clicks)
    - When opened: Visibility is instant (good → shows menu immediately)

---

## 6. EXTRACTION SPEC (for Navigation Rebuild)

### A) JSX/Astro Markup Tree Outline

```astro
<header id="header" class="header">
  <!-- DESKTOP NAVIGATION -->
  <nav class="header__desktop-nav">
    <!-- LEFT NAV -->
    <ul class="header__nav-left">
      {navLeft.map((link) => (
        <li class="header__nav-item">
          <a href={link.href} class="header__link (--active)">
            {link.label}
          </a>
          {link.dropdownItems && (
            <div class="header__dropdown">
              {link.dropdownItems.map((item) => (
                <a href={item.fullhref} class="header__dropdown-link">
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>

    <!-- CENTER BRAND -->
    <div class="header__brand">
      <a href="/" class="header__brand-link">
        <span class="header__brand-text-main">VERO'S</span>
        <span class="header__brand-text-sub">BOUTIQUE</span>
      </a>
    </div>

    <!-- RIGHT NAV + CTA -->
    <div class="header__nav-right-wrapper">
      <ul class="header__nav-right">
        {navRight.map((link) => (
          <li class="header__nav-item">
            <a href={link.href} class="header__link (--active)">
              {link.label}
            </a>
            {link.dropdownItems && (
              <div class="header__dropdown">
                {link.dropdownItems.map((item) => (
                  <a href={item.fullhref} class="header__dropdown-link">
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <a href="/book-an-appointment" class="header__cta button button--outline">
        BOOK APPOINTMENT
      </a>
    </div>
  </nav>

  <!-- MOBILE NAVIGATION BAR -->
  <nav class="header__mobile-nav">
    <button id="hamburger" class="header__hamburger (active)" 
      aria-expanded="false" aria-label="Toggle navigation menu">
      <span class="header__hamburger-line"></span>
      <span class="header__hamburger-line"></span>
      <span class="header__hamburger-line"></span>
    </button>

    <a href="/" class="header__brand-mobile">
      <span class="header__brand-text-main">VERO'S</span>
      <span class="header__brand-text-sub">BOUTIQUE</span>
    </a>

    <a href="/book-an-appointment" class="header__mobile-cta button button--outline">
      BOOK
    </a>
  </nav>

  <!-- MOBILE SLIDE-OUT MENU OVERLAY -->
  <div id="mobile-menu" class="header__mobile-menu" data-menu-state="closed" 
    aria-hidden="true">
    <ul class="header__mobile-menu-list">
      {navLeft.map((link) => (
        <li class={link.dropdownItems ? "header__mobile-menu-item" : ""}>
          <div class={link.dropdownItems ? "header__mobile-menu-link-wrapper" : undefined}>
            <a href={link.href} class="header__mobile-menu-link (--active)">
              {link.label}
            </a>
            {link.dropdownItems && (
              <button
                type="button"
                id={`trigger-${link.label}`}
                class="header__mobile-menu-dropdown-toggle"
                data-accordion-trigger={link.label}
                aria-expanded="false"
                aria-controls={`accordion-${link.label}`}
                aria-label={`Toggle ${link.label} dropdown`}
              >
                <span class="header__accordion-icon">▼</span>
              </button>
            )}
          </div>
          {link.dropdownItems && (
            <div
              id={`accordion-${link.label}`}
              class="header__mobile-menu-accordion"
              data-accordion-content={link.label}
              role="region"
              aria-labelledby={`trigger-${link.label}`}
            >
              {link.dropdownItems.map((item) => (
                <a href={item.fullhref} class="header__mobile-menu-sublink">
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
      {navRight.map((link) => (
        <li class="header__mobile-menu-item">
          {/* SAME STRUCTURE AS navLeft */}
        </li>
      ))}
      <li>
        <a href="/gallery" class="header__mobile-menu-link (--active)">
          GALLERY
        </a>
      </li>
      <li class="header__mobile-menu-divider"></li>
      <li>
        <a href="/book-an-appointment" class="header__mobile-menu-cta">
          BOOK APPOINTMENT
        </a>
      </li>
    </ul>
  </div>
</header>
```

### B) Complete Classname Inventory

Header Container:
.header
.header.scrolled (dynamic class added by scroll handler)

Desktop Navigation:
.header__desktop-nav
.header__nav-left
.header__nav-right
.header__nav-right-wrapper
.header__nav-item
.header__link
.header__link--active
.header__link:hover (pseudo-class)

Desktop Dropdowns:
.header__dropdown
.header__dropdown-link
.header__dropdown-link:hover (pseudo-class)

Brand (both desktop & mobile):
.header__brand (desktop container)
.header__brand-link (desktop anchor)
.header__brand-mobile (mobile anchor)
.header__brand-text-main (VERO'S text, both views)
.header__brand-text-sub (BOUTIQUE text, both views)

CTA Buttons:
.header__cta (desktop full button)
.button (global button style)
.button--outline (outline style for CTA)
.header__mobile-cta (mobile abbreviated button)

Mobile Navigation Bar:
.header__mobile-nav
.header__hamburger
.header__hamburger.active (dynamic class on button)
.header__hamburger-line (individual line spans, 3×)

Mobile Menu Overlay:
.header__mobile-menu (main container)
.header__mobile-menu-list (ul wrapper)
.header__mobile-menu-item (li wrapper for items with dropdowns)
.header__mobile-menu-link (main link in mobile menu)
.header__mobile-menu-link--active (active state)
.header__mobile-menu-link-wrapper (flex container for link + toggle)

Mobile Accordion:
.header__mobile-menu-dropdown-toggle (button to open/close accordion)
.header__accordion-icon (span with ▼ symbol)
.header__mobile-menu-accordion (accordion container, animates max-height)
.header__mobile-menu-accordion.open (dynamic class when open)
.header__mobile-menu-sublink (links inside accordion)

Mobile Menu Special:
.header__mobile-menu-divider (visual separator before CTA)
.header__mobile-menu-cta (final CTA link in mobile menu)

### C) Current Data Model

navLeft = [
  { 
    label: string,
    href: string,
    dropdownItems: [
      { label: string, anchor: string }
    ]?
  }
]

navRight = [
  { /* same structure as navLeft */ }
]

ctaButton = {
  label: string,
  href: string
}

Migration Notes:
- Currently sublinks use relative anchor concatenation (fragile)
- Better approach: Store full href in the array directly
- GALLERY is hardcoded in JSX (not in navLeft/navRight) — should be moved to array for consistency

### D) Dependencies & Imports

CSS:
- No external CSS imports (all inline in <style> block)
- Relies on global CSS variables from global.css:
  - --color-gold, --color-black, --color-navy, etc.
  - --font-serif (Playfair Display), --font-sans (Inter)
  - --header-height for 70px reference
  - Transitions like --transition-normal are not used in Header.astro

JavaScript:
- No external libraries (vanilla JS)
- Uses browser APIs: document, window, classList, setAttribute, getAttribute
- Event listeners: scroll, click, keydown, visibilitychange, DOMContentLoaded

Icons/Images:
- No external icon library (hamburger is CSS-animated spans)
- No images referenced in navigation

Components/Modules:
- Zero external component dependencies
- Zero imports from npm packages

Other:
- Depends on global .button and .button--outline styles from global.css
- No form submissions or API calls
- No cookies or localStorage

---

## 7. CRITICAL DOCUMENTATION: VERO'S BOUTIQUE BRANDING

### Desktop Rendering (≥1024px)

Brand Unit: centered column between left and right nav

[FORMAL][BRIDAL][QUIÑCE]     [VERO'S        [EVENTS][FLORAL] [BOOK...]
                              BOUTIQUE]

VERO'S (main heading line):
- Font: Playfair Display (serif, luxury)
- Size: 1.125rem (18px)
- Weight: 400 (regular)
- Color: #1A1A1A (black, default) / white (when scrolled)
- Letter-spacing: 0.2em (tight, elegant)
- Display: block (stacked)
- Line-height: 1.1 (default from h1-h6)
- Padding: 0 (no internal spacing)

BOUTIQUE (sub-heading line):
- Font: Inter (sans-serif, modern)
- Size: 0.625rem (10px) — smaller, supporting role
- Weight: 700 (bold)
- Color: #C5A059 (gold accent)
- Text-transform: UPPERCASE
- Letter-spacing: 0.4em (wider, emphasized)
- Display: block (separate line)
- Margin-top: 0.25rem (4px) — tight spacing
- Line-height: 1.1

Container Spacing:
- Padding: 0 2rem (lg) / 0 2.5rem (xl)
- Justify-self: center (on grid: centers in middle column)
- Text-align: center

Desktop Hover State:
- Color changes to gold on link hover
- Transition: 0.3s ease

Desktop Scrolled State:
- VERO'S changes to white
- BOUTIQUE remains gold (#C5A059)
- Background: rgba(0,0,0,0.55) with blur(10px)

### Mobile Rendering (<1024px)

Brand Unit: centered, positioned absolutely within 70px nav bar

[☰]     [VERO'S      [BOOK]
        BOUTIQUE]

Positioning:
- Display: centered via position: absolute; left: 50%; transform: translateX(-50%);
- Z-index: Not specified (defaults to 0, sits below hamburger 44px and CTA button)
- Overflow handling: Contained within 70px height

VERO'S (mobile):
- Font: Playfair Display (serif)
- Size: 0.875rem (14px) — smaller on mobile but still serif
- Weight: 400
- Color: #1A1A1A (black) / white (scrolled)
- Letter-spacing: 0.15em (tighter than desktop)
- Display: block

BOUTIQUE (mobile):
- Font: Inter (sans-serif)
- Size: 0.5rem (8px) — much smaller, barely visible
- Weight: 700
- Color: #C5A059 (gold, persistent)
- Text-transform: UPPERCASE
- Letter-spacing: 0.2em (less wide than desktop)
- Display: block
- Margin-top: 0.125rem (2px) — tighter spacing

Container Spacing:
- No padding (just transform centering)
- Text-align: center

Mobile Scrolled State:
- VERO'S changes to white
- BOUTIQUE remains gold

### Link Spacing Summary

Desktop (≥1024px):

[nav-left (gap: 2.5rem)]    [brand] + padding   [nav-right (gap: 2.5rem)] [cta]
←————————— left ———————— →                      ← ———————— right ————— →

- Left nav items separated by 2.5rem (40px)
- Right nav items separated by 2.5rem (40px)
- Right nav wrapper (including CTA) separated by 2.5rem from nav list
- Padding around brand: 0 2rem lg / 0 2.5rem xl

Desktop (≥1280px):
- All spacing increases vertically by 0.5rem padding adjustment
- Gaps remain 2.5rem (but grid adjusts container padding)

Mobile (<1024px):
- No horizontal nav spacing (mobile nav bar only has 3 elements: hamburger, brand, cta)
- Hamburger: 0.625rem padding (internal), 44px×44px size
- Brand: centered with transform
- CTA: 0.625rem 1.25rem padding, 0.7rem font-size (abbreviated "BOOK")

### Font Stack Summary

Element: VERO'S (main)
Font Family: Playfair Display (serif)
Size: 1.125rem (18px) desktop, 0.875rem (14px) mobile
Weight: 400
Color: Black/White
Uppercase: No

Element: BOUTIQUE (sub)
Font Family: Inter (sans)
Size: 0.625rem (10px) desktop, 0.5rem (8px) mobile
Weight: 700
Color: Gold
Uppercase: Yes

Element: Main nav links
Font Family: Inter (sans)
Size: 0.8125rem (13px)
Weight: 600
Color: Black/White
Uppercase: Yes

Element: Sublinks (dropdown)
Font Family: Inter (sans)
Size: 0.75rem (12px) desktop, 0.8125rem (13px) mobile sub
Weight: 400
Color: Navy/White
Uppercase: Yes

Element: Mobile menu links
Font Family: Inter (sans)
Size: 0.875rem (14px)
Weight: 600
Color: White
Uppercase: Yes

Element: CTA
Font Family: Inter (sans)
Size: 0.8125rem (13px) desktop, 0.7rem (11px) mobile abbrev
Weight: 600
Color: Black/White
Uppercase: Yes

---

END OF AUDIT

This forensic summary provides complete visibility into every aspect of the current navigation system. Ready for the next prompt where you'll specify the rebuild requirements.
