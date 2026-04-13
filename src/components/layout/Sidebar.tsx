import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Package,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Usuarios', icon: Users },
  { to: '/gyms', label: 'Gimnasios', icon: Building2 },
  { to: '/plans', label: 'Planes', icon: CreditCard },
  { to: '/payments', label: 'Pagos', icon: Package },
  { to: '/content', label: 'Contenido', icon: FileText },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/logs', label: 'Logs', icon: FileText },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[#2a2a2a] bg-[#0c0c0c] transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex h-14 items-center border-b border-[#2a2a2a] px-4">
        {!collapsed && (
          <span className="font-display text-lg font-bold text-lime-400">GIMAPP</span>
        )}
        {collapsed && <span className="font-display text-lg font-bold text-lime-400">G</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-lime-400/10 text-lime-400'
                  : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center border-t border-[#2a2a2a] text-[#666] hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}