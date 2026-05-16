'use client';

import { useEffect, useMemo, useState } from 'react';

type DailyRow = { day: string; pv: number; uv: number };

type Props = { className?: string };

// 최근 12개월 옵션 생성 (현재 달 포함)
function buildMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    opts.push({
      value: `${y}-${String(m).padStart(2, '0')}`,
      label: `${y}년 ${m}월`,
    });
  }
  return opts;
}

// 'YYYY-MM' → 해당 월의 일수
function monthDays(yyyymm: string): number {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function fmtDayKey(iso: string): number {
  // RPC가 반환한 day는 KST 자정 timestamptz → 일(day) 추출
  const d = new Date(iso);
  // KST 변환: getUTCDate 후 UTC+9 보정
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.getUTCDate();
}

export function TrafficChart({ className }: Props) {
  const monthOpts = useMemo(buildMonthOptions, []);
  const [month, setMonth] = useState<string>(monthOpts[0].value);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetch(`/api/admin/traffic?month=${encodeURIComponent(month)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        if (!res.ok) {
          setErr(typeof body.error === 'string' ? body.error : `요청 실패 (${res.status})`);
          setRows([]);
        } else {
          setRows(((body.rows ?? []) as DailyRow[]));
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(String(e));
        setRows([]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month]);

  const days = useMemo(() => monthDays(month), [month]);

  // day(1..days) → {pv, uv} 매핑
  const byDay = useMemo(() => {
    const m = new Map<number, { pv: number; uv: number }>();
    for (const r of rows) {
      const d = fmtDayKey(r.day);
      m.set(d, { pv: Number(r.pv) || 0, uv: Number(r.uv) || 0 });
    }
    return m;
  }, [rows]);

  const totals = useMemo(() => {
    let pv = 0, uv = 0;
    for (const r of rows) { pv += Number(r.pv) || 0; uv += Number(r.uv) || 0; }
    // uv는 일별 distinct 합 — 월별 distinct UV는 별도이지만 그래프 합계로 표시
    return { pv, uv };
  }, [rows]);

  const max = useMemo(() => {
    let mx = 0;
    for (const r of rows) {
      const p = Number(r.pv) || 0;
      if (p > mx) mx = p;
    }
    return Math.max(mx, 10);
  }, [rows]);

  return (
    <section className={['bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6', className ?? ''].join(' ')}>
      {/* 헤더 — 타이틀, 합계, 월 드롭다운 */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-baseline gap-6">
          <h2 className="text-[16px] font-bold text-aring-ink-900">방문자 통계</h2>
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] font-bold text-aring-ink-500">PV</span>
              <span className="text-[20px] font-bold text-aring-ink-900">{totals.pv.toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] font-bold text-aring-green">UV</span>
              <span className="text-[20px] font-bold text-aring-ink-900">{totals.uv.toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 rounded-tile border border-aring-ink-200 text-[14px] font-semibold text-aring-ink-900 bg-white focus:outline-none focus:border-aring-green"
        >
          {monthOpts.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-3 py-2 rounded-lg mb-4">
          {err}
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center gap-4 mb-3 text-[12px] font-semibold text-aring-ink-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-aring-ink-200" />
          PV (페이지뷰)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-aring-green" />
          UV (순방문자)
        </span>
      </div>

      {/* 차트 */}
      {loading ? (
        <div className="h-64 bg-aring-ink-50 animate-pulse rounded-lg" />
      ) : rows.length === 0 && !err ? (
        <div className="h-64 flex items-center justify-center text-[14px] font-semibold text-aring-ink-500 bg-aring-ink-50 rounded-lg">
          이 달의 방문자 기록이 아직 없습니다
        </div>
      ) : (
        <Chart days={days} byDay={byDay} max={max} />
      )}
    </section>
  );
}

function Chart({
  days,
  byDay,
  max,
}: {
  days: number;
  byDay: Map<number, { pv: number; uv: number }>;
  max: number;
}) {
  const W = 800;
  const H = 260;
  const PAD_L = 40;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const slot = chartW / days;
  const barW = Math.max(slot * 0.55, 4);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(max * r));

  // UV 라인 좌표
  const uvPoints: { x: number; y: number; uv: number; day: number }[] = [];
  for (let d = 1; d <= days; d++) {
    const v = byDay.get(d);
    const uv = v?.uv ?? 0;
    const x = PAD_L + slot * (d - 0.5);
    const y = PAD_T + chartH - (uv / max) * chartH;
    uvPoints.push({ x, y, uv, day: d });
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64" preserveAspectRatio="none">
        {/* 가로 격자 + Y축 라벨 */}
        {yTicks.map((t, i) => {
          const y = PAD_T + chartH - (t / max) * chartH;
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#EAEFEC" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#9AA5A0" fontWeight={600}>
                {t.toLocaleString('ko-KR')}
              </text>
            </g>
          );
        })}

        {/* PV 막대 */}
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
          const v = byDay.get(d);
          const pv = v?.pv ?? 0;
          const h = (pv / max) * chartH;
          const x = PAD_L + slot * (d - 1) + (slot - barW) / 2;
          const y = PAD_T + chartH - h;
          return (
            <g key={d}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill="#D8DFDC"
              >
                <title>{`${d}일 — PV ${pv.toLocaleString('ko-KR')}`}</title>
              </rect>
            </g>
          );
        })}

        {/* UV 라인 */}
        <polyline
          fill="none"
          stroke="#2A4A3C"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={uvPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        />

        {/* UV 포인트 */}
        {uvPoints.map((p) => (
          <circle key={p.day} cx={p.x} cy={p.y} r={2.5} fill="#2A4A3C">
            <title>{`${p.day}일 — UV ${p.uv.toLocaleString('ko-KR')}`}</title>
          </circle>
        ))}

        {/* X축 라벨 (5일 간격) */}
        {Array.from({ length: days }, (_, i) => i + 1)
          .filter((d) => d === 1 || d === days || d % 5 === 0)
          .map((d) => {
            const x = PAD_L + slot * (d - 0.5);
            return (
              <text key={d} x={x} y={H - 8} textAnchor="middle" fontSize="10" fill="#9AA5A0" fontWeight={600}>
                {d}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
