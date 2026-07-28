import { LayoutGrid, SquareCheckBig } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getProgressStyle } from '../../utils/projectUtils'

const MAX_AVATARES = 3

export default function TarjetaProyecto({ proyecto }) {
  const navigate = useNavigate()
  const progressStyle = getProgressStyle(proyecto.progreso)
  const avataresVisibles = proyecto.miembros.slice(0, MAX_AVATARES)
  const miembrosExtra = proyecto.miembros.length - MAX_AVATARES

  const handleClick = () => {
    navigate(`/proyecto/${proyecto.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-2xl border border-[#EEF0F5] bg-white p-6 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${proyecto.color}1A` }}
          >
            <LayoutGrid className="h-5 w-5" style={{ color: proyecto.color }} />
          </div>
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {proyecto.nombre}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
              {proyecto.descripcion}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p
            className="text-xl font-extrabold"
            style={{ color: progressStyle.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {proyecto.progreso}%
          </p>
          <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            completado
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: '#EEF0F5' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${proyecto.progreso}%`, background: progressStyle.gradient }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
          <SquareCheckBig className="h-4 w-4" />
          {proyecto.tareasCompletadas}/{proyecto.tareasTotal} tareas completadas
        </div>
        <div className="flex -space-x-2">
          {avataresVisibles.map((miembro) => (
            <div
              key={miembro.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
              style={{ backgroundColor: miembro.color, fontFamily: 'Nunito, sans-serif' }}
              title={miembro.iniciales}
            >
              {miembro.iniciales}
            </div>
          ))}
          {miembrosExtra > 0 ? (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold"
              style={{ backgroundColor: '#EEF0F5', color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}
            >
              +{miembrosExtra}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  )
}
