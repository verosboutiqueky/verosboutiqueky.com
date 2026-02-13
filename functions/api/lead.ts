// /functions/api/lead.ts
// Cloudflare Pages Function: POST /api/lead
// Handles: Turnstile verify + route by formType + send email via Resend
// Returns: HTML by default (safe for <form> POST), JSON when requested via Accept header

export const onRequestPost = async (context: any) => {

  const json = (status: number, body: any) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

  const html = (status: number, message: string) =>
    new Response(
      `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="font-family:system-ui; padding:24px;">
        <h2>${escapeHtml(message)}</h2>
        <p><a href="/" style="color:#111;">Return to site</a></p>
      </body></html>`,
      {
        status,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );

  const wantsJson = (() => {
    const accept = context?.request?.headers?.get?.("Accept") || "";
    return accept.includes("application/json");
  })();

  const respond = (status: number, payload: any, fallbackMsg: string) =>
    wantsJson ? json(status, payload) : html(status, fallbackMsg);

  try {
    const req = context.request as Request;
    const env = context.env as Record<string, string | undefined>;

    // ---- Env validation (matches YOUR current env vars) ----
    const required = ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "RESEND_FROM_EMAIL"] as const;
    const missing = required.filter((k) => !env[k]);

    if (missing.length > 0) {
      return respond(
        500,
        { ok: false, error: "missing_env", missing },
        "Server misconfigured (missing environment variables)."
      );
    }

    // ---- Parse form data (x-www-form-urlencoded) ----
    let form: FormData;
    try {
      form = await req.formData();
    } catch (e: any) {
      return respond(400, { ok: false, error: "invalid_form_data" }, "Invalid form submission.");
    }

    // ---- Extract fields ----
    const formType = String(form.get("formType") || "").trim().toLowerCase();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const fullName = String(form.get("fullName") || "").trim();
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();
    const turnstileToken = String(form.get("cf-turnstile-response") || "").trim();
    const rating = String(form.get("rating") || "").trim();
    const source = String(form.get("source") || "").trim();

    if (!formType) {
      return respond(400, { ok: false, error: "missing_formtype" }, "Missing form type.");
    }

    // High-rating reviews (4-5 stars): email and Turnstile are optional
    const isHighRating = formType === "reviews" && rating && parseInt(rating) >= 4;

    if (!isHighRating && !email) {
      return respond(400, { ok: false, error: "missing_email" }, "Please enter an email.");
    }
    if (!isHighRating && !turnstileToken) {
      // If your Turnstile domain is invalid, you will hit this.
      return respond(
        400,
        { ok: false, error: "missing_turnstile" },
        "Captcha missing. Please refresh and try again."
      );
    }

    // Extract IP once at start (needed for both Turnstile and email logging)
    const ip = req.headers.get("CF-Connecting-IP") || undefined;

    // Only verify Turnstile if token is provided (required for forms, optional for tracking)
    if (turnstileToken) {
      const verify = await verifyTurnstileSafe({
        token: turnstileToken,
        secretKey: env.TURNSTILE_SECRET_KEY as string,
        ip,
      });

      if (!verify.ok) {
        return respond(
          400,
          { ok: false, error: "turnstile_failed", details: verify.details },
          "Captcha failed. Please try again."
        );
      }
    }

    // ---- Route recipient ----
    const to = resolveToEmail(formType, env);
    if (!to) {
      return respond(
        400,
        { ok: false, error: "unknown_formtype", formType },
        "Unknown form type."
      );
    }

    // ---- Email content ----
    const subject = formType === "reviews" ? "Review message" : `[${formType}] New Lead from ${email}`;
    const text = buildTextBody({
      formType,
      email,
      firstName,
      lastName,
      phone,
      message,
      ip,
      userAgent: req.headers.get("User-Agent") || "",
      referer: req.headers.get("Referer") || "",
      rating: rating || undefined,
      source: source || undefined,
      name: name || undefined,
    });

    // ---- Send via Resend ----
    const send = await sendWithResendSafe({
      apiKey: env.RESEND_API_KEY as string,
      fromEmail: env.RESEND_FROM_EMAIL as string,
      fromName: env.RESEND_FROM_NAME,
      to,
      subject,
      text,
    });

    if (!send.ok) {
      return respond(
        502,
        { ok: false, error: "resend_failed", details: send.details },
        "Message failed to send. Please try again."
      );
    }

    // ---- Auto-reply for early_offer ----
    if (formType === "early_offer") {
      const replySubject = "Your Exclusive Early Offer - Vero's Boutique";
      const replyText = `Hi${firstName ? ` ${firstName}` : ""}!

Thanks for joining our Early Offer list — here's your reward for Grand Opening:

✅ Spend $50+ → get $5 back (Use code VERO5)
✅ Spend $100+ → get $10 back (Use code VERO10)

How to redeem:
1) Use code VERO5 or VERO10 at checkout
2) Offer applies to qualifying purchase totals (before tax)
3) One offer per customer during the promotion window

We can't wait to see you,
VERO'S BOUTIQUE LLC
100 Saint George St. Richmond, KY 40475
Navigation: https://maps.google.com/?q=100+Saint+George+St+Richmond+KY+40475

---

Fine Print: This offer is valid based on your consent to receive promotional emails from Vero's Boutique. Offer expires 04/05/2026. Cannot be combined with other offers. See terms of service for details.

If you don't want early offer emails, reply 'unsubscribe'.`;

      const autoReply = await sendWithResendSafe({
        apiKey: env.RESEND_API_KEY as string,
        fromEmail: env.RESEND_FROM_EMAIL as string,
        fromName: env.RESEND_FROM_NAME,
        to: email,
        subject: replySubject,
        text: replyText,
        isTransactional: true,
      });

      // Don't fail the whole form if auto-reply fails — lead still counts
      if (!autoReply.ok) {
        // Silent fail: internal email already sent
      }
    }

    // ---- Auto-reply for fitting (appointment request) ----
    if (formType === "fitting") {
      const replySubject = "Appointment Request Received — VERO'S BOUTIQUE LLC";
      const preferredDates = [];
      if (form.get("preferredDate1")) {
        const date = form.get("preferredDate1");
        const time = form.get("preferredTime1") || "(no time)";
        preferredDates.push(`${date} at ${time}`);
      }
      if (form.get("preferredDate2")) {
        const date = form.get("preferredDate2");
        const time = form.get("preferredTime2") || "(no time)";
        preferredDates.push(`${date} at ${time}`);
      }
      if (form.get("preferredDate3")) {
        const date = form.get("preferredDate3");
        const time = form.get("preferredTime3") || "(no time)";
        preferredDates.push(`${date} at ${time}`);
      }

      const replyText = `Hi ${fullName || "there"}!

We received your appointment request. Thank you for choosing Vero's Boutique for your dress fitting!

This is a request to schedule an appointment — we'll confirm your preferred time within 24 hours.

--- YOUR REQUEST ---

Full Name: ${fullName || "(not provided)"}
Email: ${email}
Phone: ${phone || "(not provided)"}

Dress Type: ${String(form.get("eventType") || "(not specified)")}

Preferred Dates & Times:
${preferredDates.length > 0 ? preferredDates.map((d, i) => `  Option ${i + 1}: ${d}`).join("\n") : "  (not provided)"}

Additional Notes:
${message || "(none)"}

--- NEXT STEPS ---

We'll reach out to confirm your appointment within 24 hours.

If you need to reschedule or have urgent questions, please reply to this email or call us directly.

We look forward to meeting you!

VERO'S BOUTIQUE LLC
100 Saint George St. Richmond, KY 40475
Navigation: https://maps.google.com/?q=100+Saint+George+St+Richmond+KY+40475`;

      const autoReply = await sendWithResendSafe({
        apiKey: env.RESEND_API_KEY as string,
        fromEmail: env.RESEND_FROM_EMAIL as string,
        fromName: env.RESEND_FROM_NAME,
        to: email,
        subject: replySubject,
        text: replyText,
        isTransactional: true,
      });

      if (!autoReply.ok) {
        // Silent fail: internal email already sent
      }
    }

    // ---- Auto-reply for events (consultation request) ----
    if (formType === "events") {
      const replySubject = "Consultation Request Received — VERO'S BOUTIQUE LLC";
      const replyText = `Hi ${name || "there"}!

We received your event planning and floral design consultation request. Thank you for thinking of Vero's Boutique!

This is a consultation inquiry — we'll reach out to discuss your vision and availability within 24 hours.

--- YOUR REQUEST ---

Full Name: ${name || "(not provided)"}
Email: ${email}
Phone: ${phone || "(not provided)"}

Consultation Details:
${message || "(none)"}

--- NEXT STEPS ---

Our events & florals team will contact you within 24 hours to discuss:
• Your event vision and style preferences
• Available dates and timeline
• Floral arrangements and décor options
• Pricing and packages

If you have urgent questions or need to reach us faster, please reply to this email or call us directly.

We're excited to help bring your vision to life!

VERO'S BOUTIQUE LLC
100 Saint George St. Richmond, KY 40475
Navigation: https://maps.google.com/?q=100+Saint+George+St+Richmond+KY+40475`;

      const autoReply = await sendWithResendSafe({
        apiKey: env.RESEND_API_KEY as string,
        fromEmail: env.RESEND_FROM_EMAIL as string,
        fromName: env.RESEND_FROM_NAME,
        to: email,
        subject: replySubject,
        text: replyText,
        isTransactional: true,
      });

      if (!autoReply.ok) {
        // Silent fail: internal email already sent
      }
    }

    // Success — redirect home with success indicator
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/?submitted=success",
      },
    });
  } catch (err: any) {
    // This should prevent Cloudflare from turning it into 502
    return new Response(
      JSON.stringify({ ok: false, error: "server_error", details: String(err?.message || err) }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
};

// ------------------------
// Types + helpers
// ------------------------

// ------------------------
// Helpers (runtime-safe)
// ------------------------

function resolveToEmail(formType: string, env: Record<string, string | undefined>): string | null {
  const t = (formType || "").toLowerCase();
  if (t === "early_offer") return env.TO_EARLY_OFFER || env.TO_DEFAULT || null;
  if (t === "fitting") return env.TO_BOOK_FITTING || env.TO_DEFAULT || null;
  if (t === "events") return env.TO_EVENT_FLORAL || env.TO_DEFAULT || null;
  if (t === "reviews") return env.TO_REVIEWS || env.TO_FEEDBACK || env.TO_DEFAULT || null;
  return env.TO_DEFAULT || null;
}

function buildTextBody(input: {
  formType: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  message: string;
  ip?: string;
  userAgent: string;
  referer: string;
  rating?: string;
  source?: string;
  name?: string;
}) {
  const lines = [
    `Form Type: ${input.formType}`,
    `Email: ${input.email}`,
    `Name: ${[input.firstName, input.lastName].filter(Boolean).join(" ") || "(not provided)"}`,
    `Phone: ${input.phone || "(not provided)"}`,
  ];

  // Add rating/source for review submissions
  if (input.formType === "reviews" && input.rating) {
    lines.push(`Rating: ${input.rating}/5`);
    if (input.source) {
      lines.push(`Review Source: ${input.source}`);
    }
  }

  lines.push(
    "",
    `Message:`,
    input.message || "(none)",
    "",
    `Meta:`,
    `IP: ${input.ip || "(unknown)"}`,
    `User-Agent: ${input.userAgent || "(unknown)"}`,
    `Referer: ${input.referer || "(unknown)"}`
  );

  return lines.join("\n");
}

async function verifyTurnstileSafe(args: {
  token: string;
  secretKey: string;
  ip?: string;
}): Promise<{ ok: boolean; details?: any }> {
  try {
    const body = new URLSearchParams();
    body.set("secret", args.secretKey);
    body.set("response", args.token);
    if (args.ip) body.set("remoteip", args.ip);

    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      return { ok: false, details: { status: resp.status, body: data } };
    }

    if (!data || data.success !== true) {
      return { ok: false, details: data };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, details: String(e?.message || e) };
  }
}

async function sendWithResendSafe(args: {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
  isTransactional?: boolean;
}): Promise<{ ok: boolean; details?: any }> {
  try {
    const from = args.fromName ? `${args.fromName} <${args.fromEmail}>` : args.fromEmail;

    const body: any = {
      from,
      to: [args.to],
      subject: args.subject,
      text: args.text,
    };

    // Add headers for better deliverability & CAN-SPAM compliance
    if (args.isTransactional) {
      body.headers = {
        "List-Unsubscribe": "<mailto:unsubscribe@verosboutiqueky.com?subject=unsubscribe>",
        "X-Priority": "3",
      };
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await resp.text().catch(() => "");
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_) {}

    if (!resp.ok) {
      return { ok: false, details: { status: resp.status, body: parsed || raw } };
    }

    return { ok: true, details: parsed };
  } catch (e: any) {
    return { ok: false, details: String(e?.message || e) };
  }
}

function escapeHtml(str: string) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
