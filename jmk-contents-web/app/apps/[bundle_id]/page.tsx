import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId, getLecturesByAppId } from '@/lib/firebase/apps'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface AppPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// Generate metadata for SEO (L1: OG 메타태그 포함)
export async function generateMetadata({ params }: AppPageProps) {
  const { bundle_id } = await params
  const app = await getAppByBundleId(bundle_id)

  if (!app) {
    return {
      title: '앱을 찾을 수 없습니다',
    }
  }

  const pageUrl = app.marketing_url || `https://jmkcontents.com/apps/${bundle_id}`

  return {
    title: `${app.app_name} - JMK Contents`,
    description: app.description || `${app.app_name} 자격증 시험 준비 앱`,
    openGraph: {
      title: app.app_name_full || app.app_name,
      description: app.description || `${app.app_name} 자격증 시험 준비 앱`,
      url: pageUrl,
      type: 'website',
      ...(app.icon_url ? { images: [{ url: app.icon_url }] } : {}),
    },
  }
}

export default async function AppPage({ params }: AppPageProps) {
  const { bundle_id } = await params
  const [app, concepts, lectures] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
    getLecturesByAppId(bundle_id),
  ])

  if (!app) {
    notFound()
  }

  // H1: App Store URL 폴백 (직접 URL 없으면 검색 링크)
  const appStoreUrl = app.app_store_url
    || `https://apps.apple.com/search?term=${encodeURIComponent(app.app_name_full || app.app_name)}`

  return (
    <div className="container mx-auto px-4 py-12">
      {/* App Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* App Icon */}
          <div className="flex-shrink-0">
            {app.icon_url ? (
              <img
                src={app.icon_url}
                alt={app.app_name}
                className="w-32 h-32 rounded-2xl shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {app.app_name[0]}
                </span>
              </div>
            )}
          </div>

          {/* App Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{app.app_name}</h1>
            {app.app_name_full && app.app_name_full !== app.app_name && (
              <p className="text-xl text-muted-foreground mb-4">
                {app.app_name_full}
              </p>
            )}

            {/* H2: App Category + Subject Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {app.app_category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {app.app_category}
                </span>
              )}
              {app.categories && app.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
              {app.rating !== undefined && app.rating > 0 && (
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-medium text-foreground">
                    {app.rating.toFixed(1)}
                  </span>
                  {app.review_count !== undefined && app.review_count > 0 && (
                    <span>({app.review_count.toLocaleString()})</span>
                  )}
                </div>
              )}
              {app.download_count !== undefined && app.download_count > 0 && (
                <div>
                  <span className="font-medium text-foreground">
                    {app.download_count.toLocaleString()}
                  </span>{' '}
                  다운로드
                </div>
              )}
            </div>

            {/* Download Button - 항상 표시 */}
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="gap-2">
                <span>🍎</span>
                App Store에서 다운로드
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* App Description (M3: description_full 포함) */}
      {(app.description || app.description_full) && (
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>앱 소개</CardTitle>
            </CardHeader>
            <CardContent>
              {app.description && (
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {app.description}
                </p>
              )}
              {app.description_full && (
                <p className="mt-4 text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {app.description_full}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 기출문제</CardTitle>
              <CardDescription>
                실제 시험에 나온 기출문제를 풀어보세요
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎧 음성 듣기</CardTitle>
              <CardDescription>
                이동 중에도 문제와 해설을 들으며 학습할 수 있습니다
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 학습 통계</CardTitle>
              <CardDescription>
                학습 진도와 성취도를 한눈에 확인하세요
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Additional Resources - H3: Lectures 조건부 표시 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">학습 자료</h2>
        <div className={`grid grid-cols-1 ${lectures.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
          <Link href={`/apps/${app.bundle_id}/concepts`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>💡 핵심 개념</CardTitle>
                <CardDescription>
                  {concepts.length > 0
                    ? `${concepts.length}개의 핵심 개념을 정리했습니다`
                    : '시험에 자주 나오는 핵심 개념을 정리했습니다'}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          {lectures.length > 0 && (
            <Link href={`/apps/${app.bundle_id}/lectures`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>🎙️ 음성 강의</CardTitle>
                  <CardDescription>
                    {lectures.length}개의 강의를 들으며 효과적으로 학습하세요
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* Support Links */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>도움이 필요하신가요?</CardTitle>
            <CardDescription>
              문의사항이 있으시면 언제든지 연락해 주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/support">
              <Button variant="outline">고객 지원</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">문의하기</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
