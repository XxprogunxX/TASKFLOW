import { Users, Star, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react'
import Header from '../components/Header'
import IntegranteEquipo from '../components/IntegranteEquipo'
import ModalInvitarMiembro from '../components/ModalInvitarMiembro'
import { useMisEquipos } from '../hooks/useMisEquipos'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function MisEquiposPage() {
  const { equipos, equipoPrincipal, isLoading, error } = useMisEquipos()
  const [inviteEquipoId, setInviteEquipoId] = useState(null)

  // Combinar equipo principal con el resto de equipos para un listado fluido
  const todosLosEquipos = []
  if (equipoPrincipal) {
    todosLosEquipos.push({ ...equipoPrincipal, esPrincipal: true })
  }
  equipos.forEach((eq) => {
    todosLosEquipos.push({ ...eq, esPrincipal: false })
  })

  return (
    <div className="min-h-screen bg-[#FFF5F7]" style={{ backgroundColor: '#FFF5F7', color: '#2D2D3F' }}>
      <Header active="Mis Equipos" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        {/* Header de página */}
        <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm">
          <h1
            className="text-2xl font-extrabold"
            style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Mis Equipos
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            Integrantes, roles y proyectos asignados en tu organización.
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        ) : null}

        {/* Error state */}
        {!isLoading && error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Estado vacío */}
        {!isLoading && !error && todosLosEquipos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-purple-300 mb-3" />
            <p className="text-base font-bold text-[#4A3A6B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Aún no perteneces a ningún equipo
            </p>
            <p className="mt-1 text-sm text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Únete a un equipo mediante una invitación o solicita acceso a tu administrador.
            </p>
          </div>
        ) : null}

        {/* Grid de Equipos */}
        {!isLoading && !error && todosLosEquipos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {todosLosEquipos.map((eq) => {
              const equipoInfo = eq.equipos || {}
              const integrantes = eq.integrantes || []
              const proyecto = eq.proyectos

              return (
                <div
                  key={eq.id_equipo}
                  className={`flex flex-col justify-between rounded-[28px] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md border ${
                    eq.esPrincipal ? 'border-[#6D5BD0] ring-1 ring-[#6D5BD0]/30' : 'border-[#EAE6FF]'
                  }`}
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="mb-5 flex items-center justify-between">
                      {eq.esPrincipal ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-extrabold text-[#6D5BD0]">
                          <Star className="h-3.5 w-3.5 fill-[#6D5BD0]" />
                          EQUIPO PRINCIPAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#7C7C93]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          EQUIPO
                        </span>
                      )}

                      <button
                        onClick={() => setInviteEquipoId(eq.id_equipo)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#6D5BD0] transition hover:bg-purple-100"
                        title="Invitar Miembro"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Invitar
                      </button>
                    </div>

                    {/* Icono + Título del Equipo */}
                    <div className="mb-4 flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                        style={{
                          background: eq.esPrincipal
                            ? 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)'
                            : 'linear-gradient(135deg, #a78bfa 0%, #6d5bd0 100%)',
                        }}
                      >
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-lg font-bold leading-tight"
                          style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                          {equipoInfo.nombre || 'Equipo sin nombre'}
                        </h2>
                        <p className="mt-0.5 text-xs text-[#7C7C93]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          {integrantes.length} integrante{integrantes.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Descripción */}
                    {equipoInfo.descripcion && (
                      <p className="mb-4 text-xs leading-relaxed text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {equipoInfo.descripcion}
                      </p>
                    )}

                    {/* Proyecto Asignado */}
                    <div className="mb-4 rounded-2xl bg-[#FAF9FF] p-3 border border-[#EAE6FF]">
                      <span className="text-xs font-medium text-[#7C7C93]">Proyecto: </span>
                      {proyecto && proyecto.id_proyecto ? (
                        <Link
                          to={`/proyecto/${proyecto.id_proyecto}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#6D5BD0] hover:underline"
                        >
                          {proyecto.nombre}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs italic text-[#9CA3AF]">Sin proyecto asignado</span>
                      )}
                    </div>

                    {/* Lista de Integrantes */}
                    <div className="mb-2">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C7C93]">
                        Integrantes
                      </p>
                      <div className="space-y-1 divide-y divide-slate-100">
                        {integrantes.map((member) => (
                          <IntegranteEquipo key={member.id_usuario} integrante={member} showRol />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        <ModalInvitarMiembro
          isOpen={!!inviteEquipoId}
          onClose={() => setInviteEquipoId(null)}
          equipoId={inviteEquipoId}
        />
      </main>
    </div>
  )
}
