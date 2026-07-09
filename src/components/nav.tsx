'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Truck,
  Route,
  CreditCard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/sidebar-context'

const navigation = [
  { name: 'Trips', href: '/trips', icon: Route },
  { name: 'Trucks', href: '/trucks', icon: Truck },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { collapsed, toggleCollapsed, setHovered, expanded } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">J.P. Transport</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold">J.P. Transport</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                loading={isSigningOut}
                className="w-full justify-start text-gray-600 hover:bg-gray-50"
              >
                {!isSigningOut && <LogOut className="w-5 h-5 mr-3" />}
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-[width] duration-300 ease-in-out',
          expanded ? 'lg:w-64' : 'lg:w-20'
        )}
      >
        {/* Collapse / expand toggle */}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Inner content clips labels as the sidebar narrows */}
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center px-4 py-4 border-b border-gray-200/50 h-[73px]">
            <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div
              className={cn(
                'ml-3 min-w-0 transition-opacity duration-200',
                expanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <h1 className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">J.P. Transport</h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">Management System</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-white/60 hover:text-blue-600 hover:shadow-md'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 mr-3 shrink-0 transition-transform duration-200',
                    active ? 'scale-110' : 'group-hover:scale-105'
                  )} />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-opacity duration-200',
                      expanded ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              title="Sign Out"
              className="w-full justify-start text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-opacity duration-200',
                  expanded ? 'opacity-100' : 'opacity-0'
                )}
              >
                Sign Out
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}