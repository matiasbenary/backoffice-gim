import { useEffect, useState } from 'react'
import { api, Membership, Gym } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary_alt'> = {
  active: 'success',
  pending: 'warning',
  cancelled: 'destructive',
  expired: 'secondary_alt',
}

export function PlansPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.gyms.list().then(setGyms).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedGym) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.gyms
      .listMemberships(selectedGym as number)
      .then(setMemberships)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedGym])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Planes / Membresías</h2>
        <p className="text-sm text-[#888]">Membresías activas, pendientes y canceladas</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedGym} onChange={(e) => setSelectedGym(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Seleccionar gimnasio</option>
          {gyms.map((gym) => (
            <option key={gym.id} value={gym.id}>{gym.name}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membresías</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedGym ? (
            <div className="p-8 text-center text-[#666]">
              Seleccioná un gimnasio para ver sus membresías
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-[#666]">Cargando...</div>
          ) : memberships.length === 0 ? (
            <div className="p-8 text-center text-[#666]">
              No hay membresías para este gimnasio
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-[#888]">{m.id}</TableCell>
                    <TableCell className="font-medium">Usuario #{m.user_id}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[m.status] || 'secondary'}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(m.price, m.currency)}</TableCell>
                    <TableCell className="text-[#888]">{formatDate(m.start_date)}</TableCell>
                    <TableCell className="text-[#888]">{formatDate(m.end_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}