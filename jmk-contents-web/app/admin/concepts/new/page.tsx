import { ConceptForm } from '@/components/admin/ConceptForm'
import { getAllApps } from '@/lib/firebase/apps'

export default async function NewConceptPage() {
  const apps = await getAllApps()
  const appList = apps.map((app) => ({
    bundle_id: app.bundle_id,
    app_name: app.app_name,
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">새 개념 추가</h1>
      <ConceptForm mode="create" apps={appList} />
    </div>
  )
}
