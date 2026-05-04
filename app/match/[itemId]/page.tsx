'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, type Listing } from '@/lib/supabase';
import { calculateAringMatch, splitMatchCandidates, type MatchResult } from '@/lib/aringMatch';
import { TopNav, BottomNav } from '@/components/Nav';

type IP = { className?: string };
const IconArrowLeft = ({ className = 'w-5 h-5' }: IP) => (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>);
const IconSparkle = ({ className = 'w-4 h-4' }: IP) => (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" /></svg>);
const IconChat = ({ className = 'w-4 h-4' }: IP) => (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
const IconChevronRight = ({ className = 'w-4 h-4' }: IP) => (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>);

interface CandidateWithScore { listing: Listing; matchScore: MatchResult; }

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    return `${Math.floor(hr / 24)}일 전`;
  } catch { return '방금 전'; }
}
function statusLabel(s: string) {
  if (s === 'open') return { text: '판매중', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  if (s === 'matched') return { text: '거래중', color: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return { text: '완료', color: 'bg-aring-ink-100 text-aring-ink-500 border border-aring-ink-200' };
}

// ── 매칭 배지 ───────────────────────────────────────────────
function MatchBadge({ score, type }: { score: number; type: 'similar' | 'reference' }) {
  if (type === 'similar') {
    const bg = score >= 90 ? 'bg-aring-ink-900 text-white' : score >= 80 ? 'bg-rose-400 text-white' : 'bg-aring-green text-white';
    return <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-extrabold ${bg}`}><IconSparkle className="w-3 h-3" /> aring Match {score}%</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-extrabold bg-aring-ink-100 text-aring-ink-500 border border-aring-ink-200">aring Match {score}%</span>;
}

// ── 이유 박스 ───────────────────────────────────────────────
function ReasonBox({ reasons, type }: { reasons: string[]; type: 'similar' | 'reference' }) {
  const cls = type === 'similar' ? 'border-emerald-100 bg-emerald-50/60' : 'border-aring-ink-100 bg-aring-ink-50/40';
  return (
    <div className={`mt-2 rounded-xl border ${cls} px-3 py-2.5 space-y-1`}>
      {reasons.map((r, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className={`mt-[4px] w-1.5 h-1.5 rounded-full shrink-0 ${type === 'similar' ? 'bg-aring-green' : 'bg-aring-ink-300'}`} />
          <p className="text-[11.5px] text-aring-ink-600 leading-snug">{r}</p>
        </div>
      ))}
    </div>
  );
}

// ── 유사 후보 카드 (PC: 가로 배열, Mobile: 세로) ─────────────
function SimilarCard({ item, matchScore }: { item: Listing; matchScore: MatchResult }) {
  const st = statusLabel(item.status);
  return (
    <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Mobile: 세로 / PC: 가로 */}
      <div className="flex flex-col lg:flex-row">
        {/* 이미지 */}
        <div className="relative lg:w-52 lg:shrink-0 aspect-square lg:aspect-auto lg:h-auto bg-aring-ink-100 overflow-hidden">
          {item.photo_url
            ? <img src={item.photo_url} alt={item.brand ?? ''} className="w-full h-full object-cover" loading="lazy" />
            : <div className="w-full h-full bg-aring-grad-pastel" />
          }
          {/* 배지 — 이미지 위 */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            <MatchBadge score={matchScore.totalScore} type="similar" />
          </div>
          <div className="absolute top-2.5 right-2.5">
            <span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${st.color}`}>{st.text}</span>
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col justify-between flex-1 px-4 py-3 lg:px-5 lg:py-4">
          <div>
            <p className="text-[11px] font-extrabold text-aring-green mb-1">{matchScore.label}</p>
            <p className="text-[10.5px] font-bold text-aring-ink-400 tracking-wide truncate">{item.brand ?? '브랜드 미상'}</p>
            <p className="mt-0.5 text-[14px] lg:text-[15px] font-bold text-aring-ink-900 leading-snug line-clamp-2">{item.detail ?? item.shape ?? '한 짝'}</p>
            {item.story && (
              <p className="mt-1.5 text-[11px] text-aring-ink-400 leading-snug line-clamp-2 italic">&ldquo;{item.story}&rdquo;</p>
            )}
            <ReasonBox reasons={matchScore.reasons} type="similar" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-aring-ink-400">{relativeTime(item.created_at)}</p>
            <div className="flex gap-2">
              <Link href={`/items/${item.id}#comments`} className="flex items-center gap-1 rounded-pill border border-aring-ink-200 bg-white px-3 py-1.5 text-[11px] font-bold text-aring-ink-700 hover:bg-aring-ink-50 transition">
                <IconChat className="w-3.5 h-3.5" /> 댓글
              </Link>
              <Link href={`/items/${item.id}`} className="flex items-center gap-1 rounded-pill bg-aring-ink-900 px-3 py-1.5 text-[11px] font-extrabold text-white hover:opacity-90 transition">
                상세 보기 <IconChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 참고 후보 카드 (항상 세로형 그리드) ──────────────────────
function ReferenceCard({ item, matchScore }: { item: Listing; matchScore: MatchResult }) {
  const st = statusLabel(item.status);
  return (
    <div className="rounded-2xl border border-aring-ink-100 bg-white overflow-hidden hover:border-aring-ink-200 transition-colors">
      <div className="relative aspect-square bg-aring-ink-100 overflow-hidden">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.brand ?? ''} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full bg-aring-grad-pastel" />
        }
        <div className="absolute top-2 left-2"><MatchBadge score={matchScore.totalScore} type="reference" /></div>
        <div className="absolute top-2 right-2"><span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${st.color}`}>{st.text}</span></div>
      </div>
      <div className="px-3 py-3">
        <p className="text-[10.5px] font-extrabold text-aring-ink-400 mb-1">{matchScore.label}</p>
        <p className="text-[10px] text-aring-ink-400 font-bold truncate">{item.brand ?? '브랜드 미상'}</p>
        <p className="mt-0.5 text-[12px] font-bold text-aring-ink-900 line-clamp-2 leading-snug">{item.detail ?? item.shape ?? '한 짝'}</p>
        {item.story && <p className="mt-1 text-[10.5px] text-aring-ink-400 italic line-clamp-1">&ldquo;{item.story}&rdquo;</p>}
        <ReasonBox reasons={matchScore.reasons.slice(0, 2)} type="reference" />
        <div className="mt-2.5 flex gap-1.5">
          <Link href={`/items/${item.id}`} className="flex-1 flex items-center justify-center rounded-pill bg-aring-ink-900 py-2 text-[11px] font-extrabold text-white hover:opacity-90 transition">상세 보기</Link>
          <Link href={`/items/${item.id}#comments`} className="flex items-center justify-center rounded-pill border border-aring-ink-200 px-2.5 py-2 text-[11px] font-bold text-aring-ink-700 hover:bg-aring-ink-50 transition"><IconChat className="w-3.5 h-3.5" /></Link>
        </div>
      </div>
    </div>
  );
}

// ── 내 귀걸이 요약 (사이드바 / 상단 카드) ────────────────────
function MyItemSummary({ item }: { item: Listing }) {
  const tags = [
    item.shape    && `형태: ${item.shape}`,
    item.color    && `컬러: ${item.color}`,
    item.material && `소재: ${item.material}`,
    item.brand && item.brand !== '브랜드 미상' && item.brand,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden shadow-sm">
      {/* Mobile: 가로 / PC(사이드바): 세로 */}
      <div className="flex lg:flex-col gap-0">
        {/* 이미지 */}
        <div className="w-24 h-24 lg:w-full lg:h-48 shrink-0 overflow-hidden bg-aring-grad-pastel">
          {item.photo_url && <img src={item.photo_url} alt="내 귀걸이" className="w-full h-full object-cover" />}
        </div>
        {/* 정보 */}
        <div className="flex-1 px-4 py-3 lg:px-5 lg:py-4 min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-[0.1em] text-aring-accent uppercase mb-1">
            <IconSparkle className="w-3 h-3" /> 내 귀걸이
          </span>
          <p className="text-[13px] lg:text-[15px] font-extrabold text-aring-ink-900 leading-snug line-clamp-2">{item.detail ?? item.shape ?? '한 짝'}</p>
          {item.brand && <p className="mt-0.5 text-[11px] text-aring-ink-400 font-medium">{item.brand}</p>}
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 4).map(t => (
              <span key={t} className="rounded-pill bg-aring-ink-100 px-2 py-0.5 text-[10px] font-semibold text-aring-ink-600">{t}</span>
            ))}
          </div>
        </div>
      </div>
      {item.story && (
        <div className="border-t border-aring-ink-100 px-4 lg:px-5 py-2.5">
          <p className="text-[11px] text-aring-ink-400 italic line-clamp-2">&ldquo;{item.story}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

// ── 빈 상태 ────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-aring-grad-pastel flex items-center justify-center mb-5">
        <IconSparkle className="w-7 h-7 text-aring-ink-500" />
      </div>
      <p className="text-[17px] font-extrabold text-aring-ink-900 leading-snug">아직 꼭 닮은 짝을<br />찾지 못했어요</p>
      <p className="mt-3 text-[13px] text-aring-ink-500 leading-[1.8] max-w-[280px]">
        하지만 끝난 건 아니에요.<br />새로운 귀걸이가 등록될 때마다 비슷한 짝을 다시 찾아볼 수 있어요.<br />
        <span className="text-aring-ink-700 font-semibold">잃어버린 반쪽을 찾는 여정, aring이 함께할게요.</span>
      </p>
      <div className="mt-8 flex flex-col gap-2.5 w-full max-w-[240px]">
        <Link href="/products" className="flex items-center justify-center rounded-pill bg-aring-ink-900 py-3 text-[13px] font-extrabold text-white">비슷한 귀걸이 둘러보기</Link>
        <Link href="/my" className="flex items-center justify-center rounded-pill border border-aring-green-line py-3 text-[13px] font-extrabold text-aring-ink-900">내 상품 보러가기</Link>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
      <div className="text-center">
        <p className="text-[14px] font-extrabold text-aring-ink-900">짝을 찾는 중이에요</p>
        <p className="mt-1 text-[11px] text-aring-ink-500">aring이 비슷한 귀걸이를 분석하고 있어요</p>
      </div>
    </div>
  );
}

type PageState =
  | { status: 'loading' }
  | { status: 'ok'; myItem: Listing; similar: CandidateWithScore[]; reference: CandidateWithScore[] }
  | { status: 'error' };

export default function MatchPage({ params }: { params: { itemId: string } }) {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    if (!supabase) { setState({ status: 'error' }); return; }
    let cancelled = false;
    async function load() {
      if (!supabase) return;
      const { data: myRow, error: myErr } = await supabase.from('listings').select('*').eq('id', params.itemId).maybeSingle();
      if (cancelled) return;
      if (myErr || !myRow) { setState({ status: 'error' }); return; }
      const myItem = myRow as Listing;
      const { data: rows } = await supabase.from('listings').select('*').eq('status', 'open').neq('id', params.itemId).order('created_at', { ascending: false }).limit(100);
      if (cancelled) return;
      const src = { shape: myItem.shape ?? '', color: myItem.color ?? '', material: myItem.material ?? '', detail: myItem.detail ?? '', brand: myItem.brand, theme: myItem.theme };
      const scored: CandidateWithScore[] = (rows ?? []).map(r => {
        const row = r as Listing;
        return { listing: row, matchScore: calculateAringMatch(src, { shape: row.shape ?? '', color: row.color ?? '', material: row.material ?? '', detail: row.detail ?? '', brand: row.brand, theme: row.theme }) };
      }).filter(c => c.matchScore.type !== 'hidden');
      const { similar, reference } = splitMatchCandidates(scored);
      if (!cancelled) setState({ status: 'ok', myItem, similar, reference });
    }
    load();
    return () => { cancelled = true; };
  }, [params.itemId]);

  const hasSimilar   = state.status === 'ok' && state.similar.length > 0;
  const hasReference = state.status === 'ok' && state.reference.length > 0;
  const isEmpty      = state.status === 'ok' && !hasSimilar && !hasReference;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="pb-28 lg:pb-16">

          {/* ── PC: 2단 레이아웃 / Mobile: 1단 ── */}
          <div className="lg:flex lg:gap-8 lg:px-8 lg:pt-8">

            {/* ── 좌측 사이드바 (PC 전용 sticky) ── */}
            <div className="lg:w-72 lg:shrink-0">
              {/* 히어로 */}
              <div className="px-5 pt-6 pb-4 lg:px-0 lg:pt-0 lg:pb-5">
                <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-aring-ink-500 hover:text-aring-ink-700 transition">
                  <IconArrowLeft className="w-4 h-4" /> 뒤로
                </button>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <IconSparkle className="w-3.5 h-3.5 text-aring-accent" />
                  <span className="text-[10.5px] font-extrabold tracking-[0.12em] text-aring-accent uppercase">AI Matching</span>
                </div>
                <h1 className="text-[22px] lg:text-[26px] font-extrabold text-aring-ink-900 leading-snug">
                  AI가 비슷한<br />짝을 찾아봤어요
                </h1>
                <p className="mt-2 text-[12.5px] text-aring-ink-500 leading-relaxed">
                  방금 등록한 귀걸이를 기준으로<br className="hidden lg:block" /> aring Match를 계산했어요
                </p>
              </div>

              {/* 내 귀걸이 카드 */}
              <div className="px-5 lg:px-0 lg:sticky lg:top-6">
                {state.status === 'ok' && <MyItemSummary item={state.myItem} />}
                {state.status === 'loading' && <div className="h-28 rounded-2xl bg-aring-ink-100/50 animate-pulse" />}

                {/* PC 전용: 결과 통계 */}
                {state.status === 'ok' && (hasSimilar || hasReference) && (
                  <div className="hidden lg:block mt-4 rounded-2xl bg-aring-ink-50 border border-aring-ink-100 px-4 py-3 space-y-2">
                    {hasSimilar && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-aring-green" />
                          <span className="text-[12px] font-bold text-aring-ink-700">유사한 후보</span>
                        </div>
                        <span className="text-[12px] font-extrabold text-aring-green">{state.similar.length}개</span>
                      </div>
                    )}
                    {hasReference && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-aring-ink-300" />
                          <span className="text-[12px] font-bold text-aring-ink-500">참고 후보</span>
                        </div>
                        <span className="text-[12px] font-extrabold text-aring-ink-500">{state.reference.length}개</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── 우측 메인 콘텐츠 ── */}
            <div className="flex-1 min-w-0">
              {state.status === 'loading' && <LoadingScreen />}

              {state.status === 'error' && (
                <div className="px-5 lg:px-0 pt-10 text-center">
                  <p className="text-[14px] font-bold text-aring-ink-900">매칭 결과를 불러오지 못했어요</p>
                  <p className="mt-1 text-[12px] text-aring-ink-500">잠시 후 다시 시도해주세요</p>
                  <Link href="/my" className="mt-5 inline-flex rounded-pill bg-aring-ink-900 px-5 py-2.5 text-[13px] font-extrabold text-white">내 상품 보기</Link>
                </div>
              )}

              {isEmpty && <EmptyState />}

              {/* 유사 후보 없고 참고만 있을 때 안내 */}
              {state.status === 'ok' && !hasSimilar && hasReference && (
                <div className="mx-5 lg:mx-0 mt-6 lg:mt-0 rounded-2xl bg-aring-ink-50 border border-aring-ink-100 px-5 py-4 mb-6">
                  <p className="text-[13px] font-extrabold text-aring-ink-900">아직 꼭 닮은 짝을 찾지 못했어요.</p>
                  <p className="mt-1 text-[12px] text-aring-ink-500">대신 참고해볼 수 있는 후보를 모아봤어요.</p>
                </div>
              )}

              {/* ── 유사한 후보 섹션 ── */}
              {hasSimilar && state.status === 'ok' && (
                <section className="mt-6 lg:mt-0 px-5 lg:px-0">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-aring-green shrink-0" />
                    <div>
                      <h2 className="text-[16px] lg:text-[18px] font-extrabold text-aring-ink-900">가장 비슷한 짝을 찾아봤어요</h2>
                      <p className="text-[11px] text-aring-ink-400 mt-0.5">aring Match 60% 이상</p>
                    </div>
                  </div>
                  {/* 유사 후보: 항상 1열, PC에서 가로형 카드 */}
                  <div className="flex flex-col gap-3">
                    {state.similar.map(c => <SimilarCard key={c.listing.id} item={c.listing} matchScore={c.matchScore} />)}
                  </div>
                </section>
              )}

              {/* 섹션 구분선 */}
              {hasSimilar && hasReference && state.status === 'ok' && (
                <div className="mx-5 lg:mx-0 my-8 border-t border-aring-ink-100" />
              )}

              {/* ── 참고 후보 섹션 ── */}
              {hasReference && state.status === 'ok' && (
                <section className={`px-5 lg:px-0 ${!hasSimilar ? 'mt-6 lg:mt-0' : ''}`}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-aring-ink-300 shrink-0" />
                    <div>
                      <h2 className="text-[14px] lg:text-[16px] font-extrabold text-aring-ink-600">완전히 같진 않지만, 이런 후보도 있어요</h2>
                      <p className="text-[11px] text-aring-ink-400 mt-0.5">aring Match 40~59%</p>
                    </div>
                  </div>
                  {/* 참고 후보: Mobile 2열, PC 3열 그리드 */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {state.reference.map(c => <ReferenceCard key={c.listing.id} item={c.listing} matchScore={c.matchScore} />)}
                  </div>
                </section>
              )}

              <div className="h-8" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
