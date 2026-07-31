import { supabase } from '../supabaseClient'

/**
 * Obtiene el ID del usuario autenticado actual
 */
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')
  
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('auth_id', user.id)
    .single()
  
  if (!usuario) throw new Error('Perfil de usuario no encontrado')
  return usuario.id_usuario
}

/**
 * Obtiene todos los equipos donde el usuario es miembro
 */
export async function fetchEquiposUsuario() {
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('usuarios_equipos')
    .select(`
      id_equipo,
      rol,
      especialidad,
      equipos!inner(
        id_equipo,
        nombre,
        descripcion,
        fecha_creacion,
        proyectos(id_proyecto, id_equipo, nombre, descripcion, estado)
      )
    `)
    .eq('id_usuario', userId)
  
  if (error) throw error
  
  return data || []
}

/**
 * Obtiene los integrantes de un equipo con sus roles
 */
export async function fetchIntegrantesEquipo(idEquipo) {
  const { data, error } = await supabase
    .from('usuarios_equipos')
    .select(`
      id_usuario,
      rol,
      especialidad,
      usuarios!inner(id_usuario, nombre, correo)
    `)
    .eq('id_equipo', idEquipo)
  
  if (error) throw error
  
  return data || []
}

/**
 * Obtiene el detalle completo de un equipo con sus integrantes y proyecto
 */
export async function fetchEquipoDetalle(idEquipo) {
  const { data: equipo, error: equipoError } = await supabase
    .from('equipos')
    .select('*')
    .eq('id_equipo', idEquipo)
    .single()
  
  if (equipoError) throw equipoError
  
  const [integrantes, proyecto] = await Promise.all([
    fetchIntegrantesEquipo(idEquipo),
    supabase
      .from('proyectos')
      .select('*')
      .eq('id_equipo', idEquipo)
      .maybeSingle()
  ])
  
  return {
    ...equipo,
    integrantes,
    proyecto: proyecto.data
  }
}

/**
 * Mapea el rol a un label legible
 */
export function getRolLabel(rol, especialidad) {
  const rolLabels = {
    pm: 'Líder',
    po: 'Product Owner',
    qa: 'QA',
    developer: especialidad || 'Developer',
    business_analyst: 'Business Analyst'
  }
  
  return rolLabels[rol] || rol
}

/**
 * Obtiene el color del badge según el rol
 */
export function getRolBadgeColor(rol, especialidad) {
  if (rol === 'pm') return { bg: '#E9D5FF', text: '#7C3AED' } // Lila/morado
  if (rol === 'po') return { bg: '#FED7AA', text: '#C2410C' } // Naranja/ámbar
  if (rol === 'qa') return { bg: '#D1FAE5', text: '#059669' } // Verde
  if (rol === 'business_analyst') return { bg: '#E5E7EB', text: '#4B5563' } // Gris neutro
  
  // developer
  if (especialidad === 'Frontend') return { bg: '#FCE7F3', text: '#DB2777' } // Rosa
  if (especialidad === 'Seguridad') return { bg: '#FEF3C7', text: '#D97706' } // Ámbar
  return { bg: '#E9D5FF', text: '#6D28D9' } // Morado oscuro (default developer)
}
