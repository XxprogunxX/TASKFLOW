import { useState, useEffect } from 'react'
import { FileText, Search, Code, CheckCircle, Clock, Info } from 'lucide-react'
import Header from '../components/Header'
import { supabase } from '../supabaseClient'

export default function EspecificacionesPage() {
  const [usuario, setUsuario] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (authData?.user) {
          const { data: usr } = await supabase
            .from('usuarios')
            .select('nombre, correo')
            .eq('auth_id', authData.user.id)
            .maybeSingle()

          const nombre = usr?.nombre || authData.user.email || 'Usuario'
          setUsuario({
            nombre,
            iniciales: nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            color: '#6D5BD0',
          })
        }
      } catch (err) {
        console.error('Error al cargar usuario:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const specs = [
    {
      id: 1,
      titulo: 'Arquitectura del Sistema & API Supabase',
      categoria: 'Backend & BD',
      version: 'v1.2',
      estado: 'Completado',
      fecha: '2026-07-25',
      descripcion: 'Definición de tablas (usuarios, proyectos, actividades, equipos), políticas RLS y triggers en tiempo real.',
    },
    {
      id: 2,
      titulo: 'Diseño de Interfaz & Sistema de Componentes',
      categoria: 'Frontend / UI',
      version: 'v2.0',
      estado: 'En Progreso',
      fecha: '2026-07-28',
      descripcion: 'Paleta de colores institucional, tipografía Plus Jakarta Sans / Nunito y navegación desplegable.',
    },
    {
      id: 3,
      titulo: 'Módulo de Gestión de Tareas y Drag & Drop',
      categoria: 'Funcionalidad',
      version: 'v1.0',
      estado: 'Completado',
      fecha: '2026-07-30',
      descripcion: 'Gestión por columnas (Pendiente, En Progreso, Revisión, Completado), filtros de búsqueda y asignación de responsables.',
    },
    {
      id: 4,
      titulo: 'Sistema de Notificaciones e Invitaciones',
      categoria: 'Realtime',
      version: 'v1.1',
      estado: 'En Progreso',
      fecha: '2026-08-01',
      descripcion: 'Suscripciones a canales de Supabase Realtime para notificaciones en vivo y contador dinámico en el Header.',
    },
  ]

  const filteredSpecs = specs.filter(
    (s) =>
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FFF5F7]" style={{ backgroundColor: '#FFF5F7', color: '#2D2D3F' }}>
      <Header
        active="Especificaciones"
        initials={usuario?.iniciales || '?'}
        avatarColor={usuario?.color || '#6D5BD0'}
        nombreUsuario={usuario?.nombre || 'Usuario'}
      />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 rounded-[32px] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Especificaciones Técnicas
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
              Documentación técnica, arquitectura y requerimientos del proyecto TaskFlow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B80]" />
              <input
                type="search"
                placeholder="Buscar especificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-2xl border border-[#E5E7F0] bg-white pl-10 pr-4 text-sm text-[#2D2D3F] outline-none transition focus:border-[#6D5BD0]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6D5BD0] border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredSpecs.map((spec) => (
              <div
                key={spec.id}
                className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md border border-[#EAE6FF]"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ backgroundColor: '#F5F3FF', color: '#6D5BD0' }}
                    >
                      <Code className="h-3.5 w-3.5" />
                      {spec.categoria}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: spec.estado === 'Completado' ? '#DCFCE7' : '#FEF3C7',
                        color: spec.estado === 'Completado' ? '#16A34A' : '#D97706',
                      }}
                    >
                      {spec.estado === 'Completado' ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {spec.estado}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold"
                    style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {spec.titulo}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {spec.descripcion}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-[#7C7C93]">
                  <span>Versión: <strong className="text-[#4A3A6B]">{spec.version}</strong></span>
                  <span>Última actualización: {spec.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
