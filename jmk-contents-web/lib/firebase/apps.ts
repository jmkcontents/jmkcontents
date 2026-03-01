import { getFirestoreDb } from './admin'
import { App, AppCategory, Concept, Lecture, COLLECTIONS } from './types'

/**
 * Firestore에서 앱 데이터 조회 함수들
 * Supabase lib/api/apps.ts 대체용
 */

/**
 * Firestore Timestamp/ISO 문자열/Date를 안전하게 JS Date로 변환
 */
function toDate(value: unknown): Date {
  if (!value) return new Date()

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }

  if (typeof value === 'object') {
    const candidate = value as { toDate?: () => Date }
    if (typeof candidate.toDate === 'function') {
      const converted = candidate.toDate()
      return converted instanceof Date && !Number.isNaN(converted.getTime())
        ? converted
        : new Date()
    }
  }

  return new Date()
}

/**
 * 모든 published 앱 목록 가져오기
 */
export async function getApps(): Promise<App[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.APPS)
      .where('status', '==', 'published')
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      bundle_id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as App[]
  } catch (error) {
    console.error('Error fetching apps from Firestore:', error)
    return []
  }
}

/**
 * 추천 앱 목록 가져오기 (평점 높은 순, 최대 3개)
 */
export async function getFeaturedApps(): Promise<App[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.APPS)
      .where('status', '==', 'published')
      .orderBy('rating', 'desc')
      .orderBy('download_count', 'desc')
      .limit(3)
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      bundle_id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as App[]
  } catch (error) {
    console.error('Error fetching featured apps from Firestore:', error)
    return []
  }
}

/**
 * bundle_id로 특정 앱 가져오기
 */
export async function getAppByBundleId(bundleId: string): Promise<App | null> {
  try {
    const db = getFirestoreDb()
    const doc = await db.collection(COLLECTIONS.APPS).doc(bundleId).get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data()
    if (data?.status !== 'published') {
      return null
    }

    return {
      ...data,
      bundle_id: doc.id,
      created_at: toDate(data.created_at),
      updated_at: toDate(data.updated_at),
    } as App
  } catch (error) {
    console.error('Error fetching app by bundle_id from Firestore:', error)
    return null
  }
}

/**
 * 카테고리별 앱 필터링
 */
export async function getAppsByCategory(category: string): Promise<App[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.APPS)
      .where('status', '==', 'published')
      .where('categories', 'array-contains', category)
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      bundle_id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as App[]
  } catch (error) {
    console.error('Error fetching apps by category from Firestore:', error)
    return []
  }
}

/**
 * 앱 분류(app_category)별 앱 필터링
 */
export async function getAppsByAppCategory(appCategory: AppCategory): Promise<App[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.APPS)
      .where('status', '==', 'published')
      .where('app_category', '==', appCategory)
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      bundle_id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as App[]
  } catch (error) {
    console.error('Error fetching apps by app_category from Firestore:', error)
    return []
  }
}

/**
 * 모든 앱 가져오기 (admin용, draft 포함)
 */
export async function getAllApps(): Promise<App[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.APPS)
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      bundle_id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as App[]
  } catch (error) {
    console.error('Error fetching all apps from Firestore:', error)
    return []
  }
}

/**
 * 앱의 학습 개념 가져오기
 */
export async function getConceptsByAppId(appId: string): Promise<Concept[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.CONCEPTS)
      .where('app_id', '==', appId)
      .orderBy('importance', 'asc') // high, medium, low
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as Concept[]
  } catch (error) {
    console.error('Error fetching concepts from Firestore:', error)
    return []
  }
}

/**
 * 카테고리별 학습 개념 가져오기
 */
export async function getConceptsByCategory(
  appId: string,
  category: string
): Promise<Concept[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.CONCEPTS)
      .where('app_id', '==', appId)
      .where('category', '==', category)
      .orderBy('importance', 'asc')
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as Concept[]
  } catch (error) {
    console.error('Error fetching concepts by category from Firestore:', error)
    return []
  }
}

/**
 * 앱의 강의 목록 가져오기
 */
export async function getLecturesByAppId(appId: string): Promise<Lecture[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.LECTURES)
      .where('app_id', '==', appId)
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => {
      const d = doc.data()
      return {
        ...d,
        id: doc.id,
        created_at: toDate(d.created_at),
        updated_at: toDate(d.updated_at),
      }
    }) as Lecture[]
  } catch (error) {
    console.error('Error fetching lectures from Firestore:', error)
    return []
  }
}

