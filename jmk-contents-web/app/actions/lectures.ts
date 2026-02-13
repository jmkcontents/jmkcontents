'use server'

import { revalidatePath } from 'next/cache'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'

export interface LectureFormData {
  id?: string
  app_id: string
  category?: string
  title: string
  description?: string
  audio_url?: string
  duration_seconds?: number
  transcript?: string
}

export interface LectureActionResult {
  success: boolean
  message: string
  data?: any
}

export async function createLecture(data: LectureFormData): Promise<LectureActionResult> {
  try {
    const db = getFirestoreDb()

    const lectureId = `${data.app_id}_${Date.now()}`
    const lectureData = {
      app_id: data.app_id,
      category: data.category || '',
      title: data.title,
      description: data.description || '',
      audio_url: data.audio_url || '',
      duration_seconds: data.duration_seconds || 0,
      transcript: data.transcript || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.collection(COLLECTIONS.LECTURES).doc(lectureId).set(lectureData)

    revalidatePath('/admin/lectures')
    revalidatePath(`/apps/${data.app_id}/lectures`)

    return {
      success: true,
      message: '강의가 성공적으로 생성되었습니다.',
      data: { id: lectureId },
    }
  } catch (error) {
    console.error('Create lecture error:', error)
    return {
      success: false,
      message: '강의 생성 중 오류가 발생했습니다.',
    }
  }
}

export async function updateLecture(
  lectureId: string,
  data: Partial<LectureFormData>
): Promise<LectureActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.LECTURES).doc(lectureId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 강의입니다.',
      }
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    }
    delete updateData.id

    await docRef.update(updateData)

    const appId = data.app_id || doc.data()?.app_id
    revalidatePath('/admin/lectures')
    if (appId) {
      revalidatePath(`/apps/${appId}/lectures`)
    }

    return {
      success: true,
      message: '강의가 성공적으로 수정되었습니다.',
    }
  } catch (error) {
    console.error('Update lecture error:', error)
    return {
      success: false,
      message: '강의 수정 중 오류가 발생했습니다.',
    }
  }
}

export async function deleteLecture(lectureId: string): Promise<LectureActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.LECTURES).doc(lectureId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 강의입니다.',
      }
    }

    const appId = doc.data()?.app_id
    await docRef.delete()

    revalidatePath('/admin/lectures')
    if (appId) {
      revalidatePath(`/apps/${appId}/lectures`)
    }

    return {
      success: true,
      message: '강의가 삭제되었습니다.',
    }
  } catch (error) {
    console.error('Delete lecture error:', error)
    return {
      success: false,
      message: '강의 삭제 중 오류가 발생했습니다.',
    }
  }
}
