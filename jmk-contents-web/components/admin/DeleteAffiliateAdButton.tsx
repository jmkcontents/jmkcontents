'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteAffiliateAd } from '@/app/actions/affiliate-ads'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteAffiliateAdButtonProps {
  adId: string
  adTitle: string
}

export function DeleteAffiliateAdButton({ adId, adTitle }: DeleteAffiliateAdButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `정말로 "${adTitle}" 광고를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 통계 데이터도 함께 삭제됩니다.`
      )
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteAffiliateAd(adId)

      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </>
      )}
    </Button>
  )
}
