const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface PaginatedApiResponse<T> {
  success: boolean
  data?: T
  meta?: PaginationMeta
  error?: string
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

async function doFetch(path: string, options: RequestInit): Promise<Response> {
  const token = localStorage.getItem('auth_token')
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  const json: ApiResponse<{ token: string; refresh_token: string }> = await res.json()
  if (json.success && json.data?.token) {
    localStorage.setItem('auth_token', json.data.token)
    localStorage.setItem('refresh_token', json.data.refresh_token)
    return true
  }
  return false
}

async function requestPaginated<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<{ data: T; meta: PaginationMeta }> {
  let res = await doFetch(path, options)
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return requestPaginated<T>(path, options, true)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    throw new Error('Tu sesión expiró. Iniciá sesión nuevamente.')
  }
  const json: PaginatedApiResponse<T> = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Error en la petición')
  }
  return { data: json.data as T, meta: json.meta as PaginationMeta }
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  let res = await doFetch(path, options)
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return request<T>(path, options, true)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    throw new Error('Tu sesión expiró. Iniciá sesión nuevamente.')
  }
  const json: ApiResponse<T> = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Error en la petición')
  }
  return json.data as T
}

export interface User {
  id: number
  email: string
  role: 'client' | 'coach' | 'gym' | 'admin' | 'pending_gym'
  is_active: boolean
  created_at: string
  profile?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface UserAdminResponse {
  id: number
  email: string
  role: 'client' | 'coach' | 'gym' | 'admin' | 'pending_gym'
  is_active: boolean
  created_at: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

export interface AdminUsersMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface AdminUsersResponse {
  success: boolean
  data: UserAdminResponse[]
  meta: AdminUsersMeta
}

export interface Gym {
  id: number
  name: string
  address: string
  city: string
  country: string
  phone?: string
  email?: string
  logo_url?: string
  is_active: boolean
  owner_user_id?: number
  gym_chain_id?: number
  created_at: string
}

export interface GymChain {
  id: number
  name: string
  description?: string
  logo_url?: string
  website?: string
  is_active: boolean
}

export interface PendingGym {
  id: number
  user_id: number
  gym_name: string
  address: string
  city: string
  email: string
  phone?: string
  created_at: string
}

export interface Feedback {
  id: number
  user_id: number
  type: 'bug' | 'feature' | 'general'
  status: 'new' | 'reviewed' | 'resolved'
  title: string
  description?: string
  category?: string
  severity?: string
  rating?: number
  created_at: string
}

export interface Membership {
  id: number
  user_id: number
  gym_id: number
  type: string
  status: string
  start_date: string
  end_date: string
  price: number
  currency: string
}

export interface GymStats {
  total_members: number
  active_memberships: number
  total_classes: number
  upcoming_classes: number
  total_challenges: number
  active_challenges: number
}

export interface DashboardStats {
  total_users: number
  active_gyms: number
  pending_gyms: number
  total_memberships: number
  active_memberships: number
  new_feedback: number
}

export interface AdminLog {
  id: number
  user_id: number
  action: string
  entity_type: string
  entity_id: number
  details: string
  ip_address: string
  user_agent: string
  created_at: string
}

export interface SystemConfig {
  id: number
  key: string
  value: string
  description: string
}

export interface PaymentResponse {
  id: number
  user_id: number
  gym_id: number
  gym_name: string
  user_email: string
  type: string
  status: string
  start_date: string
  end_date: string
  price: number
  currency: string
  created_at: string
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; refresh_token: string; user: User }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    refresh: () =>
      request<{ token: string; refresh_token: string }>('/api/v1/auth/refresh', {
        method: 'POST',
      }),
    me: () => request<User>('/api/v1/users/me'),
  },

  admin: {
    listPendingGyms: () => request<PendingGym[]>('/api/v1/admin/pending-gyms'),
    approveGym: (userId: number) =>
      request<void>(`/api/v1/admin/pending-gyms/${userId}/approve`, { method: 'POST' }),
    listFeedback: (type?: string) =>
      request<Feedback[]>(`/api/v1/admin/feedback${type ? `?type=${type}` : ''}`),
    updateFeedbackStatus: (id: number, status: string) =>
      request<void>(`/api/v1/admin/feedback/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getDashboardStats: () => request<DashboardStats>('/api/v1/analytics/summary'),
    listPayments: (params?: {
      page?: number
      page_size?: number
      gym_id?: number
      status?: string
      start_date?: string
      end_date?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.page_size) searchParams.set('page_size', String(params.page_size))
      if (params?.gym_id) searchParams.set('gym_id', String(params.gym_id))
      if (params?.status) searchParams.set('status', params.status)
      if (params?.start_date) searchParams.set('start_date', params.start_date)
      if (params?.end_date) searchParams.set('end_date', params.end_date)
      const query = searchParams.toString()
      return requestPaginated<PaymentResponse[]>(`/api/v1/admin/payments${query ? `?${query}` : ''}`)
    },
    listUsers: (params?: { page?: number; page_size?: number; role?: string; is_active?: boolean; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.page_size) searchParams.set('page_size', String(params.page_size))
      if (params?.role) searchParams.set('role', params.role)
      if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active))
      if (params?.search) searchParams.set('search', params.search)
      const query = searchParams.toString()
      return request<AdminUsersResponse>(`/api/v1/admin/users${query ? `?${query}` : ''}`)
    },
    updateUser: (id: number, data: { is_active?: boolean; role?: string }) =>
      request<UserAdminResponse>(`/api/v1/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    listLogs: (params?: {
      page?: number
      page_size?: number
      user_id?: number
      action?: string
      entity_type?: string
      start_date?: string
      end_date?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.page_size) searchParams.set('page_size', String(params.page_size))
      if (params?.user_id) searchParams.set('user_id', String(params.user_id))
      if (params?.action) searchParams.set('action', params.action)
      if (params?.entity_type) searchParams.set('entity_type', params.entity_type)
      if (params?.start_date) searchParams.set('start_date', params.start_date)
      if (params?.end_date) searchParams.set('end_date', params.end_date)
      const query = searchParams.toString()
      return requestPaginated<AdminLog[]>(`/api/v1/admin/logs${query ? `?${query}` : ''}`)
    },
    getSettings: () => request<SystemConfig[]>('/api/v1/admin/settings'),
    updateSetting: (key: string, value: string) =>
      request<void>('/api/v1/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ key, value }),
      }),
  },

  gyms: {
    list: () => request<Gym[]>('/api/v1/gyms'),
    getById: (id: number) => request<Gym>(`/api/v1/gyms/${id}`),
    create: (data: Partial<Gym>) =>
      request<Gym>('/api/v1/gyms', { method: 'POST', body: JSON.stringify(data) }),
    createChain: (data: Partial<GymChain>) =>
      request<GymChain>('/api/v1/gyms/chains', { method: 'POST', body: JSON.stringify(data) }),
    assignOwner: (gymId: number, userId: number) =>
      request<void>(`/api/v1/gyms/${gymId}/owner`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      }),
    getStats: (gymId: number) => request<GymStats>(`/api/v1/gyms/${gymId}/manage/stats`),
    listMemberships: (gymId: number) =>
      request<Membership[]>(`/api/v1/gyms/${gymId}/manage/memberships`),
  },

  users: {
    me: () => request<User>('/api/v1/users/me'),
  },
}