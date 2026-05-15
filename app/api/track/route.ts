import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SID_COOKIE = 'aring_sid';
const SID_MAX_AGE = 60 * 60 * 24 * 365; // 365일 — UV 정의 기준

function makeSessionId(): string {
  // crypto.randomUUID는 Edge/Node 양쪽에서 사용 가능
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ ok: false, reason: 'no-supabase' }, { status: 200 });
  }

  let payload: { path?: string; referrer?: string | null } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const path = typeof payload.path === 'string' ? payload.path.slice(0, 500) : null;
  if (!path) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // /admin 경로는 통계에서 제외 (관리자 활동 노이즈)
  if (path.startsWith('/admin')) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const cookieStore = cookies();
  let sid = cookieStore.get(SID_COOKIE)?.value ?? null;
  let setNewCookie = false;
  if (!sid) {
    sid = makeSessionId();
    setNewCookie = true;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* no-op */ },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const ua = req.headers.get('user-agent')?.slice(0, 500) ?? null;
  const referrer = typeof payload.referrer === 'string' ? payload.referrer.slice(0, 500) : null;

  await supabase.from('page_views').insert({
    path,
    session_id: sid,
    user_id: user?.id ?? null,
    referrer,
    ua,
  });

  const res = NextResponse.json({ ok: true });
  if (setNewCookie) {
    res.cookies.set(SID_COOKIE, sid, {
      maxAge: SID_MAX_AGE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return res;
}
