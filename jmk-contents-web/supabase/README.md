# Supabase 설정 가이드

이 가이드는 JMK Contents 프로젝트의 Supabase 설정 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 방문 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Project Name**: jmk-contents
   - **Database Password**: 안전한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) - 한국 사용자에게 최적
4. "Create new project" 클릭 (약 2분 소요)

## 2. API Keys 확인

프로젝트 생성 후:
1. Settings → API 메뉴로 이동
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbG...` (공개 키)
   - **service_role**: `eyJhbG...` (비밀 키 - 절대 공개 X)

## 3. 환경 변수 설정

복사한 값들을 프로젝트의 `.env.local` 파일에 입력:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## 4. 데이터베이스 스키마 생성

### 방법 1: Supabase Dashboard 사용 (권장)

1. Supabase Dashboard에서 **SQL Editor** 메뉴로 이동
2. "New Query" 클릭
3. `migrations/20260205_initial_schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

## 5. Storage Buckets 생성

1. Supabase Dashboard에서 **Storage** 메뉴로 이동
2. 다음 버킷들을 생성:

### app-icons (앱 아이콘)
- **Bucket Name**: `app-icons`
- **Public**: ✅ Yes
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/webp`
- **Max file size**: 1 MB

### lectures (음성 강의)
- **Bucket Name**: `lectures`
- **Public**: ✅ Yes
- **Allowed MIME types**: `audio/mpeg`, `audio/mp4`, `audio/wav`
- **Max file size**: 50 MB

### screenshots (앱 스크린샷)
- **Bucket Name**: `screenshots`
- **Public**: ✅ Yes
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/webp`
- **Max file size**: 5 MB

## 6. Storage Policies 설정

각 버킷에 대해 공개 읽기 정책 추가:

```sql
-- app-icons 버킷
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-icons');

-- lectures 버킷
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'lectures');

-- screenshots 버킷
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');
```

## 7. 데이터 확인

SQL Editor에서 다음 쿼리를 실행하여 샘플 데이터 확인:

```sql
-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 샘플 앱 데이터 확인
SELECT * FROM apps;

-- 앱 개수 확인
SELECT COUNT(*) as total_apps FROM apps;
```

## 8. 로컬 개발 서버 실행

환경 변수 설정 후:

```bash
cd jmk-contents-web
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 앱 목록이 정상적으로 표시되는지 확인

## 9. Row Level Security (RLS) 확인

데이터베이스 보안을 위해 RLS가 활성화되어 있는지 확인:

```sql
-- RLS 상태 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 정책 확인
SELECT * FROM pg_policies;
```

## 10. 트러블슈팅

### 문제: "Invalid API key" 오류
- `.env.local` 파일의 API 키가 올바른지 확인
- 개발 서버 재시작 (`npm run dev` 중단 후 재실행)

### 문제: 데이터가 표시되지 않음
- RLS 정책이 올바르게 설정되었는지 확인
- 앱 status가 'published'인지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 문제: 이미지가 로드되지 않음
- Storage Bucket이 Public으로 설정되었는지 확인
- Storage Policy가 올바르게 적용되었는지 확인
- 이미지 URL이 올바른지 확인

## 추가 리소스

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
