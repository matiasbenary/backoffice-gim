import { useEffect, useState } from 'react'
import { api, SystemConfig } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TOGGLE_KEYS = ['maintenance_mode', 'registration_enabled']

function ToggleSetting({
  setting,
  onUpdate,
}: {
  setting: SystemConfig
  onUpdate: (key: string, value: string) => Promise<void>
}) {
  const isOn = setting.value === 'true'
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    setSaving(true)
    await onUpdate(setting.key, isOn ? 'false' : 'true').finally(() => setSaving(false))
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        isOn ? 'bg-[#39FF14]' : 'bg-[#333]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function NumericSetting({
  setting,
  onUpdate,
}: {
  setting: SystemConfig
  onUpdate: (key: string, value: string) => Promise<void>
}) {
  const [val, setVal] = useState(setting.value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(setting.key, val).finally(() => setSaving(false))
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-24"
      />
      <Button size="sm" variant="default" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = () => {
    setLoading(true)
    setError(null)
    api.admin
      .getSettings()
      .then(setSettings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleUpdate = async (key: string, value: string) => {
    await api.admin.updateSetting(key, value)
    fetchSettings()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Configuración</h2>
        <p className="text-sm text-[#888]">Feature flags y configuración global</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-[#666]">Cargando...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-red-400">{error}</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {settings.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium text-white">{s.key}</p>
                  {s.description && (
                    <p className="mt-0.5 text-xs text-[#888]">{s.description}</p>
                  )}
                </div>
                <div className="ml-6 flex items-center">
                  {TOGGLE_KEYS.includes(s.key) ? (
                    <ToggleSetting setting={s} onUpdate={handleUpdate} />
                  ) : (
                    <NumericSetting setting={s} onUpdate={handleUpdate} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
