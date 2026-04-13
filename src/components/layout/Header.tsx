import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#2a2a2a] bg-[#0c0c0c] px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-lg font-semibold text-white">Backoffice</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.profile?.first_name || 'Admin'}</p>
            <p className="text-xs text-[#666]">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}