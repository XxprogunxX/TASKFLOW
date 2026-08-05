export const colorOptions = [
  { id: 'purple', value: '#6C63FF' },
  { id: 'pink', value: '#FF6B9D' },
  { id: 'green', value: '#38A169' },
  { id: 'gold', value: '#D69E2E' },
  { id: 'blue', value: '#3B82F6' },
  { id: 'red', value: '#E53E3E' },
]

const avatarPalette = ['#6C63FF', '#FF6B9D', '#D69E2E', '#38A169', '#4A3A6B', '#2D2D3F', '#6B6B80', '#EC4899']

export const getInitials = (name) => {
  const normalizedName = (name || '').trim()
  if (!normalizedName) return '?'

  const parts = normalizedName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const getAvatarColor = (name, fallbackIndex = 0) => {
  const normalizedName = (name || '').trim().toLowerCase()
  if (!normalizedName) return avatarPalette[fallbackIndex % avatarPalette.length]

  let hash = 0
  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash)
  }

  return avatarPalette[Math.abs(hash) % avatarPalette.length]
}

export const isActividadCompletada = (estado) => {
  const normalized = (estado || '').toLowerCase()
  return normalized === 'completada' || normalized === 'completado'
}

/** Colores de porcentaje y barra según rango de avance */
export const getProgressStyle = (progreso) => {
  if (progreso <= 25) {
    return { color: '#E53E3E', gradient: 'linear-gradient(90deg, #E53E3E, #F97316)' }
  }
  if (progreso <= 50) {
    return { color: '#F97316', gradient: 'linear-gradient(90deg, #F97316, #D69E2E)' }
  }
  if (progreso <= 75) {
    return { color: '#D69E2E', gradient: 'linear-gradient(90deg, #D69E2E, #6D5BD0)' }
  }
  return { color: '#38A169', gradient: 'linear-gradient(90deg, #38A169, #48BB78)' }
}
