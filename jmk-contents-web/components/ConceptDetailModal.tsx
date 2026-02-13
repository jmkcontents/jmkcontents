'use client'

import { Concept } from '@/lib/firebase/types'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ConceptDetailModalProps {
  concept: Concept
  onClose: () => void
}

export function ConceptDetailModal({ concept, onClose }: ConceptDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const importanceStars = '⭐'.repeat(concept.importance)
  const keywords = concept.keywords
    ? concept.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{concept.title}</h2>
              <span className="text-lg" title={`중요도: ${concept.importance}/5`}>
                {importanceStars}
              </span>
            </div>
            {concept.category && (
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {concept.category}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Content */}
          <section>
            <h3 className="text-lg font-semibold mb-3">개념 설명</h3>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
              {concept.content}
            </div>
          </section>

          {/* Study Note */}
          {concept.study_note && (
            <section>
              <h3 className="text-lg font-semibold mb-3">📝 학습 노트</h3>
              <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                {concept.study_note}
              </div>
            </section>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">🔖 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Related Questions */}
          {concept.related_question_ids && concept.related_question_ids.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">📚 관련 문제</h3>
              <p className="text-sm text-muted-foreground">
                {concept.related_question_ids.length}개의 관련 문제가 있습니다.
                앱에서 직접 풀어보세요!
              </p>
            </section>
          )}

          {/* Metadata */}
          <section className="text-xs text-muted-foreground pt-4 border-t">
            <div className="flex gap-4">
              <span>생성: {new Date(concept.created_at).toLocaleDateString('ko-KR')}</span>
              <span>수정: {new Date(concept.updated_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
