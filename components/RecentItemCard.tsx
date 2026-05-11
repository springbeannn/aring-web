'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatKRW, readLikedIds, writeLikedIds, type RecentItem } from '@/lib/mock';
import { getPastelClass } from '@/lib/pastel';

const IconHeart = ({ className = 'w-3.5 h-3.5', filled = false }: { className?: string; filled?: boolean }) => (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const IconEye = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export function RecentItemCard({ it, index }: { it: RecentItem; index: number }) {
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        setLiked(readLikedIds().includes(it.id));
    }, [it.id]);

    function handleLike(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const ids = readLikedIds();
        const next = ids.includes(it.id) ? ids.filter(i => i !== it.id) : [...ids, it.id];
        writeLikedIds(next);
        setLiked(next.includes(it.id));
    }

    // 목록 위치 기반 1→10 순환
    const bgClass = getPastelClass(index);

    return (
        <Link
            href={`/items/${it.id}`}
            onClick={() => console.log('[aring]', 'recent:tap', it.id)}
            className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
        >
            <div className={`relative aspect-square overflow-hidden ${bgClass}`}>
                <img
                    src={it.image}
                    alt={`${it.brand} ${it.name}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                        const f = t.nextElementSibling as HTMLElement | null;
                        if (f) f.style.display = 'flex';
                    }}
                />
                <span aria-hidden className="absolute inset-0 hidden items-center justify-center text-[42px] lg:text-[56px]">
                    {it.emoji}
                </span>
            </div>
            <div className="px-3 py-3">
                {/* 브랜드 */}
                <p className="text-[13px] lg:text-[14px] font-bold tracking-wider text-aring-ink-500 truncate">{it.brand}</p>
                {/* 제품 타이틀 */}
                <p className="mt-px text-[15px] lg:text-[16px] font-bold text-aring-ink-900 leading-[1.5] truncate">{it.name}</p>
                {/* 설명/서브 */}
                {it.story && <p className="mt-0.5 text-[13px] lg:text-[14px] font-normal text-aring-ink-500 truncate">{it.story}</p>}
                <div className="mt-1.5 flex items-center justify-between">
                    {/* 가격 */}
                    <span className="text-[15px] lg:text-[16px] font-bold text-aring-ink-900">{formatKRW(it.price)}</span>
                    <div className="flex items-center gap-2">
                        {/* 조회수 — 메타 */}
                        {typeof it.viewCount === 'number' && it.viewCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px] lg:text-[13px] font-normal text-aring-ink-400">
                                <IconEye className="w-3.5 h-3.5" />
                                {it.viewCount}
                            </span>
                        )}
                        {/* 좋아요 */}
                        <button
                            onClick={handleLike}
                            aria-label="찜하기"
                            className={['inline-flex items-center gap-1 text-[12px] lg:text-[13px] font-normal transition', liked ? 'text-aring-accent' : 'text-aring-ink-400'].join(' ')}
                        >
                            <IconHeart className="w-3.5 h-3.5" filled={liked} />
                            {it.likes + (liked ? 1 : 0)}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
