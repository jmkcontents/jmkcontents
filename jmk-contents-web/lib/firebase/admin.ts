import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let app: App | undefined
let db: Firestore | undefined

/**
 * Firebase Admin 초기화
 * - Service Account Key를 환경 변수 또는 파일에서 로드
 * - 서버사이드에서만 사용 가능
 */
function initializeFirebaseAdmin(): App {
  if (app) {
    return app
  }

  // 이미 초기화된 앱이 있으면 재사용
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    return app
  }

  try {
    // 환경 변수에서 Service Account Key 로드
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
      )
    }

    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountKey)
      // private_key에서 이스케이프된 줄바꿈을 실제 줄바꿈으로 변환
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
      }
    } catch (parseError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError)
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.')
    }

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'exam-affiliate-ads',
    })

    console.log('✅ Firebase Admin initialized successfully')
    return app
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error)
    throw error
  }
}

/**
 * Firestore 인스턴스 가져오기
 * - 서버 컴포넌트에서 사용
 * - Supabase 대체용
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    const adminApp = initializeFirebaseAdmin()
    db = getFirestore(adminApp)
  }
  return db
}

/**
 * Firebase Admin App 가져오기
 */
export function getFirebaseAdmin(): App {
  return initializeFirebaseAdmin()
}
