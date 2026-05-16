import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/admin/traffic?month=YYYY-MM
// 서버 쿠키 기반 세션으로 RPC 호출 → admin RLS 컨텍스트 확보
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase 미설정' }, { status: 500 });
  }

  // 1) 인증 + admin 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  if (profileErr || profile?.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
  }

  // 2) 월 파싱
  const month = req.nextUrl.searchParams.get('month');
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month 파라미터 형식 오류 (YYYY-MM)' }, { status: 400 });
  }
  const [y, m] = month.split('-').map(Number);
  // KST = UTC+9 → KST 자정 = UTC 전날 15:00
  const start = new Date(Date.UTC(y, m - 1, 1, -9, 0, 0)).toISOString();
  const end   = new Date(Date.UTC(y, m,     1, -9, 0, 0)).toISOString();

  // 3) RPC 호출 — 이미 admin으로 검증된 세션이라 RLS 통과
  const { data, error } = await supabase.rpc('page_views_daily', {
    range_start: start,
    range_end: end,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
