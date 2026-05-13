import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// POST /api/notify-admin
// 운영자 알림 통합 엔드포인트
// body: { kind: 'signup_error' | 'register_error' | 'custom',
//         message: string, context?: Record<string, unknown> }
//
// 채널
// - 이메일 (Resend) : RESEND_API_KEY 가 있으면 발송
// - 텔레그램 (TODO): TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID 추가 후 활성화
// ─────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'aring.official@gmail.com';
const FROM_EMAIL = 'aring <noreply@aring.app>';

type Kind = 'signup_error' | 'register_error' | 'custom';

const SUBJECT_PREFIX: Record<Kind, string> = {
  signup_error:   '[aring] 회원가입 에러',
  register_error: '[aring] 한 짝 등록 에러',
  custom:         '[aring] 알림',
};

export async function POST(req: NextRequest) {
  let body: { kind?: Kind; message?: string; context?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const kind: Kind = (body.kind as Kind) ?? 'custom';
  const message = (body.message ?? '').toString();
  if (!message) return NextResponse.json({ ok: false, error: 'message required' }, { status: 400 });

  const context = body.context ?? {};
  const subject = SUBJECT_PREFIX[kind] ?? SUBJECT_PREFIX.custom;
  const html = buildHtml({ kind, message, context });

  const text = buildPlainText({ kind, message, context });
  const channels = await Promise.allSettled([
    sendEmail(subject, html),
    sendTelegram(`${subject}\n\n${text}`),
  ]);

  const result = {
    ok: channels.some((c) => c.status === 'fulfilled' && c.value === true),
    email:    channels[0].status === 'fulfilled' ? channels[0].value : false,
    telegram: channels[1].status === 'fulfilled' ? channels[1].value : false,
  };

  return NextResponse.json(result);
}

// ── 텔레그램 봇 ──────────────────────────────────────────────
async function sendTelegram(text: string): Promise<boolean> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[notify-admin] TELEGRAM_BOT_TOKEN/CHAT_ID 미설정 — 텔레그램 발송 생략');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[notify-admin] Telegram HTTP', res.status, t);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify-admin] Telegram exception', e);
    return false;
  }
}

// ── 텔레그램용 plain text ───────────────────────────────────
function buildPlainText({
  kind,
  message,
  context,
}: {
  kind: Kind;
  message: string;
  context: Record<string, unknown>;
}): string {
  const lines = [
    `[${kind}]`,
    new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    '',
    message,
  ];
  const entries = Object.entries(context);
  if (entries.length) {
    lines.push('');
    for (const [k, v] of entries) {
      lines.push(`${k}: ${String(v ?? '')}`);
    }
  }
  return lines.join('\n');
}

// ── 이메일 (Resend) ──────────────────────────────────────────
async function sendEmail(subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[notify-admin] RESEND_API_KEY 미설정 — 이메일 발송 생략');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[notify-admin] Resend HTTP', res.status, text);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify-admin] Resend exception', e);
    return false;
  }
}

// ── HTML 본문 생성 ───────────────────────────────────────────
function buildHtml({
  kind,
  message,
  context,
}: {
  kind: Kind;
  message: string;
  context: Record<string, unknown>;
}): string {
  const rows = Object.entries(context)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b6b7e;font-size:13px;white-space:nowrap;">${escape(k)}</td><td style="padding:4px 0;color:#1e1b2e;font-size:13px;word-break:break-all;">${escape(String(v ?? ''))}</td></tr>`,
    )
    .join('');

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e1b2e;">
  <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;">${escape(SUBJECT_PREFIX[kind])}</h2>
  <p style="font-size:14px;color:#6b6b7e;margin:0 0 16px;">시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
  <div style="background:#f3f3f5;border-radius:12px;padding:14px 18px;margin-bottom:18px;font-size:14px;line-height:1.6;color:#1e1b2e;white-space:pre-wrap;word-break:break-all;">${escape(message)}</div>
  ${rows ? `<table style="border-collapse:collapse;width:100%;margin-bottom:8px;">${rows}</table>` : ''}
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0 8px;" />
  <p style="font-size:11px;color:#b5b5c0;margin:0;">aring 운영 알림 · https://aring.app</p>
</div>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
