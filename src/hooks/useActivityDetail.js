import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  fetchActividadDetalle,
  fetchMiembrosProyecto,
  fetchComentariosActividad,
  fetchEvidenciasActividad,
  addComentarioActividad,
  addEvidenciaActividad,
  updateActividadCompleta,
  deleteActividad,
  mapUsuarioToResponsable,
} from '../services/actividadesService'

const priorityMap = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
  urgente: 'Alta',
}

const estadoMap = {
  pendiente: 'Pendiente',
  en_progreso: 'En proceso',
  en_revision: 'En revisión',
  completada: 'Completada',
}

const reverseEstadoMap = {
  'Pendiente': 'pendiente',
  'En proceso': 'en_progreso',
  'En revisión': 'en_revision',
  'Completada': 'completada',
}

const reversePriorityMap = {
  'Alta': 'alta',
  'Media': 'media',
  'Baja': 'baja',
}

export function useActivityDetail({ actividadId, proyectoId, isOpen, onResponsableUpdated, onActivityUpdated, onActivityDeleted }) {
  const [actividad, setActividad] = useState(null)
  const [miembros, setMiembros] = useState([])
  const [selectedResponsableId, setSelectedResponsableId] = useState('')
  const [comentarios, setComentarios] = useState([])
  const [evidencias, setEvidencias] = useState([])
  
  // Campos editables
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('Pendiente')
  const [prioridad, setPrioridad] = useState('Media')
  const [fechaLimite, setFechaLimite] = useState('')
  
  // Comentarios y evidencias
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaEvidenciaUrl, setNuevaEvidenciaUrl] = useState('')
  const [nuevaEvidenciaDesc, setNuevaEvidenciaDesc] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isOpen || !actividadId) {
      setActividad(null)
      setMiembros([])
      setSelectedResponsableId('')
      setComentarios([])
      setEvidencias([])
      setTitulo('')
      setDescripcion('')
      setEstado('Pendiente')
      setPrioridad('Media')
      setFechaLimite('')
      setNuevoComentario('')
      setNuevaEvidenciaUrl('')
      setNuevaEvidenciaDesc('')
      setError('')
      setSuccess('')
      return
    }

    let isMounted = true

    const cargarDetalle = async () => {
      setIsLoading(true)
      setError('')
      setSuccess('')

      try {
        const [detalle, listaMiembros, listaComentarios, listaEvidencias] = await Promise.all([
          fetchActividadDetalle(actividadId),
          fetchMiembrosProyecto(proyectoId),
          fetchComentariosActividad(actividadId),
          fetchEvidenciasActividad(actividadId),
        ])

        if (!detalle) {
          throw new Error('No se encontró la actividad.')
        }

        if (isMounted) {
          setActividad(detalle)
          setMiembros(listaMiembros)
          setComentarios(listaComentarios)
          setEvidencias(listaEvidencias)
          
          // Inicializar campos editables con valores de la actividad
          setTitulo(detalle.titulo || '')
          setDescripcion(detalle.descripcion || '')
          setEstado(estadoMap[detalle.estado] || 'Pendiente')
          setPrioridad(priorityMap[detalle.prioridad] || 'Media')
          setFechaLimite(detalle.fecha_limite ? detalle.fecha_limite.split('T')[0] : '')
          setSelectedResponsableId(detalle.id_responsable ? String(detalle.id_responsable) : '')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar la actividad.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    cargarDetalle()

    return () => {
      isMounted = false
    }
  }, [actividadId, isOpen, proyectoId])

  const handleSaveResponsable = useCallback(async () => {
    if (!actividadId) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const idResponsable = selectedResponsableId ? Number(selectedResponsableId) : null

      if (idResponsable && !miembros.some((miembro) => miembro.id === idResponsable)) {
        throw new Error('El responsable seleccionado no pertenece al proyecto.')
      }

      const actualizado = await updateActividadCompleta(actividadId, {
        id_responsable: idResponsable,
      })

      const responsableRaw = Array.isArray(actualizado.responsable)
        ? actualizado.responsable[0]
        : actualizado.responsable

      const responsableActualizado = responsableRaw ? mapUsuarioToResponsable(responsableRaw) : null

      setActividad((current) => ({
        ...current,
        id_responsable: actualizado.id_responsable,
        responsable: responsableRaw,
      }))

      setSuccess('Responsable actualizado correctamente.')

      if (onResponsableUpdated) {
        onResponsableUpdated(actividadId, responsableActualizado)
      }
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el responsable.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId, miembros, onResponsableUpdated, selectedResponsableId])

  const handleGuardarCambios = useCallback(async () => {
    if (!actividadId) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const campos = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        estado: reverseEstadoMap[estado],
        prioridad: reversePriorityMap[prioridad],
        fecha_limite: fechaLimite || null,
        id_responsable: selectedResponsableId ? Number(selectedResponsableId) : null,
      }

      const actualizado = await updateActividadCompleta(actividadId, campos)

      const responsableRaw = Array.isArray(actualizado.responsable)
        ? actualizado.responsable[0]
        : actualizado.responsable

      const responsableActualizado = responsableRaw ? mapUsuarioToResponsable(responsableRaw) : null

      setActividad((current) => ({
        ...current,
        ...actualizado,
        responsable: responsableRaw,
      }))

      setSuccess('Cambios guardados correctamente.')

      if (onActivityUpdated) {
        onActivityUpdated(actividadId, {
          titulo: actualizado.titulo,
          estado: reverseEstadoMap[estado],
          prioridad: reversePriorityMap[prioridad],
          fecha_limite: actualizado.fecha_limite,
          responsable: responsableActualizado,
        })
      }
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId, titulo, descripcion, estado, prioridad, fechaLimite, selectedResponsableId, onActivityUpdated])

  const handleAddComentario = useCallback(async () => {
    if (!actividadId || !nuevoComentario.trim()) return

    setIsSaving(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        throw new Error('No se pudo obtener la sesión del usuario.')
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', userData.user.id)
        .maybeSingle()

      if (perfilError || !perfil?.id_usuario) {
        throw new Error('No se pudo obtener el perfil del usuario.')
      }

      const comentario = await addComentarioActividad(actividadId, perfil.id_usuario, nuevoComentario)
      
      setComentarios((current) => [comentario, ...current])
      setNuevoComentario('')
      setSuccess('Comentario agregado correctamente.')
    } catch (err) {
      setError(err.message || 'No se pudo agregar el comentario.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId, nuevoComentario])

  const handleAddEvidencia = useCallback(async () => {
    if (!actividadId || !nuevaEvidenciaUrl.trim()) return

    setIsSaving(true)
    setError('')

    try {
      const evidencia = await addEvidenciaActividad(actividadId, nuevaEvidenciaUrl, nuevaEvidenciaDesc)
      
      setEvidencias((current) => [evidencia, ...current])
      setNuevaEvidenciaUrl('')
      setNuevaEvidenciaDesc('')
      setSuccess('Evidencia agregada correctamente.')
    } catch (err) {
      setError(err.message || 'No se pudo agregar la evidencia.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId, nuevaEvidenciaUrl, nuevaEvidenciaDesc])

  const handleDeleteActividad = useCallback(async () => {
    if (!actividadId) return

    setIsDeleting(true)
    setError('')

    try {
      await deleteActividad(actividadId)
      setSuccess('Actividad eliminada correctamente.')

      if (onActivityDeleted) {
        onActivityDeleted(actividadId)
      }
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la actividad.')
    } finally {
      setIsDeleting(false)
    }
  }, [actividadId, onActivityDeleted])

  return {
    actividad,
    miembros,
    selectedResponsableId,
    setSelectedResponsableId,
    comentarios,
    evidencias,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    estado,
    setEstado,
    prioridad,
    setPrioridad,
    fechaLimite,
    setFechaLimite,
    nuevoComentario,
    setNuevoComentario,
    nuevaEvidenciaUrl,
    setNuevaEvidenciaUrl,
    nuevaEvidenciaDesc,
    setNuevaEvidenciaDesc,
    isLoading,
    isSaving,
    isDeleting,
    error,
    success,
    handleSaveResponsable,
    handleGuardarCambios,
    handleAddComentario,
    handleAddEvidencia,
    handleDeleteActividad,
  }
}
