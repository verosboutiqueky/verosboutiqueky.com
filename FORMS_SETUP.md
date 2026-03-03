# Forms System Architecture - Quick Reference

## Overview
3-tier form system: Astro Components → Cloudflare Pages Function → Resend Email. Includes Cloudflare Turnstile CAPTCHA with lazy-loading.

## File Structure
```
functions/api/lead.ts              ← Backend (POST /api/lead)
src/components/forms/
  ├── BookFittingForm.astro        ← Dress fitting (formType: "fitting")
  ├── EarlyOfferBannerForm.astro   ← Early offer (formType: "early_offer", 2-step progressive)
  └── EventFloralConsultForm.astro ← Events (formType: "events")
src/layouts/BaseLayout.astro       ← Global Turnstile lazy-loader
```

## Form Fields & Features
**BookFittingForm**: fullName, email, phone, preferredDate[1-3], preferredTime[1-3], eventType, message, addOnServices[], addOnEventDate → Auto-reply: appointment confirmation
**EarlyOfferForm**: email, firstName, lastName, phone → Auto-reply: promo codes (VERO5=$5, VERO10=$10)
**EventForm**: name, email, phone, eventLocation, eventDate, preferredConsultDate[1-3], preferredConsultTime[1-3], services[], message → Auto-reply: consultation confirmation

## Turnstile Integration

**Frontend (each form)**:
```astro
const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAACWIZrFF9GFEC74s";
<div data-turnstile-placeholder data-sitekey={siteKey}></div>
```

**Global Lazy-Loader (BaseLayout.astro)** - Inline in `<head>`:
```javascript
<script is:inline>
  (function () {
    let loaded = false;
    function loadTurnstile() {
      if (loaded) return;
      loaded = true;
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.onload = () => {
        document.querySelectorAll("[data-turnstile-placeholder]").forEach((el) => {
          if (!el.dataset.rendered) {
            el.dataset.rendered = "1";
            window.turnstile?.render(el, { sitekey: el.dataset.sitekey });
          }
        });
      };
      document.head.appendChild(s);
    }
    ["focusin", "pointerdown", "keydown"].forEach((evt) => 
      window.addEventListener(evt, loadTurnstile, { once: true, passive: true })
    );
    window.loadTurnstile = loadTurnstile;
  })();
</script>
```

**Backend Verification (lead.ts)**:
```typescript
const turnstileToken = String(form.get("cf-turnstile-response") || "").trim();
// High-rating reviews (4-5 stars) skip Turnstile
const isHighRating = formType === "reviews" && parseInt(rating) >= 4;
if (!isHighRating && !turnstileToken) return respond(400, {ok: false, error: "missing_turnstile"}, "...");

if (turnstileToken) {
  const verify = await verifyTurnstileSafe({ token: turnstileToken, secretKey: env.TURNSTILE_SECRET_KEY, ip });
  if (!verify.ok) return respond(400, {ok: false, error: "turnstile_failed"}, "...");
}
```

## Environment Variables
```
TURNSTILE_SECRET_KEY              (Cloudflare Turnstile secret)
RESEND_API_KEY                    (Resend email API key)
RESEND_FROM_EMAIL                 (sender@example.com)
RESEND_FROM_NAME                  (Sender name - optional)
TO_EARLY_OFFER, TO_BOOK_FITTING, TO_EVENT_FLORAL, TO_REVIEWS, TO_DEFAULT (Email recipients)
PUBLIC_TURNSTILE_SITE_KEY         (Frontend - Cloudflare site key)
```

## Submission Flow
1. Form POSTs to `/api/lead` with form-encoded data + `cf-turnstile-response`
2. Validate fields → Verify Turnstile token → Extract IP
3. Route by formType → Send lead email to business
4. Send auto-reply to customer (early_offer: codes, fitting: confirmation, events: consultation)
5. Redirect to `/?submitted=success` or return JSON if `Accept: application/json`

## Email Routing
```typescript
function resolveToEmail(formType: string, env): string | null {
  const t = formType.toLowerCase();
  if (t === "early_offer") return env.TO_EARLY_OFFER || env.TO_DEFAULT;
  if (t === "fitting") return env.TO_BOOK_FITTING || env.TO_DEFAULT;
  if (t === "events") return env.TO_EVENT_FLORAL || env.TO_DEFAULT;
  if (t === "reviews") return env.TO_REVIEWS || env.TO_DEFAULT;
  return env.TO_DEFAULT;
}
```

## Key Features
✅ No JS required (progressive enhancement) | ✅ Turnstile lazy-loads on interaction | ✅ Dual response (HTML/JSON) | ✅ IP tracking | ✅ Mobile responsive | ✅ Auto-replies optional | ✅ CAN-SPAM compliant headers | ✅ Form-by-form routing

## Error Handling
- `missing_email` (400) - No email provided
- `missing_turnstile` (400) - No captcha token
- `turnstile_failed` (400) - Captcha verification failed
- `resend_failed` (502) - Email service error
- `server_error` (500) - Unexpected error

## Setup Checklist
- [ ] Create `/functions/api/lead.ts` with handler + helpers (verifyTurnstileSafe, sendWithResendSafe, resolveToEmail)
- [ ] Set Cloudflare env vars (Turnstile secret, Resend API key, email recipients)
- [ ] Add lazy-loader script to BaseLayout
- [ ] Create 3 form components with `data-turnstile-placeholder` + IntersectionObserver + interaction fallback
- [ ] Get PUBLIC_TURNSTILE_SITE_KEY from Cloudflare
- [ ] Test lead email delivery
- [ ] Test auto-reply emails
- [ ] Verify Turnstile domain matches Cloudflare zone
- [ ] Add success indicator (parse ?submitted=success)

---
*Reference: Full implementation at [verosboutiqueky.com](https://github.com)*
