# jmkcontents 웹 프로젝트 업데이트 계획

> 작성일: 2026-02-07
> 대상: jmkcontents 웹 프로젝트 + exam_pipeline Firebase 업로더

---

## 현재 상태 요약

| 항목 | 상태 |
|------|------|
| Firebase 프로젝트 | `exam-affiliate-ads` (양쪽 일치) |
| `apps` 컬렉션 | 업로드 O, 웹 표시 △ (일부 필드 미사용) |
| `concepts` 컬렉션 | 업로드 O, 웹 표시 O |
| `lectures` 컬렉션 | 업로드 X (스킵), 웹 페이지 있으나 빈 상태 |
| 관리자 패널 | CRUD 일부만 동작 |

---

## HIGH PRIORITY

### H1. App Store URL 워크플로우 수정

**문제**: `firebase_uploader.py`가 `app_store_url: ''` (빈 문자열)로 업로드 → 웹의 다운로드 버튼이 항상 비활성

**영향 파일:**
- `exam_pipeline/deployer/firebase_uploader.py` (업로더)
- `exam_pipeline/deployer/__init__.py` (배포 파이프라인)
- `jmkcontents/app/apps/[bundle_id]/page.tsx` (앱 상세 페이지)

**수정 방안:**

#### A. 파이프라인 측 (exam_pipeline)

`deployer/__init__.py`의 `deploy_to_app_store()` 함수에서 배포 완료 후 Firebase의 `app_store_url`을 업데이트:

```python
# deployer/__init__.py - deploy_to_app_store() 끝부분에 추가

# 5. App Store URL을 Firebase에 업데이트
if app_store_id:
    app_store_url = f"https://apps.apple.com/app/id{app_store_id}"
    _update_firebase_app_store_url(bundle_id, app_store_url)
```

새 함수 추가:
```python
def _update_firebase_app_store_url(bundle_id: str, app_store_url: str) -> bool:
    """Firebase의 앱 문서에 App Store URL을 업데이트합니다."""
    try:
        import firebase_admin
        from firebase_admin import firestore

        if not firebase_admin._apps:
            # 초기화 필요
            return False

        db = firestore.client()
        db.collection('apps').document(bundle_id).update({
            'app_store_url': app_store_url,
            'updated_at': firestore.SERVER_TIMESTAMP,
        })
        print(f"[Deploy] Firebase app_store_url 업데이트: {app_store_url}")
        return True
    except Exception as e:
        print(f"[Deploy] Firebase 업데이트 실패: {e}")
        return False
```

#### B. 웹 측 (jmkcontents)

`app/apps/[bundle_id]/page.tsx`에서 `app_store_url`이 비어있을 때 폴백 처리:

```tsx
// 현재: app_store_url이 비어있으면 버튼 미표시 또는 깨진 링크
// 수정: bundle_id 기반 검색 링크로 폴백
const appStoreUrl = app.app_store_url
  || `https://apps.apple.com/search?term=${encodeURIComponent(app.app_name)}`;
