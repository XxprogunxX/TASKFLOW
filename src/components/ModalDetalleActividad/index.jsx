import { Calendar, Clock, MessageSquare, Paperclip, Trash2, User, X, ExternalLink } from 'lucide-react'
import { useActivityDetail } from '../../hooks/useActivityDetail'
import { useState, useCallback } from 'react'

export default function ActivityDetailModal({
  isOpen,
  onClose,
  actividadId,
  proyectoId,
  onResponsableUpdated,
  onActivityUpdated,
  onActivityDeleted,
}) {
  // Hooks deben declararse antes de cualquier return condicional
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
  } = useActivityDetail({ actividadId, proyectoId, isOpen, onResponsableUpdated, onActivityUpdated, onActivityDeleted })

  const handleConfirmDelete = useCallback(async () => {
    await handleDeleteActividad()
    setShowDeleteConfirm(false)
    onClose()
  }, [handleDeleteActividad, onClose])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'No registrada'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }, [])

  if (!isOpen || !actividadId) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-transparent text-xl font-bold outline-none"
                style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                placeholder="Título de la actividad"
              />
              <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                Edita todos los detalles de la actividad
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-500">Cargando actividad...</p>
          ) : null}

          {!isLoading && actividad ? (
            <div className="mt-6 space-y-6">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#E53E3E]">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              {/* Información principal editable */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Describe los objetivos y criterios de aceptación..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                      Estado
                    </label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                      Prioridad
                    </label>
                    <select
                      value={prioridad}
                      onChange={(e) => setPrioridad(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                      Fecha límite
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B80]" />
                      <input
                        type="date"
                        value={fechaLimite}
                        onChange={(e) => setFechaLimite(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#6D5BD0]"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                      Responsable
                    </label>
                    <select
                      value={selectedResponsableId}
                      onChange={(e) => setSelectedResponsableId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <option value="">Sin asignar</option>
                      {miembros.map((miembro) => (
                        <option key={miembro.id} value={String(miembro.id)}>
                          {miembro.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Metadatos */}
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap gap-4 text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="h-3 w-3" />
                    Creado: {formatDate(actividad.fecha_creacion)}
                  </span>
                  {actividad.fecha_actualizacion ? (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-3 w-3" />
                      Actualizado: {formatDate(actividad.fecha_actualizacion)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Comentarios */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                  Comentarios
                </h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comentarios.length === 0 ? (
                    <p className="text-sm text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      No hay comentarios aún.
                    </p>
                  ) : null}
                  
                  {comentarios.map((comentario) => {
                    const usuario = Array.isArray(comentario.usuarios) ? comentario.usuarios[0] : comentario.usuarios
                    const nombreUsuario = usuario?.nombre || usuario?.correo || 'Usuario'
                    
                    return (
                      <div key={comentario.id_comentario} className="rounded-2xl bg-slate-50 p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {nombreUsuario}
                          </span>
                          <span className="text-xs text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {formatDate(comentario.fecha_comentario)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          {comentario.comentario}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddComentario()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddComentario}
                    disabled={isSaving || !nuevoComentario.trim()}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)', fontFamily: 'Nunito, sans-serif' }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Evidencias */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                  Evidencias
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {evidencias.length === 0 ? (
                    <p className="text-sm text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      No hay evidencias registradas.
                    </p>
                  ) : null}
                  
                  {evidencias.map((evidencia) => (
                    <div key={evidencia.id_evidencia} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3">
                      <div className="flex-1 min-w-0">
                        <a
                          href={evidencia.url_evidencia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#6D5BD0] hover:underline"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{evidencia.descripcion || evidencia.url_evidencia}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <input
                    type="url"
                    value={nuevaEvidenciaUrl}
                    onChange={(e) => setNuevaEvidenciaUrl(e.target.value)}
                    placeholder="URL de la evidencia"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  <input
                    type="text"
                    value={nuevaEvidenciaDesc}
                    onChange={(e) => setNuevaEvidenciaDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddEvidencia}
                    disabled={isSaving || !nuevaEvidenciaUrl.trim()}
                    className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)', fontFamily: 'Nunito, sans-serif' }}
                  >
                    <Paperclip className="mr-2 inline h-4 w-4" />
                    Agregar evidencia
                  </button>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  <Trash2 className="mr-2 inline h-4 w-4" />
                  Eliminar
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarCambios}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)', fontFamily: 'Nunito, sans-serif' }}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && !actividad && !error ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              No se pudo cargar la actividad.
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-lg font-bold" style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              ¿Eliminar actividad?
            </h2>
            <p className="mt-2 text-sm text-slate-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta actividad?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
