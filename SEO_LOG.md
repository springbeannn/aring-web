# SEO 작업 로그 (aring.app)

> 0단계 진단부터 모든 변경을 시점별로 누적 기록한다.
> 형식: "현황 요약" 또는 "[x] 항목명 — 무엇을 했는지 / 검증 결과 OK인지"

---

## 2026-05-22 — 0단계 진단

### 현황 요약 (5줄)

1. **프레임워크**: Next.js 14.2.5 (App Router) — `npm run build` → `.next/`. 라우트 50개, 빌드 정상.
2. **렌더링 방식**: 거의 모든 페이지가 빌드 시 정적 prerender(`○ Static`) 또는 SSG(`●`). 동적은 `/items/[id]`, `/brands/[brand]`, `/cases`, 일부 API뿐. 즉 **빌드 HTML에 본문이 비어있지 않음** — 검색노출 가능한 상태.
3. **빌드 HTML 검증 결과**: 홈/`/about`/`/lost-found` 등 핵심 페이지의 HTML에 h1·본문·메타·네이버 인증 태그 모두 정상 포함. "귀걸이" 키워드가 페이지당 49~286회 등장.
4. **가장 큰 리스크 ①**: `/discover`, `/popular`, `/products`, `/brands` 4개 페이지가 `'use client'` + 페이지별 `metadata` 미정의 → 모두 동일한 default title("aring — 한 짝의 짝을 찾다")로 색인됨. 검색 결과 변별력 zero.
5. **가장 큰 리스크 ②**: 콘텐츠가 가장 많이 쌓이는 long-tail 동적 라우트 `/items/[id]`, `/brands/[brand]`가 client component이고 `generateMetadata` 미정의 → 개별 아이템/브랜드 페이지의 검색 노출 사실상 불가.

### 기술 메모 확정값

- 프레임워크: **Next.js 14.2.5 (App Router)**
- 렌더링 방식: **혼합** — 대부분 Static(`○`), 일부 SSG(`●`), 동적 라우트(`ƒ`) 소수
- 빌드 명령: `npm run build`
- 빌드 산출물 경로: `.next/` (정적 HTML: `.next/server/app/*.html`)

### 진단 데이터 (요약)

| 페이지 | 렌더 | title (HTML 검증) | h1 | 본문 키워드 수 | metadata export |
|---|---|---|---|---|---|
| `/` | Static | `aring — 한 짝의 짝을 찾다` (default) | "하나만 남은 귀걸이…" | "귀걸이" 49 + "aring" 246 | 없음 (layout fallback) |
| `/discover` | Static | (default) | **없음** | 136 | **없음** |
| `/popular` | Static | (default) | "오늘의 매칭 후보" | 146 | **없음** |
| `/products` | Static | (default) | **없음** | 137 | **없음** |
| `/brands` | Static | (default) | "브랜드별 탐색" | 147 | **없음** |
| `/lost-found` | Static | `분실물 통합 검색 · aring \| aring` | "어딘가 잃어버린 한 짝" | 286 | 있음 ✅ |
| `/about` | Static | `aring 소개 — 한 짝의 짝을 찾다 \| aring` | "한 짝만 남은 귀걸이의…" | 263 | 있음 ✅ |
| `/cases` | Dynamic | (별도 검증 필요) | — | — | 있음 ✅ |
| `/items/[id]` | Dynamic | (default) | — | — | **없음** |
| `/brands/[brand]` | Dynamic | (default) | — | — | **없음** |
| `/cases/[slug]` | SSG | — | — | — | 있음 ✅ |

### SEO 인프라 상태

- ✅ `public/robots.txt`: 주요 검색·AI 봇 명시적 Allow, `/admin`, `/api`, `/auth` Disallow, sitemap 링크
- ✅ `app/sitemap.ts`: 정적 + 동적 라우트(Supabase에서 발생) 자동 포함, 1시간 ISR
- ✅ `app/layout.tsx`: 사이트 전역 OG/Twitter/JSON-LD(Organization, WebSite, Service, FAQPage) 풀세트
- ✅ `app/opengraph-image.tsx`, `app/twitter-image.tsx` 존재
- ✅ Google Search Console 인증: 진행 중(별도 작업)
- ✅ Naver Search Advisor 인증: 메타태그 빌드 HTML에 포함 확인

### 다음 단계 (1단계 후보 — 사용자 승인 후 진행)

1. `/discover`, `/popular`, `/products`, `/brands` 4개 페이지에 페이지별 `metadata` export 추가 (가장 ROI 큰 작업)
2. `/items/[id]`, `/brands/[brand]`에 `generateMetadata` 추가 — long-tail 검색 노출 회복
3. `/discover`, `/products`에 h1 추가

---

## 2026-05-23 — 1단계 작업

### [x] 1번 항목: `/discover` · `/popular` · `/products` · `/brands` 페이지별 metadata 추가 / OK

**무엇을 했는지**
- 4개 페이지 모두 `'use client'` 컴포넌트라 페이지 파일에 직접 metadata export가 불가능 → 같은 폴더에 `layout.tsx`(Server Component)를 새로 만들어 metadata를 export하는 방식 적용.
- 각 페이지의 실제 h1/부제/기능을 코드에서 확인한 뒤, **추측이나 가짜 정보 없이** 실제 콘텐츠에 기반해 페이지별 title/description/canonical/OG/twitter 메타 작성.
- 신규 파일: [app/discover/layout.tsx](app/discover/layout.tsx), [app/popular/layout.tsx](app/popular/layout.tsx), [app/products/layout.tsx](app/products/layout.tsx), [app/brands/layout.tsx](app/brands/layout.tsx)

