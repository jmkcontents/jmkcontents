import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Firebase Admin
jest.mock('./lib/firebase/admin', () => ({
  getFirestoreDb: jest.fn(),
}))

// Set test environment variables
process.env.ADMIN_PASSWORD = 'test-password'
process.env.CONTACT_EMAIL = 'test@example.com'
