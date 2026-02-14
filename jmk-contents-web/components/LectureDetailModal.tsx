'use client'

import { Lecture } from '@/lib/firebase/types'
import { X, Clock } from 'lucide-react'
import { useEffect } from 'react'

interface LectureDetailModalProps {
  lecture: Lecture
  onClose: () => void
}

export function LectureDetailModal({ lecture, onClose }: LectureDetailModalProps) {
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

  // 재생 시간 포맷
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
              <h2 className="text-2xl font-bold">{lecture.title}</h2>
              {lecture.duration_seconds && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(lecture.duration_seconds)}</span>
                </div>
              )}
            </div>
            {lecture.category && (
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {lecture.category}
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
          {/* YouTube Video Player */}
          {lecture.youtube_video_id && (
            <section>
              <h3 className="text-lg font-semibold mb-3">🎬 영상 강의</h3>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${lecture.youtube_video_id}`}
                  title={lecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Audio Player (레거시 지원) */}
          {lecture.audio_url && !lecture.youtube_video_id && (
            <section>
              <h3 className="text-lg font-semibold mb-3">🎧 오디오 강의</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <audio
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  <source src={lecture.audio_url} type="audio/mpeg" />
                  <source src={lecture.audio_url} type="audio/mp4" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
              </div>
            </section>
          )}

          {/* Description */}
          {lecture.description && (
            <section>
              <h3 className="text-lg font-semibold mb-3">강의 소개</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {lecture.description}
              </div>
            </section>
          )}

          {/* Transcript */}
          {lecture.transcript && (
            <section>
              <h3 className="text-lg font-semibold mb-3">📝 강의 스크립트</h3>
              <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                {lecture.transcript}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!lecture.youtube_video_id && !lecture.audio_url && !lecture.description && !lecture.transcript && (
            <div className="text-center py-8 text-muted-foreground">
              <p>강의 내용이 아직 준비되지 않았습니다.</p>
            </div>
          )}

          {/* Metadata */}
          <section className="text-xs text-muted-foreground pt-4 border-t">
            <div className="flex gap-4">
              <span>등록: {new Date(lecture.created_at).toLocaleDateString('ko-KR')}</span>
              {lecture.updated_at && (
                <span>수정: {new Date(lecture.updated_at).toLocaleDateString('ko-KR')}</span>
              )}
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