```

#### C. firebase_uploader.py 수정

`app_store_url` 필드를 업로드 시 App Store ID가 이미 있으면 URL 생성:

```python
# firebase_uploader.py - app_data에서
'app_store_url': f"https://apps.apple.com/app/id{app_store_id}" if app_store_id else '',
```

이를 위해 `upload_to_firebase()` 함수에 `app_store_id` 파라미터 추가:

```python
def upload_to_firebase(
    bundle_id: str,
    app_name: str,
    app_name_korean: str,
    # ... 기존 파라미터 ...
    app_store_id: Optional[str] = None,   # 추가
) -> bool:
```

---

### H2. `app_category` 필드 활용 (필터링 + 표시)

**문제**: 파이프라인이 `app_category` (기능사/산업기사/기사/컴퓨터자격증/기타전문자격증)를 업로드하지만, 웹에서 전혀 사용하지 않음

**영향 파일:**
- `jmkcontents/lib/firebase/types.ts` (타입에 추가)
- `jmkcontents/lib/firebase/apps.ts` (카테고리별 조회 함수)
- `jmkcontents/app/apps/page.tsx` (앱 목록 - 필터 UI)
- `jmkcontents/components/AppCard.tsx` (카테고리 배지)
- `jmkcontents/app/page.tsx` (홈페이지 - 카테고리별 섹션)

**수정 방안:**

#### A. 타입 정의 업데이트

```typescript
// lib/firebase/types.ts - App 인터페이스에 추가
interface App {
  // ... 기존 필드 ...
  app_category?: '기능사' | '산업기사' | '기사' | '컴퓨터자격증' | '기타전문자격증';
}
```

#### B. 앱 목록 필터 추가

```typescript
// lib/firebase/apps.ts - 새 함수
export async function getAppsByAppCategory(appCategory: string): Promise<App[]> {
  const db = getFirestoreDb();
  const snapshot = await db.collection('apps')
    .where('status', '==', 'published')
    .where('app_category', '==', appCategory)
    .orderBy('created_at', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ ...doc.data(), bundle_id: doc.id } as App));
}
```

#### C. 앱 목록 페이지에 필터 탭 추가

`app/apps/page.tsx`에 카테고리 필터 탭:
```
[전체] [기능사] [산업기사] [기사] [컴퓨터자격증] [기타전문자격증]
```

#### D. AppCard에 카테고리 배지

```tsx
// components/AppCard.tsx
{app.app_category && (
  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
    {app.app_category}
  </span>
)}
```

#### E. 홈페이지 카테고리별 섹션

```tsx
// app/page.tsx - 카테고리별 앱 그룹핑
const categories = ['기능사', '산업기사', '기사', '컴퓨터자격증'];
// 각 카테고리별로 앱 3개씩 표시
```

---

### H3. Lectures 데이터 업로드 구현

**문제**: `firebase_uploader.py`에서 Lectures를 스킵 → 웹의 강의 페이지가 항상 비어있음

**영향 파일:**
- `exam_pipeline/deployer/firebase_uploader.py` (업로더에 강의 업로드 추가)
- `exam_pipeline/audio/question_tts.py` (TTS 오디오 파일 정보)

**수정 방안:**

#### 옵션 1: TTS 오디오 기반 Lectures 생성

파이프라인이 이미 TTS로 오디오를 생성하므로, 이를 Firebase Storage에 업로드하고 lectures 컬렉션에 추가:

```python
# firebase_uploader.py - _upload_lectures() 함수 추가
def _upload_lectures(db, bundle_id: str, audio_dir: Path, questions_db_path: Path) -> int:
    """TTS 오디오를 Firebase Storage에 업로드하고 lectures 컬렉션에 기록"""
    from firebase_admin import storage, firestore as fs

    bucket = storage.bucket('exam-affiliate-ads.appspot.com')

    # questions.db에서 카테고리별 문제 정보 조회
    conn = sqlite3.connect(str(questions_db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT Category FROM questions ORDER BY Category")
    categories = [row[0] for row in cursor.fetchall()]

    batch = db.batch()
    count = 0

    for category in categories:
        # 카테고리별 오디오 파일 찾기
        audio_files = sorted(audio_dir.glob(f"*{category}*"))

        for audio_file in audio_files:
            # Firebase Storage 업로드
            blob = bucket.blob(f"lectures/{bundle_id}/{audio_file.name}")
            blob.upload_from_filename(str(audio_file))
            blob.make_public()
            audio_url = blob.public_url

            lecture_id = f"{bundle_id}_lecture_{count}"
            lecture_ref = db.collection('lectures').document(lecture_id)

            lecture_data = {
                'id': lecture_id,
                'app_id': bundle_id,
                'category': category,
                'title': f"{category} 음성 강의",
                'description': f"{category} 과목의 주요 문제와 해설을 음성으로 학습합니다.",
                'audio_url': audio_url,
                'duration_seconds': _get_audio_duration(audio_file),
                'transcript': '',  # 향후 추가 가능
                'created_at': fs.SERVER_TIMESTAMP,
                'updated_at': fs.SERVER_TIMESTAMP,
            }

            batch.set(lecture_ref, lecture_data)
            count += 1

            if count % 500 == 0:
                batch.commit()
                batch = db.batch()

    if count % 500 != 0:
        batch.commit()

    conn.close()
    return count
```

#### 옵션 2: Lectures 페이지 비활성화 (임시)

웹에서 lectures 링크를 숨기고 "준비 중" 표시:
```tsx
// app/apps/[bundle_id]/page.tsx
// 강의 링크를 조건부로 표시
{lectures.length > 0 && <Link href={`/apps/${bundle_id}/lectures`}>강의</Link>}
```

**권장**: 옵션 2로 임시 처리 후, 오디오 파이프라인이 안정되면 옵션 1 적용

---

## MEDIUM PRIORITY

### M1. 앱 수정 페이지 구현

**문제**: `/admin/apps/[bundle_id]/edit` 라우트가 스텁 상태

**영향 파일:**
- `jmkcontents/app/admin/apps/[bundle_id]/edit/page.tsx` (신규 또는 수정)

**수정 방안:**

`/admin/apps/new/page.tsx`의 폼을 재사용하되, 기존 데이터를 프리필:

```tsx
// app/admin/apps/[bundle_id]/edit/page.tsx
export default async function EditAppPage({ params }: { params: { bundle_id: string } }) {
  const app = await getAppByBundleId(params.bundle_id);
  if (!app) notFound();

  return <AppForm mode="edit" initialData={app} />;
}
```

공통 `AppForm` 컴포넌트로 리팩토링:
- mode: 'create' | 'edit'
- create: `createApp()` 서버 액션 호출
- edit: `updateApp()` 서버 액션 호출
- edit 시 `bundle_id` 필드 비활성화 (변경 불가)

---

### M2. 앱 삭제 시 연쇄 삭제

**문제**: 앱 삭제 시 관련 `concepts`, `lectures` 문서가 남아있음

**영향 파일:**
- `jmkcontents/app/actions/apps.ts` (deleteApp 함수)

**수정 방안:**

```typescript
// app/actions/apps.ts - deleteApp() 수정
export async function deleteApp(bundleId: string) {
  const db = getFirestoreDb();

  // 1. 관련 concepts 삭제
  const conceptsSnapshot = await db.collection('concepts')
    .where('app_id', '==', bundleId)
    .get();

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of conceptsSnapshot.docs) {
    batch.delete(doc.ref);
    batchCount++;
    if (batchCount >= 500) {
      await batch.commit();
      batch = db.batch();  // 새 배치
      batchCount = 0;
    }
  }

  // 2. 관련 lectures 삭제
  const lecturesSnapshot = await db.collection('lectures')
    .where('app_id', '==', bundleId)
    .get();

  for (const doc of lecturesSnapshot.docs) {
    batch.delete(doc.ref);
    batchCount++;
    if (batchCount >= 500) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  // 3. 앱 문서 삭제
  batch.delete(db.collection('apps').document(bundleId));
  await batch.commit();
}
```

**주의**: Firestore batch는 최대 500개 문서. 대량 삭제 시 루프 필요.

---

### M3. `description_full` 필드 활용 또는 제거

**문제**: 관리자 입력 폼에 `description_full` 필드가 있지만, 공개 페이지에서 표시하지 않음

**영향 파일:**
- `jmkcontents/app/apps/[bundle_id]/page.tsx` (앱 상세)

**수정 방안 (표시하기):**

```tsx
// app/apps/[bundle_id]/page.tsx - description 아래에 추가
{app.description_full && (
  <div className="mt-4 text-gray-700 whitespace-pre-line">
    {app.description_full}
  </div>
)}
```

**대안 (제거):** 관리자 폼에서 `description_full` 입력 필드 제거.
→ 권장: 표시하기 (이미 입력 UI가 있으므로)

---

### M4. Static Params 재활성화 (SEO)

**문제**: `generateStaticParams`가 비활성화되어 있어 SEO 최적화 불가

**영향 파일:**
- `jmkcontents/app/apps/[bundle_id]/page.tsx`
- `jmkcontents/app/apps/[bundle_id]/concepts/page.tsx`
- `jmkcontents/app/apps/[bundle_id]/lectures/page.tsx`

**수정 방안:**

```tsx
// app/apps/[bundle_id]/page.tsx
export async function generateStaticParams() {
  const apps = await getApps();
  return apps.map(app => ({ bundle_id: app.bundle_id }));
}

export const revalidate = 3600; // 1시간
```

각 동적 라우트에 동일 패턴 적용. 빌드 시 정적 페이지 생성 → 검색엔진 크롤링 가능.

---

### M5. Concepts/Lectures CRUD 구현

**문제**: 관리자 패널에서 Concepts/Lectures를 조회만 가능, 추가/수정/삭제 불가 ("준비 중" 버튼)

**영향 파일:**
- `jmkcontents/app/admin/concepts/page.tsx`
- `jmkcontents/app/actions/concepts.ts` (신규)
- `jmkcontents/app/admin/lectures/page.tsx`
- `jmkcontents/app/actions/lectures.ts` (신규)

**수정 방안:**

#### Concepts CRUD

```typescript
// app/actions/concepts.ts (신규)
'use server'

export async function createConcept(data: ConceptFormData) { ... }
export async function updateConcept(id: string, data: Partial<ConceptFormData>) { ... }
export async function deleteConcept(id: string) { ... }
```

#### 관리자 페이지 업데이트

```tsx
// app/admin/concepts/page.tsx
// "준비 중" 버튼을 실제 기능으로 교체:
// - "개념 추가" → /admin/concepts/new
// - 각 항목에 "수정" / "삭제" 버튼
```

**우선순위 참고**: 대부분의 Concepts는 파이프라인에서 자동 생성되므로,
웹 CRUD는 "오타 수정" 등 소규모 편집용. 전체 재생성은 파이프라인 재실행이 더 효율적.

---

## LOW PRIORITY

### L1. `marketing_url` 활용

**문제**: 파이프라인이 `https://jmkcontents.com/apps/{bundle_id}` URL을 업로드하지만 웹에서 사용하지 않음

**영향 파일:**
- `jmkcontents/app/apps/[bundle_id]/page.tsx` (공유 버튼)
- `jmkcontents/components/AppCard.tsx` (공유 링크)

**수정 방안:**

앱 상세 페이지에 "공유하기" 버튼 추가:

```tsx
// app/apps/[bundle_id]/page.tsx
<button onClick={() => {
  navigator.clipboard.writeText(app.marketing_url || window.location.href);
  // 토스트 알림: "링크가 복사되었습니다"
}}>
  공유하기
</button>
```

OG 메타 태그에도 활용:
```tsx
// app/apps/[bundle_id]/page.tsx
export async function generateMetadata({ params }) {
  const app = await getAppByBundleId(params.bundle_id);
  return {
    title: app.app_name,
    description: app.description,
    openGraph: {
      url: app.marketing_url,
      title: app.app_name_full || app.app_name,
      description: app.description,
      images: app.icon_url ? [app.icon_url] : [],
    },
  };
}
```

---

### L2. `related_question_ids` 실제 연결

**문제**: Concept 상세 모달에 "관련 문제가 있습니다" 플레이스홀더만 표시

**영향 파일:**
- `jmkcontents/components/ConceptDetailModal.tsx`

**수정 방안:**

현재 웹에 questions 데이터가 없으므로 두 가지 선택지:

#### 옵션 A: 앱으로 딥링크 (권장)
```tsx
{concept.related_question_ids?.length > 0 && (
  <p className="text-sm text-gray-500">
    관련 문제 {concept.related_question_ids.length}개가 앱에서 제공됩니다.
  </p>
)}
```

#### 옵션 B: questions 컬렉션 추가 (대규모 작업)
- `firebase_uploader.py`에서 questions 데이터도 업로드
- 웹에서 문제 조회 + 표시
- 데이터량이 많아 비용 고려 필요 (문제당 5지선다 + 해설)

**권장**: 옵션 A (앱 유도 목적에도 부합)

---

### L3. `review_count` / `rating` 실시간 업데이트

**문제**: 항상 0으로 업로드 → 웹에서 리뷰 수가 절대 표시되지 않음

**영향 파일:**
- `exam_pipeline/deployer/firebase_uploader.py` (업로드 시)
- (선택) 별도 스크립트로 주기적 업데이트

**수정 방안:**

#### 옵션 A: App Store Connect API로 주기적 조회
별도 cron 스크립트:
```python
# scripts/update_app_ratings.py
# App Store Connect API에서 평점/리뷰 수 조회 → Firebase 업데이트
def update_ratings():
    registrar = AppRegistrar()
    db = firestore.client()

    apps = db.collection('apps').get()
    for app_doc in apps:
        bundle_id = app_doc.id
        full_bundle_id = f"com.example.{bundle_id}"

        # App Store Connect API로 평점 조회
        rating_data = registrar.get_app_rating(full_bundle_id)
        if rating_data:
            db.collection('apps').document(bundle_id).update({
                'rating': rating_data['average_rating'],
                'review_count': rating_data['review_count'],
                'updated_at': firestore.SERVER_TIMESTAMP,
            })
```

#### 옵션 B: 수동 업데이트
관리자 패널에서 수동 입력 (현재 admin 폼에 이미 rating/download_count 필드 있음)

**권장**: 앱이 소수일 때는 옵션 B, 10개 이상이면 옵션 A

---

## 구현 순서 (권장)

### Phase 1: 핵심 데이터 흐름 수정 (1일)
1. **H1** - App Store URL 워크플로우
   - `firebase_uploader.py`에 `app_store_id` 파라미터 추가
   - `deploy_to_app_store()` 완료 후 Firebase URL 업데이트
   - 웹에서 폴백 URL 처리

2. **H2** - `app_category` 활용
   - 타입 정의 업데이트
   - 앱 목록 필터 탭 추가
   - AppCard에 카테고리 배지

### Phase 2: 관리자 기능 보완 (1일)
3. **M1** - 앱 수정 페이지
4. **M2** - 연쇄 삭제
5. **M3** - `description_full` 표시

### Phase 3: SEO + 콘텐츠 (1일)
6. **M4** - Static Params 활성화
7. **L1** - `marketing_url` + OG 메타 태그
8. **H3** - Lectures 처리 (웹에서 비활성화 또는 업로드 구현)

### Phase 4: 고급 기능 (별도 일정)
9. **M5** - Concepts/Lectures CRUD
10. **L2** - `related_question_ids`
11. **L3** - 평점/리뷰 자동 업데이트

---

## 파일 변경 매트릭스

| 파일 | H1 | H2 | H3 | M1 | M2 | M3 | M4 | M5 | L1 | L2 | L3 |
|------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **exam_pipeline** | | | | | | | | | | | |
| `deployer/firebase_uploader.py` | O | | O | | | | | | | | |
| `deployer/__init__.py` | O | | | | | | | | | | |
| **jmkcontents** | | | | | | | | | | | |
| `lib/firebase/types.ts` | | O | | | | | | | | | |
| `lib/firebase/apps.ts` | | O | | | | | | | | | |
| `app/page.tsx` (홈) | | O | | | | | | | | | |
| `app/apps/page.tsx` (목록) | | O | | | | | | | | | |
| `app/apps/[bundle_id]/page.tsx` | O | | O | | | O | O | | O | | |
| `app/apps/[bundle_id]/concepts/page.tsx` | | | | | | | O | | | | |
| `app/apps/[bundle_id]/lectures/page.tsx` | | | O | | | | O | | | | |
| `components/AppCard.tsx` | | O | | | | | | | O | | |
| `components/ConceptDetailModal.tsx` | | | | | | | | | | O | |
| `app/admin/apps/[bundle_id]/edit/page.tsx` | | | | O | | | | | | | |
| `app/actions/apps.ts` | | | | | O | | | | | | |
| `app/admin/concepts/page.tsx` | | | | | | | | O | | | |
| `app/actions/concepts.ts` (신규) | | | | | | | | O | | | |
| `app/admin/lectures/page.tsx` | | | | | | | | O | | | |
| `app/actions/lectures.ts` (신규) | | | | | | | | O | | | |
