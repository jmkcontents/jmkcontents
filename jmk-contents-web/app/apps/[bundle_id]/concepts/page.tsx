import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId } from '@/lib/firebase/apps'
import { ConceptsClient } from '@/components/ConceptsClient'
import { Button } from '@/components/ui/button'

interface ConceptsPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: ConceptsPageProps) {
  const { bundle_id } = await params
  const app = await getAppByBundleId(bundle_id)

  if (!app) {
    return {
      title: '앱을 찾을 수 없습니다',
    }
  }

  const description = `${app.app_name_full || app.app_name} 시험의 핵심 개념을 정리했습니다.`

  return {
    title: `핵심 개념 - ${app.app_name} - JMK Contents`,
    description,
    openGraph: {
      title: `${app.app_name} 핵심 개념`,
      description,
      url: `https://jmkcontents.com/apps/${bundle_id}/concepts`,
      type: 'website',
    },
  }
}

export default async function ConceptsPage({ params }: ConceptsPageProps) {
  const { bundle_id } = await params
  const [app, concepts] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
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
        <span className="text-foreground">핵심 개념</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">💡 핵심 개념</h1>
        <p className="text-xl text-muted-foreground">
          {app.app_name_full || app.app_name} 시험의 핵심 개념을 정리했습니다
        </p>
      </div>

      {/* Client Component with Filtering */}
      {concepts.length > 0 ? (
        <ConceptsClient concepts={concepts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            등록된 개념이 아직 없습니다.
          </p>
          <Link href={`/apps/${bundle_id}`}>
            <Button>앱 상세로 돌아가기</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
