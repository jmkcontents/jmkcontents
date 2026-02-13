import { notFound } from 'next/navigation'
import { LectureForm } from '@/components/admin/LectureForm'
import { getAllApps } from '@/lib/firebase/apps'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, Lecture } from '@/lib/firebase/types'

interface EditLecturePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditLecturePage({ params }: EditLecturePageProps) {
  const { id } = await params
  const db = getFirestoreDb()

  const doc = await db.collection(COLLECTIONS.LECTURES).doc(id).get()
  if (!doc.exists) {
    notFound()
  }

  const data = doc.data()!
  const lecture: Lecture = {
    id: doc.id,
    app_id: data.app_id,
    category: data.category || '',
    title: data.title,
    description: data.description || '',
    audio_url: data.audio_url || '',
    duration_seconds: data.duration_seconds || 0,
    transcript: data.transcript || '',
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
      <h1 className="text-3xl font-bold">강의 수정</h1>
      <LectureForm mode="edit" initialData={lecture} apps={appList} />
    </div>
  )
}