/**
 * 카테고리별 강의 목록 가져오기
 */
export async function getLecturesByCategory(
  appId: string,
  category: string
): Promise<Lecture[]> {
  try {
    const db = getFirestoreDb()
    const snapshot = await db
      .collection(COLLECTIONS.LECTURES)
      .where('app_id', '==', appId)
      .where('category', '==', category)
      .orderBy('created_at', 'desc')
      .get()

    return snapshot.docs.map(doc => {
      const d = doc.data()
      return {
        ...d,
        id: doc.id,
        created_at: toDate(d.created_at),
        updated_at: toDate(d.updated_at),
      }
    }) as Lecture[]
  } catch (error) {
    console.error('Error fetching lectures by category from Firestore:', error)
    return []
  }
}

/**
 * 모든 앱의 학습 개념 가져오기 (전체 과목 모아보기)
 */
export async function getAllConcepts(): Promise<(Concept & { app_name: string })[]> {
  try {
    const db = getFirestoreDb()
    const [conceptsSnapshot, apps] = await Promise.all([
      db.collection(COLLECTIONS.CONCEPTS)
        .orderBy('created_at', 'desc')
        .get(),
      getApps(),
    ])

    const appMap = new Map(apps.map(a => [a.bundle_id, a.app_name]))

    return conceptsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      app_name: appMap.get(doc.data().app_id) || doc.data().app_id,
      created_at: toDate(doc.data().created_at),
      updated_at: toDate(doc.data().updated_at),
    })) as (Concept & { app_name: string })[]
  } catch (error) {
    console.error('Error fetching all concepts:', error)
    return []
  }
}

/**
 * 모든 앱의 강의 가져오기 (전체 과목 모아보기)
 */
export async function getAllLectures(): Promise<(Lecture & { app_name: string })[]> {
  try {
    const db = getFirestoreDb()
    const [lecturesSnapshot, apps] = await Promise.all([
      db.collection(COLLECTIONS.LECTURES)
        .orderBy('created_at', 'desc')
        .get(),
      getApps(),
    ])

    const appMap = new Map(apps.map(a => [a.bundle_id, a.app_name]))

    return lecturesSnapshot.docs.map(doc => {
      const d = doc.data()
      return {
        ...d,
        id: doc.id,
        app_name: appMap.get(d.app_id) || d.app_id,
        created_at: toDate(d.created_at),
        updated_at: toDate(d.updated_at),
      }
    }) as (Lecture & { app_name: string })[]
  } catch (error) {
    console.error('Error fetching all lectures:', error)
    return []
  }
}

/**
 * 모든 앱 + 콘텐츠 개수 한번에 가져오기
 */
export async function getAppsWithContentCounts(): Promise<(App & { conceptCount: number; lectureCount: number })[]> {
  try {
    const db = getFirestoreDb()
    const [apps, conceptsSnapshot, lecturesSnapshot] = await Promise.all([
      getApps(),
      db.collection(COLLECTIONS.CONCEPTS).select('app_id').get(),
      db.collection(COLLECTIONS.LECTURES).select('app_id').get(),
    ])

    const conceptCounts = new Map<string, number>()
    conceptsSnapshot.docs.forEach(doc => {
      const appId = doc.data().app_id
      conceptCounts.set(appId, (conceptCounts.get(appId) || 0) + 1)
    })

    const lectureCounts = new Map<string, number>()
    lecturesSnapshot.docs.forEach(doc => {
      const appId = doc.data().app_id
      lectureCounts.set(appId, (lectureCounts.get(appId) || 0) + 1)
    })

    return apps.map(app => ({
      ...app,
      conceptCount: conceptCounts.get(app.bundle_id) || 0,
      lectureCount: lectureCounts.get(app.bundle_id) || 0,
    }))
  } catch (error) {
    console.error('Error fetching apps with content counts:', error)
    return []
  }
}

/**
 * 앱 다운로드 수 증가
 */
export async function incrementDownloadCount(bundleId: string): Promise<void> {
  try {
    const db = getFirestoreDb()
    const docRef = db.collection(COLLECTIONS.APPS).doc(bundleId)

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef)
      if (!doc.exists) {
        throw new Error(`App ${bundleId} not found`)
      }

      const currentCount = doc.data()?.download_count || 0
      transaction.update(docRef, {
        download_count: currentCount + 1,
        updated_at: new Date(),
      })
    })
  } catch (error) {
    console.error('Error incrementing download count in Firestore:', error)
  }
}
