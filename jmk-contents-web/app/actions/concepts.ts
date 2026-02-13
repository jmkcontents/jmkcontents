'use server'

import { revalidatePath } from 'next/cache'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'

export interface ConceptFormData {
  id?: string
  app_id: string
  category: string
  title: string
  content: string
  importance: number
  keywords: string
  study_note: string
}

export interface ConceptActionResult {
  success: boolean
  message: string
  data?: any
}

export async function createConcept(data: ConceptFormData): Promise<ConceptActionResult> {
  try {
    const db = getFirestoreDb()

    const conceptId = `${data.app_id}_${Date.now()}`
    const conceptData = {
      app_id: data.app_id,
      category: data.category || '',
      title: data.title,
      content: data.content,
      importance: data.importance || 3,
      keywords: data.keywords || '',
      study_note: data.study_note || '',
      related_question_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.collection(COLLECTIONS.CONCEPTS).doc(conceptId).set(conceptData)

    revalidatePath('/admin/concepts')
    revalidatePath(`/apps/${data.app_id}/concepts`)

    return {
      success: true,
      message: '개념이 성공적으로 생성되었습니다.',
      data: { id: conceptId },
    }
  } catch (error) {
    console.error('Create concept error:', error)
    return {
      success: false,
      message: '개념 생성 중 오류가 발생했습니다.',
    }
  }
}

export async function updateConcept(
  conceptId: string,
  data: Partial<ConceptFormData>
): Promise<ConceptActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.CONCEPTS).doc(conceptId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 개념입니다.',
      }
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    }
    delete updateData.id

    await docRef.update(updateData)

    const appId = data.app_id || doc.data()?.app_id
    revalidatePath('/admin/concepts')
    if (appId) {
      revalidatePath(`/apps/${appId}/concepts`)
    }

    return {
      success: true,
      message: '개념이 성공적으로 수정되었습니다.',
    }
  } catch (error) {
    console.error('Update concept error:', error)
    return {
      success: false,
      message: '개념 수정 중 오류가 발생했습니다.',
    }
  }
}

export async function deleteConcept(conceptId: string): Promise<ConceptActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.CONCEPTS).doc(conceptId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 개념입니다.',
      }
    }

    const appId = doc.data()?.app_id
    await docRef.delete()

    revalidatePath('/admin/concepts')
    if (appId) {
      revalidatePath(`/apps/${appId}/concepts`)
    }

    return {
      success: true,
      message: '개념이 삭제되었습니다.',
    }
  } catch (error) {
    console.error('Delete concept error:', error)
    return {
      success: false,
      message: '개념 삭제 중 오류가 발생했습니다.',
    }
  }
}
