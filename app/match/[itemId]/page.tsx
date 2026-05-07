'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Listing } from '@/lib/supabase';
import { calculateAringMatch, splitMatchCandidates, type MatchResult } from '@/lib/aringMatch';
import { TopNav, BottomNav } from '@/components/Nav';

type IP = { className?: string };
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
  if (s === 'open') return '찾는 중';
  if (s === 'matched') return '매칭 완료';
  return '마감';
}

function statusColor(s: string) {
  if (s === 'open') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'matched') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-500 border-gray-200';
}

function scoreColor(score: number) {
  if (score >= 80) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 60) return 'bg-green-50 text-green-700 border-green-200';
  return 'bg-blue-50 text-blue-600 border-blue-200';
}

function MatchBadge({ score }: { score: number }) {
  return (
    <span className={'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ' + scoreColor(score)}>
      <IconSparkle className="w-3 h-3" />
      aring Match {score}%
    </span>
  );
}

function ReasonBox({ reasons }: { reasons: string[] }) {
  return (
    <div className="mt-2 rounded-xl bg-aring-ink-50 border border-aring-ink-100 px-3 py-2.5 space-y-1">
      {reasons.map((r, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 bg-aring-ink-400" />
          <p className="text-[11.5px] text-aring-ink-600 leading-snug">{r}</p>
        </div>
      ))}
    </div>
  );
}

