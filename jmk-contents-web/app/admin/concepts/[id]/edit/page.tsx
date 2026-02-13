import { notFound } from 'next/navigation'
import { ConceptForm } from '@/components/admin/ConceptForm'
import { getAllApps } from '@/lib/firebase/apps'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, Concept } from '@/lib/firebase/types'

interface EditConceptPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditConceptPage({ params }: EditConceptPageProps) {
  const { id } = await params
  const db = getFirestoreDb()

  const doc = await db.collection(COLLECTIONS.CONCEPTS).doc(id).get()
  if (!doc.exists) {
    notFound()
  }

  const data = doc.data()!
  const concept: Concept = {
    id: doc.id,
    app_id: data.app_id,
    category: data.category || '',
    title: data.title,
    content: data.content,
    importance: data.importance || 3,
    keywords: data.keywords || '',
    study_note: data.study_note || '',
    related_question_ids: data.related_question_ids || [],
    created_at: data.created_at?.toDate() || new Date(),
    updated_at: data.updated_at?.toDate() || new Date(),
  }

  const apps = await getAllApps()
  const appList = apps.map((app) => ({
    bundle_id: app.bundle_id,
    app_name: app.app_name,
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">개념 수정</h1>
      <ConceptForm mode="edit" initialData={concept} apps={appList} />
    </div>
  )
}
