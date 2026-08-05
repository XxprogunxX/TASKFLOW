import { supabase } from '../supabaseClient'
import { colorOptions, getAvatarColor, getInitials, isActividadCompletada } from '../utils/projectUtils'

const mapProyectoConMetricas = (proyecto, actividades, miembros, index, colorOverride = null) => {
  const tareasTotal = actividades.length
  const tareasCompletadas = actividades.filter((actividad) => isActividadCompletada(actividad.estado)).length
  const progreso = tareasTotal > 0 ? Math.round((tareasCompletadas / tareasTotal) * 100) : 0
  const iconColor = colorOverride || colorOptions[index % colorOptions.length].value

  const miembrosUnicos = []
  const idsVistos = new Set()

  miembros.forEach((miembro, miembroIndex) => {
    if (!miembro?.id_usuario || idsVistos.has(miembro.id_usuario)) return
    idsVistos.add(miembro.id_usuario)

    const nombre = miembro.nombre || miembro.correo || 'Usuario'
    miembrosUnicos.push({
      id: miembro.id_usuario,
      iniciales: getInitials(nombre),
      color: getAvatarColor(nombre, miembroIndex),
    })
  })

  return {
    id: proyecto.id_proyecto,
    nombre: proyecto.nombre || 'Proyecto sin nombre',
    descripcion: proyecto.descripcion || 'Sin descripción',
    fechaInicio: proyecto.fecha_inicio,
    estado: proyecto.estado,
    color: iconColor,
    progreso,
    tareasCompletadas,
    tareasTotal,
    miembros: miembrosUnicos,
  }
}

/** Obtiene el perfil del usuario autenticado en la tabla usuarios */
async function getUsuarioAutenticado() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    throw new Error('No se pudo autenticar al usuario.')
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, correo')
    .eq('auth_id', authData.user.id)
    .maybeSingle()

  if (usuarioError) {
    throw usuarioError
  }

  return {
    authUser: authData.user,
    perfil: usuario,
  }
}

/** Obtiene los IDs de equipos a los que pertenece el usuario */
async function getEquipoIdsUsuario(idUsuario) {
  const { data: membresias, error } = await supabase
    .from('usuarios_equipos')
    .select('id_equipo')
    .eq('id_usuario', idUsuario)

  if (error) {
    throw error
  }

  return [...new Set((membresias || []).map((membresia) => membresia.id_equipo).filter(Boolean))]
}

/** Obtiene miembros del equipo vinculado a un proyecto */
async function getMiembrosPorEquipo(idEquipo) {
  const { data: relaciones, error } = await supabase
    .from('usuarios_equipos')
    .select('id_usuario, usuarios(id_usuario, nombre, correo)')
    .eq('id_equipo', idEquipo)

  if (error) {
    throw error
  }

  return (relaciones || []).flatMap((relacion) => {
    const usuario = Array.isArray(relacion.usuarios) ? relacion.usuarios[0] : relacion.usuarios
    return usuario ? [usuario] : []
  })
}

export async function getProyectoForUsuario(idUsuario, preferredProyectoId = null) {
  if (!idUsuario) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const equipoIds = await getEquipoIdsUsuario(idUsuario)

  if (equipoIds.length === 0) {
    return { proyectoId: null, proyectoNombre: null }
  }

  const targetId = preferredProyectoId || (typeof window !== 'undefined' ? localStorage.getItem('taskflow_active_project_id') : null)

  if (targetId) {
    const { data: preferido } = await supabase
      .from('proyectos')
      .select('id_proyecto, nombre')
      .in('id_equipo', equipoIds)
      .eq('id_proyecto', targetId)
      .maybeSingle()

    if (preferido) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('taskflow_active_project_id', String(preferido.id_proyecto))
      }
      return {
        proyectoId: preferido.id_proyecto,
        proyectoNombre: preferido.nombre || 'Proyecto',
      }
    }
  }

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('id_proyecto, nombre')
    .in('id_equipo', equipoIds)
    .order('id_proyecto', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (proyectoError || !proyecto) {
    return { proyectoId: null, proyectoNombre: null }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('taskflow_active_project_id', String(proyecto.id_proyecto))
  }

  return {
    proyectoId: proyecto.id_proyecto,
    proyectoNombre: proyecto.nombre || 'Proyecto',
  }
}

