# Backoffice Admin — Plan de Desarrollo

## Overview

- **Ubicación**: `/home/matiasbenary/projects/gimapp/backoffice/`
- **Stack**: React 18 + Vite 5 + TypeScript + shadcn/ui + Tailwind CSS
- **Objetivo**: Panel de administración completo para gestionar usuarios, gimnasios, métricas, contenido y más

## Tech Stack

| Herramienta | Propósito |
|-------------|-----------|
| React 18 | Framework UI |
| Vite 5 | Build tool |
| TypeScript | Tipado estático |
| shadcn/ui | Componentes sobre Radix UI |
| Tailwind CSS | Estilos (tema oscuro) |
| React Router 6 | Navegación |
| fetch API | Comunicación con backend |

## Estructura de archivos

```
backoffice/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── tailwind.config.js
├── components.json          # shadcn/ui config
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   ├── api.ts           # fetch wrapper + endpoints admin
    │   └── utils.ts         # shadcn cn() utility
    ├── components/
    │   ├── ui/              # shadcn/ui components (Button, Card, Table, etc.)
    │   └── layout/
    │       ├── Sidebar.tsx
    │       └── Header.tsx
    ├── contexts/
    │   └── AuthContext.tsx  # JWT auth + rol admin validation
    └── pages/
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── UsersPage.tsx
        ├── GymsPage.tsx
        ├── PlansPage.tsx
        ├── PaymentsPage.tsx
        ├── ContentPage.tsx
        ├── FeedbackPage.tsx
        ├── LogsPage.tsx
        └── SettingsPage.tsx
```

## Secciones del Backoffice

### 1. Dashboard / Métricas
- KPIs: usuarios totales, gimnasios activos, feedback pendiente, membresías activas
- Métricas de uso y actividad
- **Estado API**: Parcial — `/api/v1/gyms/:id/manage/stats`

### 2. Gestión de Usuarios
- Lista paginada de usuarios con filtros (por rol, estado)
- Ver/editar perfil de usuario
- Activar/desactivar usuarios
- **Estado API**: ⚠️ Faltan endpoints dedicados para admin

### 3. Gestión de Gimnasios
- Lista de gimnasios con CRUD
- Aprobar gimnasios pendientes (`pending_gym`)
- Crear gimnasio o cadena de gimnasios
- Asignar owner a un gym
- **Estado API**: ✅ Completo

### 4. Gestión de Planes/Suscripciones
- Membresías agrupadas por gym
- Filtro por estado (pending/active/cancelled)
- Activar, cancelar, renovar membresías
- **Estado API**: Parcial — `GET /gyms/:id/manage/memberships`

### 5. Gestión de Pagos
- Historial de transacciones
- Estados de pago (completed, pending, refunded)
- **Estado API**: ⚠️ Faltan endpoints backend

### 6. Gestión de Contenido
- Rutinas públicas
- Challenges globales
- Gestión de ejercicios
- **Estado API**: Parcial — endpoints de rutinas y challenges existentes

### 7. Feedback y Soporte
- Lista de bugs, features y feedback general
- Cambiar estado (new → reviewed → resolved)
- Ver detalles y metadata
- **Estado API**: ✅ Completo — `/api/v1/admin/feedback`

### 8. Logs y Auditoría
- Registro de acciones del sistema
- Filtrado por tipo de evento, fecha, usuario
- **Estado API**: ⚠️ Faltan endpoints backend

### 9. Configuración del Sistema
- Feature flags
- Configuraciones globales
- **Estado API**: ⚠️ Faltan endpoints backend

## Autenticación

- Mismo patrón que el frontend existente
- JWT almacenado en `localStorage` (`auth_token`, `refresh_token`)
- Validación de rol `admin` en `AuthContext`
- Redirect a login si no es admin

## Endpoints del Backend a Utilizar

### Admin endpoints (requieren `RoleAdmin`)
```
GET    /api/v1/admin/pending-gyms
POST   /api/v1/admin/pending-gyms/:user_id/approve
GET    /api/v1/admin/feedback
PATCH  /api/v1/admin/feedback/:id/status

POST   /api/v1/gyms                    (create gym)
POST   /api/v1/gyms/chains            (create chain)
POST   /api/v1/gyms/:gym_id/owner      (assign owner)

GET    /api/v1/gyms/:gym_id/manage/stats
GET    /api/v1/gyms/:gym_id/manage/machines
GET    /api/v1/gyms/:gym_id/manage/staff
GET    /api/v1/gyms/:gym_id/manage/members
GET    /api/v1/gyms/:gym_id/manage/memberships
GET    /api/v1/gyms/:gym_id/manage/classes
GET    /api/v1/gyms/:gym_id/manage/challenges

GET    /api/v1/users/me
```

### Próximos endpoints a implementar en backend
- `GET /api/v1/admin/users` — lista de usuarios con filtros
- `PATCH /api/v1/admin/users/:id` — actualizar usuario (activar/desactivar)
- `GET /api/v1/admin/payments` — historial de transacciones
- `GET /api/v1/admin/logs` — logs de auditoría

## Decisiones de Diseño

1. **Mismo estilo visual que frontend**: Tema oscuro `#0c0c0c`, acentos `lime-400`, Barlow font
2. **Sidebar colapsable**: Navegación lateral que se puede minimizar
3. **UI de shadcn/ui**: Componentes accesibles y customizables
4. **Placeholder states**: Secciones sin endpoint visiblecerán estados vacíos, listos para integrar