function CandidateCard({ item, matchScore }: { item: Listing; matchScore: MatchResult }) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative aspect-square bg-aring-ink-100">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.brand ?? ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          : <div className="absolute inset-0 bg-aring-ink-100" />
        }
        <div className="absolute top-3 left-3"><MatchBadge score={matchScore.totalScore} /></div>
        <div className="absolute top-3 right-3">
          <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur ' + statusColor(item.status)}>
            {statusLabel(item.status)}
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4">
        {matchScore.label && (
          <p className="text-[11px] font-extrabold text-aring-green mb-1">{matchScore.label}</p>
        )}
        <p className="text-[10.5px] font-bold text-aring-ink-400 tracking-wide truncate">{item.brand ?? '브랜드 미상'}</p>
        <p className="mt-0.5 text-[14px] font-extrabold text-aring-ink-900 leading-snug line-clamp-2">{item.detail ?? item.shape ?? '한 짝'}</p>
        {item.story && <p className="mt-1.5 text-[11px] text-aring-ink-400 leading-snug line-clamp-2 italic">&ldquo;{item.story}&rdquo;</p>}
        <ReasonBox reasons={matchScore.reasons.slice(0, 3)} />
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-aring-ink-100">
          <p className="text-[10px] text-aring-ink-400">{relativeTime(item.created_at)}</p>
          <div className="flex items-center gap-2">
            <Link href={`/items/${item.id}#comments`} className="inline-flex items-center justify-center gap-1 h-9 px-4 rounded-full border border-aring-ink-200 bg-white text-[13px] font-semibold text-aring-ink-700 hover:bg-aring-ink-50 transition">
              <IconChat className="w-3.5 h-3.5" /> 댓글
            </Link>
            <Link href={`/items/${item.id}`} className="inline-flex items-center justify-center gap-1 h-9 px-4 rounded-full bg-aring-ink-900 text-[13px] font-semibold text-white hover:opacity-90 transition">
              상세 보기 <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyItemSummary({ item }: { item: Listing }) {
  const tags = [
    item.shape    && `형태: ${item.shape}`,
    item.color    && `컬러: ${item.color}`,
    item.material && `소재: ${item.material}`,
    item.brand && item.brand !== '브랜드 미상' && item.brand,
  ].filter(Boolean) as string[];
  return (
    <div className="mx-5 lg:mx-8 rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden">
      <div className="flex">
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 bg-aring-ink-100 overflow-hidden">
          {item.photo_url && <img src={item.photo_url} alt="내 귀걸이" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-center gap-1">
          <p className="text-[14px] font-extrabold text-aring-ink-900 leading-snug line-clamp-2">{item.detail ?? item.shape ?? '한 짝'}</p>
          {item.brand && <p className="text-[12px] font-semibold text-aring-ink-500 truncate">{item.brand}</p>}
          <div className="grid grid-cols-3 gap-1.5 mt-0.5">
            {tags.slice(0, 4).map(t => (
              <span key={t} className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-aring-ink-100 text-aring-ink-600 text-[11px] font-medium truncate">{t}</span>
            ))}
          </div>
        </div>
      </div>
      {item.story && (
        <div className="border-t border-aring-ink-100 bg-aring-ink-50 px-4 py-2.5">
          <p className="text-[11px] font-medium text-aring-ink-500 italic line-clamp-1">&ldquo;{item.story}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-aring-ink-100 flex items-center justify-center mb-5">
        <IconSparkle className="w-7 h-7 text-aring-ink-500" />
      </div>
      <p className="text-[17px] font-extrabold text-aring-ink-900 leading-snug">아직 딱 맞는 짝을<br />찾지 못했어요</p>
      <p className="mt-3 text-[13px] text-aring-ink-500 leading-[1.8] max-w-[280px]">
        함께 기다려 볼까요?<br />새로운 귀걸이가 등록될 때마다 비슷한 짝을 다시 찾아볼 수 있어요.
      </p>
      <div className="mt-8 flex flex-col gap-2.5 w-full max-w-[240px]">
        <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-aring-ink-900 py-3 text-[13px] font-extrabold text-white">비슷한 귀걸이 둘러보기</Link>
        <Link href="/my" className="inline-flex items-center justify-center rounded-full bg-white border border-aring-ink-200 py-3 text-[13px] font-extrabold text-aring-ink-900">내 상품 보러가기</Link>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
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
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible bg-white">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* Header */}
          <div className="px-5 lg:px-8 pt-3 pb-4">
            <h1 className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900 leading-snug">
              AI가 비슷한 짝을 찾아봤어요
            </h1>
            <p className="mt-1 text-[13px] text-aring-ink-400">
              방금 등록한 귀걸이를 기준으로 aring Match를 계산했어요
            </p>
          </div>

          {/* My item summary */}
          <div className="mb-5">
            {state.status === 'ok' && <MyItemSummary item={state.myItem} />}
            {state.status === 'loading' && <div className="mx-5 lg:mx-8 h-28 rounded-2xl bg-aring-ink-100/50 animate-pulse" />}
          </div>

          <div className="px-5 lg:px-8">
            {/* Loading / Error / Empty */}
            {state.status === 'loading' && <LoadingScreen />}
            {state.status === 'error' && (
              <div className="pt-4 text-center">
                <p className="text-[14px] font-extrabold text-aring-ink-900">매칭 결과를 불러오지 못했어요</p>
                <p className="mt-1 text-[12px] text-aring-ink-500">잠시 후 다시 시도해주세요</p>
                <Link href="/my" className="mt-5 inline-flex rounded-full bg-aring-ink-900 px-5 py-2.5 text-[13px] font-extrabold text-white">내 상품 보기</Link>
              </div>
            )}
            {isEmpty && <EmptyState />}

            {/* Result summary */}
            {state.status === 'ok' && (hasSimilar || hasReference) && (
              <div className="mb-5 rounded-2xl bg-aring-ink-50 border border-aring-ink-100 px-4 py-3.5">
                {hasSimilar ? (
                  <>
                    <p className="text-[14px] font-extrabold text-aring-green">딱 맞는 짝을 찾았어요!</p>
                    <p className="mt-1 text-[12px] text-aring-ink-500">
                      {`유사한 후보 ${state.similar.length}개${hasReference ? ` · 참고 후보 ${state.reference.length}개` : ''}를 찾았어요`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[14px] font-extrabold text-aring-ink-900">아직 딱 맞는 짝을 찾지 못했어요. 함께 기다려 볼까요?</p>
                    <p className="mt-1 text-[12px] text-aring-ink-500">대신 참고해볼 수 있는 후보 {state.reference.length}개를 모아봤어요</p>
                  </>
                )}
              </div>
            )}

            {/* 유사 후보 섹션 */}
            {hasSimilar && state.status === 'ok' && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-aring-green shrink-0" />
                  <h2 className="text-[15px] lg:text-[16px] font-extrabold text-aring-ink-900">
                    가장 비슷한 짝을 찾아봤어요
                    <span className="ml-2 text-[11px] font-bold text-aring-green">유사 후보 {state.similar.length}개</span>
                  </h2>
                </div>
                <div className="ml-4 mb-3">
                  <div className="rounded-full h-1.5 bg-aring-ink-100 overflow-hidden">
                    <div className="h-full bg-aring-green rounded-full transition-all" style={{ width: '60%' }} />
                  </div>
                  <span className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-green-50 text-green-700 border-green-200">
                    aring Match 60% 이상
                  </span>
                </div>
                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
                  {state.similar.map(c => <CandidateCard key={c.listing.id} item={c.listing} matchScore={c.matchScore} />)}
                </div>
              </section>
            )}

            {/* 참고 후보 섹션 */}
            {hasReference && state.status === 'ok' && (
              <section>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-aring-ink-300 shrink-0" />
                  <h2 className="text-[14px] lg:text-[15px] font-extrabold text-aring-ink-700">
                    완전히 같진 않지만, 이런 후보도 있어요
                    <span className="ml-2 text-[11px] font-bold text-aring-ink-400">참고 후보 {state.reference.length}개</span>
                  </h2>
                </div>
                <div className="ml-4 mb-3">
                  <div className="rounded-full h-1.5 bg-aring-ink-100 overflow-hidden">
                    <div className="h-full bg-aring-green rounded-full transition-all" style={{ width: '40%' }} />
                  </div>
                  <span className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
                    aring Match 40~59%
                  </span>
                </div>
                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
                  {state.reference.map(c => <CandidateCard key={c.listing.id} item={c.listing} matchScore={c.matchScore} />)}
                </div>
              </section>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
