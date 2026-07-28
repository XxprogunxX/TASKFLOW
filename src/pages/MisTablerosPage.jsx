import { HelpCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import ModalNuevoProyecto from '../components/ModalNuevoProyecto'
import TarjetaProyecto from '../components/TarjetaProyecto'
import { useMisTableros } from '../hooks/useMisTableros'

function TarjetaSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EEF0F5] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-5 h-2 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 flex justify-between">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="flex -space-x-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function MisTablerosPage() {
  const { proyectos, isLoading, error, isCreating, crearProyecto, colorOptions } = useMisTableros()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleCrear = async (datos) => {
    setCreateError('')
    try {
      await crearProyecto(datos)
      setIsModalOpen(false)
    } catch (err) {
      setCreateError(err.message)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF2F2', color: '#2D2D3F' }}>
      <Header active="Mis Tableros" />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-[28px] font-extrabold"
              style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
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
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95"
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

        {isLoading ? (
          <section className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <TarjetaSkeleton key={index} />
            ))}
          </section>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && proyectos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-[#4A3A6B]">Aún no tienes proyectos activos</p>
            <p className="mt-2 text-sm text-[#6B6B80]">Crea uno con el botón &quot;Nuevo proyecto&quot; para empezar.</p>
          </div>
        ) : null}

        {!isLoading && !error && proyectos.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2">
            {proyectos.map((proyecto) => (
              <TarjetaProyecto key={proyecto.id} proyecto={proyecto} />
            ))}
          </section>
        ) : null}
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
        onClose={() => {
          setCreateError('')
          setIsModalOpen(false)
        }}
        onCrear={handleCrear}
        colorOptions={colorOptions}
        isSubmitting={isCreating}
        submitError={createError}
      />
    </div>
  )
}
