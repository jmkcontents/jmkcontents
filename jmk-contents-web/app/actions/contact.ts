'use server'

import { getFirestoreDb } from '@/lib/firebase/admin'

export interface ContactFormData {
  name?: string
  email: string
  subject?: string
  message: string
}

export interface ContactFormResponse {
  success: boolean
  message: string
}

/**
 * Contact Form 제출 Server Action
 * - Firebase Firestore contact_submissions 컬렉션에 저장
 * - 이메일 주소 유효성 검사
 * - 필수 필드 검증
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResponse> {
  try {
    // 필수 필드 검증
    if (!data.email || !data.message) {
      return {
        success: false,
        message: '이메일과 메시지는 필수 항목입니다.',
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: '올바른 이메일 주소를 입력해주세요.',
      }
    }

    // 메시지 길이 검증
    if (data.message.length < 10) {
      return {
        success: false,
        message: '메시지는 최소 10자 이상 입력해주세요.',
      }
    }

    if (data.message.length > 5000) {
      return {
        success: false,
        message: '메시지는 최대 5000자까지 입력 가능합니다.',
      }
    }

    // Firestore에 저장
    const db = getFirestoreDb()
    const contactSubmissionsRef = db.collection('contact_submissions')

    const submission = {
      name: data.name || '익명',
      email: data.email,
      subject: data.subject || '(제목 없음)',
      message: data.message,
      status: 'pending', // pending, in_progress, resolved
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await contactSubmissionsRef.add(submission)

    return {
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
    }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return {
      success: false,
      message: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}
