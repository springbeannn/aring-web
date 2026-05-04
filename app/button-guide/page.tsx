'use client';
import { useState } from 'react';

export default function ButtonGuidePage() {
  const [view, setView] = useState<'pc' | 'mobile'>('pc');
  const isMobile = view === 'mobile';

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-[22px] font-extrabold text-aring-ink-900 mb-1">aring Button Guide</h1>
        <p className="text-[13px] text-aring-ink-400 mb-6">7가지 버튼 타입 · PC / MOBILE</p>

        {/* PC / MOBILE 토글 */}
        <div className="inline-flex rounded-pill bg-white border border-aring-green-line p-1 mb-10 gap-1">
          <button
            onClick={() => setView('pc')}
            className={\`rounded-pill px-4 py-1.5 text-[12px] font-bold transition \${
              !isMobile ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-500 hover:bg-aring-ink-100'
            }\`}
          >PC</button>
          <button
            onClick={() => setView('mobile')}
            className={\`rounded-pill px-4 py-1.5 text-[12px] font-bold transition \${
              isMobile ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-500 hover:bg-aring-ink-100'
            }\`}
          >MOBILE</button>
        </div>

        <div className="flex flex-col gap-10">

          {/* 1. CTA Primary */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 1</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">CTA Primary</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">주요 액션 버튼 · 검정 filled pill</p>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-start gap-2">
                <a href="#" className={\`inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-95 transition \${isMobile ? 'px-3 py-2 text-[12px]' : 'px-4 py-2.5 text-[13px]'}\`}>
                  + 한 짝 등록
                </a>
                <span className="text-[10px] text-aring-ink-300">nav</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <a href="#" className={\`inline-flex items-center gap-2 rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-[0.98] transition \${isMobile ? 'px-4 py-2.5 text-[13px]' : 'px-7 py-3.5 text-[14px]'}\`}>
                  등록하기 →
                </a>
                <span className="text-[10px] text-aring-ink-300">hero</span>
              </div>
              <div className="flex flex-col items-start gap-2 w-full max-w-[280px]">
                <button className={\`w-full rounded-pill bg-aring-ink-900 text-white font-extrabold shadow-cta active:scale-[0.99] transition \${isMobile ? 'py-3 text-[13px]' : 'py-3.5 text-[14px]'}\`}>
                  다음 단계로
                </button>
                <span className="text-[10px] text-aring-ink-300">full-width submit</span>
              </div>
              <div className="flex flex-col items-start gap-2 w-full max-w-[280px]">
                <button disabled className={\`w-full rounded-pill bg-aring-ink-300 text-white font-extrabold cursor-not-allowed \${isMobile ? 'py-3 text-[13px]' : 'py-3.5 text-[14px]'}\`}>
                  사진을 먼저 올려주세요
                </button>
                <span className="text-[10px] text-aring-ink-300">disabled</span>
              </div>
            </div>
          </section>

          {/* 2. CTA Secondary */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 2</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">CTA Secondary</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">히어로 full-width · rounded-full</p>
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <a href="#" className={\`w-full flex items-center justify-center gap-1.5 bg-aring-ink-900 text-white rounded-full font-semibold hover:opacity-90 transition \${isMobile ? 'py-3 text-[13px]' : 'py-[14px] text-[14px]'}\`}>
                등록하기 →
              </a>
              <span className="text-[10px] text-aring-ink-300">full-width · rounded-full</span>
            </div>
          </section>

          {/* 3. Chip / Filter */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 3</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">Chip / Filter</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">브랜드·필터·정렬 선택 칩</p>
            <div className="flex flex-wrap gap-2">
              {['전체 24', 'TIFFANY & CO. 11', 'Swarovski 3', 'Didier Dubot 3', '기타 2'].map((label, i) => (
                <button key={label} className={\`rounded-pill font-bold transition active:scale-95 \${isMobile ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-[13px]'} \${i === 0 ? 'bg-aring-ink-900 text-white border border-transparent' : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300'}\`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

          {/* 4. Icon Button Solid */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 4</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">Icon Button · Solid</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">고정 배경 원형 아이콘 버튼</p>
            <div className="flex items-center gap-4">
              {[
                { label: '프로필', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
                { label: '뒤로가기', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> },
                { label: '닫기', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg> },
              ].map(({ label, icon }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <button className={\`rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition \${isMobile ? 'w-9 h-9' : 'w-10 h-10'}\`}>{icon}</button>
                  <span className="text-[10px] text-aring-ink-300">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Icon Button Hover */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 5</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">Icon Button · Hover</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">hover 시 배경 생기는 원형 버튼</p>
            <div className="flex items-center gap-4">
              {[
                { label: '메뉴', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg> },
                { label: '검색', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg> },
              ].map(({ label, icon }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <button className={\`rounded-full bg-[rgb(243,243,245)] flex items-center justify-center text-aring-ink-900 hover:bg-aring-ink-100 transition \${isMobile ? 'w-9 h-9' : 'w-10 h-10'}\`}>{icon}</button>
                  <span className="text-[10px] text-aring-ink-300">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Text Link */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 6</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">Text Link Button</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">상단 네비 탭</p>
            <div className="flex flex-wrap gap-1">
              {['홈', '탐색', '등록', '댓글', 'MY'].map((label, i) => (
                <a key={label} href="#" className={\`rounded-pill font-semibold text-aring-ink-700 hover:bg-aring-ink-100 transition \${isMobile ? 'px-2.5 py-1.5 text-[12px]' : 'px-3.5 py-2 text-[13px]'} \${i === 0 ? 'bg-aring-ink-100 font-extrabold' : ''}\`}>
                  {label}
                </a>
              ))}
            </div>
            <p className="text-[10px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

          {/* 7. Material Color Chip */}
          <section className="bg-white rounded-[20px] p-7 shadow-sm">
            <p className="text-[11px] font-extrabold tracking-widest text-aring-ink-400 uppercase mb-1">Type 7</p>
            <h2 className="text-[15px] font-extrabold text-aring-ink-900 mb-1">Material Color Chip</h2>
            <p className="text-[12px] text-aring-ink-400 mb-6">탐색 소재 필터 · 원형 컬러 + 라벨</p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: '전체', color: 'bg-white border-2 border-aring-green-line', active: true },
                { label: '골드', color: 'bg-[#D4AF5A]' },
                { label: '실버', color: 'bg-[#C0C0C0]' },
                { label: '로즈골드', color: 'bg-[#E8A598]' },
                { label: '진주', color: 'bg-[#F0EBE0] border border-aring-green-line' },
                { label: '크리스탈', color: 'bg-[#C8DCF0]' },
              ].map(({ label, color, active }) => (
                <button key={label} className="flex flex-col items-center gap-1.5 transition active:scale-95">
                  <div className={\`rounded-full \${color} \${isMobile ? 'w-9 h-9' : 'w-10 h-10'} \${active ? 'ring-2 ring-aring-ink-900 ring-offset-2' : ''}\`} />
                  <span className={\`font-medium text-aring-ink-700 \${isMobile ? 'text-[10px]' : 'text-[11px]'}\`}>{label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-aring-ink-300 mt-3">첫 번째 = active 상태</p>
          </section>

        </div>
      </div>
    </div>
  );
}
