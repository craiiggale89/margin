import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminLayoutContent from '@/components/admin/AdminLayoutContent'

export const metadata = {
  title: 'Editor Control Panel | Margin',
}

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'EDITOR') {
    redirect('/agent')
  }

  return <AdminLayoutContent user={user}>{children}</AdminLayoutContent>
}
