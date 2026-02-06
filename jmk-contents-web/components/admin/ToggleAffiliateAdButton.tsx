'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toggleAffiliateAdStatus } from '@/app/actions/affiliate-ads'
import { Power, Loader2 } from 'lucide-react'

interface ToggleAffiliateAdButtonProps {
  adId: string
  currentStatus: boolean
}

export function ToggleAffiliateAdButton({
  adId,
  currentStatus,
}: ToggleAffiliateAdButtonProps) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)

    try {
      const result = await toggleAffiliateAdStatus(adId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isToggling}
      className={currentStatus ? '' : 'bg-gray-100'}
    >
      {isToggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Power className="w-4 h-4 mr-2" />
          {currentStatus ? '비활성화' : '활성화'}
        </>
      )}
    </Button>
  )
}
