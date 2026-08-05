import { Calendar, Check, CheckCircle2, ExternalLink, Link2, MessageSquare, Paperclip, Save, Send, Trash2, User, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useActivityDetail } from '../../hooks/useActivityDetail'

const avatarColors = ['#6D5BD0', '#DB2777', '#059669', '#D97706', '#7C3AED', '#0891B2', '#C2410C', '#4B5563']

function getAvatarColor(index) {
  return avatarColors[index % avatarColors.length]
}

function getInitials(nombre = '') {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function ModalDetalleActividad({
  isOpen,
  onClose,
  actividadId,
  proyectoId,
  onResponsableUpdated,
  onActivityUpdated,
  onActivityDeleted,
  onUpdated,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    actividad,
    miembros,
    selectedResponsableId,
    setSelectedResponsableId,
    comentarios,
    evidencias,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    estado,
    setEstado,
    prioridad,
    setPrioridad,
    fechaLimite,
    setFechaLimite,
    nuevoComentario,
    setNuevoComentario,
    nuevaEvidenciaUrl,
    setNuevaEvidenciaUrl,
    nuevaEvidenciaDesc,
    setNuevaEvidenciaDesc,
    isLoading,
    isSaving,
    isDeleting,
    error,
    success,
    handleGuardarCambios,
    handleAddComentario,
    handleAddEvidencia,
    handleDeleteActividad,
  } = useActivityDetail({
    actividadId,
    proyectoId,
    isOpen,
    onResponsableUpdated,
    onActivityUpdated: onActivityUpdated || onUpdated,
    onActivityDeleted,
  })

  const handleConfirmDelete = useCallback(async () => {
    await handleDeleteActividad()
    setShowDeleteConfirm(false)
    onClose()
  }, [handleDeleteActividad, onClose])

  if (!isOpen || !actividadId) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la actividad"
              className="w-full text-xl font-extrabold text-[#2D2342] outline-none placeholder:text-slate-300"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            />
            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Cargando actividad...</div>
          ) : !actividad ? (
            <div className="p-8 text-center text-sm text-slate-500">{error || 'No se encontró la actividad.'}</div>
          ) : (
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
              {/* Columna Izquierda */}
              <div className="w-full md:flex-1 p-5 sm:p-8 space-y-6">
                {error && <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}
                {success && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Estado y Prioridad */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Estado</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#6C63FF]"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Prioridad</label>
                    <select
                      value={prioridad}
                      onChange={(e) => setPrioridad(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#6C63FF]"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                {/* Fecha Limite */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Fecha límite</label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#6C63FF]"
                  />
                </div>

                {/* Responsable */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Responsable</label>
                  <div className="flex flex-wrap gap-2">
                    {miembros.map((m, idx) => {
                      const isSelected = selectedResponsableId === String(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedResponsableId(String(m.id))}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white transition ${
                            isSelected ? 'ring-2 ring-[#6C63FF] ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: getAvatarColor(idx) }}
                          title={m.nombre}
                        >
                          {getInitials(m.nombre)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Descripción</label>
                  <textarea
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Detalles sobre esta actividad..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#6C63FF]"
                  />
                </div>

                {/* Enlace de entrega */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Enlace de entrega</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={nuevaEvidenciaUrl}
                      onChange={(e) => setNuevaEvidenciaUrl(e.target.value)}
                      placeholder="ej. https://drive.google.com/..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#6C63FF]"
                    />
                    <button
                      type="button"
                      onClick={handleAddEvidencia}
                      disabled={!nuevaEvidenciaUrl.trim()}
                      className="rounded-xl bg-[#6C63FF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#5A52E0] disabled:opacity-40 cursor-pointer"
                    >
                      Agregar enlace
                    </button>
                  </div>
                  {evidencias.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {evidencias.map((ev, i) => (
                        <a
                          key={i}
                          href={ev.url_evidencia || ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs text-purple-700 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate">{ev.descripcion || ev.url_evidencia || ev.url}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleGuardarCambios}
                      disabled={isSaving}
                      className="rounded-xl bg-[#6C63FF] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#5A52E0] disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha (Notas / Comentarios) */}
              <div className="flex w-full md:w-80 flex-shrink-0 flex-col border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Notas ({comentarios.length})</span>
                </div>

                {/* Lista de Comentarios */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {comentarios.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">Sin notas aún.</p>
                  ) : (
                    comentarios.map((c, i) => {
                      const u = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios
                      const nombre = u?.nombre || u?.correo || 'Usuario'
                      return (
                        <div key={c.id_comentario || i} className="rounded-2xl bg-white p-3 shadow-xs border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-purple-900">{nombre}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(c.fecha_creacion)}</span>
                          </div>
                          <p className="text-xs text-slate-600">{c.contenido}</p>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Input de Comentarios */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe una nota..."
                    onKeyDown={(e) => e.key === 'Enter' && nuevoComentario.trim() && handleAddComentario()}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#6C63FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddComentario}
                    disabled={!nuevoComentario.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C63FF] text-white transition hover:bg-[#5A52E0] disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmar Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-800">¿Eliminar actividad?</h3>
            <p className="mt-1 text-xs text-slate-500">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-bold text-white"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
