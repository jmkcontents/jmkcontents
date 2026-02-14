/**
 * Firebase Firestore 데이터 타입 정의
 * Supabase에서 마이그레이션
 */

export type AppCategory = '기능사' | '산업기사' | '기사' | '컴퓨터자격증' | '기타전문자격증'

export const APP_CATEGORIES: AppCategory[] = ['기능사', '산업기사', '기사', '컴퓨터자격증', '기타전문자격증']

export interface App {
  bundle_id: string // 문서 ID
  app_name: string
  app_name_full?: string
  description?: string
  description_full?: string
  categories?: string[] // 과목 카테고리 (예: ["산업안전관리론", "인간공학"])
  app_category?: AppCategory // 앱 분류 (기능사/산업기사/기사 등)
  status: 'draft' | 'published' | 'archived'
  icon_url?: string
  app_store_url?: string
  marketing_url?: string
  rating?: number
  review_count?: number
  download_count?: number
  is_featured?: boolean
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
  youtube_video_id?: string // YouTube 영상 ID (예: 'cMDj0pirZFI')
  duration_seconds?: number
  transcript?: string
  created_at: Date
  updated_at: Date
}

export interface ContactSubmission {
  id: string // 문서 ID
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: Date
  updated_at: Date
}

export interface AffiliateAd {
  id: string // 문서 ID
  type: 'banner' | 'interstitial' // 광고 타입
  title: string // 광고 제목
  imageUrl: string // 광고 이미지 URL
  linkUrl: string // 제휴 링크 URL
  isActive: boolean // 활성 여부
  priority: number // 우선순위 (가중치, 1-100)
  startDate?: Date // 시작일 (optional)
  endDate?: Date // 종료일 (optional)
  impressions: number // 노출 수
  clicks: number // 클릭 수
  appIds: string[] // 타겟 앱 ID 목록 (['all'] 또는 ['indsafety', 'gigecha'])
  experimentGroup?: string // A/B 테스트 그룹명 (예: 'book-promo-2024', variant: 'A', 'B', 'C')
  created_at?: Date
  updated_at?: Date
}

/**
 * Firestore 컬렉션 이름
 */
export const COLLECTIONS = {
  APPS: 'apps',
  CONCEPTS: 'concepts',
  LECTURES: 'lectures',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  AFFILIATE_ADS: 'affiliate_ads',
} as const
