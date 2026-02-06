'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Concept } from '@/lib/firebase/types'
import { useState } from 'react'

interface ConceptCardProps {
  concept: Concept
  onClick?: () => void
}

export function ConceptCard({ concept, onClick }: ConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 중요도를 별표로 표시
  const importanceStars = '⭐'.repeat(concept.importance)

  // 키워드를 배열로 변환
  const keywords = concept.keywords
    ? concept.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : []

  // 내용을 100자로 제한
  const truncatedContent = concept.content.length > 100
    ? concept.content.substring(0, 100) + '...'
    : concept.content

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => {
        if (onClick) {
          onClick()
        } else {
          setIsExpanded(!isExpanded)
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg flex-1">{concept.title}</CardTitle>
          <div className="flex-shrink-0 text-sm" title={`중요도: ${concept.importance}/5`}>
            {importanceStars}
          </div>
        </div>
        {concept.category && (
          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs w-fit">
            {concept.category}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="mb-4 flex-1">
          {isExpanded ? concept.content : truncatedContent}
        </CardDescription>

        {/* Keywords */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {!onClick && concept.content.length > 100 && (
          <div className="text-xs text-primary mt-2 text-center">
            {isExpanded ? '접기' : '자세히 보기'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
