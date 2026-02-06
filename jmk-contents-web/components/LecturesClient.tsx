'use client'

import { useState, useMemo } from 'react'
import { Lecture } from '@/lib/firebase/types'
import { LectureCard } from '@/components/LectureCard'
import { LectureDetailModal } from '@/components/LectureDetailModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'

interface LecturesClientProps {
  lectures: Lecture[]
}

export function LecturesClient({ lectures }: LecturesClientProps) {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // 필터링 로직
  const filteredLectures = useMemo(() => {
    let filtered = [...lectures]

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query) ||
          (lecture.description && lecture.description.toLowerCase().includes(query)) ||
          (lecture.transcript && lecture.transcript.toLowerCase().includes(query))
      )
    }

    // 카테고리 필터
    if (selectedCategory) {
      filtered = filtered.filter((lecture) => lecture.category === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedCategory, lectures])

  // 고유 카테고리 목록
  const categories = useMemo(
    () => Array.from(new Set(lectures.map((l) => l.category).filter(Boolean))) as string[],
    [lectures]
  )

  return (
    <>
      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="강의 제목, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          {categories.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              필터 {showFilters ? '숨기기' : '보기'}
            </Button>
          )}

          {/* Filters */}
          {showFilters && categories.length > 0 && (
            <div className="pt-4 border-t">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-2">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    전체
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredLectures.length}개의 강의
        {(searchQuery || selectedCategory) && (
          <span> (전체 {lectures.length}개 중)</span>
        )}
      </div>

      {/* Lectures Grid */}
      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              onClick={() => setSelectedLecture(lecture)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery || selectedCategory
                ? '검색 결과가 없습니다.'
                : '등록된 강의가 없습니다.'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory(null)
                }}
              >
                필터 초기화
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedLecture && (
        <LectureDetailModal
          lecture={selectedLecture}
          onClose={() => setSelectedLecture(null)}
        />
      )}
    </>
  )
}