/** Trae todos los proyectos del usuario con métricas de actividades y miembros */
export async function fetchProyectosUsuario() {
  const { perfil } = await getUsuarioAutenticado()

  if (!perfil?.id_usuario) {
    return []
  }

  const equipoIds = await getEquipoIdsUsuario(perfil.id_usuario)

  if (equipoIds.length === 0) {
    return []
  }

  const { data: proyectos, error: proyectosError } = await supabase
    .from('proyectos')
    .select('id_proyecto, id_equipo, nombre, descripcion, fecha_inicio, fecha_fin, estado')
    .in('id_equipo', equipoIds)
    .order('fecha_inicio', { ascending: false, nullsFirst: false })

  if (proyectosError) {
    throw proyectosError
  }

  if (!proyectos?.length) {
    return []
  }

  const proyectoIds = proyectos.map((proyecto) => proyecto.id_proyecto)

  const { data: actividades, error: actividadesError } = await supabase
    .from('actividades')
    .select('id_actividad, id_proyecto, estado')
    .in('id_proyecto', proyectoIds)

  if (actividadesError) {
    throw actividadesError
  }

  const actividadesPorProyecto = (actividades || []).reduce((acc, actividad) => {
    if (!acc[actividad.id_proyecto]) acc[actividad.id_proyecto] = []
    acc[actividad.id_proyecto].push(actividad)
    return acc
  }, {})

  const miembrosPorProyecto = {}

  await Promise.all(
    proyectos.map(async (proyecto) => {
      miembrosPorProyecto[proyecto.id_proyecto] = await getMiembrosPorEquipo(proyecto.id_equipo)
    }),
  )

  return proyectos.map((proyecto, index) =>
    mapProyectoConMetricas(
      proyecto,
      actividadesPorProyecto[proyecto.id_proyecto] || [],
      miembrosPorProyecto[proyecto.id_proyecto] || [],
      index,
    ),
  )
}

/** Crea equipo + proyecto + membresía vía RPC (transacción atómica en Supabase) */
export async function createProyecto({ nombre, descripcion, color }) {
  const { perfil } = await getUsuarioAutenticado()

  if (!perfil?.id_usuario) {
    throw new Error('No se encontró el perfil del usuario.')
  }

  const nombreProyecto = nombre.trim()
  const descripcionProyecto = descripcion.trim() || null

  const { data: proyectoRpc, error: rpcError } = await supabase.rpc('crear_proyecto_con_equipo', {
    p_nombre: nombreProyecto,
    p_descripcion: descripcionProyecto,
  })

  if (rpcError) {
    throw rpcError
  }

  const proyecto = Array.isArray(proyectoRpc) ? proyectoRpc[0] : proyectoRpc

  if (!proyecto) {
    throw new Error('No se pudo crear el proyecto.')
  }

  return mapProyectoConMetricas(proyecto, [], [perfil], 0, color)
}

/** Elimina un proyecto por su ID */
export async function deleteProyecto(idProyecto) {
  if (!idProyecto) throw new Error('ID de proyecto no válido.')

  // Obtener todas las actividades del proyecto
  const { data: acts } = await supabase
    .from('actividades')
    .select('id_actividad')
    .eq('id_proyecto', idProyecto)

  if (acts && acts.length > 0) {
    const idsAct = acts.map((a) => a.id_actividad)
    // Eliminar dependencias de las actividades
    await supabase.from('comentarios').delete().in('id_actividad', idsAct)
    await supabase.from('evidencias').delete().in('id_actividad', idsAct)
  }

  // Eliminar actividades asociadas al proyecto
  await supabase.from('actividades').delete().eq('id_proyecto', idProyecto)

  // Finalmente eliminar el proyecto
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id_proyecto', idProyecto)

  if (error) {
    throw error
  }
}
