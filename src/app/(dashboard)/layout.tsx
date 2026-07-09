import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/nav'
import { SidebarProvider } from '@/components/sidebar-context'
import { DashboardMain } from '@/components/dashboard-main'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SidebarProvider>
        <Navigation />
        <DashboardMain>{children}</DashboardMain>
      </SidebarProvider>
    </div>
  )
}