'use client'

import { useState, useMemo } from 'react'
import { Concept } from '@/lib/firebase/types'
import { ConceptCard } from '@/components/ConceptCard'
import { ConceptDetailModal } from '@/components/ConceptDetailModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'

interface ConceptsClientProps {
  concepts: Concept[]
}

export function ConceptsClient({ concepts }: ConceptsClientProps) {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImportance, setSelectedImportance] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // 필터링 로직
  const filteredConcepts = useMemo(() => {
    let filtered = [...concepts]

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (concept) =>
          concept.title.toLowerCase().includes(query) ||
          concept.content.toLowerCase().includes(query) ||
          concept.keywords.toLowerCase().includes(query)
      )
    }

    // 중요도 필터
    if (selectedImportance !== null) {
      filtered = filtered.filter((concept) => concept.importance === selectedImportance)
    }

    // 카테고리 필터
    if (selectedCategory) {
      filtered = filtered.filter((concept) => concept.category === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedImportance, selectedCategory, concepts])

  // 고유 카테고리 목록
  const categories = useMemo(
    () => Array.from(new Set(concepts.map((c) => c.category))).filter(Boolean),
    [concepts]
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
              placeholder="개념, 키워드 검색..."
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터 {showFilters ? '숨기기' : '보기'}
          </Button>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Importance Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-2">중요도</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedImportance === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedImportance(null)}
                  >
                    전체
                  </Button>
                  {[5, 4, 3, 2, 1].map((importance) => (
                    <Button
                      key={importance}
                      variant={selectedImportance === importance ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedImportance(importance)}
                    >
                      {'⭐'.repeat(importance)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
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
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredConcepts.length}개의 개념
        {(searchQuery || selectedImportance !== null || selectedCategory) && (
          <span> (전체 {concepts.length}개 중)</span>
        )}
      </div>

      {/* Concepts Grid */}
      {filteredConcepts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              onClick={() => setSelectedConcept(concept)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery || selectedImportance !== null || selectedCategory
                ? '검색 결과가 없습니다.'
                : '등록된 개념이 없습니다.'}
            </p>
            {(searchQuery || selectedImportance !== null || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedImportance(null)
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
      {selectedConcept && (
        <ConceptDetailModal
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </>
  )
}
