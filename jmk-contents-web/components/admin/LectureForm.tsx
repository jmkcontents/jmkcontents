'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createLecture, updateLecture } from '@/app/actions/lectures'
import { Lecture } from '@/lib/firebase/types'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface LectureFormProps {
  mode: 'create' | 'edit'
  initialData?: Lecture
  apps: { bundle_id: string; app_name: string }[]
}

export function LectureForm({ mode, initialData, apps }: LectureFormProps) {
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
    description: initialData?.description || '',
    audio_url: initialData?.audio_url || '',
    youtube_video_id: initialData?.youtube_video_id || '',
    duration_seconds: initialData?.duration_seconds || 0,
    transcript: initialData?.transcript || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const result = mode === 'create'
        ? await createLecture(formData)
        : await updateLecture(initialData!.id, formData)

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message })
        setTimeout(() => {
          router.push('/admin/lectures')
          router.refresh()
        }, 1500)
      } else {
        setSubmitStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: `강의 ${mode === 'create' ? '생성' : '수정'} 중 오류가 발생했습니다.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>강의 정보</CardTitle>
        <CardDescription>
          {mode === 'create' ? '새로운 강의를 등록하세요.' : '강의 정보를 수정하세요.'} * 표시는 필수 항목입니다.
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
                placeholder="산업안전관리론 핵심 정리"
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

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              설명
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="강의에 대한 설명을 입력하세요..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* YouTube Video ID */}
          <div>
            <label htmlFor="youtube_video_id" className="block text-sm font-medium mb-2">
              YouTube Video ID
            </label>
            <Input
              id="youtube_video_id"
              value={formData.youtube_video_id}
              onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
              placeholder="예: cMDj0pirZFI"
              disabled={isSubmitting}
            />
            {formData.youtube_video_id && (
              <p className="text-xs text-muted-foreground mt-1">
                미리보기: youtube.com/watch?v={formData.youtube_video_id}
              </p>
            )}
          </div>

          {/* 오디오 URL + 재생 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="audio_url" className="block text-sm font-medium mb-2">
                오디오 URL (선택)
              </label>
              <Input
                id="audio_url"
                type="url"
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="duration_seconds" className="block text-sm font-medium mb-2">
                재생 시간 (초)
              </label>
              <Input
                id="duration_seconds"
                type="number"
                min="0"
                value={formData.duration_seconds}
                onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
              {formData.duration_seconds > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.floor(formData.duration_seconds / 60)}분 {formData.duration_seconds % 60}초
                </p>
              )}
            </div>
          </div>

          {/* 스크립트 */}
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium mb-2">
              스크립트
            </label>
            <Textarea
              id="transcript"
              value={formData.transcript}
              onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
              placeholder="강의 스크립트를 입력하세요..."
              rows={8}
              disabled={isSubmitting}
            />
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
                mode === 'create' ? '강의 생성' : '강의 수정'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => router.push('/admin/lectures')}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
