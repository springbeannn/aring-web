# aring.app — 프로젝트 컨텍스트

## 서비스 정의
aring.app은 잃어버린 귀걸이 한 짝을 AI 이미지 매칭으로 찾아주는 서비스다.
- 핵심 기능: 한 짝 사진 업로드 → 이미지 분석 → 다른 사용자의 한 짝과 매칭
- 부가 가치: 분실물(LOST112) 연동, 비대칭(미스매치) 스타일링 제안
- 주 사용자: 한국어 사용자. UI 언어는 한국어.

## 현재 목표
구글과 네이버에서 색인·검색 노출되도록 SEO를 개선한다.
구글은 JS를 일부 실행하지만 네이버는 거의 실행하지 않으므로,
"JS 없이도 HTML에 핵심 콘텐츠와 메타정보가 보이는 것"이 최우선이다.

## 작업 규칙
- 추측 금지. 항상 파일을 먼저 읽고 사실을 확인한 뒤 수정한다.
- 모든 변경은 빌드로 검증하고, 빌드 산출물 HTML을 grep으로 확인한다.
- 작업 내역은 SEO_LOG.md에 누적 기록한다.
- 비용 발생/되돌리기 어려운 작업(도메인 설정, 외부 서비스 결제,
  git push, 배포)은 실행 전 반드시 사람에게 먼저 확인한다.
- 가짜 메타정보·허위 콘텐츠 생성 금지. 실제 서비스 내용에 기반한다.

## 보고 규칙 (사람에게 결과 알리기 — 중요)
나는 작업 결과를 사람에게 명확히 보고받기를 원한다. 다음 시점마다
채팅창에 한국어로 사람이 읽기 쉬운 보고를 출력해라:
1. 0단계 진단 직후 — "현황 요약" 보고:
   프레임워크, 렌더링 방식, 빌드 HTML이 비어있는지 여부(=검색노출
   가능성), 가장 큰 리스크 1~2개를 5줄 이내로.
2. 각 체크리스트 항목 완료 시 — 한 줄 보고:
   "[x] N번 항목: 무엇을 했고 / 검증 결과 OK인지" 형식으로 짧게.
3. 전체 완료 시 — "종합 보고":
   - 적용한 변경 요약 (항목별 1줄)
   - 검색노출이 실제로 개선됐다고 볼 근거 (빌드 HTML 검증 결과)
   - 사람이 직접 해야 할 일 목록 (단계별, 클릭 위치까지 구체적으로)
   - 다음에 하면 좋을 추천 작업 3가지
보고는 전문용어를 최소화하고, UX/기획 배경의 비개발자도 이해할 수
있게 풀어서 설명해라. 모든 보고는 SEO_LOG.md에도 같은 내용을 남긴다.

## 기술 메모 (Claude가 진단하며 채워넣을 것)
- 프레임워크: Next.js 15 (App Router)
- 렌더링 방식: 혼합 (SSG + 동적 라우트는 SSR/ISR — 0단계에서 라우트별 재검증 예정)
- 빌드 명령: npm run build
- 빌드 산출물 경로: .next/

---

# aring UI/기능 에이전트

> 이 파일을 먼저 읽고, 루트의 CLAUDE.md도 반드시 읽은 후 작업 시작

## 역할
너는 aring의 **UI/기능 전담 에이전트**다.
컴포넌트 개발, 화면 개선, 신규 기능 구현을 담당한다.

## 담당 범위
- components/ 폴더 전체
- app/ 하위 페이지 UI
- Tailwind 스타일링
- Framer Motion 애니메이션
- Zustand 상태관리 (UI 관련)

## 건드리지 말 것
- lib/supabase.ts (DB 스키마/타입)
- lib/auth.ts (인증 로직)
- middleware.ts
- supabase/ 폴더
- app/api/ 폴더

---

## aring 디자인 시스템

### 디자인 원칙
- 모바일 퍼스트, 감성적이고 깔끔한 스타일
- 디자인 토큰 반드시 사용 (하드코딩 절대 금지)
- 외부 디자인 레퍼런스(타 서비스 스타일) 따르지 말 것 — aring 고유 스타일 유지

### 반응형 브레이크포인트
| prefix | 기준 | 설명 |
|--------|------|------|
| (없음) | 0px~ | 모바일 기본 |
| `sm:` | 640px~ | 소형 태블릿 |
| `lg:` | 1024px~ | 데스크탑 |
> `md:` 브레이크포인트는 거의 사용하지 않음. 모바일/데스크탑 2단계 중심.

---

### 버튼

#### Primary (주요 액션)
```
bg-aring-ink-900 text-white rounded-tile py-4 w-full font-bold text-[14px] transition active:scale-95
```

#### Secondary (보조 액션)
```
bg-aring-ink-100 text-aring-ink-900 rounded-tile py-2.5 font-bold text-[13px] transition
```

#### Green CTA
```
bg-aring-green text-white rounded-tile shadow-cta font-bold
```

#### Pill (필터/태그)
```
rounded-pill px-2 py-1 (소형) / px-3.5 py-2 (중형) font-bold text-[11-13px]
```

---

### 입력 필드 (Input)
```
w-full px-4 py-3 rounded-tile border border-aring-ink-200 text-[14px] lg:text-[15px] font-normal bg-transparent focus:border-aring-green placeholder:text-aring-ink-400
```
> outline 없음, focus 시 border-aring-green으로 전환

---

### 카드 (Card)

#### 리스트 카드 (tile)
```
rounded-tile border border-aring-green-line bg-white overflow-hidden
```

#### 섹션 카드 (card)
```
rounded-card border border-aring-green-line bg-white / bg-aring-grad-green shadow-card
```
> rounded-tile = 16px / rounded-card = 22px

---

### 애니메이션
- 라이브러리: Framer Motion
- 기본 transition: `transition` (Tailwind, 150ms ease)
- 버튼 클릭: `active:scale-95`
- 페이지/모달 진입: Framer Motion `AnimatePresence` 사용

---

### 아이콘
- Lucide 또는 커스텀 SVG 사용
- 이모지 활용 사례 있음 (📍 👁 ✉️ 등)

---

### Z-index 레이어
| 값 | 용도 |
|----|------|
| `z-10` | 카드 오버레이, 뱃지 |
| `z-30` | 헤더 |
| `z-[9999]` | 사이드 드로어 메뉴 |

---

### 네이밍 컨벤션
- 컴포넌트 파일: PascalCase (`LoginForm.tsx`)
- 유틸 함수: camelCase (`signUpWithEmail.ts`)
- CSS 토큰: kebab-case (`aring-ink-900`)
- 페이지 라우트: kebab-case (`/signup/email`, `/auth/callback`)

---

## 작업 방식
1. 작업 전 관련 컴포넌트 파일 반드시 읽기
2. 위 디자인 시스템 토큰 준수 (임의 색상/사이즈 사용 금지)
3. 모바일 퍼스트로 작업, PC는 lg: 브레이크포인트로 처리
4. 변경사항 요약 → 코드 작업 순서로 진행
5. 새 컴포넌트 생성 시 components/ 폴더에 위치
6. 한국어로 답변