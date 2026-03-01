# JMK Contents 웹 플랫폼 - 배포 및 운영 가이드

## 프로젝트 개요

한국 자격증 시험 준비 iOS 앱을 홍보하고 관리하는 웹 플랫폼

- **프로덕션 URL**: https://jmkcontents.vercel.app
- **커스텀 도메인**: (설정 완료)
- **기술 스택**: Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, Vercel
- **GitHub 저장소**: https://github.com/jmkcontents/jmkcontents

---
ok!
## 목차

1. [완료된 기능](#완료된-기능)
2. [프로젝트 구조](#프로젝트-구조)
3. [새로운 앱 추가 방법](#새로운-앱-추가-방법)
4. [데이터베이스 관리](#데이터베이스-관리)
5. [배포 프로세스](#배포-프로세스)
6. [환경 변수 설정](#환경-변수-설정)
7. [문제 해결](#문제-해결)

---

## 완료된 기능

### Phase 1 & 2: MVP 완료 (2026-02-05)

✅ **웹사이트 기본 구조**
- 홈페이지 (Hero, Featured Apps, Features)
- 앱 목록 페이지
- 앱 상세 페이지 (동적 라우트)
- 법률 페이지 (Privacy, Terms, Support, Contact, About)
- 반응형 디자인 (모바일/태블릿/데스크톱)

✅ **Supabase 연동**
- PostgreSQL 데이터베이스
- Row Level Security (RLS) 정책
- 4개 테이블: apps, concepts, lectures, contact_submissions
- 실시간 데이터 연동

✅ **최적화**
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- SEO 메타데이터 자동 생성
- 이미지 최적화

✅ **배포 및 인프라**
- Vercel 프로덕션 배포
- GitHub 연동 (자동 배포)
- Cloudflare DNS 설정
- 환경 변수 관리

---

## 프로젝트 구조

```
jmkcontents/
├── jmk-contents-web/           # Next.js 애플리케이션
│   ├── app/                    # App Router
│   │   ├── page.tsx           # 홈페이지
│   │   ├── apps/
│   │   │   ├── page.tsx       # 앱 목록
│   │   │   └── [bundle_id]/
│   │   │       └── page.tsx   # 앱 상세 (동적)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── support/
│   │   └── terms/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── AppCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── api/               # API 함수
│   │   │   ├── apps.ts
│   │   │   └── contact.ts
│   │   └── supabase/          # Supabase 클라이언트
│   │       ├── admin.ts       # Admin 클라이언트 (SSG용)
│   │       ├── server.ts      # Server 클라이언트
│   │       └── types.ts       # 데이터베이스 타입
│   └── supabase/
│       └── migrations/        # 데이터베이스 마이그레이션
├── claude.md                   # 개발 진행 상황
├── JMK_CONTENTS_DEVELOPMENT_PLAN.md
└── DEPLOYMENT_GUIDE.md        # 이 파일

```

---

## 새로운 앱 추가 방법

### 옵션 1: Supabase Dashboard (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: `bzqifzrkikanhvylwfjv`

2. **Table Editor로 이동**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `apps` 테이블 선택

3. **새 앱 추가**
   - "Insert row" 버튼 클릭
   - 다음 정보 입력:

```sql
-- 필수 필드
bundle_id:        'com.jmk.newapp'           -- 앱 번들 ID (고유값)
app_name:         '새로운 앱'                 -- 앱 이름
app_name_full:    '새로운 앱 - 자격증 준비'    -- 전체 이름
status:           'published'                -- 상태 (published/draft)

-- 선택 필드
description:      '앱 설명...'
icon_url:         'https://...'              -- 앱 아이콘 URL
app_store_url:    'https://apps.apple.com/...' -- App Store 링크
categories:       ['교육', '자격증']          -- 카테고리 배열
is_featured:      false                      -- 추천 앱 여부
download_count:   0                          -- 다운로드 수
rating:           4.5                        -- 평점 (0-5)
review_count:     0                          -- 리뷰 수
```

4. **저장 및 확인**
   - "Save" 클릭
   - 웹사이트 방문하여 새 앱이 표시되는지 확인
   - ISR 설정으로 최대 1시간 후 자동 업데이트

### 옵션 2: SQL 쿼리 사용

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
INSERT INTO apps (
  bundle_id,
  app_name,
  app_name_full,
  description,
  icon_url,
  app_store_url,
  categories,
  is_featured,
  status,
  download_count,
  rating,
  review_count
) VALUES (
  'com.jmk.example',
  '예제 앱',
  '예제 앱 - 자격증 시험 준비',
  '이 앱은 자격증 시험을 준비하는 사용자를 위한 앱입니다.',
  'https://example.com/icon.png',
  'https://apps.apple.com/kr/app/example/id123456789',
  ARRAY['교육', '자격증'],
  false,
  'published',
  0,
  0.0,
  0
);
```

### 옵션 3: 프로그래밍 방식 (향후 관리자 대시보드)

Phase 3에서 개발 예정인 관리자 대시보드를 통해 웹 UI에서 직접 관리 가능합니다.

---

## 데이터베이스 관리

### 앱 상태 관리

```sql
-- 앱을 비공개로 변경 (사이트에서 숨김)
UPDATE apps SET status = 'draft' WHERE bundle_id = 'com.jmk.example';

-- 앱을 다시 공개
UPDATE apps SET status = 'published' WHERE bundle_id = 'com.jmk.example';

-- 추천 앱으로 설정
UPDATE apps SET is_featured = true WHERE bundle_id = 'com.jmk.example';

-- 앱 통계 업데이트
UPDATE apps
SET
  download_count = 1000,
  rating = 4.5,
  review_count = 50
WHERE bundle_id = 'com.jmk.example';
```

### 개념(Concepts) 추가

```sql
INSERT INTO concepts (
  app_id,
  category,
  title,
  content,
  importance
) VALUES (
  (SELECT id FROM apps WHERE bundle_id = 'com.jmk.example'),
  '산업안전관리론',
  '위험성 평가',
  '위험성 평가는...',
  'high'
);
```

### 강의(Lectures) 추가

```sql
INSERT INTO lectures (
  app_id,
  category,
  title,
  audio_url,
  transcript,
  duration
) VALUES (
  (SELECT id FROM apps WHERE bundle_id = 'com.jmk.example'),
  '산업안전관리론',
  '위험성 평가 강의',
  'https://storage.supabase.co/...',
  '강의 내용 전문...',
  1800  -- 30분 (초 단위)
);
```

---

## 배포 프로세스

### 자동 배포 (권장)

GitHub에 코드를 푸시하면 Vercel이 자동으로 배포합니다:

```bash
# 변경사항 커밋
git add .
git commit -m "Add new feature"

# GitHub에 푸시 (자동 배포 트리거)
git push origin main
```

### 수동 배포

프로젝트 루트에서 Vercel CLI 사용:

```bash
# 프로덕션 배포
cd /path/to/jmkcontents
vercel --prod
```

### 배포 확인

1. **Vercel 대시보드**에서 배포 상태 확인
2. **Build Logs** 확인하여 에러 없는지 체크
3. 프로덕션 URL 방문하여 정상 작동 확인

---

## 환경 변수 설정

### Vercel 환경 변수 (Production)

다음 환경 변수가 **Production** 환경에 설정되어 있어야 합니다:

```env
# Supabase 공개 키
NEXT_PUBLIC_SUPABASE_URL=https://bzqifzrkikanhvylwfjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase 서비스 롤 키 (서버 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 연락처 이메일
CONTACT_EMAIL=bombezzang2607@gmail.com
```

### 환경 변수 업데이트 방법

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. 변수 편집 또는 추가
3. **Production** 체크박스 선택
4. **Save** 클릭
5. 재배포 (자동 또는 수동)

---

## Vercel 프로젝트 설정

### 중요 설정값

**Settings > General:**
- Project Name: `jmkcontents`

**Settings > Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `jmk-contents-web`
- Build Command: (자동 설정)
- Output Directory: (자동 설정)
- Install Command: (자동 설정)

---

## 문제 해결

### 사이트가 404 에러를 표시하는 경우

1. **Framework Preset 확인**
   - Settings > Build and Deployment
   - Framework Preset이 "Next.js"로 설정되어 있는지 확인

2. **Root Directory 확인**
   - Root Directory가 `jmk-contents-web`로 설정되어 있는지 확인

3. **재배포**
   ```bash
   vercel --prod --force
   ```

### 앱이 표시되지 않는 경우

1. **데이터베이스 확인**
   ```sql
   SELECT * FROM apps WHERE status = 'published';
   ```

2. **환경 변수 확인**
   - Vercel Dashboard에서 Supabase 환경 변수가 Production에 설정되어 있는지 확인

3. **캐시 클리어**
   - ISR로 인해 최대 1시간 동안 이전 데이터가 표시될 수 있음
   - 강제 재배포로 캐시 클리어

### 빌드 실패

1. **Build Logs 확인**
   - Vercel Dashboard > Deployments > 실패한 배포 클릭
   - Build Logs 확인

2. **로컬에서 빌드 테스트**
   ```bash
   cd jmk-contents-web
   npm run build
   ```

---

## 데이터 업데이트 주기

### ISR (Incremental Static Regeneration) 설정

현재 설정된 재검증 시간:

```typescript
// app/page.tsx, app/apps/page.tsx
export const revalidate = 3600 // 1시간마다 재검증
```

- **홈페이지**: 1시간마다 자동 업데이트
- **앱 목록 페이지**: 1시간마다 자동 업데이트
- **앱 상세 페이지**: SSG로 빌드 시 생성, 새 앱 추가 시 재배포 필요

### 즉시 업데이트가 필요한 경우

1. **수동 재배포**
   ```bash
   vercel --prod
   ```

2. **On-Demand Revalidation** (향후 구현 가능)
   - API 엔드포인트를 통한 특정 페이지 재검증

---

## 유지보수 체크리스트

### 일간
- [ ] 사이트 정상 작동 확인
- [ ] 새로운 에러 로그 확인 (Vercel Dashboard)

### 주간
- [ ] 앱 다운로드 수, 평점 업데이트
- [ ] 새로운 앱 추가 (App Store 출시 시)
- [ ] 사용자 문의 확인 및 응답

### 월간
- [ ] 데이터베이스 백업
- [ ] 성능 모니터링 (Core Web Vitals)
- [ ] SEO 순위 확인
- [ ] Supabase 사용량 확인

---

## 향후 개발 계획

### Phase 3: 콘텐츠 및 개선 (예정)

- [ ] 앱 개념 페이지 구현 (`/apps/[bundle_id]/concepts`)
- [ ] 음성 강의 페이지 구현 (`/apps/[bundle_id]/lectures`)
- [ ] 이미지 업로드 및 Supabase Storage 연동
- [ ] 관리자 대시보드 (앱/콘텐츠 관리 UI)
- [ ] 연락 폼 기능 활성화
- [ ] 분석 도구 통합 (Google Analytics)
- [ ] SEO 최적화

---

## 연락처

**개발 관련 문의:**
- Email: bombezzang2607@gmail.com
- GitHub: https://github.com/jmkcontents/jmkcontents

**기술 스택 문서:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## 마지막 업데이트

- **작성일**: 2026-02-05
- **버전**: 1.0.0 (MVP)
- **상태**: 프로덕션 운영 중
