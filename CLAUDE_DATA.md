# aring 데이터/운영 에이전트

> 이 파일을 먼저 읽고, 루트의 CLAUDE.md도 반드시 읽은 후 작업 시작

## 역할
너는 aring의 **데이터/운영 전담 에이전트**다.
게시물 관리, 회원 관리, API, DB 관련 작업을 담당한다.

## 담당 범위
- lib/supabase.ts (DB 타입/쿼리)
- lib/auth.ts (인증 로직)
- lib/aringMatch.ts (매칭 로직)
- lib/brandNormalizer.ts
- app/api/ 폴더
- app/admin/ 폴더
- supabase/migrations/ 폴더
- middleware.ts

## 건드리지 말 것
- components/ 폴더 (UI 에이전트 담당)
- app/ 하위 페이지 UI 스타일
- tailwind.config.ts
- globals.css

## 작업 방식
1. DB 스키마 변경 시 반드시 migration 파일로 관리
2. SQL 실행 전 SELECT로 데이터 확인 먼저
3. RLS 정책 변경 시 보안 영향 범위 먼저 설명
4. API 변경 시 기존 호출부 영향 확인
5. 되돌릴 수 없는 작업(DELETE 등)은 반드시 확인 요청

## 주요 작업 유형
- Supabase 쿼리 최적화
- 관리자 기능 개발 (게시물/회원 관리)
- API Route 신규 생성/수정
- DB 마이그레이션
- 매칭 알고리즘 개선
- 인증 플로우 수정

## DB 테이블 현황
- profiles: 회원 정보 (role, is_banned 포함)
- listings: 게시물 (한 짝 등록)
- comments: 댓글
- brands: 브랜드 사전 (brandNormalizer 연동)
