import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { supabase } from '../supabaseClient'
import { getProgressStyle } from '../utils/projectUtils'

export default function ProyectoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proyecto, setProyecto] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const cargarProyecto = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: queryError } = await supabase
          .from('proyectos')
          .select('id_proyecto, nombre, descripcion, fecha_inicio, fecha_fin, estado')
          .eq('id_proyecto', id)
          .maybeSingle()

        if (queryError) throw queryError
        if (!data) throw new Error('Proyecto no encontrado.')

        if (isMounted) setProyecto(data)
      } catch (err) {
        if (isMounted) setError(err.message || 'No se pudo cargar el proyecto.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    cargarProyecto()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF2F2', color: '#2D2D3F' }}>
      <Header active="Mis Tableros" />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/mis-tableros"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6D5BD0]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Tableros
        </Link>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && proyecto ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: '#6D5BD01A' }}
              >
                <LayoutGrid className="h-6 w-6" style={{ color: '#6D5BD0' }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-extrabold"
                  style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {proyecto.nombre}
                </h1>
                <p className="mt-2 text-sm text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {proyecto.descripcion || 'Sin descripción'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/tablero')}
              className="mt-8 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
              style={{ background: getProgressStyle(100).gradient, fontFamily: 'Nunito, sans-serif' }}
            >
              Ir al tablero Kanban
            </button>
          </div>
        ) : null}
      </main>
    </div>
  )
}
