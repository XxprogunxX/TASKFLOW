import { Check, LayoutGrid, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ModalNuevoProyecto({ isOpen, onClose, onCrear, colorOptions }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [color, setColor] = useState(colorOptions[0].value)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setNombre('')
      setDescripcion('')
      setColor(colorOptions[0].value)
      setError('')
    }
  }, [isOpen, colorOptions])

  if (!isOpen) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!nombre.trim()) {
      setError('El nombre del proyecto es obligatorio.')
      return
    }

    onCrear({ nombre, descripcion, color })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-3xl"
              style={{ backgroundColor: '#EDEBFB' }}
            >
              <LayoutGrid className="h-5 w-5" style={{ color: '#6D5BD0' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Nuevo Proyecto
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                Crea un tablero para tu equipo
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

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Nombre del proyecto <span className="text-[#E53E3E]">*</span>
            </label>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="ej. Plataforma de calificaciones"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={4}
              placeholder="¿De qué trata este proyecto?"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6D5BD0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
              Color del tablero
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((option) => {
                const isSelected = option.value === color
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition"
                    style={{
                      backgroundColor: option.value,
                      boxShadow: isSelected ? `0 0 0 3px #FFFFFF, 0 0 0 5px ${option.value}` : 'none',
                    }}
                    aria-label={`Color ${option.id}`}
                  >
                    {isSelected ? <Check className="h-5 w-5 text-white" /> : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${color}1A` }}
              >
                <LayoutGrid className="h-5 w-5" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {nombre.trim() || 'Nombre del proyecto'}
                </p>
                <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
                  0/0 tareas · 0% completado
                </p>
              </div>
              <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: '#EEF0F5' }}>
                <div className="h-full w-0 rounded-full" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
              style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
            >
              <Plus className="h-4 w-4" />
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