**검증 결과 (재빌드 후 `.next/server/app/*.html` grep)**

| 페이지 | 최종 title (HTML에서 추출) |
|---|---|
| `/discover` | `탐색 — 모양·소재·브랜드로 한 짝 찾기 \| aring` |
| `/popular`  | `인기 한 짝 — 오늘의 매칭 후보 \| aring` |
| `/products` | `전체 한 짝 — 매칭을 기다리는 귀걸이 \| aring` |
| `/brands`   | `브랜드별 탐색 — 골든듀·스톤헨지·까르띠에 외 \| aring` |

- description, `<link rel="canonical">`, `og:title`/`og:url`, `twitter:title`/`twitter:description` 4개 페이지 모두 HTML 산출물에 정상 포함 확인.
- 빌드 정상(`✓ Compiled successfully`), 50개 라우트 그대로 유지, 4개 페이지 여전히 `○ Static`으로 prerender됨.


---

## 2026-05-31 — STORY 03 "왜 우리는 남은 한 짝을 버리지 못할까" 페이지 신설

### 적용한 변경 (한 줄 요약)

- `app/about/story/cant-throw-away/page.tsx` 신규 생성 — STORY 03 본문 + 인라인 CTA 2개 + Hero CTA 1개. 기존 `StoryLayout` / `StoryPrimitives` 재사용으로 1/2편과 동일한 디자인 시스템(eyebrow · H1 · intro · Section · Para · Pullquote · CTA 슬롯) 유지.
- `lib/stories.ts`: `cant-throw-away` 상태 `coming-soon` → `ready`. 시리즈 네비게이션에서 클릭 가능 상태로 전환.
- 신규 inline CTA 컴포넌트는 페이지 내 로컬 컴포넌트로 추가 (variant: soft / accent). 본문 흐름 사이에 자연스럽게 삽입.

### 검색노출 개선 근거 (빌드 HTML 검증)

- `npm run build` ✓ Compiled successfully. 라우트 표에 `/about/story/cant-throw-away` → `○ Static`(prerender)로 출력 확인.
- `.next/server/app/about/story/cant-throw-away.html` grep 결과:
  - **H1·본문 핵심 문구**: "왜 우리는 남은 한 짝을 버리지 못할까", "소유효과", "자이가르닉 효과", "확장된 자아", "보관은 희망", "미련이 아니라" 전부 HTML에 정적 포함.
  - **타깃 SEO 키워드**: "한쪽만 남은 귀걸이", "남은 한 짝", "잃어버린", "한쪽 귀걸이" HTML에 직접 등장.
  - **CTA 텍스트 4종** ("한 짝 찾으러 가기", "등록된 귀걸이 보기", "내 한 짝 등록하기", "반대쪽 찾으러 가기") 모두 정적 HTML에 포함.
  - **메타 태그**: `<meta name="description">`, `og:title` / `og:description` / `og:url`, `twitter:card="summary_large_image"`, `<link rel="canonical" href="https://aring.app/about/story/cant-throw-away">` 정상 출력.
  - **JSON-LD**: `Article` + `BreadcrumbList` @graph 1개 `<script type="application/ld+json">`로 삽입 확인.
- JS 미실행 환경(네이버 색인 봇 가정)에서도 H1·본문·메타·구조화데이터가 그대로 HTML에 노출됨.

### 사람이 직접 해야 할 일

1. **Google Search Console**: `https://aring.app/about/story/cant-throw-away` URL을 검색창에 입력 → "색인 생성 요청" 클릭. (사이트맵에 자동 포함되려면 다음 배포 후 sitemap.xml에 항목이 들어왔는지 확인)
2. **네이버 서치어드바이저**: 웹마스터도구 → 요청 → 웹페이지 수집 → 위 URL 제출. 같은 화면에서 "단순/모바일 수집" 둘 다 OK.
3. **시리즈 네비 검증**: `/about/story` 와 `/about/story/why-register-first` 두 페이지에서 시리즈 네비 3번째 항목 "한쪽만 남은 귀걸이는 왜 버리지 못할까"가 더 이상 "준비 중"이 아니라 활성 링크로 표시되는지 브라우저에서 한 번 확인.

### 다음에 하면 좋을 추천 작업 3가지

1. **시리즈 후속편 발행 페이스 유지** — `moments-of-loss` / `how-ai-matches` 두 편을 같은 톤·구조로 이어 발행하면 "잃어버린 귀걸이" long-tail 키워드 클러스터가 빠르게 완성됨.
2. **각 스토리에 OG 이미지 개별 지정** — 현재는 사이트 공통 OG. 편당 키 비주얼을 만들어 `openGraph.images`에 지정하면 SNS·검색 카드 CTR이 올라감.
3. **사이트맵의 `<lastmod>` 자동화 점검** — 새 스토리 추가 시 `app/sitemap.xml` (또는 `sitemap.ts`)에 자동 반영되는지 한 번 확인. 누락되면 색인 지연 원인이 됨.
