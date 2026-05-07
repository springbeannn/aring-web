'use client';
import { useState } from 'react';

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export default function ButtonGuidePage() {
  const [view, setView] = useState<'pc' | 'mobile'>('pc');
  const isMobile = view === 'mobile';
  const chipSize = isMobile ? 'px-2 py-1 text-[13px]' : 'px-3 py-1.5 text-[13px]';
  const iconSize = isMobile ? 'w-9 h-9' : 'w-10 h-10';
  const navTabSize = isMobile ? 'px-2.5 py-1.5 text-[12px]' : 'px-3.5 py-2 text-[13px]';

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 lg:p-10">
      <div className="max-w-[860px] mx-auto">
        <h1 className="text-[22px] font-extrabold text-aring-ink-900 mb-1">aring Button Guide</h1>
        <p className="text-[13px] text-aring-ink-400 mb-6">7가지 버튼 타입 · PC / MOBILE</p>
        <div className="inline-flex rounded-pill bg-white border border-aring-green-line p-1 mb-10 gap-1">
          <button onClick={() => setView('pc')} className={cx('rounded-pill px-5 py-1.5 text-[12px] font-bold transition', !isMobile ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-500 hover:bg-aring-ink-100')}>PC</button>
          <button onClick={() => setView('mobile')} className={cx('rounded-pill px-5 py-1.5 text-[12px] font-bold transition', isMobile ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-500 hover:bg-aring-ink-100')}>MOBILE</button>
        </div>
        <div className="flex flex-col gap-8">

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 1</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">CTA Primary</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">주요 액션 · 검정 filled pill</p>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-start gap-2">
                <a href="#" className={cx('inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-95 transition', isMobile ? 'px-3 py-2 text-[12px]' : 'px-4 py-2.5 text-[13px]')}>+ 한 짝 등록</a>
                <span className="text-[12px] text-aring-ink-300">nav</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <a href="#" className={cx('inline-flex items-center gap-2 rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-[0.98] transition', isMobile ? 'px-4 py-2.5 text-[13px]' : 'px-7 py-3.5 text-[14px]')}>등록하기 →</a>
                <span className="text-[12px] text-aring-ink-300">hero</span>
              </div>
              <div className="flex flex-col items-start gap-2 w-full max-w-[260px]">
                <button className={cx('w-full rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-[0.99] transition', isMobile ? 'py-3 text-[13px]' : 'py-3.5 text-[14px]')}>다음 단계로</button>
                <span className="text-[12px] text-aring-ink-300">full-width submit</span>
              </div>
              <div className="flex flex-col items-start gap-2 w-full max-w-[260px]">
                <button disabled className={cx('w-full rounded-pill bg-aring-ink-300 text-white font-extrabold cursor-not-allowed', isMobile ? 'py-3 text-[13px]' : 'py-3.5 text-[14px]')}>사진을 먼저 올려주세요</button>
                <span className="text-[12px] text-aring-ink-300">disabled</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 2</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">CTA Secondary</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">full-width rounded-full · 히어로 모바일</p>
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              <a href="#" className={cx('w-full flex items-center justify-center gap-1.5 bg-aring-ink-900 text-white rounded-full font-semibold hover:opacity-90 transition', isMobile ? 'py-3 text-[13px]' : 'py-[14px] text-[14px]')}>등록하기 →</a>
              <span className="text-[12px] text-aring-ink-300">full-width · rounded-full</span>
            </div>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 3</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">Chip / Filter</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">브랜드 · 필터 · 정렬 선택 칩</p>
            <div className="flex flex-wrap gap-2">
              {(['전체 24', 'TIFFANY & CO. 11', 'Swarovski 3', 'Didier Dubot 3', '기타 2'] as string[]).map((label, i) => (
                <button key={label} className={cx(chipSize, 'rounded-pill font-bold transition active:scale-95', i === 0 ? 'bg-aring-ink-900 text-white border border-transparent' : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300')}>{label}</button>
              ))}
            </div>
            <p className="text-[12px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 4</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">Icon Button · Solid</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">고정 배경 원형 · 프로필 / 뒤로가기 / 닫기</p>
            <div className="flex items-center gap-5">
              {([['프로필', 'M12 12c2.7 0 4-1.8 4-4s-1.3-4-4-4-4 1.8-4 4 1.3 4 4 4zm0 2c-4.4 0-8 2.7-8 6h16c0-3.3-3.6-6-8-6z'], ['뒤로', 'M19 12H5m7-7-7 7 7 7'], ['닫기', 'M18 6 6 18M6 6l12 12']] as [string,string][]).map(([label, d]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <button className={cx(iconSize, 'rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d}/></svg></button>
                  <span className="text-[12px] text-aring-ink-300">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 5</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">Icon Button · Hover</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">hover 시 배경 생기는 원형 · 메뉴 / 검색</p>
            <div className="flex items-center gap-5">
              {([['메뉴', 'M4 6h16M4 12h16M4 18h16'], ['검색', 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z']] as [string,string][]).map(([label, d]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <button className={cx(iconSize, 'rounded-full bg-[rgb(243,243,245)] flex items-center justify-center text-aring-ink-900 hover:bg-aring-ink-100 transition')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d}/></svg></button>
                  <span className="text-[12px] text-aring-ink-300">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 6</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">Text Link Button</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">상단 네비 탭 · hover 배경</p>
            <div className="flex flex-wrap gap-1">
              {(['홈', '탐색', '등록', '댓글', 'MY'] as string[]).map((label, i) => (
                <a key={label} href="#" className={cx(navTabSize, 'rounded-pill font-semibold text-aring-ink-700 hover:bg-aring-ink-100 transition', i === 0 ? 'bg-aring-ink-100 font-extrabold' : '')}>{label}</a>
              ))}
            </div>
            <p className="text-[12px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[12px] font-extrabold tracking-widest text-aring-ink-300 uppercase mb-1">Type 7</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-0.5">Material Color Chip</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">탐색 소재 필터 · 원형 컬러 + 라벨</p>
            <div className="flex flex-wrap gap-5">
              {([
                { label: '전체', color: 'bg-white border-2 border-aring-green-line', active: true },
                { label: '골드', color: 'bg-[#D4AF5A]', active: false },
                { label: '실버', color: 'bg-[#C0C0C0]', active: false },
                { label: '로즈골드', color: 'bg-[#E8A598]', active: false },
                { label: '진주', color: 'bg-[#F0EBE0] border border-aring-green-line', active: false },
                { label: '크리스탈', color: 'bg-[#C8DCF0]', active: false },
              ] as {label:string;color:string;active:boolean}[]).map(({ label, color, active }) => (
                <button key={label} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
                  <div className={cx(iconSize, 'rounded-full', color, active ? 'ring-2 ring-aring-ink-900 ring-offset-2' : '')} />
                  <span className={cx('font-medium text-aring-ink-700', isMobile ? 'text-[12px]' : 'text-[13px]')}>{label}</span>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

        </div>
      </div>
    </div>
  );
}