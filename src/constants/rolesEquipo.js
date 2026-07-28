/** Valores válidos del enum rol_equipo en Supabase */
export const ROLES_EQUIPO = [
  { value: 'pm', label: 'Project Manager' },
  { value: 'po', label: 'Product Owner' },
  { value: 'qa', label: 'QA' },
  { value: 'developer', label: 'Developer' },
  { value: 'business_analyst', label: 'Business Analyst' },
]

/** Rol asignado al usuario que crea un equipo/proyecto */
export const ROL_EQUIPO_CREADOR = 'pm'

export const ROLES_EQUIPO_VALUES = ROLES_EQUIPO.map((rol) => rol.value)

export function isRolEquipoValido(rol) {
  return ROLES_EQUIPO_VALUES.includes(rol)
}
