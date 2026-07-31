import BadgeRol from '../BadgeRol'
import { getRolLabel } from '../../services/equiposService'

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

export default function IntegranteEquipo({ integrante, showRol = true, compact = false }) {
  const usuario = integrante.usuarios
  const nombre = usuario?.nombre || 'Usuario'
  const iniciales = getInitials(nombre)
  const avatarColor = getAvatarColor(nombre.length)
  const rolLabel = getRolLabel(integrante.rol, integrante.especialidad)
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: avatarColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
        >
          {iniciales}
        </div>
        <span className="text-xs" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
          {nombre}
        </span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: avatarColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
        >
          {iniciales}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#2D2D3F', fontFamily: 'Nunito, sans-serif' }}>
            {nombre}
          </p>
          {showRol && (
            <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
              {rolLabel}
            </p>
          )}
        </div>
      </div>
      {showRol && <BadgeRol rol={integrante.rol} especialidad={integrante.especialidad} />}
    </div>
  )
}
