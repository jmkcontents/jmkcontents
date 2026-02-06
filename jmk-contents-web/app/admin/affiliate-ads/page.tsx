import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, AffiliateAd } from '@/lib/firebase/types'
import { DollarSign, Plus, ExternalLink } from 'lucide-react'
import { DeleteAffiliateAdButton } from '@/components/admin/DeleteAffiliateAdButton'
import { ToggleAffiliateAdButton } from '@/components/admin/ToggleAffiliateAdButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminAffiliateAdsPage() {
  const db = getFirestoreDb()
  const adsSnapshot = await db
    .collection(COLLECTIONS.AFFILIATE_ADS)
    .orderBy('created_at', 'desc')
    .get()

  const ads: (AffiliateAd & { id: string })[] = adsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type,
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 1,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      impressions: data.impressions ?? 0,
      clicks: data.clicks ?? 0,
      appIds: data.appIds ?? ['all'],
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    }
  })

  const totalCount = ads.length
  const activeCount = ads.filter((ad) => ad.isActive).length
  const bannerCount = ads.filter((ad) => ad.type === 'banner').length
  const interstitialCount = ads.filter((ad) => ad.type === 'interstitial').length
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0)
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">제휴광고 관리</h1>
          <p className="text-muted-foreground">등록된 제휴광고: {totalCount}개</p>
        </div>
        <Link href="/admin/affiliate-ads/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 광고 추가
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{totalCount}</div>
            <div className="text-xs text-muted-foreground">총 광고</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1 text-green-600">{activeCount}</div>
            <div className="text-xs text-muted-foreground">활성</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{bannerCount}</div>
            <div className="text-xs text-muted-foreground">배너</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{interstitialCount}</div>
            <div className="text-xs text-muted-foreground">전면</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{totalImpressions.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">총 노출</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{avgCTR}%</div>
            <div className="text-xs text-muted-foreground">평균 CTR</div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      {ads.length > 0 ? (
        <div className="space-y-4">
          {ads.map((ad) => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'
            return (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Preview Image */}
                    {ad.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ad.type === 'banner'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {ad.type === 'banner' ? '배너' : '전면'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ad.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ad.isActive ? '활성' : '비활성'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">우선순위:</span>{' '}
                          <span className="font-medium">{ad.priority}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">노출:</span>{' '}
                          <span className="font-medium">{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">클릭:</span>{' '}
                          <span className="font-medium">{ad.clicks.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CTR:</span>{' '}
                          <span className="font-medium">{ctr}%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>타겟: {ad.appIds.join(', ')}</span>
                        <span>•</span>
                        <span>기간: {formatDate(ad.startDate)} ~ {formatDate(ad.endDate)}</span>
                        <span>•</span>
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          링크 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href={`/admin/affiliate-ads/${ad.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          수정
                        </Button>
                      </Link>
                      <ToggleAffiliateAdButton
                        adId={ad.id}
                        currentStatus={ad.isActive}
                      />
                      <DeleteAffiliateAdButton
                        adId={ad.id}
                        adTitle={ad.title}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">등록된 제휴광고가 없습니다</p>
            <Link href="/admin/affiliate-ads/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                첫 번째 광고 추가하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
