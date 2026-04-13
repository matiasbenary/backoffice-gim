import { useEffect, useState } from 'react'
import { api, Gym, PendingGym } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Plus, Check, X } from 'lucide-react'

export function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [pendingGyms, setPendingGyms] = useState<PendingGym[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGym, setNewGym] = useState({ name: '', address: '', city: '', country: '' })

  useEffect(() => {
    Promise.all([api.gyms.list(), api.admin.listPendingGyms()])
      .then(([gymsData, pendingData]) => {
        setGyms(gymsData)
        setPendingGyms(pendingData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (userId: number) => {
    try {
      await api.admin.approveGym(userId)
      setPendingGyms((prev) => prev.filter((p) => p.user_id !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateGym = async () => {
    try {
      const gym = await api.gyms.create(newGym)
      setGyms((prev) => [gym, ...prev])
      setShowCreateModal(false)
      setNewGym({ name: '', address: '', city: '', country: '' })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Gimnasios</h2>
          <p className="text-sm text-[#888]">Gestión de gimnasios y cadenas</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Gimnasio
        </Button>
      </div>

      {pendingGyms.length > 0 && (
        <Card className="border-yellow-600/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">Gimnasios Pendientes de Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingGyms.map((pg) => (
                  <TableRow key={pg.id}>
                    <TableCell className="font-medium">{pg.gym_name}</TableCell>
                    <TableCell className="text-[#888]">{pg.address}</TableCell>
                    <TableCell className="text-[#888]">{pg.city}</TableCell>
                    <TableCell>{pg.email}</TableCell>
                    <TableCell className="text-[#888]">{formatDate(pg.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(pg.user_id)}>
                          <Check className="mr-1 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos los Gimnasios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-[#666]">Cargando...</div>
          ) : gyms.length === 0 ? (
            <div className="p-8 text-center text-[#666]">No hay gimnasios registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell className="text-[#888]">{gym.id}</TableCell>
                    <TableCell className="font-medium">{gym.name}</TableCell>
                    <TableCell>{gym.city}</TableCell>
                    <TableCell className="text-[#888]">{gym.country}</TableCell>
                    <TableCell>
                      <Badge variant={gym.is_active ? 'success' : 'secondary'}>
                        {gym.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#888]">{formatDate(gym.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Crear Gimnasio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newGym.name}
                  onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={newGym.address}
                  onChange={(e) => setNewGym({ ...newGym, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    value={newGym.city}
                    onChange={(e) => setNewGym({ ...newGym, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input
                    value={newGym.country}
                    onChange={(e) => setNewGym({ ...newGym, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateGym}>Crear</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}