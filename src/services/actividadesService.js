import { supabase } from '../supabaseClient'
import { getAvatarColor, getInitials } from '../utils/projectUtils'

/** Mapea un registro de usuarios al formato usado en selectores de responsable */
export function mapUsuarioToResponsable(usuario) {
  const nombre = usuario?.nombre || usuario?.correo || 'Sin nombre'

  return {
    id: usuario.id_usuario,
    nombre,
    iniciales: getInitials(nombre),
    color: getAvatarColor(nombre),
  }
}

/** Miembros del equipo vinculado al proyecto (usuarios_equipos → usuarios) */
export async function fetchMiembrosProyecto(proyectoId) {
  if (!proyectoId) {
    return []
  }

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('id_equipo')
    .eq('id_proyecto', proyectoId)
    .maybeSingle()

  if (proyectoError) {
    throw proyectoError
  }

  if (!proyecto?.id_equipo) {
    return []
  }

  const { data: relaciones, error: relacionesError } = await supabase
    .from('usuarios_equipos')
    .select('id_usuario, usuarios(id_usuario, nombre, correo)')
    .eq('id_equipo', proyecto.id_equipo)

  if (relacionesError) {
    throw relacionesError
  }

  const idsVistos = new Set()
  const miembros = []

  ;(relaciones || []).forEach((relacion) => {
    const usuario = Array.isArray(relacion.usuarios) ? relacion.usuarios[0] : relacion.usuarios
    if (!usuario?.id_usuario || idsVistos.has(usuario.id_usuario)) return
    idsVistos.add(usuario.id_usuario)
    miembros.push(mapUsuarioToResponsable(usuario))
  })

  return miembros
}

/** Actualiza id_responsable de una actividad (CA01 / CA03) */
export async function updateResponsableActividad(idActividad, idResponsable) {
  const { data, error } = await supabase
    .from('actividades')
    .update({ id_responsable: idResponsable })
    .eq('id_actividad', idActividad)
    .select(`
      id_actividad,
      id_responsable,
      responsable:usuarios!id_responsable(id_usuario, nombre, correo)
    `)
    .single()

  if (error) {
    throw error
  }

  return data
}

/** Obtiene detalle completo de una actividad para el modal de edición */
export async function fetchActividadDetalle(idActividad) {
  const { data, error } = await supabase
    .from('actividades')
    .select(`
      id_actividad,
      titulo,
      descripcion,
      prioridad,
      estado,
      fecha_limite,
      id_proyecto,
      id_responsable,
      fecha_creacion,
      fecha_actualizacion,
      responsable:usuarios!id_responsable(id_usuario, nombre, correo)
    `)
    .eq('id_actividad', idActividad)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

/** Obtiene comentarios de una actividad */
export async function fetchComentariosActividad(idActividad) {
  const { data, error } = await supabase
    .from('comentarios')
    .select(`
      id_comentario,
      comentario,
      fecha_comentario,
      id_usuario,
      usuarios(id_usuario, nombre, correo)
    `)
    .eq('id_actividad', idActividad)
    .order('fecha_comentario', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

/** Agrega un nuevo comentario a una actividad */
export async function addComentarioActividad(idActividad, idUsuario, texto) {
  const { data, error } = await supabase
    .from('comentarios')
    .insert({
      id_actividad: idActividad,
      id_usuario: idUsuario,
      comentario: texto.trim(),
    })
    .select(`
      id_comentario,
      comentario,
      fecha_comentario,
      id_usuario,
      usuarios(id_usuario, nombre, correo)
    `)
    .single()

  if (error) {
    throw error
  }

  return data
}

/** Obtiene evidencias de una actividad */
export async function fetchEvidenciasActividad(idActividad) {
  const { data, error } = await supabase
    .from('evidencias')
    .select('*')
    .eq('id_actividad', idActividad)
    .order('fecha_registro', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

/** Agrega una nueva evidencia a una actividad */
export async function addEvidenciaActividad(idActividad, urlEvidencia, descripcion) {
  const { data, error } = await supabase
    .from('evidencias')
    .insert({
      id_actividad: idActividad,
      url_evidencia: urlEvidencia.trim(),
      descripcion: descripcion?.trim() || null,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

/** Actualiza todos los campos editables de una actividad */
export async function updateActividadCompleta(idActividad, campos) {
  const { data, error } = await supabase
    .from('actividades')
    .update({
      ...campos,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq('id_actividad', idActividad)
    .select(`
      id_actividad,
      titulo,
      descripcion,
      prioridad,
      estado,
      fecha_limite,
      id_responsable,
      responsable:usuarios!id_responsable(id_usuario, nombre, correo)
    `)
    .single()

  if (error) {
    throw error
  }

  return data
}

/** Elimina una actividad */
export async function deleteActividad(idActividad) {
  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id_actividad', idActividad)

  if (error) {
    throw error
  }

  return true
}
