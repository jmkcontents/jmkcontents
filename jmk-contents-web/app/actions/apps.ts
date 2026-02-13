'use server'

import { revalidatePath } from 'next/cache'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, AppCategory } from '@/lib/firebase/types'

export interface AppFormData {
  bundle_id: string
  app_name: string
  app_name_full?: string
  description?: string
  description_full?: string
  app_store_url?: string
  icon_url?: string
  categories?: string[]
  app_category?: AppCategory | ''
  status: 'draft' | 'published'
  is_featured: boolean
  rating?: number
  download_count?: number
}

export interface AppActionResult {
  success: boolean
  message: string
  data?: any
}

/**
 * App 생성
 */
export async function createApp(data: AppFormData): Promise<AppActionResult> {
  try {
    const db = getFirestoreDb()

    const existingDoc = await db.collection(COLLECTIONS.APPS).doc(data.bundle_id).get()
    if (existingDoc.exists) {
      return {
        success: false,
        message: '이미 존재하는 Bundle ID입니다.',
      }
    }

    const appData: Record<string, any> = {
      app_name: data.app_name,
      app_name_full: data.app_name_full || data.app_name,
      description: data.description || '',
      description_full: data.description_full || '',
      app_store_url: data.app_store_url || '',
      icon_url: data.icon_url || '',
      categories: data.categories || [],
      status: data.status,
      is_featured: data.is_featured,
      rating: data.rating || 0,
      download_count: data.download_count || 0,
      marketing_url: `https://jmkcontents.com/apps/${data.bundle_id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (data.app_category) {
      appData.app_category = data.app_category
    }

    await db.collection(COLLECTIONS.APPS).doc(data.bundle_id).set(appData)

    revalidatePath('/apps')
    revalidatePath('/')
    revalidatePath('/admin/apps')

    return {
      success: true,
      message: 'App이 성공적으로 생성되었습니다.',
      data: { bundle_id: data.bundle_id },
    }
  } catch (error) {
    console.error('Create app error:', error)
    return {
      success: false,
      message: 'App 생성 중 오류가 발생했습니다.',
    }
  }
}

/**
 * App 수정
 */
export async function updateApp(
  bundleId: string,
  data: Partial<AppFormData>
): Promise<AppActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.APPS).doc(bundleId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 App입니다.',
      }
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    // bundle_id는 수정 불가 (Document ID)
    delete updateData.bundle_id

    // app_category가 빈 문자열이면 필드 제거
    if (updateData.app_category === '') {
      delete updateData.app_category
    }

    await docRef.update(updateData)

    revalidatePath('/apps')
    revalidatePath(`/apps/${bundleId}`)
    revalidatePath('/')
    revalidatePath('/admin/apps')

    return {
      success: true,
      message: 'App이 성공적으로 수정되었습니다.',
    }
  } catch (error) {
    console.error('Update app error:', error)
    return {
      success: false,
      message: 'App 수정 중 오류가 발생했습니다.',
    }
  }
}

/**
 * App 삭제 (M2: 관련 concepts, lectures 연쇄 삭제)
 */
export async function deleteApp(bundleId: string): Promise<AppActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.APPS).doc(bundleId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 App입니다.',
      }
    }

    // 관련 concepts 삭제
    const conceptsSnapshot = await db
      .collection(COLLECTIONS.CONCEPTS)
      .where('app_id', '==', bundleId)
      .get()

    // 관련 lectures 삭제
    const lecturesSnapshot = await db
      .collection(COLLECTIONS.LECTURES)
      .where('app_id', '==', bundleId)
      .get()

    // Batch 삭제 (500개 제한 고려)
    const allDocs = [...conceptsSnapshot.docs, ...lecturesSnapshot.docs]
    const BATCH_LIMIT = 500

    for (let i = 0; i < allDocs.length; i += BATCH_LIMIT) {
      const batch = db.batch()
      const chunk = allDocs.slice(i, i + BATCH_LIMIT)
      chunk.forEach(d => batch.delete(d.ref))
      await batch.commit()
    }

    // 앱 문서 삭제
    await docRef.delete()

    const deletedCount = conceptsSnapshot.size + lecturesSnapshot.size

    revalidatePath('/apps')
    revalidatePath('/')
    revalidatePath('/admin/apps')
    revalidatePath('/admin/concepts')
    revalidatePath('/admin/lectures')

    return {
      success: true,
      message: `App이 삭제되었습니다. (관련 데이터 ${deletedCount}건 함께 삭제)`,
    }
  } catch (error) {
    console.error('Delete app error:', error)
    return {
      success: false,
      message: 'App 삭제 중 오류가 발생했습니다.',
    }
  }
}
