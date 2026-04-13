import { useEffect, useState } from 'react'
import { api, UserAdminResponse } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const roleLabels: Record<string, string> = {
  client: 'Cliente',
  coach: 'Coach',
  gym: 'Gimnasio',
  admin: 'Admin',
  pending_gym: 'Pendiente Gym',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  client: 'secondary',
  coach: 'default',
  gym: 'success',
  admin: 'warning',
  pending_gym: 'destructive',
}

export function UsersPage() {
  const [users, setUsers] = useState<UserAdminResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const pageSize = 20

  const fetchUsers = () => {
    setLoading(true)
    const isActive = activeFilter === '' ? undefined : activeFilter === 'true'
    api.admin
      .listUsers({
        page,
        page_size: pageSize,
        role: roleFilter || undefined,
        is_active: isActive,
        search: search || undefined,
      })
      .then((res) => {
        setUsers(res.data)
        setTotalPages(res.meta.total_pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter, activeFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== '' || page === 1) {
        setPage(1)
      }
      fetchUsers()
    }, 400)
    return () => clearTimeout(debounce)
  }, [search])

  const handleToggleActive = async (user: UserAdminResponse) => {
    setTogglingId(user.id)
    try {
      await api.admin.updateUser(user.id, { is_active: !user.is_active })
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      )
    } catch (e) {
      console.error(e)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Usuarios</h2>
        <p className="text-sm text-[#888]">Gestión de usuarios de la plataforma</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los roles</option>
          <option value="client">Cliente</option>
          <option value="coach">Coach</option>
          <option value="gym">Gimnasio</option>
          <option value="admin">Admin</option>
        </Select>
        <Select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </Select>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[#666]">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[#666]">No se encontraron usuarios</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-[#888]">{user.id}</TableCell>
                  <TableCell className="font-medium">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : '—'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[user.role] || 'secondary'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#888]">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(user)}
                      disabled={togglingId === user.id}
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#888]">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}