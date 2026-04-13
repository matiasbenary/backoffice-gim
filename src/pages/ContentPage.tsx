import { Card, CardContent } from '@/components/ui/card'

export function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Contenido</h2>
        <p className="text-sm text-[#888]">Rutinas públicas, challenges y ejercicios</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="text-center text-[#666]">
            <p className="text-lg font-medium">Próximamente</p>
            <p className="mt-2 text-sm">
              Gestión de contenido de la plataforma.
              <br />
              Incluye rutinas públicas, challenges globales
              <br />
              y ejercicios disponibles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}