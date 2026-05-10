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
