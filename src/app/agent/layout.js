import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AgentLayoutContent from '@/components/agent/AgentLayoutContent'

export const metadata = {
  title: 'Agent Hub | Margin',
}

export default async function AgentLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Editors can also access agent hub
  if (user.role !== 'AGENT' && user.role !== 'EDITOR') {
    redirect('/login')
  }

  return <AgentLayoutContent user={user}>{children}</AgentLayoutContent>
}
