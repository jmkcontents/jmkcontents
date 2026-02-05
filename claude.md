# Claude Code 사용 가이드

## 개요
Claude Code는 Anthropic의 공식 CLI 도구로, AI와 함께 소프트웨어 개발을 수행할 수 있는 인터랙티브 환경을 제공합니다.

## 주요 기능

### 1. 파일 작업
- 파일 읽기, 편집, 생성
- 코드베이스 탐색 및 검색
- 패턴 기반 파일 검색 (Glob)
- 내용 기반 검색 (Grep)

### 2. 코드 작업
- 버그 수정 및 기능 추가
- 코드 리팩토링
- 코드 설명 및 분석
- 보안 취약점 검토

### 3. Git 통합
- 자동 커밋 생성
- Pull Request 생성
- Git 상태 확인
- 변경사항 추적

### 4. 작업 관리
- Todo 리스트를 통한 작업 추적
- 복잡한 작업의 단계별 분해
- 진행 상황 시각화

## 사용 규칙

### 파일 업데이트 규칙
- claude.md 파일을 업데이트한 후에는 **항상 커밋**합니다
- 변경사항은 명확한 커밋 메시지와 함께 기록합니다

### 코딩 원칙
- 읽지 않은 코드는 수정하지 않습니다
- 과도한 엔지니어링을 피합니다
- 요청된 작업에만 집중합니다
- 보안 취약점을 주의합니다

### 커뮤니케이션
- 간결하고 명확한 응답
- 이모지는 명시적 요청이 있을 때만 사용
- 기술적 정확성 우선

## 도움말
- `/help`: Claude Code 사용법 확인
- 피드백: https://github.com/anthropics/claude-code/issues

## 모범 사례

1. **계획 먼저**: 복잡한 작업은 TodoWrite로 계획 수립
2. **병렬 실행**: 독립적인 작업은 동시에 실행
3. **전문 도구 활용**: 각 작업에 최적화된 도구 사용
4. **메모리 활용**: 이전 경험을 기록하고 재사용

## 파일 참조
코드 참조 시 클릭 가능한 링크 형식 사용:
- 파일: [filename.ts](src/filename.ts)
- 특정 라인: [filename.ts:42](src/filename.ts#L42)
- 라인 범위: [filename.ts:42-51](src/filename.ts#L42-L51)

## 프로젝트 진행 상황

### JMK Contents 웹 플랫폼 (2026-02-05)

#### Phase 1 완료
- ✅ Next.js 15 프로젝트 초기화
- ✅ Supabase 클라이언트 설정 (client.ts, server.ts, types.ts)
- ✅ shadcn/ui 컴포넌트 라이브러리 설치
- ✅ 기본 레이아웃 (Header, Footer)
- ✅ 홈페이지 구현 (Hero, Featured Apps, Features)
- ✅ 법률 페이지 (Privacy, Support, Terms)
- ✅ 추가 페이지 (Contact, About, Apps)
- ✅ 재사용 가능한 컴포넌트 (AppCard)
- ✅ 반응형 디자인 구현
- ✅ 프로덕션 빌드 테스트

#### Phase 2 완료 (2026-02-05)
- ✅ Supabase 데이터베이스 스키마 작성 (SQL migration)
- ✅ 환경 변수 설정 (.env, .env.local)
- ✅ Supabase API 함수 작성 (apps.ts, contact.ts)
- ✅ Admin 클라이언트 생성 (static generation용)
- ✅ 앱 상세 페이지 동적 라우트 구현
- ✅ 홈페이지 Supabase 데이터 연동
- ✅ 앱 목록 페이지 데이터 연동
- ✅ SSG(Static Site Generation) 구현
- ✅ 프로덕션 빌드 성공

#### 다음 단계 (Phase 3)
- Vercel 배포
- Cloudflare DNS 설정
- 앱 개념/강의 페이지 구현
- 이미지 업로드 및 Storage 연동
- 관리자 대시보드 (선택사항)
