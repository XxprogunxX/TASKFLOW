import { ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import TarjetaEquipoPrincipal from '../components/TarjetaEquipoPrincipal'
import TarjetaEquipoSecundario from '../components/TarjetaEquipoSecundario'
import { useMisEquipos } from '../hooks/useMisEquipos'
import { useState, useCallback } from 'react'

export default function MisEquiposPage() {
  const { equipos, equipoPrincipal, isLoading, error } = useMisEquipos()
  const [scrollIndex, setScrollIndex] = useState(0)

  const handlePrev = useCallback(() => {
    setScrollIndex(prev => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setScrollIndex(prev => Math.min(equipos.length - 2, prev + 1))
  }, [equipos.length])

  const getVisibleEquipos = useCallback(() => {
    if (equipos.length <= 2) return equipos
    return equipos.slice(scrollIndex, scrollIndex + 2)
  }, [equipos, scrollIndex])

  const visibleEquipos = getVisibleEquipos()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF2F2' }}>
      <Header active="Mis Equipos" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        {/* Header de página */}
        <div className="mb-8">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Mis Equipos
          </h1>
          <p
            className="mt-2 text-base"
            style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}
          >
            Integrantes, roles y proyectos asignados
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        ) : null}

        {/* Error state */}
        {!isLoading && error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Estado vacío */}
        {!isLoading && !error && !equipoPrincipal && equipos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-[#4A3A6B]">Aún no perteneces a ningún equipo.</p>
            <p className="mt-2 text-sm text-[#6B6B80]">Únete a un equipo o crea uno para empezar.</p>
          </div>
        ) : null}

        {/* Layout de equipos */}
        {!isLoading && !error && equipoPrincipal ? (
          <div className="relative">
            {/* Flecha izquierda */}
            {equipos.length > 2 && scrollIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:shadow-xl"
                style={{ color: '#6B6B80' }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Grid de 3 columnas */}
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Equipo secundario izquierda */}
              {visibleEquipos[0] ? (
                <TarjetaEquipoSecundario
                  equipo={visibleEquipos[0].equipos}
                  integrantes={visibleEquipos[0].integrantes}
                  colorIndex={0}
                />
              ) : (
                <div className="h-full rounded-2xl border-2 border-dashed border-slate-200" />
              )}

              {/* Equipo principal centro */}
              <TarjetaEquipoPrincipal
                equipo={equipoPrincipal.equipos}
                integrantes={equipoPrincipal.integrantes}
                proyecto={equipoPrincipal.proyectos}
              />

              {/* Equipo secundario derecha */}
              {visibleEquipos[1] ? (
                <TarjetaEquipoSecundario
                  equipo={visibleEquipos[1].equipos}
                  integrantes={visibleEquipos[1].integrantes}
                  colorIndex={1}
                />
              ) : (
                <div className="h-full rounded-2xl border-2 border-dashed border-slate-200" />
              )}
            </div>

            {/* Flecha derecha */}
            {equipos.length > 2 && scrollIndex < equipos.length - 2 && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:shadow-xl"
                style={{ color: '#6B6B80' }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
