import { Calendar, Check, CheckCircle2, ChevronDown, ExternalLink, FileText, Link2, MessageSquare, Paperclip, Save, Send, Trash2, User, X } from 'lucide-react'
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
  const [showMobileNotes, setShowMobileNotes] = useState(false)

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
    tags,
    setTags,
    addTag,
    removeTag,
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
    handleUploadPdfEvidencia,
    handleDeleteEvidencia,
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

  const normalizeSt = (st) => {
    const s = (st || '').toLowerCase().trim()
    if (s === 'en_progreso' || s === 'en_proceso' || s === 'en proceso') return 'en proceso'
    if (s === 'en_revision' || s === 'en_revisión' || s === 'en revisión') return 'en revisión'
    if (s === 'completada' || s === 'completado') return 'completada'
    return 'pendiente'
  }

  const extractTags = (desc = '') => {
    if (!desc) return []
    const match = desc.match(/(?:Etiquetas|Etiqueta|Tags|Tag):\s*([^\n]+)/i)
    if (match && match[1]) {
      return match[1].split(',').map((t) => t.trim()).filter(Boolean)
    }
    return []
  }

  const initialTagsStr = extractTags(actividad?.descripcion).sort().join(',')
  const currentTagsStr = [...(tags || [])].sort().join(',')

  const cleanActividadDesc = (actividad?.descripcion || '')
    .replace(/(?:\r\n|\r|\n)*?(?:Etiquetas|Etiqueta|Tags|Tag):\s*[^\n]+/gi, '')
    .trim()

  const hasChanges = Boolean(
    actividad &&
      (titulo.trim() !== (actividad.titulo || '').trim() ||
        (descripcion || '').trim() !== cleanActividadDesc ||
        normalizeSt(estado) !== normalizeSt(actividad.estado) ||
        (prioridad || '').toLowerCase() !== (actividad.prioridad || '').toLowerCase() ||
        fechaLimite !== (actividad.fecha_limite ? actividad.fecha_limite.split('T')[0] : '') ||
        String(selectedResponsableId || '') !== String(actividad.id_responsable || '') ||
        currentTagsStr !== initialTagsStr)
  )

  if (!isOpen || !actividadId) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header (Estilo Figma) */}
          <div className="flex items-start justify-between border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-5">
            <div className="flex-1 min-w-0">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la actividad"
                className="w-full text-xl font-extrabold text-[#2D2342] outline-none placeholder:text-slate-300"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#ECE8FF] px-3 py-0.5 text-[11px] font-semibold text-[#6C63FF]"
                  >
                    {tag}
                  </span>
                ))}
                {hasChanges ? (
                  <span className="rounded-full bg-[#FFF4E5] px-3 py-0.5 text-[11px] font-semibold text-[#D97706] flex items-center gap-1.5 border border-[#FFE8CC] animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                    Cambios sin guardar
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F0FFF4] px-3 py-0.5 text-[11px] font-semibold text-[#38A169] flex items-center gap-1.5 border border-[#C6F6D5]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38A169]" />
                    Guardado
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
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
            <div className="flex flex-col md:flex-row flex-1 min-h-0 min-w-0 overflow-hidden">
              {/* Columna Izquierda (Scroll suave e independiente) */}
              <div className="w-full md:flex-1 p-5 sm:p-6 space-y-5 min-w-0 min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]">
                {error && <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}
                {success && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Estado, Prioridad y Fecha Límite (Diseño compacto horizontal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ESTADO (Píldoras horizontales) */}
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Estado
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: 'Pendiente', dot: 'bg-[#6366F1]', activeStyle: 'border-indigo-200 bg-indigo-50 text-indigo-600' },
                        { label: 'En proceso', dot: 'bg-[#F59E0B]', activeStyle: 'border-amber-200 bg-amber-50 text-amber-600' },
                        { label: 'En revisión', dot: 'bg-[#E11D48]', activeStyle: 'border-[#F43F5E] bg-[#FFF1F2] text-[#E11D48]' },
                        { label: 'Completada', dot: 'bg-[#10B981]', activeStyle: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
                      ].map((est) => {
                        const isSelected = estado === est.label
                        return (
                          <button
                            key={est.label}
                            type="button"
                            onClick={() => setEstado(est.label)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? `${est.activeStyle} shadow-2xs font-bold`
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${est.dot}`} />
                            {est.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* PRIORIDAD Y FECHA LÍMITE */}
                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#6B6B80]">
                        Prioridad
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { label: 'Alta', dot: 'bg-[#E53E3E]', activeStyle: 'border-[#E53E3E] bg-[#FFF5F5] text-[#E53E3E]' },
                          { label: 'Media', dot: 'bg-[#D69E2E]', activeStyle: 'border-[#D69E2E] bg-[#FFFBEB] text-[#D69E2E]' },
                          { label: 'Baja', dot: 'bg-[#38A169]', activeStyle: 'border-[#38A169] bg-[#F0FFF4] text-[#38A169]' },
                        ].map((prio) => {
                          const isSelected = prioridad === prio.label
                          return (
                            <button
                              key={prio.label}
                              type="button"
                              onClick={() => setPrioridad(prio.label)}
                              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                  ? `${prio.activeStyle} shadow-2xs font-bold`
                                  : 'border-slate-200 bg-white text-[#6B6B80] hover:bg-slate-50'
                              }`}
                            >
                              <span className={`h-2 w-2 rounded-full ${prio.dot}`} />
                              {prio.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[#6B6B80]">
                        Fecha límite
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={fechaLimite}
                        onChange={(e) => setFechaLimite(e.target.value)}
                        className="w-full sm:w-auto rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2D2D3F] outline-none focus:border-[#6C63FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsable (Avatares horizontales estilo Figma) */}
                <div>
                  <label className="mb-2.5 block text-xs font-extrabold uppercase tracking-wider text-[#6B6B80]">
                    Responsable
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {miembros.map((m, idx) => {
                      const isSelected = selectedResponsableId === String(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedResponsableId(String(m.id))}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white transition cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-[#E53E3E] ring-offset-2 scale-105 shadow-xs'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: getAvatarColor(idx) }}
                          title={m.nombre}
                        >
                          {getInitials(m.nombre)}
                        </button>
                      )
                    })}
                  </div>
                  {/* Nombre del responsable seleccionado */}
                  {selectedResponsableId && (
                    <p className="mt-2 text-xs font-semibold text-[#2D2D3F]">
                      {miembros.find((m) => String(m.id) === String(selectedResponsableId))?.nombre || ''}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#6B6B80]">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Detalles sobre esta actividad..."
                    className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs font-medium text-[#2D2D3F] outline-none focus:border-[#6C63FF] placeholder:text-[#6B6B80]/50 leading-relaxed"
                  />
                </div>

                {/* Evidencias (Conservando Dropzone PDF y Enlaces) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6B6B80]">
                      Enlace de evidencia / Evidencias
                    </label>
                    <span className="text-[11px] font-semibold text-[#6B6B80] flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {evidencias.length} archivo(s) adjunto(s)
                    </span>
                  </div>

                  {/* Dropzone PDF */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files) {
                        handleUploadPdfEvidencia(e.dataTransfer.files)
                      }
                    }}
                    className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#FFF5F7]/40 p-4 transition hover:border-[#6C63FF] hover:bg-[#FFF5F7]/80 cursor-pointer mb-3"
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={(e) => handleUploadPdfEvidencia(e.target.files)}
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6C63FF] shadow-2xs mb-1">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-[#2D2D3F]">
                      Arrastra tu archivo PDF aquí o haz clic
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6B6B80]">
                      Solo archivos PDF — máx 10 MB
                    </p>
                  </div>

                  {/* Input de Enlace (Estilo Figma) */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="relative flex-1 min-w-0">
                      <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B80]" />
                      <input
                        type="text"
                        value={nuevaEvidenciaUrl}
                        onChange={(e) => setNuevaEvidenciaUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddEvidencia()
                          }
                        }}
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-9 pr-3 py-2.5 text-xs outline-none focus:border-[#6C63FF] placeholder:text-[#6B6B80]/40 text-[#2D2D3F]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEvidencia}
                      disabled={!nuevaEvidenciaUrl.trim()}
                      className="rounded-2xl bg-[#6C63FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#5A52E0] disabled:opacity-40 cursor-pointer shadow-xs whitespace-nowrap flex items-center justify-center"
                    >
                      Agregar enlace
                    </button>
                  </div>

                  {/* Lista de Evidencias */}
                  {evidencias.length > 0 && (
                    <div className="space-y-2 min-w-0">
                      {evidencias.map((ev, i) => {
                        const targetUrl = ev.url_evidencia || ev.url || '#'
                        const isPdf = targetUrl.toLowerCase().includes('.pdf') || ev.descripcion?.toLowerCase().includes('pdf')
                        const labelText = (ev.descripcion && ev.descripcion !== 'Enlace de evidencia') ? ev.descripcion : targetUrl
                        return (
                          <div
                            key={ev.id_evidencia || ev.id || i}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs transition hover:border-[#6C63FF]/40 min-w-0 shadow-2xs"
                          >
                            <a
                              href={targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 flex-1 min-w-0 group"
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF5F7] text-[#6C63FF] shadow-2xs border border-[#E2E8F0] group-hover:scale-105 transition-transform">
                                {isPdf ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                              </div>
                              
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="block truncate font-bold text-[#2D2D3F] group-hover:text-[#6C63FF] transition-colors">
                                  {labelText}
                                </span>
                                <span className="block text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider mt-0.5">
                                  {isPdf ? 'Documento PDF' : 'Enlace Web'}
                                </span>
                              </div>
                            </a>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteEvidencia(ev)
                              }}
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[#6B6B80] transition hover:bg-[#FFF5F5] hover:text-[#E53E3E] cursor-pointer"
                              title="Eliminar evidencia"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Botones de Acción (Totalmente responsivo en celulares) */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4 sm:pt-5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-[#E53E3E]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#E53E3E] transition hover:bg-[#FFF5F5] cursor-pointer whitespace-nowrap"
                  >
                    <X className="h-4 w-4" /> Eliminar
                  </button>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none flex items-center justify-center rounded-full border border-[#E2E8F0] bg-white px-4 sm:px-5 py-2.5 text-xs font-bold text-[#6B6B80] transition hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleGuardarCambios}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #4A3A6B 100%)' }}
                    >
                      <Check className="h-4 w-4" />
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha ("Notas de seguimiento") */}
              {/* Mobile: Acordeón colapsable */}
              <div className="md:hidden border-t border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => setShowMobileNotes((prev) => !prev)}
                  className="flex w-full items-center justify-between px-5 py-4 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#6C63FF]" />
                    <span className="text-sm font-bold text-[#2D2342]">Notas de seguimiento</span>
                    <span className="rounded-full bg-[#EEECFF] px-2.5 py-0.5 text-xs font-extrabold text-[#6C63FF]">
                      {comentarios.length}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showMobileNotes ? 'rotate-180' : ''}`} />
                </button>

                {showMobileNotes && (
                  <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-1 duration-200">
                    {/* Lista de Comentarios */}
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-1 [scrollbar-width:thin]">
                      {comentarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7F5FF] mb-2 text-[#6C63FF]">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-600">Sin notas aún</p>
                          <p className="mt-1 text-[11px] text-slate-400 max-w-[200px]">
                            Escribe notas o comentarios para darle seguimiento a esta actividad.
                          </p>
                        </div>
                      ) : (
                        comentarios.map((c, i) => {
                          const u = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios
                          const nombre = u?.nombre || u?.correo || 'Usuario'
                          return (
                            <div key={c.id_comentario || i} className="flex gap-2.5 text-xs">
                              <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs mt-0.5"
                                style={{ backgroundColor: getAvatarColor(i) }}
                              >
                                {getInitials(nombre)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-bold text-slate-800">{nombre}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">{formatDate(c.fecha_creacion)}</span>
                                </div>
                                <div className="rounded-2xl rounded-tl-xs bg-[#F7F5FF] p-3 text-xs text-slate-700 leading-relaxed border border-[#EFEBFF]">
                                  {c.contenido}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Input de Comentarios */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-xs font-bold text-white shadow-2xs">
                          TU
                        </div>
                        <div className="relative flex-1 flex items-center">
                          <input
                            type="text"
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder="Escribe una nota..."
                            onKeyDown={(e) => e.key === 'Enter' && nuevoComentario.trim() && handleAddComentario()}
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/10 transition placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={handleAddComentario}
                            disabled={!nuevoComentario.trim()}
                            className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F0FF] text-[#6C63FF] transition hover:bg-[#6C63FF] hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Enviar nota"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Columna lateral fija (sin cambios) */}
              <div className="hidden md:flex w-80 flex-shrink-0 flex-col border-l border-slate-100 bg-white p-6 min-h-0">
                {/* Encabezado */}
                <div className="mb-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#6C63FF]" />
                    <span className="text-sm font-bold text-[#2D2342]">Notas de seguimiento</span>
                  </div>
                  <span className="rounded-full bg-[#EEECFF] px-2.5 py-0.5 text-xs font-extrabold text-[#6C63FF]">
                    {comentarios.length}
                  </span>
                </div>

                {/* Lista de Comentarios */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                  {comentarios.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5FF] mb-3 text-[#6C63FF]">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">Sin notas aún</p>
                      <p className="mt-1 text-[11px] text-slate-400 max-w-[180px]">
                        Escribe notas o comentarios para darle seguimiento a esta actividad.
                      </p>
                    </div>
                  ) : (
                    comentarios.map((c, i) => {
                      const u = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios
                      const nombre = u?.nombre || u?.correo || 'Usuario'
                      return (
                        <div key={c.id_comentario || i} className="flex gap-2.5 text-xs">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs mt-0.5"
                            style={{ backgroundColor: getAvatarColor(i) }}
                          >
                            {getInitials(nombre)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-bold text-slate-800">{nombre}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{formatDate(c.fecha_creacion)}</span>
                            </div>
                            <div className="rounded-2xl rounded-tl-xs bg-[#F7F5FF] p-3 text-xs text-slate-700 leading-relaxed border border-[#EFEBFF]">
                              {c.contenido}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Input de Comentarios */}
                <div className="mt-4 border-t border-slate-100 pt-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-xs font-bold text-white shadow-2xs">
                      TU
                    </div>
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="text"
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Escribe una nota... (Enter para enviar)"
                        onKeyDown={(e) => e.key === 'Enter' && nuevoComentario.trim() && handleAddComentario()}
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/10 transition placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddComentario}
                        disabled={!nuevoComentario.trim()}
                        className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F0FF] text-[#6C63FF] transition hover:bg-[#6C63FF] hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Enviar nota"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
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
