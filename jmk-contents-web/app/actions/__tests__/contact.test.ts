import { submitContactForm } from '../contact'
import { getFirestoreDb } from '@/lib/firebase/admin'

jest.mock('@/lib/firebase/admin')

describe('Contact Form Server Action', () => {
  let mockDb: any
  let mockCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCollection = {
      add: jest.fn().mockResolvedValue({ id: 'new-submission-id' }),
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }

    ;(getFirestoreDb as jest.Mock).mockReturnValue(mockDb)
  })

  describe('submitContactForm', () => {
    it('should submit contact form with all fields', async () => {
      const formData = {
        name: 'Test User',
        email: 'user@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      }

      const result = await submitContactForm(formData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('성공')
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          email: 'user@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
          status: 'pending',
        })
      )
    })

    it('should validate email format', async () => {
      const formData = {
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message content that is long enough',
      }

      const result = await submitContactForm(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('이메일')
    })

    it('should validate required fields', async () => {
      const formData = {
        name: 'Test User',
        email: '',
        subject: 'Test Subject',
        message: '',
      }

      const result = await submitContactForm(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('필수')
    })

    it('should validate message length', async () => {
      const formData = {
        name: 'Test User',
        email: 'user@example.com',
        subject: 'Test Subject',
        message: 'Short',
      }

      const result = await submitContactForm(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('10자')
    })

    it('should handle submission errors gracefully', async () => {
      mockCollection.add.mockRejectedValue(new Error('Database error'))

      const formData = {
        name: 'Test User',
        email: 'user@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      }

      const result = await submitContactForm(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('오류')
    })
  })
})
