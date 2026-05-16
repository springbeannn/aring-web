import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/admin/traffic?month=YYYY-MM[&debug=1]
// 서버 쿠키 기반 세션으로 RPC 호출 → admin RLS 컨텍스트 확보
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase 미설정' }, { status: 500 });
  }

  // 1) 인증
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  // 2) admin 권한 확인
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  if (profileErr || profile?.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
  }

  // 3) 월 파싱
  const month = req.nextUrl.searchParams.get('month');
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month 파라미터 형식 오류 (YYYY-MM)' }, { status: 400 });
  }
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, -9, 0, 0)).toISOString();
  const end   = new Date(Date.UTC(y, m,     1, -9, 0, 0)).toISOString();

  // 4) RPC 호출
  const rpcRes = await supabase.rpc('page_views_daily', {
    range_start: start,
    range_end: end,
  });

  // 5) 디버그 모드 — ?debug=1
  const debug = req.nextUrl.searchParams.get('debug') === '1';
  if (debug) {
    // is_admin() 함수 직접 호출
    const isAdminRes = await supabase.rpc('is_admin');
    // 직접 SELECT (RLS 적용) 시도
    const directRes = await supabase
      .from('page_views')
      .select('id, created_at, session_id', { count: 'exact', head: false })
      .gte('created_at', start)
      .lt('created_at', end)
      .limit(5);
    return NextResponse.json({
      auth_user_id: user.id,
      auth_user_email: user.email,
      profile_role: profile.role,
      is_admin_rpc: { data: isAdminRes.data, error: isAdminRes.error?.message ?? null },
      range: { start, end },
      rpc_page_views_daily: {
        data: rpcRes.data,
        error: rpcRes.error?.message ?? null,
        row_count: Array.isArray(rpcRes.data) ? rpcRes.data.length : null,
      },
      direct_select: {
        count: directRes.count,
        sample: directRes.data,
        error: directRes.error?.message ?? null,
      },
    });
  }

  if (rpcRes.error) {
    return NextResponse.json({ error: rpcRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: rpcRes.data ?? [] });
}
