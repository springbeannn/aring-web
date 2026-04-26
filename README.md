# aring-web

한 짝만 남은 귀걸이를 등록하면, AI가 비슷하거나 정확히 맞는 짝을 찾아 연결해주는 매칭 서비스의 웹 프론트.

## Stack

- **Next.js 14** (App Router · TypeScript)
- **TailwindCSS** (브랜드 토큰: `aring.*`)
- **Supabase** (Database + Storage + 추후 Auth/Realtime)
- **Vercel** (배포 예정)

---

## 🚀 Supabase 연결 셋업 (5분)

### 1) Supabase 프로젝트 생성

[supabase.com](https://supabase.com) → New Project → 이름 `aring` → 리전 `Northeast Asia (Seoul)` → 비밀번호 자동 생성

### 2) URL + anon key 복사

대시보드 → **Settings → API**

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` 에 사용
- `Project API keys → anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 에 사용

### 3) `.env.local` 채우기

```bash
cp .env.local.example .env.local
# 그리고 .env.local 열어서 위에서 복사한 값 붙여넣기
```

### 4) SQL 실행 (스키마 + Storage + RLS 한방에)

대시보드 → **SQL Editor → New query** → 아래 파일 내용 전체 붙여넣고 **Run**

```
/aring/supabase/migrations/001_listings.sql
```

이 SQL이 만드는 것:

| 항목 | 내용 |
|---|---|
| `public.listings` 테이블 | id, photo_url/path, AI 분석(brand/shape/material/detail), 사용자 입력(side/price/story/region), status |
| 인덱스 4개 | created_at desc / brand / side / status |
| RLS 정책 | SELECT·INSERT 누구나 (MVP) / UPDATE·DELETE 본인만 |
| Storage bucket | `listing-photos` (public) |
| Storage RLS | 누구나 업로드/조회 가능 |

### 5) dev 서버 재시작

`.env.local` 변경 사항 반영을 위해 dev 서버 끄고(`Ctrl+C`) 다시 `npm run dev`.

### 6) 확인

- `/register` → 사진 올림 → AI 분석 → 등록 → 자동으로 `/` 홈으로 이동
- 홈의 "최근 등록된 한 짝" 그리드에 본인이 올린 사진이 떠야 정상 ✅

> ⚠️ env 미설정 상태에서도 UI는 mock 데이터로 동작합니다. 등록 시 alert로 안내.

---

## 로컬 실행

```bash
cd aring-web
npm install
npm run dev
```

→ http://localhost:3000

---

## 현재 구현된 화면

| Route | 설명 | 상태 |
|---|---|---|
| `/` | 모바일 홈 (HM01) — 9 섹션 + glassmorphism | ✅ Supabase fetch / mock 폴백 |
| `/register` | 한 짝 등록 (RG01) — 3 step (사진 → AI 분석 → 정보) | ✅ Supabase Storage + DB / mock 폴백 |
| `/discover` | 탐색 (SC01~03) | ⏳ |
| `/chat` | 채팅 (CH01~02) | ⏳ |
| `/my` | 마이 (MY01~04) | ⏳ |

---

## 디자인 시스템 v3 (Soft Pastel + Deep Green Anchor)

### Brand Primary (Deep Green — 단일 앵커, 5곳 이하)

| Token | Hex | 용도 |
|---|---|---|
| `aring.green` | `#2A4A3C` | 로고 / FAB / 활성 탭 |
| `aring.green.deep` | `#1C3328` | Success Story 카드 bg |

### Pastel Palette (썸네일 · 장식 시스템)

| Token | Hex |
|---|---|
| `aring.pastel.pink` | `#FBC8DC` |
| `aring.pastel.peach` | `#FFD9B8` |
| `aring.pastel.butter` | `#FFEFB5` |
| `aring.pastel.mint` | `#C8E6C9` |
| `aring.pastel.sky` | `#C5DDF0` |
| `aring.pastel.sage` | `#D8E5C8` |

### Glassmorphism Utilities (`globals.css`)

`.glass` (white 0.55) / `.glass-strong` (white 0.78) / `.glass-dark` (green 0.55)

### 가독성 룰

- 그린 위 흰 텍스트: 8.9:1 (WCAG AAA)
- Pastel 위 진한 텍스트: `aring.ink.900` (#1E1B2E)

---

## 폴더 구조

```
aring/
├─ aring-web/                          # Next.js 프로젝트
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                      # HM01 — 9 섹션
│  │  ├─ register/page.tsx             # RG01 — 등록 플로우
│  │  └─ globals.css                   # glass + blob 애니메이션
│  ├─ lib/
│  │  ├─ mock.ts                       # mock 데이터 (env 미설정 시 fallback)
│  │  └─ supabase.ts                   # Supabase client + Listing 타입
│  ├─ tailwind.config.ts               # aring.* 토큰
│  └─ .env.local.example
└─ supabase/
   └─ migrations/
      └─ 001_listings.sql              # 스키마 + Storage + RLS
```

---

## 데이터 플로우

```
[사용자] /register
    ↓ 사진 선택 (FileReader → base64 preview + File 객체 보존)
    ↓ "AI 분석 시작"
    ↓ MOCK_ANALYSIS 4-step 진행 (실제 AI는 v0.3에서 연결)
    ↓ "한 짝 등록하기"
    ↓
[Supabase Storage] listing-photos/<timestamp>-<rand>.jpg 업로드
    ↓ getPublicUrl()
    ↓
[Supabase DB] listings INSERT
    ↓
[홈] router.push('/') + refresh
    ↓
[useEffect] supabase.from('listings').select('*').order(created_at desc).limit(8)
    ↓
[UI] "최근 등록된 한 짝" 그리드에 표시
```

---

## 다음 단계 (MVP v0.2 → v1.0)

| 우선 | 작업 |
|---|---|
| ★★★ | AI 매칭 임시 로직 — 같은 brand + 반대 side로 SQL 쿼리 → "오늘의 매칭 후보" 실데이터 |
| ★★★ | Vercel 배포 → 본인 폰 베타 테스트 |
| ★★ | Supabase Auth (Kakao/Email) — anon insert 정책 강화 |
| ★★ | SC01 탐색 화면 (브랜드/사이드 필터) |
| ★★ | CH01 채팅 (Supabase Realtime) |
| ★ | 실제 AI 이미지 분석 — CLIP / OpenAI Vision / 임베딩 기반 유사도 |
