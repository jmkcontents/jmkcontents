'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { adminLogout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  AppWindow,
  BookOpen,
  Mic,
  Mail,
  LogOut,
  Home,
  DollarSign,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/apps', label: 'Apps', icon: AppWindow },
  { href: '/admin/concepts', label: 'Concepts', icon: BookOpen },
  { href: '/admin/lectures', label: 'Lectures', icon: Mic },
  { href: '/admin/affiliate-ads', label: 'Affiliate Ads', icon: DollarSign },
  { href: '/admin/contacts', label: 'Contacts', icon: Mail },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="font-bold text-xl flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            <span>JMK Admin</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            <div className="ml-4 pl-4 border-l flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  사이트로
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
