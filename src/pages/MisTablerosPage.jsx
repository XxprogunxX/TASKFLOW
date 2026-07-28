import { HelpCircle, LayoutGrid, Plus, SquareCheckBig } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import ModalNuevoProyecto from '../components/ModalNuevoProyecto'
import { useMisTableros } from '../hooks/useMisTableros'

export default function MisTablerosPage() {
  const { proyectos, crearProyecto, colorOptions } = useMisTableros()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCrear = (datos) => {
    crearProyecto(datos)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-white" style={{ color: '#2D2D3F' }}>
      <Header active="Mis Tableros" />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Mis Tableros
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
              Todos tus proyectos activos
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95"
            style={{
              background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)',
              color: '#FFFFFF',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </button>
        </div>

        {proyectos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-[#4A3A6B]">Aún no tienes proyectos.</p>
            <p className="mt-2 text-sm text-[#6B6B80]">Crea uno para empezar a organizar tu equipo.</p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className="rounded-3xl border border-[#EEF0F5] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${proyecto.color}1A` }}
                    >
                      <LayoutGrid className="h-5 w-5" style={{ color: proyecto.color }} />
                    </div>
                    <div>
                      <h2
                        className="text-base font-bold"
                        style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        {proyecto.nombre}
                      </h2>
                      <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                        {proyecto.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-extrabold" style={{ color: proyecto.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {proyecto.progreso}%
                    </p>
                    <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                      completado
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: '#EEF0F5' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${proyecto.progreso}%`, backgroundColor: proyecto.color }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    <SquareCheckBig className="h-4 w-4" />
                    {proyecto.tareasCompletadas}/{proyecto.tareasTotal} tareas completadas
                  </div>
                  <div className="flex -space-x-2">
                    {proyecto.miembros.map((miembro, index) => (
                      <div
                        key={`${proyecto.id}-${index}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
                        style={{ backgroundColor: miembro.color, fontFamily: 'Nunito, sans-serif' }}
                      >
                        {miembro.iniciales}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: '#2D2D3F', color: '#FFFFFF' }}
        aria-label="Ayuda"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <ModalNuevoProyecto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCrear={handleCrear}
        colorOptions={colorOptions}
      />
    </div>
  )
}
