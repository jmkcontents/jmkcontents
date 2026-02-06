'use client'

import { useState, FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitContactForm } from '@/app/actions/contact'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message })
        // 폼 초기화
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        setSubmitStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">문의하기</h1>
        <p className="text-xl text-muted-foreground">
          궁금하신 사항이 있으시면 언제든지 문의해 주세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>연락 정보</CardTitle>
          <CardDescription>
            아래 양식을 작성하시거나 이메일로 직접 문의해 주세요
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                이름
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="홍길동"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                이메일 *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                제목
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="문의 제목"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                메시지 *
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="문의 내용을 입력해 주세요 (최소 10자)"
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  전송 중...
                </>
              ) : (
                '문의 보내기'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold mb-4">직접 연락하기</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 이메일: bombezzang100@gmail.com</p>
              <p>⏰ 운영 시간: 평일 오전 9시 - 오후 6시 (KST)</p>
              <p>💬 답변 시간: 영업일 기준 1-2일 이내</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
