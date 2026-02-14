# JMK Contents Web Platform

한국 자격증 시험 준비를 위한 30개 이상의 iOS 앱을 관리하고 홍보하는 웹 플랫폼입니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **DNS**: Cloudflare

## 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 정보 입력
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 프로젝트 구조

```
jmk-contents-web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈페이지
│   ├── apps/              # 앱 목록 및 상세 페이지
│   ├── privacy/           # 개인정보 처리방침
│   ├── support/           # 고객 지원
│   ├── terms/             # 이용약관
│   ├── contact/           # 문의하기
│   └── about/             # 회사 소개
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── Header.tsx        # 헤더
│   ├── Footer.tsx        # 푸터
│   └── AppCard.tsx       # 앱 카드
├── lib/                   # 유틸리티 및 설정
│   └── supabase/         # Supabase 클라이언트
└── public/               # 정적 파일
```

## 주요 기능

- ✅ 반응형 디자인 (모바일 우선)
- ✅ SEO 최적화
- ✅ 다크 모드 지원
- ✅ 접근성 (WCAG 2.1 AA)
- ✅ 법률 페이지 (Privacy, Terms, Support)
- 🚧 Supabase 데이터베이스 연동
- 🚧 관리자 대시보드
- 🚧 분석 통합

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Optional)
CONTACT_EMAIL=bombezzang100@gmail.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 배포
vercel --prod
```

### Cloudflare DNS 설정

Vercel 배포 후, Cloudflare에서 다음 CNAME 레코드를 추가하세요:

```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: Enabled
```

## 개발 로드맵

- [x] Phase 1: MVP 기본 구조
- [ ] Phase 2: 콘텐츠 마이그레이션
- [ ] Phase 3: 기능 개선
- [ ] Phase 4: 유지보수

자세한 내용은 [JMK_CONTENTS_DEVELOPMENT_PLAN.md](../JMK_CONTENTS_DEVELOPMENT_PLAN.md)를 참고하세요.

## 라이선스

© 2026 JMK Contents. All rights reserved.

## 문의

- Email: bombezzang2607@gmail.com
- Website: jmkcontents.com
end