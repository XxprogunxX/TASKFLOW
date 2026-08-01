import { AlertTriangle, Calendar, Check, Eye, HelpCircle, Zap } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import ModalDetalleActividad from '../components/ModalDetalleActividad'
import { useMisTareas } from '../hooks/useMisTareas'

const priorityGroupConfig = {
  alta: {
    title: 'Prioridad Alta',
    barColor: '#E53E3E',
    badgeBg: '#FEE2E2',
    badgeText: '#E53E3E',
    pillIcon: AlertTriangle,
    pillBg: '#FEE2E2',
    pillText: '#DC2626',
    pillBorder: '#FCA5A5',
    checkBorder: '#F87171',
    label: 'Alta',
  },
  media: {
    title: 'Prioridad Media',
    barColor: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#D97706',
    pillIcon: Zap,
    pillBg: '#FEF3C7',
    pillText: '#D97706',
    pillBorder: '#FCD34D',
    checkBorder: '#FBBF24',
    label: 'Media',
  },
  baja: {
    title: 'Prioridad Baja',
    barColor: '#16A34A',
    badgeBg: '#DCFCE7',
    badgeText: '#16A34A',
    pillIcon: Check,
    pillBg: '#DCFCE7',
    pillText: '#16A34A',
    pillBorder: '#6EE7B7',
    checkBorder: '#34D399',
    label: 'Baja',
  },
}

const statusStyles = {
  pendiente: {
    bg: '#EEF2FF',
    text: '#4F46E5',
    dot: '#6366F1',
  },
  en_progreso: {
    bg: '#FEF3C7',
    text: '#D97706',
    dot: '#F59E0B',
  },
  en_revision: {
    bg: '#FCE7F3',
    text: '#DB2777',
    dot: '#EC4899',
  },
  completada: {
    bg: '#DCFCE7',
    text: '#16A34A',
    dot: '#22C55E',
  },
}

export default function MisTareasPage() {
  const {
    tasksByPriority,
    allTasksCount,
    usuario,
    isLoading,
    onlyMineFilter,
    setOnlyMineFilter,
    toggleTaskStatus,
  } = useMisTareas()

  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const initials = usuario?.iniciales || 'MG'
  const avatarColor = usuario?.color || '#6D5BD0'
  const nombreUsuario = usuario?.nombre || 'Manuel Gonzalez'

  const handleOpenDetail = (taskId) => {
    setSelectedTaskId(taskId)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7]" style={{ backgroundColor: '#FFF5F7', color: '#2D2D3F' }}>
      <Header active="Mis Tareas" initials={initials} avatarColor={avatarColor} nombreUsuario={nombreUsuario} />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1
              className="text-2xl font-extrabold sm:text-3xl"
              style={{ color: '#2D2342', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Mis Tareas
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Ordenadas por prioridad · {allTasksCount} tareas asignadas a ti
            </p>
          </div>

          <button
            onClick={() => setOnlyMineFilter(!onlyMineFilter)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition ${
              onlyMineFilter
                ? 'border-purple-300 bg-white text-purple-900 shadow-purple-100'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <Eye className="h-4 w-4 text-purple-600" />
            <span>Solo mis tareas</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((groupKey) => (
              <div key={groupKey} className="space-y-3">
                <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
                {[1, 2, 3].map((itemKey) => (
                  <div key={itemKey} className="h-20 w-full animate-pulse rounded-2xl bg-white shadow-sm" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {['alta', 'media', 'baja'].map((priorityKey) => {
              const groupTasks = tasksByPriority[priorityKey] || []


              const config = priorityGroupConfig[priorityKey]
              const PillIcon = config.pillIcon

              return (
                <section key={priorityKey} className="space-y-3">
                  {/* Priority Group Header */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-5 w-1 rounded-full"
                      style={{ backgroundColor: config.barColor }}
                    />
                    <h2
                      className="text-base font-bold"
                      style={{ color: '#2D2342', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      {config.title}
                    </h2>
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
                    >
                      {groupTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {groupTasks.length === 0 ? (
                      <p className="pl-3.5 text-xs text-slate-400 italic">No hay tareas en esta prioridad.</p>
                    ) : (
                      groupTasks.map((task) => {
                        const isCompleted = task.status === 'completada'
                        const stStyle = statusStyles[task.status] || statusStyles.pendiente

                        return (
                          <div
                            key={task.id}
                            onClick={() => handleOpenDetail(task.id)}
                            className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100/90 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md sm:p-5"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              {/* Checkbox button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTaskStatus(task.id)
                                }}
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'border-2 hover:bg-slate-50'
                                }`}
                                style={{
                                  borderColor: isCompleted ? '#10B981' : config.checkBorder,
                                }}
                                title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                {isCompleted ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : null}
                              </button>

                              {/* Task Metadata & Title */}
                              <div className="min-w-0">
                                <h3
                                  className={`text-sm font-bold sm:text-base transition ${
                                    isCompleted ? 'text-slate-400 line-through' : 'text-[#2D2342]'
                                  }`}
                                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                  {task.title}
                                </h3>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                                  {/* Date */}
                                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {task.date}
                                  </span>

                                  {/* Status badge */}
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                    style={{
                                      backgroundColor: stStyle.bg,
                                      color: stStyle.text,
                                      fontFamily: 'Nunito, sans-serif',
                                    }}
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: stStyle.dot }}
                                    />
                                    {task.statusLabel}
                                  </span>

                                  {/* Tag pills */}
                                  {task.tags &&
                                    task.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-lg bg-[#F5F3FF] px-2.5 py-0.5 text-xs font-medium text-[#6D5BD0]"
                                        style={{ fontFamily: 'Nunito, sans-serif' }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>

                            {/* Priority badge pill on right */}
                            <div className="shrink-0">
                              <span
                                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs"
                                style={{
                                  backgroundColor: config.pillBg,
                                  color: config.pillText,
                                  borderColor: config.pillBorder,
                                  fontFamily: 'Nunito, sans-serif',
                                }}
                              >
                                <PillIcon className="h-3.5 w-3.5" />
                                {config.label}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating help question button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#1E1B4B] text-white shadow-lg transition hover:scale-105"
        title="Ayuda"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Task Detail Modal */}
      {isDetailModalOpen && (
        <ModalDetalleActividad
          isOpen={isDetailModalOpen}
          actividadId={selectedTaskId}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdated={() => {
            // refresh
          }}
        />
      )}
    </div>
  )
}
