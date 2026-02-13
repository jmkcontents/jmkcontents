import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, Lecture } from '@/lib/firebase/types'
import { Mic, Plus, Clock, Pencil } from 'lucide-react'
import { DeleteLectureButton } from '@/components/admin/DeleteLectureButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLecturesPage() {
  const db = getFirestoreDb()
  const lecturesSnapshot = await db
    .collection(COLLECTIONS.LECTURES)
    .orderBy('created_at', 'desc')
    .limit(50)
    .get()

  const lectures: (Lecture & { id: string })[] = lecturesSnapshot.docs.map((doc) => ({
    id: doc.id,
    app_id: doc.data().app_id,
    category: doc.data().category,
    title: doc.data().title,
    description: doc.data().description,
    audio_url: doc.data().audio_url,
    duration_seconds: doc.data().duration_seconds,
    transcript: doc.data().transcript,
    created_at: doc.data().created_at?.toDate() || new Date(),
    updated_at: doc.data().updated_at?.toDate() || new Date(),
  }))

  const totalCount = lecturesSnapshot.size
  const withAudio = lectures.filter((l) => l.audio_url).length
  const withTranscript = lectures.filter((l) => l.transcript).length

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lectures 관리</h1>
          <p className="text-muted-foreground">등록된 강의: {totalCount}개</p>
        </div>
        <Link href="/admin/lectures/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 강의 추가
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{totalCount}</div>
            <div className="text-sm text-muted-foreground">총 강의</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{withAudio}</div>
            <div className="text-sm text-muted-foreground">오디오 파일 있음</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{withTranscript}</div>
            <div className="text-sm text-muted-foreground">스크립트 있음</div>
          </CardContent>
        </Card>
      </div>

      {/* Lectures List */}
      {lectures.length > 0 ? (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <Card key={lecture.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{lecture.title}</CardTitle>
                      {lecture.category && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          {lecture.category}
                        </span>
                      )}
                      {lecture.duration_seconds && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(lecture.duration_seconds)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>App: {lecture.app_id}</span>
                      <span>•</span>
                      <span>{new Date(lecture.created_at).toLocaleDateString('ko-KR')}</span>
                      <span>•</span>
                      <div className="flex gap-2">
                        {lecture.audio_url && (
                          <span className="text-green-600">🎧 오디오</span>
                        )}
                        {lecture.transcript && (
                          <span className="text-blue-600">📝 스크립트</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/lectures/${lecture.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="w-3 h-3" />
                        수정
                      </Button>
                    </Link>
                    <DeleteLectureButton lectureId={lecture.id} lectureTitle={lecture.title} />
                  </div>
                </div>
              </CardHeader>
              {lecture.description && (
                <CardContent>
                  <p className="text-sm line-clamp-2">{lecture.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Mic className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">등록된 강의가 없습니다</p>
            <Link href="/admin/lectures/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                첫 번째 강의 추가하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
