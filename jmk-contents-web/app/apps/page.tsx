import { getApps } from '@/lib/firebase/apps'
import { AppsClient } from '@/components/AppsClient'

export const revalidate = 3600

export default async function AppsPage() {
  const allApps = await getApps()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">모든 앱</h1>
        <p className="text-xl text-muted-foreground">
          자격증 시험 준비를 위한 {allApps.length}개의 전문 학습 앱
        </p>
      </div>

      {allApps.length > 0 ? (
        <AppsClient apps={allApps} />
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
