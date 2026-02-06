import { AppCard } from '@/components/AppCard'
import { Button } from '@/components/ui/button'
import { getFeaturedApps, getApps } from '@/lib/firebase/apps'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
  const [featuredApps, allApps] = await Promise.all([
    getFeaturedApps(),
    getApps(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          한국 자격증 시험 준비
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {allApps.length}개 이상의 iOS 앱으로 자격증 시험을 효과적으로 준비하세요
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/apps">
            <Button size="lg">모든 앱 보기</Button>
          </Link>
          <Link href="/support">
            <Button size="lg" variant="outline">지원 센터</Button>
          </Link>
        </div>
      </section>

      {/* Featured Apps Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">추천 앱</h2>
          <Link href="/apps">
            <Button variant="ghost">전체 보기 →</Button>
          </Link>
        </div>
        {featuredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredApps.map((app) => (
              <AppCard key={app.bundle_id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              추천 앱이 아직 없습니다. 곧 업데이트될 예정입니다.
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold">모바일 최적화</h3>
          <p className="text-muted-foreground">
            언제 어디서나 스마트폰으로 편리하게 학습하세요
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold">기출문제</h3>
          <p className="text-muted-foreground">
            실제 시험 기출문제로 효과적인 학습을 제공합니다
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🎧</div>
          <h3 className="text-xl font-bold">음성 듣기</h3>
          <p className="text-muted-foreground">
            이동 중에도 음성으로 학습할 수 있습니다
          </p>
        </div>
      </section>
    </div>
  )
}
