import React, { useEffect, useState } from 'react'
import { api, Feedback } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Bug, Lightbulb, MessageSquare } from 'lucide-react'

const typeIcon: Record<string, React.ElementType> = {
  bug: Bug,
  feature: Lightbulb,
  general: MessageSquare,
}

const statusBadgeVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
  new: 'warning',
  reviewed: 'secondary',
  resolved: 'success',
}

export function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    api.admin
      .listFeedback(typeFilter || undefined)
      .then(setFeedback)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [typeFilter])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.admin.updateFeedbackStatus(id, status)
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: status as Feedback['status'] } : f))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Feedback</h2>
        <p className="text-sm text-[#888]">Bugs, features y feedback general</p>
      </div>

      <div className="flex gap-4">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="bug">Bugs</option>
          <option value="feature">Features</option>
          <option value="general">General</option>
        </Select>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[#666]">Cargando...</div>
        ) : feedback.length === 0 ? (
          <div className="p-8 text-center text-[#666]">No hay feedback</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((f) => {
                const Icon = typeIcon[f.type] || MessageSquare
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#888]" />
                        <span className="capitalize">{f.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{f.title}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[f.status] || 'secondary'}>
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {f.severity && (
                        <Badge variant={f.severity === 'high' ? 'destructive' : 'secondary'}>
                          {f.severity}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-[#888]">{formatDate(f.created_at)}</TableCell>
                    <TableCell>
                      <Select
                        value={f.status}
                        onChange={(e) => handleStatusChange(f.id, e.target.value)}
                        className="w-32"
                      >
                        <option value="new">Nuevo</option>
                        <option value="reviewed">Revisado</option>
                        <option value="resolved">Resuelto</option>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}