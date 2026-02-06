import { isAdminAuthenticated, adminLogin, adminLogout } from '../../app/actions/auth'
import { cookies } from 'next/headers'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Authentication Utilities', () => {
  let mockCookies: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }

    ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
  })

  describe('isAdminAuthenticated', () => {
    it('should return true when valid admin session exists', async () => {
      mockCookies.get.mockReturnValue({ value: 'authenticated' })

      const result = await isAdminAuthenticated()

      expect(result).toBe(true)
      expect(mockCookies.get).toHaveBeenCalledWith('admin_session')
    })

    it('should return false when no admin session exists', async () => {
      mockCookies.get.mockReturnValue(undefined)

      const result = await isAdminAuthenticated()

      expect(result).toBe(false)
    })

    it('should return false when session value is not "authenticated"', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid' })

      const result = await isAdminAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('adminLogin', () => {
    beforeEach(() => {
      process.env.ADMIN_PASSWORD = 'test-password'
    })

    it('should return success for correct password', async () => {
      const result = await adminLogin('test-password')

      expect(result.success).toBe(true)
      expect(result.message).toContain('성공')
      expect(mockCookies.set).toHaveBeenCalledWith(
        'admin_session',
        'authenticated',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      )
    })

    it('should return error for incorrect password', async () => {
      const result = await adminLogin('wrong-password')

      expect(result.success).toBe(false)
      expect(result.message).toContain('비밀번호')
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('should return error when ADMIN_PASSWORD not set', async () => {
      delete process.env.ADMIN_PASSWORD

      const result = await adminLogin('any-password')

      expect(result.success).toBe(false)
      expect(result.message).toContain('설정')
    })
  })

  describe('adminLogout', () => {
    it('should delete admin session cookie', async () => {
      await adminLogout()

      expect(mockCookies.delete).toHaveBeenCalledWith('admin_session')
    })
  })
})
