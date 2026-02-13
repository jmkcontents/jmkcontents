import { notFound } from 'next/navigation'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, App } from '@/lib/firebase/types'
import { Button } from '@/components/ui/button'
import { AppForm } from '@/components/admin/AppForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditAppPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function EditAppPage({ params }: EditAppPageProps) {
  const { bundle_id } = await params

  // Admin에서는 draft 포함 모든 상태의 앱을 조회
  const db = getFirestoreDb()
  const doc = await db.collection(COLLECTIONS.APPS).doc(bundle_id).get()

  if (!doc.exists) {
    notFound()
  }

  const data = doc.data()
  const app: App = {
    ...data,
    bundle_id: doc.id,
    created_at: data?.created_at?.toDate() || new Date(),
    updated_at: data?.updated_at?.toDate() || new Date(),
  } as App

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/apps">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">앱 수정</h1>
          <p className="text-muted-foreground">{bundle_id}</p>
        </div>
      </div>

      <AppForm mode="edit" initialData={app} />
    </div>
  )
}
