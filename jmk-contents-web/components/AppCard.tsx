import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { App } from '@/lib/firebase/types'

interface AppCardProps {
  app: App
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.app_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {app.app_name[0]}
              </span>
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{app.app_name}</CardTitle>
            {app.categories && (
              <div className="flex gap-2 mt-2">
                {app.categories.slice(0, 2).map((category) => (
                  <span
                    key={category}
                    className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="flex-1 line-clamp-3">
          {app.description || '자격증 시험 준비를 위한 앱'}
        </CardDescription>
        {app.rating && (
          <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
            <span>⭐</span>
            <span>{app.rating.toFixed(1)}</span>
          </div>
        )}
        <Link href={`/apps/${app.bundle_id}`} className="mt-4">
          <Button className="w-full">자세히 보기</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
