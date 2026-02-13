import { LectureForm } from '@/components/admin/LectureForm'
import { getAllApps } from '@/lib/firebase/apps'

export default async function NewLecturePage() {
  const apps = await getAllApps()
  const appList = apps.map((app) => ({
    bundle_id: app.bundle_id,
    app_name: app.app_name,
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">새 강의 추가</h1>
      <LectureForm mode="create" apps={appList} />
    </div>
  )
}
