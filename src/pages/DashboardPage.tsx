import React, { useEffect, useState } from 'react'
import { api, DashboardStats } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  subtitle?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#888]">{title}</CardTitle>
        <Icon className="h-4 w-4 text-lime-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-[#666]">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin
      .getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-[#888]">Resumen general de la plataforma</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Usuarios"
            value={stats.total_users?.toLocaleString() ?? '—'}
            icon={Users}
            subtitle="usuarios registrados"
          />
          <StatCard
            title="Gimnasios Activos"
            value={stats.active_gyms ?? '—'}
            icon={Building2}
            subtitle={`${stats.pending_gyms ?? '—'} pendientes de aprobar`}
          />
          <StatCard
            title="Membresías Activas"
            value={stats.active_memberships ?? '—'}
            icon={CreditCard}
            subtitle={`de ${stats.total_memberships ?? '—'} total`}
          />
          <StatCard
            title="Feedback Nuevo"
            value={stats.new_feedback ?? '—'}
            icon={MessageSquare}
            subtitle="requiere atención"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-[#2a2a2a] p-8 text-center text-[#666]">
          No se pudo cargar el dashboard
        </div>
      )}
    </div>
  )
}