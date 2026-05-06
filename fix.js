const fs = require('fs');
let c = fs.readFileSync('app/signup/email/page.tsx', 'utf8');

// 1. Image import 추가
c = c.replace(
  "import Link from 'next/link';",
  "import Image from 'next/image';\nimport Link from 'next/link';"
);

// 2. IconCheck className
c = c.replace(
  "className=inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition ${checked ? 'bg-aring-ink-900 border-aring-ink-900' : 'border-aring-ink-300 bg-white'}}",
  "className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition ${checked ? 'bg-aring-ink-900 border-aring-ink-900' : 'border-aring-ink-300 bg-white'}`}"
);

// 3. DupButton className
c = c.replace(
  "className=w-full mt-2 py-2.5 rounded-2xl text-[13px] font-bold transition ${!disabled ? 'bg-aring-ink-900 text-white active:scale-95' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}}",
  "className={`w-full mt-2 py-2.5 rounded-2xl text-[13px] font-bold transition ${!disabled ? 'bg-aring-ink-900 text-white active:scale-95' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}"
);

// 4. 비밀번호 input className (2개)
c = c.replace(/className=\$\{inputBase\} pr-11\}/g,
  'className={`${inputBase} pr-11`}'
);

// 5. pwMatch p className
c = c.replace(
  "className=mt-1.5 text-[11px] ${pwMatch ? 'text-emerald-500' : 'text-rose-400'}}",
  "className={`mt-1.5 text-[11px] ${pwMatch ? 'text-emerald-500' : 'text-rose-400'}`}"
);

// 6. 가입하기 button className
c = c.replace(
  "className=w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${canSubmit && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}}",
  "className={`w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${canSubmit && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}"
);

// 7. SignupLeftPanel + SignupMobileBanner 컴포넌트 삽입 (export default 바로 앞에)
const panels = `
function SignupLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden w-[420px] xl:w-[480px] flex-shrink-0 min-h-full">
      <Image src="/images/signup-model.jpg" alt="aring 귀걸이 모델" fill className="object-cover object-top" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
      <div className="relative z-20 mt-auto px-9 pb-12">
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-white/60 mb-3">버리기엔 아깝고</p>
        <h2 className="text-[22px] font-bold leading-snug text-white mb-3 break-keep">아깝고, 다시 사기엔<br />어려운 귀걸이</h2>
        <p className="text-[13px] leading-relaxed text-white/80 mb-4 break-keep">
          서랍 속에 한 짝만 남겨둔 경험이 있다면<br />
          <span className="text-purple-300 font-semibold">aring</span>에서 다시 찾아보세요
        </p>
        <div className="pl-3 border-l-2 border-purple-400/50 mb-4">
          <p className="text-[12px] leading-loose text-white/60 break-keep">
            aring은 한 짝만 남은 귀걸이를 등록하면<br />
            같거나 비슷한 귀걸이를 찾아볼 수 있도록<br />
            돕는 매칭 서비스입니다<br /><br />
            시간이 조금 걸리더라도<br />
            잃어버린 반쪽을 다시 만나는 경험을<br />
            만들어가고 있습니다
          </p>
        </div>
        <p className="text-[12px] text-purple-300 font-medium break-keep">
          한 짝만 남은 귀걸이가 있다면<br />
          버리지 말고 <span className="text-white font-bold">aring에 등록해보세요</span>
        </p>
      </div>
    </div>
  );
}

function SignupMobileBanner() {
  return (
    <div className="lg:hidden mx-5 mt-4 mb-2 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 border-l-[3px] border-purple-300">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-purple-400 mb-1.5">버리기엔 아깝고</p>
      <p className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5 break-keep">
        아깝고, 다시 사기엔 어려운 귀걸이<br />
        <span className="text-purple-600">aring</span>에서 다시 찾아보세요
      </p>
      <p className="text-[12px] text-gray-500 leading-relaxed break-keep">한 짝만 남은 귀걸이를 등록하면 같거나 비슷한 짝을 찾아드립니다</p>
    </div>
  );
}

`;
c = c.replace('export default function SignupEmailPage()', panels + 'export default function SignupEmailPage()');

// 8. 레이아웃 변경: 기존 form div를 2단 레이아웃으로
c = c.replace(
  '<div className="px-5 pt-4 pb-32 lg:max-w-[480px] lg:mx-auto">',
  `<div className="lg:flex lg:min-h-[calc(100vh-72px)]">
          <SignupLeftPanel />
          <div className="flex-1 flex flex-col lg:overflow-y-auto">
            <SignupMobileBanner />
            <div className="px-5 pt-4 pb-32 lg:pt-12 lg:pb-16 lg:px-14 xl:px-20 lg:max-w-[560px] lg:w-full lg:mx-auto">`
);

// 9. 제목 중앙→좌측 정렬 (데스크탑)
c = c.replace(
  '<div className="mb-7 text-center">',
  '<div className="mb-7 text-center lg:text-left">'
);

// 10. 닫는 태그 추가 (form div 끝 + flex div 2개 닫기)
c = c.replace(
  '</div>\n\n      </div>\n    </main>',
  `</div>
            </div>
          </div>
        </div>

      </div>
    </main>`
);

fs.writeFileSync('app/signup/email/page.tsx', c);
console.log('All done!');
