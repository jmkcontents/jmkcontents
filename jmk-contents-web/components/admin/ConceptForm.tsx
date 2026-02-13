'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createConcept, updateConcept } from '@/app/actions/concepts'
import { Concept } from '@/lib/firebase/types'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ConceptFormProps {
  mode: 'create' | 'edit'
  initialData?: Concept
  apps: { bundle_id: string; app_name: string }[]
}

export function ConceptForm({ mode, initialData, apps }: ConceptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [formData, setFormData] = useState({
    app_id: initialData?.app_id || '',
    category: initialData?.category || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    importance: initialData?.importance || 3,
    keywords: initialData?.keywords || '',
    study_note: initialData?.study_note || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const result = mode === 'create'
        ? await createConcept(formData)
        : await updateConcept(initialData!.id, formData)

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message })
        setTimeout(() => {
          router.push('/admin/concepts')
          router.refresh()
        }, 1500)
      } else {
        setSubmitStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: `개념 ${mode === 'create' ? '생성' : '수정'} 중 오류가 발생했습니다.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>개념 정보</CardTitle>
        <CardDescription>
          {mode === 'create' ? '새로운 개념을 등록하세요.' : '개념 정보를 수정하세요.'} * 표시는 필수 항목입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{submitStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* App 선택 */}
          <div>
            <label htmlFor="app_id" className="block text-sm font-medium mb-2">
              앱 *
            </label>
            <select
              id="app_id"
              value={formData.app_id}
              onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              required
              disabled={isSubmitting || mode === 'edit'}
            >
              <option value="">앱을 선택하세요</option>
              {apps.map((app) => (
                <option key={app.bundle_id} value={app.bundle_id}>
                  {app.app_name} ({app.bundle_id})
                </option>
              ))}
            </select>
          </div>

          {/* 제목 + 카테고리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                제목 *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="안전관리 조직의 구성"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                카테고리
              </label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="산업안전관리론"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              내용 *
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="개념에 대한 상세 설명을 입력하세요..."
              rows={6}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 학습 노트 */}
          <div>
            <label htmlFor="study_note" className="block text-sm font-medium mb-2">
              학습 노트
            </label>
            <Textarea
              id="study_note"
              value={formData.study_note}
              onChange={(e) => setFormData({ ...formData, study_note: e.target.value })}
              placeholder="학습 팁이나 추가 설명을 입력하세요..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* 중요도 + 키워드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="importance" className="block text-sm font-medium mb-2">
                중요도 (1-5)
              </label>
              <Input
                id="importance"
                type="number"
                min="1"
                max="5"
                value={formData.importance}
                onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) || 3 })}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {'⭐'.repeat(formData.importance)}
              </p>
            </div>
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium mb-2">
                키워드 (쉼표 구분)
              </label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="안전관리, 조직, 안전보건관리"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? '생성 중...' : '수정 중...'}
                </>
              ) : (
                mode === 'create' ? '개념 생성' : '개념 수정'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => router.push('/admin/concepts')}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
