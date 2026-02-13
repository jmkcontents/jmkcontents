'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteConcept } from '@/app/actions/concepts'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteConceptButtonProps {
  conceptId: string
  conceptTitle: string
}

export function DeleteConceptButton({ conceptId, conceptTitle }: DeleteConceptButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${conceptTitle}" 개념을 삭제하시겠습니까?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteConcept(conceptId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      삭제
    </Button>
  )
}
