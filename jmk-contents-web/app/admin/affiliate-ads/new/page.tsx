'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createAffiliateAd } from '@/app/actions/affiliate-ads'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function NewAffiliateAdPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [formData, setFormData] = useState({
    type: 'banner' as 'banner' | 'interstitial',
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    priority: 10,
    startDate: '',
    endDate: '',
    appIds: 'all', // 'all' 또는 쉼표로 구분된 앱 IDs
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // appIds 파싱
      const appIds = formData.appIds === 'all' || formData.appIds.trim() === ''
        ? ['all']
        : formData.appIds.split(',').map((id) => id.trim()).filter(Boolean)

      const result = await createAffiliateAd({
        type: formData.type,
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        isActive: formData.isActive,
        priority: formData.priority,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        appIds,
      })

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message })
        setTimeout(() => {
          router.push('/admin/affiliate-ads')
          router.refresh()
        }, 1500)
      } else {
        setSubmitStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: '광고 생성 중 오류가 발생했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/affiliate-ads">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">새 제휴광고 추가</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>광고 정보</CardTitle>
          <CardDescription>
            새로운 제휴광고 정보를 입력하세요. * 표시는 필수 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Messages */}
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
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">광고 타입 *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="banner"
                    checked={formData.type === 'banner'}
                    onChange={(e) => setFormData({ ...formData, type: 'banner' })}
                    disabled={isSubmitting}
                  />
                  <span>배너 (Banner)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="interstitial"
                    checked={formData.type === 'interstitial'}
                    onChange={(e) => setFormData({ ...formData, type: 'interstitial' })}
                    disabled={isSubmitting}
                  />
                  <span>전면광고 (Interstitial)</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                광고 제목 *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="🎓 자격증 합격 필독서 - 베스트셀러 1위!"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                이미지 URL *
              </label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                배너: 640x100 권장, 전면광고: 400x300 권장
              </p>
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium mb-2">
                제휴 링크 URL *
              </label>
              <Input
                id="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://example.com/product"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-2">
                우선순위 (1-100) *
              </label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                숫자가 높을수록 더 자주 표시됩니다
              </p>
            </div>

            {/* App IDs */}
            <div>
              <label htmlFor="appIds" className="block text-sm font-medium mb-2">
                타겟 앱 IDs
              </label>
              <Input
                id="appIds"
                value={formData.appIds}
                onChange={(e) => setFormData({ ...formData, appIds: e.target.value })}
                placeholder="all (또는 indsafety, gigecha)"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                'all' 입력 시 모든 앱에 표시. 특정 앱에만 표시하려면 앱 ID를 쉼표로 구분하여 입력
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  시작일 (선택)
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  종료일 (선택)
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Is Active */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">즉시 활성화</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '광고 생성'
                )}
              </Button>
              <Link href="/admin/affiliate-ads" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
