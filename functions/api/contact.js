/**
 * Cloudflare Pages Function — Anfrageformular
 *
 * Endpoint: POST /api/contact
 *
 * Empfängt das Anfrageformular von /buchung/, validiert es, und schickt die
 * Anfrage als E-Mail an alm44@gmx.at via Resend (resend.com).
 *
 * Reply-To wird auf die E-Mail-Adresse der absendenden Person gesetzt —
 * eine Antwort aus dem Postfach geht damit direkt zurück.
 *
 * Erforderliche Cloudflare Pages Environment Variables:
 *   RESEND_API_KEY  — API-Key von resend.com/api-keys (Production env)
 *
 * Optionale Variables:
 *   MAIL_TO         — Zieladresse (default alm44@gmx.at)
 *   MAIL_FROM       — Absenderadresse (default "alm44 Website <onboarding@resend.dev>")
 */

const DEFAULT_TO   = 'alm44@gmx.at';
const DEFAULT_FROM = 'alm44 Website <onboarding@resend.dev>';

/** Escape user input for safe inclusion in plain-text email bodies. */
function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function buildPlainText({ name, email, anreise, abreise, personen, nachricht }) {
  return [
    'Neue Anfrage über die alm44 Website',
    '────────────────────────────────────',
    '',
    `Name:      ${name}`,
    `E-Mail:    ${email}`,
    `Anreise:   ${anreise || '—'}`,
    `Abreise:   ${abreise || '—'}`,
    `Personen:  ${personen || '—'}`,
    '',
    'Nachricht:',
    nachricht || '—',
    '',
    '────────────────────────────────────',
    'Direkt antworten geht — Reply-To ist auf die obige E-Mail-Adresse gesetzt.',
  ].join('\n');
}

function buildHtml({ name, email, anreise, abreise, personen, nachricht }) {
  const esc = (s) => String(s ?? '—')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
  return `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color:#2A211B;">
      <h2 style="font-family: Georgia, serif; font-style: italic; color:#5C4D43;">Neue Anfrage über die alm44 Website</h2>
      <table style="border-collapse: collapse; width:100%;">
        <tr><td style="padding:6px 10px; color:#5C4D43; vertical-align:top;">Name</td><td style="padding:6px 10px;">${esc(name)}</td></tr>
        <tr><td style="padding:6px 10px; color:#5C4D43; vertical-align:top;">E-Mail</td><td style="padding:6px 10px;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:6px 10px; color:#5C4D43; vertical-align:top;">Anreise</td><td style="padding:6px 10px;">${esc(anreise)}</td></tr>
        <tr><td style="padding:6px 10px; color:#5C4D43; vertical-align:top;">Abreise</td><td style="padding:6px 10px;">${esc(abreise)}</td></tr>
        <tr><td style="padding:6px 10px; color:#5C4D43; vertical-align:top;">Personen</td><td style="padding:6px 10px;">${esc(personen)}</td></tr>
      </table>
      <h3 style="font-family: Georgia, serif; font-style: italic; color:#5C4D43; margin-top:1.5em;">Nachricht</h3>
      <div style="white-space: pre-wrap; line-height:1.6;">${esc(nachricht)}</div>
      <hr style="margin-top:2em; border:none; border-top:1px solid #D9CDC1;">
      <p style="color:#7B5F46; font-size: 0.9em;">Antwort aus dem Postfach geht direkt an die obige E-Mail-Adresse zurück (Reply-To gesetzt).</p>
    </div>
  `;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch (err) {
    return new Response('Ungültige Anfrage.', { status: 400 });
  }

  // Honeypot — schweigend OK an Bots melden.
  if (data._honey && String(data._honey).trim() !== '') {
    return Response.redirect(new URL('/danke/', request.url).toString(), 303);
  }

  const fields = {
    name:      clean(data.name),
    email:     clean(data.email),
    anreise:   clean(data.anreise),
    abreise:   clean(data.abreise),
    personen:  clean(data.personen),
    nachricht: clean(data.nachricht).replace(/\s+/g, ' '),
  };

  // Mindestvalidierung.
  if (!fields.name || !fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return new Response('Bitte Name und gültige E-Mail-Adresse angeben.', { status: 400 });
  }

  if (!env.RESEND_API_KEY) {
    return new Response('Mailversand ist gerade nicht konfiguriert. Bitte direkt an alm44@gmx.at schreiben.', { status: 503 });
  }

  const to       = env.MAIL_TO   || DEFAULT_TO;
  const from     = env.MAIL_FROM || DEFAULT_FROM;
  const subject  = `alm44 Anfrage — ${fields.name}${fields.anreise ? ` (Anreise ${fields.anreise})` : ''}`;

  const resendBody = {
    from,
    to: [to],
    reply_to: fields.email,
    subject,
    text: buildPlainText(fields),
    html: buildHtml(fields),
  };

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });
  } catch (err) {
    return new Response('Verbindung zum Mailversand fehlgeschlagen. Bitte erneut versuchen oder direkt an alm44@gmx.at schreiben.', { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.log('Resend error', res.status, detail);
    return new Response('Mailversand fehlgeschlagen. Bitte erneut versuchen oder direkt an alm44@gmx.at schreiben.', { status: 502 });
  }

  return Response.redirect(new URL('/danke/', request.url).toString(), 303);
}

/** Methoden außer POST sollen schlicht abgewiesen werden. */
export const onRequest = ({ request }) => new Response('Method Not Allowed', {
  status: 405,
  headers: { Allow: 'POST' },
});
