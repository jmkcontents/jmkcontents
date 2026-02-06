/**
 * Firebase Firestore 데이터 타입 정의
 * Supabase에서 마이그레이션
 */

export interface App {
  bundle_id: string // 문서 ID
  app_name: string
  app_name_full?: string
  description?: string
  categories?: string[]
  status: 'draft' | 'published' | 'archived'
  icon_url?: string
  app_store_url?: string
  marketing_url?: string
  rating?: number
  review_count: number
  download_count: number
  created_at: Date
  updated_at: Date
}

export interface Concept {
  id: string // 문서 ID
  app_id: string // bundle_id
  category: string
  title: string
  content: string
  importance: number // 1-5 (문서 스펙에 맞춤)
  keywords: string // 쉼표로 구분된 키워드
  study_note: string // 학습 팁/추가 설명
  related_question_ids?: string[]
  created_at: Date
  updated_at: Date
}

export interface Lecture {
  id: string // 문서 ID
  app_id: string // bundle_id
  category?: string
  title: string
  description?: string
  audio_url?: string
  duration_seconds?: number
  transcript?: string
  created_at: Date
  updated_at: Date
}

/**
 * Firestore 컬렉션 이름
 */
export const COLLECTIONS = {
  APPS: 'apps',
  CONCEPTS: 'concepts',
  LECTURES: 'lectures',
} as const
