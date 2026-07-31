import { Calendar, Clock, MessageSquare, Paperclip, Trash2, User, X, ExternalLink, Send, Link, Check, Circle } from 'lucide-react'
import { useActivityDetail } from '../../hooks/useActivityDetail'
import { useState, useCallback } from 'react'

const avatarColors = ['#6D5BD0', '#DB2777', '#059669', '#D97706', '#7C3AED', '#0891B2', '#C2410C', '#4B5563']

function getAvatarColor(index) {
  return avatarColors[index % avatarColors.length]
}

function getInitials(nombre) {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

  const handleEvidenciaKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && nuevaEvidenciaUrl.trim()) {
      handleAddEvidencia()
    }
  }, [nuevaEvidenciaUrl, handleAddEvidencia])

  if (!isOpen || !actividadId) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          {/* Header del modal */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex-1">
              <h1
                className="text-2xl font-bold"
                style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {titulo || 'Título de la actividad'}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#E9D5FF', color: '#7C3AED', fontFamily: 'Nunito, sans-serif' }}
                >
                  Diseño
                </span>
                <span className="text-xs" style={{ color: '#D97706', fontFamily: 'Nunito, sans-serif' }}>
                  • Cambios sin guardar
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Cargando actividad...</div>
          ) : null}

          {!isLoading && actividad ? (
            <div className="flex flex-col lg:flex-row">
              {/* Columna izquierda - Formulario */}
              <div className="flex-1 p-6 lg:border-r lg:border-slate-200">
                {error ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#E53E3E]">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                {/* Estado y Prioridad en fila */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Estado */}
                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                      Estado
                    </label>
                    <div className="space-y-2">
                      {['Pendiente', 'En proceso', 'En revisión', 'Completada'].map((opcion) => (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() => setEstado(opcion)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                            estado === opcion ? 'border-2 border-[#6D5BD0] bg-[#E9D5FF]' : 'border border-transparent hover:bg-slate-50'
                          }`}
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          <Circle
                            className="h-3 w-3"
                            fill={estado === opcion ? 'currentColor' : 'none'}
                            style={{
                              color: opcion === 'Pendiente' ? '#6D5BD0' :
                                     opcion === 'En proceso' ? '#D97706' :
                                     opcion === 'En revisión' ? '#DB2777' : '#059669'
                            }}
                          />
                          <span style={{ color: estado === opcion ? '#4A3A6B' : '#6B6B80' }}>
                            {opcion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                      Prioridad
                    </label>
                    <div className="space-y-2">
                      {['Alta', 'Media', 'Baja'].map((opcion) => (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() => setPrioridad(opcion)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                            prioridad === opcion ? 'border-2 border-[#6D5BD0] bg-[#E9D5FF]' : 'border border-transparent hover:bg-slate-50'
                          }`}
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          <Circle
                            className="h-3 w-3"
                            fill={prioridad === opcion ? 'currentColor' : 'none'}
                            style={{
                              color: opcion === 'Alta' ? '#E53E3E' :
                                     opcion === 'Media' ? '#D97706' : '#059669'
                            }}
                          />
                          <span style={{ color: prioridad === opcion ? '#4A3A6B' : '#6B6B80' }}>
                            {opcion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fecha límite */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                {/* Responsable */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    Responsable
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {miembros.map((miembro, index) => (
                      <button
                        key={miembro.id}
                        type="button"
                        onClick={() => setSelectedResponsableId(String(miembro.id))}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition ${
                          selectedResponsableId === String(miembro.id) ? 'ring-2 ring-[#6D5BD0] ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: getAvatarColor(index), color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
                        title={miembro.nombre}
                      >
                        {getInitials(miembro.nombre)}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: '#4A3A6B', fontFamily: 'Nunito, sans-serif' }}>
                    {miembros.find(m => String(m.id) === selectedResponsableId)?.nombre || 'Sin asignar'}
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                    placeholder="Describe los objetivos y criterios de aceptación..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                {/* Enlace de evidencia */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    Enlace de evidencia
                  </label>
                  <div className="relative">
                    <Link className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={nuevaEvidenciaUrl}
                      onChange={(e) => setNuevaEvidenciaUrl(e.target.value)}
                      onKeyDown={handleEvidenciaKeyDown}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#6D5BD0]"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                    <Paperclip className="h-4 w-4" />
                    <span>{evidencias.length} archivo(s) adjunto(s)</span>
                  </div>
                </div>

                {/* Footer botones */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    <X className="h-4 w-4" />
                    Eliminar
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleGuardarCambios}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-full bg-[#6D5BD0] px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 hover:bg-[#5a4bb8]"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <Check className="h-4 w-4" />
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Notas de seguimiento */}
              <div className="w-full lg:w-96 p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" style={{ color: '#6D5BD0' }} />
                    <span className="text-sm font-bold" style={{ color: '#4A3A6B', fontFamily: 'Nunito, sans-serif' }}>
                      Notas de seguimiento
                    </span>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6D5BD0] text-xs font-semibold text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {comentarios.length}
                  </div>
                </div>

                {/* Lista de comentarios */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                  {comentarios.length === 0 ? (
                    <p className="text-sm text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Aún no hay notas de seguimiento.
                    </p>
                  ) : null}
                  
                  {comentarios.map((comentario) => {
                    const usuario = Array.isArray(comentario.usuarios) ? comentario.usuarios[0] : comentario.usuarios
                    const nombreUsuario = usuario?.nombre || usuario?.correo || 'Usuario'
                    const inicialesUsuario = getInitials(nombreUsuario)
                    
                    return (
                      <div key={comentario.id_comentario}>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: '#6D5BD0', color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
                          >
                            {inicialesUsuario}
                          </div>
                          <span className="text-xs font-bold" style={{ color: '#4A3A6B', fontFamily: 'Nunito, sans-serif' }}>
                            {nombreUsuario}
                          </span>
                          <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Nunito, sans-serif' }}>
                            {formatDate(comentario.fecha_comentario)}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3">
                          <p className="text-sm" style={{ color: '#374151', fontFamily: 'Nunito, sans-serif' }}>
                            {comentario.comentario}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Input de nuevo comentario */}
                <div className="flex gap-2">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#6D5BD0', color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
                  >
                    TU
                  </div>
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe una nota... (Enter para enviar)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nuevoComentario.trim()) {
                        e.preventDefault()
                        handleAddComentario()
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && !actividad && !error ? (
            <div className="p-6 flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              No se pudo cargar la actividad.
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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
