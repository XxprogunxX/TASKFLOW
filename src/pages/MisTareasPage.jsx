import { AlertTriangle, Calendar, Check, CheckCircle2, Eye, HelpCircle, MessageSquare, Paperclip, Zap } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import ModalDetalleActividad from '../components/ModalDetalleActividad'
import { useMisTareas } from '../hooks/useMisTareas'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getAvatarBg(name) {
  const colors = ['#6D5BD0', '#8B5CF6', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B']
  if (!name) return colors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ─── Config ───────────────────────────────────────────────────────────────────
const priorityConfig = {
  alta: {
    title: 'Prioridad Alta',
    barColor: '#EF4444',
    badgeBg: '#FEE2E2',
    badgeText: '#DC2626',
    pillBg: '#FEF2F2',
    pillText: '#DC2626',
    pillBorder: '#FECACA',
    checkBorder: '#F87171',
    checkCompletedBg: '#EF4444',
    icon: AlertTriangle,
    label: 'Alta',
  },
  media: {
    title: 'Prioridad Media',
    barColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    badgeText: '#D97706',
    pillBg: '#FFFBEB',
    pillText: '#B45309',
    pillBorder: '#FCD34D',
    checkBorder: '#FBBF24',
    checkCompletedBg: '#F59E0B',
    icon: Zap,
    label: 'Media',
  },
  baja: {
    title: 'Prioridad Baja',
    barColor: '#22C55E',
    badgeBg: '#DCFCE7',
    badgeText: '#16A34A',
    pillBg: '#F0FDF4',
    pillText: '#15803D',
    pillBorder: '#86EFAC',
    checkBorder: '#4ADE80',
    checkCompletedBg: '#22C55E',
    icon: Check,
    label: 'Baja',
  },
}

const statusStyles = {
  pendiente:   { bg: '#EEF2FF', text: '#4F46E5', dot: '#6366F1', label: 'Pendiente' },
  en_progreso: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B', label: 'En proceso' },
  en_revisión: { bg: '#FCE7F3', text: '#DB2777', dot: '#EC4899', label: 'En revisión' },
  completada:  { bg: '#DCFCE7', text: '#16A34A', dot: '#22C55E', label: 'Completada' },
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MisTareasPage() {
  const {
    tasksByPriority,
    allTasksCount,
    usuario,
    isLoading,
    onlyMineFilter,
    setOnlyMineFilter,
    toggleTaskStatus,
    refreshTasks,
  } = useMisTareas()

  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleOpenDetail = (taskId) => {
    setSelectedTaskId(taskId)
    setIsDetailModalOpen(true)
  }

  const activePriorities = ['alta', 'media', 'baja'].filter(
    (key) => (tasksByPriority[key] || []).length > 0
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF2F8' }}>
      <Header
        active="Mis Tareas"
        initials={usuario?.iniciales}
        avatarColor={usuario?.color}
        nombreUsuario={usuario?.nombre}
      />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: '#2D2342', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Mis Tareas
            </h1>
            <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {allTasksCount} {allTasksCount === 1 ? 'tarea' : 'tareas'} ·{' '}
              {onlyMineFilter ? 'asignadas a ti' : 'todas en el proyecto'}
            </p>
          </div>

          {/* Toggle pill */}
          <button
            onClick={() => setOnlyMineFilter(!onlyMineFilter)}
            className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-bold shadow-sm transition-all"
            style={{
              fontFamily: 'Nunito, sans-serif',
              background: onlyMineFilter
                ? 'linear-gradient(135deg, #6D5BD0, #9061f9)'
                : '#F3F4F6',
              color: onlyMineFilter ? '#fff' : '#374151',
              border: onlyMineFilter ? '1.5px solid #7C3AED' : '1.5px solid #E5E7EB',
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            {onlyMineFilter ? 'Mis tareas' : 'Todas las tareas'}
          </button>
        </div>

        {/* ── Loading ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((k) => (
              <div key={k} className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-200" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-[72px] w-full animate-pulse rounded-2xl bg-white shadow-xs" />
                ))}
              </div>
            ))}
          </div>

        /* ── Empty State ──────────────────────────────────────── */
        ) : activePriorities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-8 py-16 text-center shadow-xs" style={{ border: '1.5px dashed #DDD6FE' }}>
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)' }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: '#7C3AED' }} />
            </div>
            <h3
              className="text-xl font-extrabold"
              style={{ color: '#2D2342', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {onlyMineFilter ? '¡Todo al día! 🎉' : 'Sin tareas aún'}
            </h3>
            <p
              className="mt-2 max-w-xs text-sm text-slate-500"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {onlyMineFilter
                ? 'No tienes tareas pendientes asignadas a ti en este momento.'
                : 'No hay tareas registradas en el proyecto todavía.'}
            </p>
            {onlyMineFilter && (
              <button
                onClick={() => setOnlyMineFilter(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #6D5BD0, #9061f9)',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                <Eye className="h-4 w-4" />
                Ver todas las tareas del equipo
              </button>
            )}
          </div>

        /* ── Task groups ─────────────────────────────────────── */
        ) : (
          <div className="space-y-10">
            {activePriorities.map((priorityKey) => {
              const tasks = tasksByPriority[priorityKey] || []
              const cfg = priorityConfig[priorityKey]
              const Icon = cfg.icon

              return (
                <section key={priorityKey}>
                  {/* Group header */}
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="h-4 w-1.5 rounded-full"
                      style={{ backgroundColor: cfg.barColor }}
                    />
                    <h2
                      className="text-sm font-extrabold uppercase tracking-widest"
                      style={{
                        color: cfg.badgeText,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {cfg.title}
                    </h2>
                    <span
                      className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold"
                      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                    >
                      {tasks.length}
                    </span>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-2.5">
                    {tasks.map((task) => {
                      const isCompleted = task.status === 'completada'
                      const stStyle = statusStyles[task.status] || statusStyles.pendiente
                      const avatarBg = getAvatarBg(task.responsableNombre)

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenDetail(task.id)}
                          className="group relative flex cursor-pointer items-center gap-0 overflow-hidden rounded-2xl bg-white shadow-xs transition-all hover:shadow-md"
                          style={{
                            border: '1px solid #F1F0FB',
                            opacity: isCompleted ? 0.72 : 1,
                          }}
                        >
                          {/* Left priority bar */}
                          <span
                            className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                            style={{ backgroundColor: cfg.barColor }}
                          />

                          {/* Content */}
                          <div className="flex flex-1 items-center gap-4 px-5 py-4 pl-6">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTaskStatus(task.id)
                              }}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                              style={{
                                borderColor: isCompleted ? cfg.checkCompletedBg : cfg.checkBorder,
                                backgroundColor: isCompleted ? cfg.checkCompletedBg : 'transparent',
                                color: '#fff',
                              }}
                              title={isCompleted ? 'Desmarcar' : 'Completar'}
                            >
                              {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>

                            {/* Title + meta */}
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-sm font-bold transition-all"
                                style={{
                                  color: isCompleted ? '#9CA3AF' : '#2D2342',
                                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                }}
                              >
                                {task.title}
                              </p>

                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                {/* Due date badge */}
                                {task.dueBadge && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                                    style={{
                                      fontFamily: 'Nunito, sans-serif',
                                      ...(task.dueBadge.variant === 'danger'
                                        ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
                                        : task.dueBadge.variant === 'warning'
                                        ? { background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D' }
                                        : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }),
                                    }}
                                  >
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    {task.dueBadge.text}
                                  </span>
                                )}

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
                                  {stStyle.label}
                                </span>

                                {/* Comentarios */}
                                {task.comentariosCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                    <MessageSquare className="h-3.5 w-3.5" style={{ color: '#8B5CF6' }} />
                                    {task.comentariosCount}
                                  </span>
                                )}

                                {/* Evidencias */}
                                {task.evidenciasCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                    <Paperclip className="h-3.5 w-3.5" style={{ color: '#6366F1' }} />
                                    {task.evidenciasCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right side: avatar + priority pill */}
                            <div className="flex shrink-0 items-center gap-3">
                              {/* Responsable avatar */}
                              {task.responsableNombre && (
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                                  style={{ backgroundColor: avatarBg }}
                                  title={task.responsableNombre}
                                >
                                  {getInitials(task.responsableNombre)}
                                </div>
                              )}

                              {/* Priority pill */}
                              <span
                                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold"
                                style={{
                                  backgroundColor: cfg.pillBg,
                                  color: cfg.pillText,
                                  borderColor: cfg.pillBorder,
                                  fontFamily: 'Nunito, sans-serif',
                                }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating help button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #1E1B4B, #3B3298)' }}
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
          onUpdated={refreshTasks}
        />
      )}
    </div>
  )
}
