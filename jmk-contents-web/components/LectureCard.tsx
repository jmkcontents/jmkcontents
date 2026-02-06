'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lecture } from '@/lib/firebase/types'
import { Play, Clock } from 'lucide-react'

interface LectureCardProps {
  lecture: Lecture
  onClick?: () => void
}

export function LectureCard({ lecture, onClick }: LectureCardProps) {
  // 재생 시간을 분:초 형식으로 변환
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 내용을 100자로 제한
  const truncatedDescription = lecture.description
    ? lecture.description.length > 100
      ? lecture.description.substring(0, 100) + '...'
      : lecture.description
    : lecture.transcript
    ? lecture.transcript.length > 100
      ? lecture.transcript.substring(0, 100) + '...'
      : lecture.transcript
    : '강의 내용이 없습니다.'

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg flex-1">{lecture.title}</CardTitle>
          <div className="flex-shrink-0">
            <Play className="w-5 h-5 text-primary" />
          </div>
        </div>
        {lecture.category && (
          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs w-fit">
            {lecture.category}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="mb-4 flex-1">
          {truncatedDescription}
        </CardDescription>

        {/* Duration and Audio Status */}
        <div className="flex items-center gap-4 mt-auto text-sm text-muted-foreground">
          {lecture.duration_seconds && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(lecture.duration_seconds)}</span>
            </div>
          )}
          {lecture.audio_url && (
            <span className="text-primary text-xs">🎧 오디오 있음</span>
          )}
        </div>

        <div className="text-xs text-primary mt-2 text-center">
          자세히 보기 / 재생
        </div>
      </CardContent>
    </Card>
  )
}
