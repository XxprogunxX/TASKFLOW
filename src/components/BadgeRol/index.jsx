import { getRolBadgeColor } from '../../services/equiposService'

export default function BadgeRol({ rol, especialidad }) {
  const { bg, text } = getRolBadgeColor(rol, especialidad)
  
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color: text, fontFamily: 'Nunito, sans-serif' }}
    >
      {rol === 'developer' && especialidad ? especialidad : rol.toUpperCase()}
    </span>
  )
}
