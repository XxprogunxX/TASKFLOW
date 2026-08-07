import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Link,
  MessageSquare,
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

import { useSearchParams, useNavigate } from 'react-router-dom'

export default function BoardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const targetProyectoId = searchParams.get('proyectoId') || null
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialColumnTitle, setInitialColumnTitle] = useState('Pendiente')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverColumnTitle, setDragOverColumnTitle] = useState(null)

  const {
    usuario,
    columnas,
    isLoading,
    error,
    refreshBoard,
    updateTaskResponsable,
    updateTaskFields,
    deleteTaskFromBoard,
    moveTaskToColumn,
  } = useBoard(targetProyectoId)

  const handleOpenNewTaskModal = (columnTitle = 'Pendiente') => {
    setInitialColumnTitle(columnTitle)
    setIsModalOpen(true)
  }

  const initials = usuario?.iniciales || '?'
  const avatarColor = usuario?.color || '#6D5BD0'
  const nombreUsuario = usuario?.nombre || 'Usuario'
  const proyectoLabel = usuario?.sinProyectos ? 'Aún no tienes proyectos' : usuario?.proyectoNombre || 'Proyecto'

  const columnasFiltradas = columnas.map((column) => {
    const filteredTasks = column.tasks.filter((task) => {
      if (!searchTerm.trim()) return true
      const query = searchTerm.toLowerCase()
      const matchesTitle = task.title?.toLowerCase().includes(query)
      const matchesOwner = task.ownerName?.toLowerCase().includes(query)
      const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(query))
      return matchesTitle || matchesOwner || matchesTags
    })
    return {
      ...column,
      tasks: filteredTasks,
    }
  })

  const columnasVisibles = activeMobileTab === 'all'
    ? columnasFiltradas
    : columnasFiltradas.filter((c) => c.title === activeMobileTab)

  return (
    <div className="min-h-screen bg-[#FDF6F8] pb-12">
      <Header usuario={usuario} />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Tablero del Proyecto
              </h1>
              <p
                className="mt-1 text-sm font-semibold uppercase tracking-wider"
                style={{ color: '#6D5BD0', fontFamily: 'Nunito, sans-serif' }}
              >
                {usuario?.sinProyectos ? 'Sin proyecto activo' : usuario?.proyectoNombre}
              </p>
            </div>
            {usuario?.sinProyectos ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                Selecciona o crea un proyecto en "Mis Tableros"
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#E5E7F0] bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-[#6D5BD0] focus:ring-2 focus:ring-[#6D5BD0]/20"
                style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}
              />
            </div>
            <button
              onClick={() => handleOpenNewTaskModal('Pendiente')}
              disabled={usuario?.sinProyectos || isLoading}
              className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition ${
                usuario?.sinProyectos || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-95 cursor-pointer'
              }`}
              style={{
                background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)',
                color: '#FFFFFF',
                fontFamily: 'Nunito, sans-serif',
              }}
              title={usuario?.sinProyectos ? 'Crea un proyecto primero para poder añadir tareas' : 'Nueva tarea'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </button>
          </div>
        </div>

        {isLoading ? (
          <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
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
            <p className="mt-2 text-sm text-[#6B6B80]">Únete a un equipo o crea uno en "Mis Tableros" para empezar.</p>
            <button
              onClick={() => navigate('/mis-tableros')}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#6D5BD0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5a4bb8] cursor-pointer"
            >
              Ir a Mis Tableros
            </button>
          </div>
        ) : null}

        {!isLoading && !error && !usuario?.sinProyectos && (
          <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] lg:hidden">
            <button
              onClick={() => setActiveMobileTab('all')}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeMobileTab === 'all'
                  ? 'bg-[#6C63FF] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Ver todas
            </button>
            {columnas.map((col) => {
              const isSelected = activeMobileTab === col.title
              return (
                <button
                  key={col.title}
                  onClick={() => setActiveMobileTab(col.title)}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#2D2342] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-semibold'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.accent }} />
                  <span>{col.title}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {col.count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {!isLoading && !error && !usuario?.sinProyectos ? (
          <section className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-1 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] lg:grid lg:grid-cols-4 lg:overflow-x-visible">
            {columnasVisibles.map((column) => {
              const isOver = dragOverColumnTitle === column.title

              return (
                <div
                  key={column.title}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dragOverColumnTitle !== column.title) {
                      setDragOverColumnTitle(column.title)
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget)) return
                    setDragOverColumnTitle(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    try {
                      const raw = e.dataTransfer.getData('text/plain')
                      if (raw) {
                        const { taskId, fromColumn } = JSON.parse(raw)
                        if (taskId && fromColumn !== column.title) {
                          moveTaskToColumn(taskId, column.title)
                        }
                      }
                    } catch (err) {
                      console.error('Error al procesar soltado:', err)
                    }
                    setDraggedTaskId(null)
                    setDragOverColumnTitle(null)
                  }}
                  className={`${
                    activeMobileTab === 'all'
                      ? 'w-[85vw] max-w-[320px] sm:w-[320px]'
                      : 'w-full max-w-full'
                  } lg:w-full flex-shrink-0 snap-center rounded-3xl p-4 sm:p-5 transition-all duration-200 ${
                    isOver ? 'ring-2 shadow-xl scale-[1.01]' : 'shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isOver ? `${column.accent}10` : '#F8F0FF',
                    border: isOver ? `2px solid ${column.accent}` : '2px solid transparent',
                  }}
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
                    {column.tasks.length === 0 && !draggedTaskId ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
                        Sin tareas aún
                      </div>
                    ) : null}

                    {column.tasks.map((task) => {
                      const priority = priorityStyles[task.priority] || priorityStyles.Media
                      const isDraggingThis = draggedTaskId === task.id

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, fromColumn: column.title }))
                            setDraggedTaskId(task.id)
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null)
                            setDragOverColumnTitle(null)
                          }}
                          onClick={() => {
                            setSelectedTaskId(task.id)
                            setIsDetailOpen(true)
                          }}
                          className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing ${
                            isDraggingThis
                              ? 'opacity-30 scale-95 border-dashed border-[#6C63FF] shadow-inner'
                              : 'border-[#E5E7F0] hover:shadow-md hover:-translate-y-0.5'
                          }`}
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
                                <Link className="h-3.5 w-3.5" style={{ color: '#6B6B80' }} />
                                {task.attachments}
                              </span>
                            </div>
                            {task.hasResponsable ? (
                              <div
                                className="flex items-center gap-1.5 rounded-full bg-slate-100/80 pl-1 pr-2.5 py-0.5"
                                title={task.ownerName}
                              >
                                <div
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                                  style={{ backgroundColor: task.ownerColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
                                >
                                  {task.ownerInitials}
                                </div>
                                <span
                                  className="text-xs font-semibold text-[#4A3A6B] max-w-[100px] truncate"
                                  style={{ fontFamily: 'Nunito, sans-serif' }}
                                >
                                  {task.ownerName}
                                </span>
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
                        </div>
                      )
                    })}

                    {draggedTaskId && isOver && (
                      <div
                        className="mt-3 rounded-2xl border-2 border-dashed p-4 text-center text-xs font-extrabold transition-all flex items-center justify-center gap-2 animate-pulse shadow-xs"
                        style={{
                          borderColor: column.accent,
                          backgroundColor: `${column.accent}18`,
                          color: column.accent,
                        }}
                      >
                        Suelta aquí
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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
        onResponsableUpdated={(actId, resp) => {
          updateTaskResponsable(actId, resp)
          refreshBoard()
        }}
        onActivityUpdated={(actId, campos) => {
          updateTaskFields(actId, campos)
          refreshBoard()
        }}
        onActivityDeleted={(actId) => {
          deleteTaskFromBoard(actId)
          refreshBoard()
        }}
      />
    </div>
  )
}
