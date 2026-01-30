export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const req = context.request;
    const env = context.env;

    // 1) Read form data
    const form = await req.formData();

    const formType = String(form.get("formType") || "").trim();
    const email = String(form.get("email") || "").trim();
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();

    // Turnstile token field name is typically this:
    const turnstileToken = String(form.get("cf-turnstile-response") || "").trim();

    // 2) Basic validation
    if (!formType) return json({ success: false, error: "Missing formType" }, 400);
    if (!email) return json({ success: false, error: "Missing email" }, 400);
    if (!turnstileToken) return json({ success: false, error: "Missing Turnstile token" }, 400);

    // 3) Verify Turnstile token
    const ip = req.headers.get("CF-Connecting-IP") || undefined;

    const verified = await verifyTurnstile({
      token: turnstileToken,
      secretKey: env.TURNSTILE_SECRET_KEY,
      ip,
    });

    if (!verified.ok) {
      return json(
        { success: false, error: "Turnstile verification failed", details: verified.details },
        403
      );
    }

    // 4) Route by formType to the correct TO email
    const to = resolveToEmail(formType, env);
    if (!to) {
      return json({ success: false, error: `Unknown formType: ${formType}` }, 400);
    }

    // 5) Send email via Resend
    const subject = `[${formType}] New lead from ${email}`;
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
    });

    const sendResult = await sendWithResend({
      apiKey: env.RESEND_API_KEY,
      fromEmail: env.RESEND_FROM_EMAIL,
      fromName: env.RESEND_FROM_NAME,
      to,
      subject,
      text,
    });

    if (!sendResult.ok) {
      return json({ success: false, error: "Email send failed", details: sendResult.details }, 502);
    }

    // 6) Return success
    return json({ success: true }, 200);
  } catch (err: any) {
    return json({ success: false, error: "Server error", details: String(err?.message || err) }, 500);
  }
};

// ------------------------
// Types + helpers
// ------------------------

type Env = {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_FROM_NAME?: string;

  // routing
  TO_EARLY_OFFER?: string;
  TO_CONTACT?: string;
  TO_QUOTE?: string;
  TO_DEFAULT?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function resolveToEmail(formType: string, env: Env): string | null {
  const t = formType.toLowerCase();

  if (t === "early_offer") return env.TO_EARLY_OFFER || env.TO_DEFAULT || null;
  if (t === "contact") return env.TO_CONTACT || env.TO_DEFAULT || null;
  if (t === "quote") return env.TO_QUOTE || env.TO_DEFAULT || null;

  // Optional fallback:
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
}) {
  const lines = [
    `Form Type: ${input.formType}`,
    `Email: ${input.email}`,
    `Name: ${[input.firstName, input.lastName].filter(Boolean).join(" ") || "(not provided)"}`,
    `Phone: ${input.phone || "(not provided)"}`,
    "",
    `Message:`,
    input.message || "(none)",
    "",
    `Meta:`,
    `IP: ${input.ip || "(unknown)"}`,
    `User-Agent: ${input.userAgent || "(unknown)"}`,
    `Referer: ${input.referer || "(unknown)"}`,
  ];

  return lines.join("\n");
}

async function verifyTurnstile(args: {
  token: string;
  secretKey: string;
  ip?: string;
}): Promise<{ ok: boolean; details?: unknown }> {
  if (!args.secretKey) {
    return { ok: false, details: "TURNSTILE_SECRET_KEY missing" };
  }

  const body = new URLSearchParams();
  body.set("secret", args.secretKey);
  body.set("response", args.token);
  if (args.ip) body.set("remoteip", args.ip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data: any = await resp.json().catch(() => null);

  // Turnstile response shape includes `success: boolean`
  if (!data || data.success !== true) {
    return { ok: false, details: data };
  }

  return { ok: true };
}

async function sendWithResend(args: {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; details?: unknown }> {
  if (!args.apiKey) return { ok: false, details: "RESEND_API_KEY missing" };
  if (!args.fromEmail) return { ok: false, details: "RESEND_FROM_EMAIL missing" };

  const from = args.fromName ? `${args.fromName} <${args.fromEmail}>` : args.fromEmail;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      text: args.text,
    }),
  });

  if (!resp.ok) {
    const details = await resp.text().catch(() => "");
    return { ok: false, details: { status: resp.status, body: details } };
  }

  const data = await resp.json().catch(() => ({}));
  return { ok: true, details: data };
}
