import { useEffect, useState } from 'react'
import { api, AdminLog, PaginationMeta } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

function parseDetails(details: string): string {
  try {
    const obj = JSON.parse(details)
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')
  } catch {
    return details
  }
}

const PAGE_SIZE = 20

export function LogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.admin
      .listLogs({
        page,
        page_size: PAGE_SIZE,
        ...(userId ? { user_id: Number(userId) } : {}),
        ...(action ? { action } : {}),
        ...(entityType ? { entity_type: entityType } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      })
      .then(({ data, meta: m }) => {
        setLogs(data)
        setMeta(m)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, userId, action, entityType, startDate, endDate])

  const handleSearch = () => {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Logs</h2>
        <p className="text-sm text-[#888]">Registro de auditoría y actividad del sistema</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-28"
        />
        <Input
          placeholder="Acción (ej: user.deactivated)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-52"
        />
        <Input
          placeholder="Tipo de entidad"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
        <Button onClick={handleSearch} variant="default" size="sm">
          Filtrar
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[#666]">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#666]">No hay logs</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-[#888]">{log.id}</TableCell>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell>
                    <span className="capitalize">{log.entity_type}</span>
                    {log.entity_id ? <span className="text-[#888]"> #{log.entity_id}</span> : null}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-[#aaa]">
                    {parseDetails(log.details)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#888]">{log.ip_address}</TableCell>
                  <TableCell className="text-[#888]">{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#888]">
            Página {meta.page} de {meta.total_pages} ({meta.total_items} registros)
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
