import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Paperclip,
  Plus,
  X,
  Zap,
} from 'lucide-react'
import { useNewActivity } from '../../hooks/useNewActivity'

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

const estadoStyles = {
  'Por Hacer': {
    color: '#6366F1',
    label: 'Por Hacer',
  },
  'En Progreso': {
    color: '#D69E2E',
    label: 'En Progreso',
  },
  'En Revisión': {
    color: '#E53E3E',
    label: 'En Revisión',
  },
  Completado: {
    color: '#38A169',
    label: 'Completado',
  },
}

export default function NewActivityModal({ isOpen, onClose, onActivityCreated }) {
  const {
    responsables,
    selectedResponsable,
    setSelectedResponsable,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    estadoInicial,
    setEstadoInicial,
    tags,
    tagInput,
    setTagInput,
    files,
    addTag,
    removeTag,
    handleFileSelection,
    removeFile,
    handleSubmit,
    isSubmitting,
    isLoadingResponsables,
    error,
    success,
  } = useNewActivity({ isOpen, onActivityCreated })

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-3xl"
              style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
            >
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Nueva Actividad
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                Completa los detalles de la tarea
              </p>
            </div>
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

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#E53E3E]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {success}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Título <span className="text-[#E53E3E]">*</span>
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="ej. Implementar módulo de autenticación"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe los objetivos y criterios de aceptación de esta actividad..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                Responsable
              </label>
              <div className="flex flex-wrap gap-3">
                {isLoadingResponsables ? (
                  <p className="text-sm text-slate-500">Cargando responsables...</p>
                ) : null}
                {!isLoadingResponsables && responsables.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay responsables disponibles.</p>
                ) : null}
                {responsables.map((responsable) => {
                  const isSelected = selectedResponsable?.id === responsable.id
                  return (
                    <button
                      key={responsable.id}
                      type="button"
                      onClick={() => setSelectedResponsable(responsable)}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: responsable.color }}
                      >
                        {responsable.iniciales}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{responsable.nombre}</span>
                      {isSelected ? <span className="ml-1 h-3 w-3 rounded-full border-2 border-[#6D5BD0] bg-white" /> : null}
                    </button>
                  )
                })}
              </div>
              {selectedResponsable ? (
                <p className="mt-2 text-sm font-medium" style={{ color: '#6D5BD0', fontFamily: 'Nunito, sans-serif' }}>
                  {selectedResponsable.nombre}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                Fecha de entrega
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B80]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#6D5BD0]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Prioridad
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(priorityStyles).map(([label, config]) => {
                const Icon = config.Icon
                const isActive = priority === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPriority(label)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${isActive ? 'shadow-sm' : ''}`}
                    style={{
                      borderColor: isActive ? config.border : '#E5E7F0',
                      backgroundColor: isActive ? config.bg : 'white',
                      color: config.color,
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Estado inicial
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(estadoStyles).map(([label, config]) => {
                const isActive = estadoInicial === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setEstadoInicial(label)}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${isActive ? 'border-[#6D5BD0] bg-purple-50' : 'border-slate-200 bg-white'}`}
                  >
                    <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-sm text-[#4A3A6B]">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-xs text-[#6B6B80]">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addTag(event)
                }
              }}
              placeholder="Escribe una etiqueta y presiona Enter..."
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
            <p className="mt-2 text-sm text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ej. Backend, Diseño, Testing, Documentación
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Evidencias
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-[#6D5BD0] hover:bg-purple-50/40">
              <Paperclip className="h-8 w-8 text-[#6D5BD0]" />
              <span className="mt-3 text-sm font-semibold text-[#2D2D3F]">Arrastra archivos aquí o haz clic</span>
              <span className="mt-1 text-sm text-slate-500">PDF, imágenes, documentos — máx 10 MB</span>
              <input type="file" multiple className="hidden" onChange={handleFileSelection} />
            </label>
            {files.length > 0 ? (
              <div className="mt-3 space-y-2">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-[#6D5BD0]" />
                      <span className="text-sm text-slate-700">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(file.name)} className="text-sm text-[#E53E3E]">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
            >
              {isSubmitting ? 'Creando...' : '+ Crear actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
