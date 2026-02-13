import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAppByBundleId, getLecturesByAppId } from '@/lib/firebase/apps'
import { LecturesClient } from '@/components/LecturesClient'
import { Button } from '@/components/ui/button'

interface LecturesPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: LecturesPageProps) {
  const { bundle_id } = await params
  const app = await getAppByBundleId(bundle_id)

  if (!app) {
    return {
      title: '앱을 찾을 수 없습니다',
    }
  }

  const description = `${app.app_name_full || app.app_name} 시험 대비 음성 강의를 들어보세요.`

  return {
    title: `음성 강의 - ${app.app_name} - JMK Contents`,
    description,
    openGraph: {
      title: `${app.app_name} 음성 강의`,
      description,
      url: `https://jmkcontents.com/apps/${bundle_id}/lectures`,
      type: 'website',
    },
  }
}

export default async function LecturesPage({ params }: LecturesPageProps) {
  const { bundle_id } = await params
  const [app, lectures] = await Promise.all([
    getAppByBundleId(bundle_id),
    getLecturesByAppId(bundle_id),
  ])

  if (!app) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/apps" className="hover:text-foreground">
          앱 목록
        </Link>
        {' / '}
        <Link href={`/apps/${bundle_id}`} className="hover:text-foreground">
          {app.app_name}
        </Link>
        {' / '}
        <span className="text-foreground">음성 강의</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎙️ 음성 강의</h1>
        <p className="text-xl text-muted-foreground">
          {app.app_name_full || app.app_name} 시험 대비 음성 강의를 들어보세요
        </p>
      </div>

      {/* Client Component with Filtering */}
      {lectures.length > 0 ? (
        <LecturesClient lectures={lectures} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            등록된 강의가 아직 없습니다.
          </p>
          <Link href={`/apps/${bundle_id}`}>
            <Button>앱 상세로 돌아가기</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
