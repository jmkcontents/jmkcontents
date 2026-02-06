import { AppCard } from '@/components/AppCard'
import { getApps } from '@/lib/firebase/apps'

export const revalidate = 3600 // Revalidate every hour

export default async function AppsPage() {
  const allApps = await getApps()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">모든 앱</h1>
        <p className="text-xl text-muted-foreground">
          자격증 시험 준비를 위한 {allApps.length}개의 전문 학습 앱
        </p>
      </div>

      {/* Apps Grid */}
      {allApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allApps.map((app) => (
            <AppCard key={app.bundle_id} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            앱이 아직 등록되지 않았습니다. 곧 업데이트될 예정입니다.
          </p>
        </div>
      )}
    </div>
  )
}
