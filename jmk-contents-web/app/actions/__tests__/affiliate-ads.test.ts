import {
  createAffiliateAd,
  updateAffiliateAd,
  deleteAffiliateAd,
  toggleAffiliateAdStatus,
} from '../affiliate-ads'
import { getFirestoreDb } from '@/lib/firebase/admin'

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Affiliate Ads Server Actions', () => {
  let mockDb: any
  let mockCollection: any
  let mockDoc: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ isActive: true }),
      }),
    }

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      add: jest.fn().mockResolvedValue({ id: 'new-ad-id' }),
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }

    ;(getFirestoreDb as jest.Mock).mockReturnValue(mockDb)
  })

  describe('createAffiliateAd', () => {
    it('should create a new affiliate ad with all required fields', async () => {
      const adData = {
        type: 'banner' as const,
        title: 'Test Banner Ad',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com/link',
        isActive: true,
        priority: 10,
        appIds: ['all'],
      }

      const result = await createAffiliateAd(adData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('생성')
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'banner',
          title: 'Test Banner Ad',
          isActive: true,
          priority: 10,
          impressions: 0,
          clicks: 0,
        })
      )
    })

    it('should create ad with experiment group when provided', async () => {
      const adData = {
        type: 'interstitial' as const,
        title: 'Test A/B Ad',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com/link',
        isActive: true,
        priority: 5,
        appIds: ['indsafety'],
        experimentGroup: 'test-experiment-1',
      }

      const result = await createAffiliateAd(adData)

      expect(result.success).toBe(true)
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          experimentGroup: 'test-experiment-1',
        })
      )
    })

    it('should handle date fields correctly', async () => {
      const adData = {
        type: 'banner' as const,
        title: 'Test Banner Ad',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com/link',
        isActive: true,
        priority: 10,
        appIds: ['all'],
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }

      const result = await createAffiliateAd(adData)

      expect(result.success).toBe(true)
      // Dates are converted to ISO strings
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.stringContaining('2026-01-01'),
          endDate: expect.stringContaining('2026-12-31'),
        })
      )
    })

    it('should create ad even with empty fields (no validation)', async () => {
      const adData = {
        type: 'banner' as const,
        title: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        priority: 10,
        appIds: ['all'],
      }

      const result = await createAffiliateAd(adData)

      // Currently no validation, so it should succeed
      expect(result.success).toBe(true)
      expect(mockCollection.add).toHaveBeenCalled()
    })
  })

  describe('updateAffiliateAd', () => {
    it('should update an existing affiliate ad', async () => {
      const updateData = {
        title: 'Updated Title',
        priority: 20,
        isActive: false,
      }

      const result = await updateAffiliateAd('test-ad-id', updateData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('수정')
      expect(mockCollection.doc).toHaveBeenCalledWith('test-ad-id')
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          priority: 20,
          isActive: false,
        })
      )
    })

    it('should update experiment group', async () => {
      const updateData = {
        experimentGroup: 'new-experiment',
      }

      const result = await updateAffiliateAd('test-ad-id', updateData)

      expect(result.success).toBe(true)
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          experimentGroup: 'new-experiment',
        })
      )
    })
  })

  describe('deleteAffiliateAd', () => {
    it('should delete an affiliate ad', async () => {
      const result = await deleteAffiliateAd('test-ad-id')

      expect(result.success).toBe(true)
      expect(result.message).toContain('삭제')
      expect(mockCollection.doc).toHaveBeenCalledWith('test-ad-id')
      expect(mockDoc.delete).toHaveBeenCalled()
    })

    it('should handle deletion errors', async () => {
      mockDoc.delete.mockRejectedValue(new Error('Delete failed'))

      const result = await deleteAffiliateAd('test-ad-id')

      expect(result.success).toBe(false)
      expect(result.message).toContain('삭제')
    })
  })

  describe('toggleAffiliateAdStatus', () => {
    it('should toggle active status from true to false', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ isActive: true }),
      })

      const result = await toggleAffiliateAdStatus('test-ad-id')

      expect(result.success).toBe(true)
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      )
    })

    it('should toggle active status from false to true', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ isActive: false }),
      })

      const result = await toggleAffiliateAdStatus('test-ad-id')

      expect(result.success).toBe(true)
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      )
    })

    it('should handle non-existent document', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      })

      const result = await toggleAffiliateAdStatus('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.message).toContain('존재하지 않는')
    })
  })
})
