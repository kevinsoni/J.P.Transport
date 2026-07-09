import { redirect } from 'next/navigation'

// Dashboard is temporarily hidden — Trips is the main page for now.
// The previous dashboard UI is preserved in git history; restore this file to bring it back.
export default function DashboardPage() {
  redirect('/trips')
}
