import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import ActivityDetailModal from '../components/ModalDetalleActividad'
import NewActivityModal from '../components/ModalActividad'
import { useBoard } from '../hooks/useBoard'

const priorityStyles = {
  Alta: {
    color: '#E53E3E',
    bg: 'rgba(229, 62, 62, 0.1)',
    border: '#E53E3E',
    Icon: AlertTriangle,
  },
  Media: {
    color: '#D69E2E',
    bg: 'rgba(214, 158, 46, 0.1)',
    border: '#D69E2E',
    Icon: Zap,
  },
  Baja: {
    color: '#38A169',
    bg: 'rgba(56, 161, 105, 0.1)',
    border: '#38A169',
    Icon: CheckCircle2,
  },
}

import { useSearchParams } from 'react-router-dom'

export default function BoardPage() {
  const [searchParams] = useSearchParams()
  const targetProyectoId = searchParams.get('proyectoId') || null
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialColumnTitle, setInitialColumnTitle] = useState('Pendiente')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleOpenNewTaskModal = (columnTitle = 'Pendiente') => {
    setInitialColumnTitle(columnTitle)
    setIsModalOpen(true)
  }

  const initials = usuario?.iniciales || '?'
  const avatarColor = usuario?.color || '#6D5BD0'
  const nombreUsuario = usuario?.nombre || 'Usuario'
  const proyectoLabel = usuario?.sinProyectos ? 'Aún no tienes proyectos' : usuario?.proyectoNombre || 'Proyecto'

  return (
    <div className="min-h-screen bg-[#FFF5F7]" style={{ backgroundColor: '#FFF5F7', color: '#2D2D3F' }}>
      <Header active="Tablero" initials={initials} avatarColor={avatarColor} nombreUsuario={nombreUsuario} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 rounded-[32px] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Tablero del Proyecto
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
              {proyectoLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B80]" />
              <input
                type="search"
                placeholder="Buscar"
                className="h-12 rounded-2xl border border-[#E5E7F0] bg-white pl-10 pr-4 text-sm text-[#2D2D3F] outline-none"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </label>
            <button
              onClick={() => handleOpenNewTaskModal('Pendiente')}
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95"
              style={{
                background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)',
                color: '#FFFFFF',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </button>
          </div>
        </div>

        {isLoading ? (
          <section className="grid gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: '#FFF0F6' }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-7 w-10 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="mb-3 h-2 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-5 space-y-4">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && usuario?.sinProyectos ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-[#4A3A6B]">Aún no tienes proyectos.</p>
            <p className="mt-2 text-sm text-[#6B6B80]">Únete a un equipo o crea uno para empezar.</p>
          </div>
        ) : null}

        {!isLoading && !error && !usuario?.sinProyectos ? (
          <section className="grid gap-6 xl:grid-cols-4">
            {columnas.map((column) => (
              <div
                key={column.title}
                className="rounded-3xl p-5 shadow-sm"
                style={{ backgroundColor: '#FFF0F6' }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: column.accent }}
                    />
                    <h2
                      className="text-sm font-semibold"
                      style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      {column.title}
                    </h2>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}
                  >
                    {column.count}
                  </div>
                  <button
                    onClick={() => handleOpenNewTaskModal(column.title)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: '#FFFFFF', color: '#6B6B80' }}
                    aria-label={`Agregar tarea a ${column.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${column.progress}%`, backgroundColor: column.accent }}
                  />
                </div>
                <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                  {column.progress}% del total
                </p>

                <div className="mt-5 space-y-4">
                  {column.tasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
                      Sin tareas aún
                    </div>
                  ) : null}

                  {column.tasks.map((task) => {
                    const priority = priorityStyles[task.priority] || priorityStyles.Media

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                          setSelectedTaskId(task.id)
                          setIsDetailOpen(true)
                        }}
                        className="w-full rounded-2xl border border-[#E5E7F0] bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3
                              className="text-sm font-semibold leading-snug"
                              style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                              {task.title}
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full px-2 py-1 text-[11px] font-medium"
                                  style={{
                                    backgroundColor: '#F3E8FF',
                                    color: '#4A3A6B',
                                    fontFamily: 'Nunito, sans-serif',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div
                            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                            style={{
                              borderColor: priority.border,
                              backgroundColor: priority.bg,
                            }}
                          >
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: priority.bg,
                                color: priority.color,
                                border: `1px solid ${priority.border}`,
                              }}
                            >
                              <priority.Icon className="h-3.5 w-3.5" />
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: priority.color, fontFamily: 'Nunito, sans-serif' }}
                            >
                              {task.priorityLabel}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[13px] text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" style={{ color: '#6B6B80' }} />
                              {task.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" style={{ color: '#6B6B80' }} />
                              {task.comments}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="h-3.5 w-3.5" style={{ color: '#6B6B80' }} />
                              {task.attachments}
                            </span>
                          </div>
                          {task.hasResponsable ? (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                              style={{ backgroundColor: task.ownerColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
                              title={task.ownerName}
                            >
                              {task.ownerInitials}
                            </div>
                          ) : (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100"
                              title="Sin asignar"
                              aria-label="Sin responsable asignado"
                            >
                              <UserPlus className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </main>

      <NewActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        proyectoId={usuario?.proyectoId}
        onActivityCreated={refreshBoard}
        initialColumn={initialColumnTitle}
      />

      <ActivityDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedTaskId(null)
        }}
        actividadId={selectedTaskId}
        proyectoId={usuario?.proyectoId}
        onResponsableUpdated={updateTaskResponsable}
        onActivityUpdated={updateTaskFields}
        onActivityDeleted={deleteTaskFromBoard}
      />
    </div>
  )
}
