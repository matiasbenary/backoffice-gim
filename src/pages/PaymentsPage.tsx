import { useEffect, useState } from 'react'
import { api, Gym, PaymentResponse, PaginationMeta } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  expired: 'secondary',
  cancelled: 'destructive',
  pending: 'warning',
}

const PAGE_SIZE = 20

export function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [gymId, setGymId] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    api.gyms.list().then(setGyms).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    api.admin
      .listPayments({
        page,
        page_size: PAGE_SIZE,
        ...(gymId ? { gym_id: Number(gymId) } : {}),
        ...(status ? { status } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      })
      .then(({ data, meta: m }) => {
        setPayments(data ?? [])
        setMeta(m)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, gymId, status, startDate, endDate])

  const handleFilterChange = () => setPage(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Pagos</h2>
        <p className="text-sm text-[#888]">Historial de transacciones y pagos</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={gymId}
          onChange={(e) => { setGymId(e.target.value); handleFilterChange() }}
        >
          <option value="">Todos los gimnasios</option>
          {gyms.map((g) => (
            <option key={g.id} value={String(g.id)}>{g.name}</option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); handleFilterChange() }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="expired">Expirado</option>
          <option value="cancelled">Cancelado</option>
          <option value="pending">Pendiente</option>
        </Select>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); handleFilterChange() }}
          placeholder="Desde"
        />

        <Input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); handleFilterChange() }}
          placeholder="Hasta"
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[#666]">Cargando...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-[#666]">No se encontraron pagos</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gimnasio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-[#888]">{p.id}</TableCell>
                  <TableCell>{p.user_email}</TableCell>
                  <TableCell>{p.gym_name}</TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[p.status] || 'secondary'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#888]">{formatDate(p.start_date)}</TableCell>
                  <TableCell className="text-[#888]">{formatDate(p.end_date)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.price, p.currency)}</TableCell>
                  <TableCell className="text-[#888]">{formatDate(p.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#888]">
          <span>
            Página {meta.page} de {meta.total_pages} ({meta.total_items} registros)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
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
