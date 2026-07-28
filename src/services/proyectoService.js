import { supabase } from '../supabaseClient'

export async function getProyectoForUsuario(idUsuario) {
  if (!idUsuario) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const { data: membresias, error: membresiasError } = await supabase
    .from('usuarios_equipos')
    .select('id_equipo')
    .eq('id_usuario', idUsuario)
    .limit(20)

  if (membresiasError || !membresias?.length) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const equipoIds = [...new Set(membresias.map((membresia) => membresia.id_equipo).filter(Boolean))]

  if (equipoIds.length === 0) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const { data: equipos, error: equiposError } = await supabase
    .from('equipos')
    .select('id_proyecto')
    .in('id_equipo', equipoIds)
    .limit(20)

  if (equiposError || !equipos?.length) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const proyectoId = equipos.find((equipo) => equipo.id_proyecto)?.id_proyecto ?? null

  if (!proyectoId) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('nombre')
    .eq('id_proyecto', proyectoId)
    .maybeSingle()

  if (proyectoError) {
    return { proyectoId, proyectoNombre: 'Proyecto' }
  }

  return {
    proyectoId,
    proyectoNombre: proyecto?.nombre || 'Proyecto',
  }
}
