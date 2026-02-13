import { getFirestoreDb } from './admin'
import { App, AppCategory, Concept, Lecture, COLLECTIONS } from './types'

/**
 * Firestore에서 앱 데이터 조회 함수들
 * Supabase lib/api/apps.ts 대체용
 */

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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
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

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
    })) as Lecture[]
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

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
    })) as Lecture[]
  } catch (error) {
    console.error('Error fetching lectures by category from Firestore:', error)
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
