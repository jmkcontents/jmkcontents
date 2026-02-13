'use client'

import { Button } from '@/components/ui/button'
import { AppForm } from '@/components/admin/AppForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewAppPage() {
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
          <h1 className="text-3xl font-bold">새 앱 추가</h1>
        </div>
      </div>

      <AppForm mode="create" />
    </div>
  )
}
