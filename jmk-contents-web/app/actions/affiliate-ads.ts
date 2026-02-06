'use server'

import { revalidatePath } from 'next/cache'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, AffiliateAd } from '@/lib/firebase/types'

export interface AffiliateAdFormData {
  type: 'banner' | 'interstitial'
  title: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
  priority: number
  startDate?: string
  endDate?: string
  appIds: string[] // ['all'] 또는 특정 앱 IDs
}

export interface AffiliateAdActionResult {
  success: boolean
  message: string
  data?: any
}

/**
 * 제휴광고 생성
 */
export async function createAffiliateAd(
  data: AffiliateAdFormData
): Promise<AffiliateAdActionResult> {
  try {
    const db = getFirestoreDb()

    const adData = {
      type: data.type,
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive,
      priority: data.priority,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      impressions: 0,
      clicks: 0,
      appIds: data.appIds.length > 0 ? data.appIds : ['all'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const docRef = await db.collection(COLLECTIONS.AFFILIATE_ADS).add(adData)

    revalidatePath('/admin/affiliate-ads')

    return {
      success: true,
      message: '제휴광고가 성공적으로 생성되었습니다.',
      data: { id: docRef.id },
    }
  } catch (error) {
    console.error('Create affiliate ad error:', error)
    return {
      success: false,
      message: '제휴광고 생성 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 제휴광고 수정
 */
export async function updateAffiliateAd(
  id: string,
  data: Partial<AffiliateAdFormData>
): Promise<AffiliateAdActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.AFFILIATE_ADS).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 제휴광고입니다.',
      }
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    // 날짜 필드 처리
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate).toISOString() : null
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate).toISOString() : null
    }

    await docRef.update(updateData)

    revalidatePath('/admin/affiliate-ads')

    return {
      success: true,
      message: '제휴광고가 성공적으로 수정되었습니다.',
    }
  } catch (error) {
    console.error('Update affiliate ad error:', error)
    return {
      success: false,
      message: '제휴광고 수정 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 제휴광고 삭제
 */
export async function deleteAffiliateAd(id: string): Promise<AffiliateAdActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.AFFILIATE_ADS).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 제휴광고입니다.',
      }
    }

    await docRef.delete()

    revalidatePath('/admin/affiliate-ads')

    return {
      success: true,
      message: '제휴광고가 성공적으로 삭제되었습니다.',
    }
  } catch (error) {
    console.error('Delete affiliate ad error:', error)
    return {
      success: false,
      message: '제휴광고 삭제 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 제휴광고 활성화/비활성화 토글
 */
export async function toggleAffiliateAdStatus(id: string): Promise<AffiliateAdActionResult> {
  try {
    const db = getFirestoreDb()

    const docRef = db.collection(COLLECTIONS.AFFILIATE_ADS).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return {
        success: false,
        message: '존재하지 않는 제휴광고입니다.',
      }
    }

    const currentStatus = doc.data()?.isActive ?? true
    await docRef.update({
      isActive: !currentStatus,
      updated_at: new Date().toISOString(),
    })

    revalidatePath('/admin/affiliate-ads')

    return {
      success: true,
      message: `제휴광고가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`,
    }
  } catch (error) {
    console.error('Toggle affiliate ad status error:', error)
    return {
      success: false,
      message: '상태 변경 중 오류가 발생했습니다.',
    }
  }
}
