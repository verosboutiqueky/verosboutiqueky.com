import type { APIRoute } from 'astro';

// Turnstile token validation endpoint (Cloudflare Workers)
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const turnstileToken = formData.get('cf-turnstile-response') as string;
    const formType = formData.get('formType') as string;

    // Validate Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          error: 'Turnstile validation token missing',
          success: false,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify token with Cloudflare
    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: import.meta.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const verifyData = (await verifyResponse.json()) as TurnstileResponse;

    if (!verifyData.success) {
      return new Response(
        JSON.stringify({
          error: 'Turnstile validation failed',
          codes: verifyData.error_codes,
          success: false,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build lead object from form data
    const lead: Record<string, string | string[]> = {
      formType: formType || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Extract all form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'cf-turnstile-response' || key === 'formType') continue;

      // Handle multi-value fields (arrays)
      if (key.endsWith('[]')) {
        const fieldName = key.slice(0, -2);
        if (!lead[fieldName]) {
          lead[fieldName] = [];
        }
        const fieldValue = lead[fieldName];
        if (Array.isArray(fieldValue)) {
          fieldValue.push(value as string);
        }
      } else {
        lead[key] = value as string;
      }
    }

    // TODO: Save lead to database or send to CRM
    // For now, log it and return success
    console.log('Lead received:', lead);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead submitted successfully',
        formType: formType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing lead:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
