'use client'

import { useState } from 'react'
import { App, APP_CATEGORIES, AppCategory } from '@/lib/firebase/types'
import { AppCard } from './AppCard'

interface AppsClientProps {
  apps: App[]
}

export function AppsClient({ apps }: AppsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all')

  const filteredApps = selectedCategory === 'all'
    ? apps
    : apps.filter(app => app.app_category === selectedCategory)

  // 카테고리별 앱 수 계산
  const categoryCounts = APP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = apps.filter(app => app.app_category === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          전체 ({apps.length})
        </button>
        {APP_CATEGORIES.map((category) => (
          categoryCounts[category] > 0 && (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category} ({categoryCounts[category]})
            </button>
          )
        ))}
      </div>

      {/* 앱 그리드 */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.bundle_id} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            해당 분류의 앱이 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
