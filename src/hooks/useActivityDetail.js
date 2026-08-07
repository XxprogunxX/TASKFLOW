import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  fetchActividadDetalle,
  fetchMiembrosProyecto,
  fetchComentariosActividad,
  fetchEvidenciasActividad,
  addComentarioActividad,
  addEvidenciaActividad,
  deleteEvidenciaActividad,
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
  en_proceso: 'En proceso',
  en_revision: 'En revisión',
  en_revisión: 'En revisión',
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
  const [tags, setTags] = useState([])
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

  const extractTagsFromText = (desc = '') => {
    if (!desc) return []
    const match = desc.match(/(?:Etiquetas|Etiqueta|Tags|Tag):\s*([^\n]+)/i)
    if (match && match[1]) {
      return match[1].split(',').map((t) => t.trim()).filter(Boolean)
    }
    return []
  }

  useEffect(() => {
    if (!isOpen || !actividadId) {
      setActividad(null)
      setMiembros([])
      setSelectedResponsableId('')
      setComentarios([])
      setEvidencias([])
      setTitulo('')
      setDescripcion('')
      setTags([])
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
          
          // Extraer etiquetas y limpiar descripción
          const parsedTags = extractTagsFromText(detalle.descripcion)
          const cleanDesc = (detalle.descripcion || '')
            .replace(/(?:\r\n|\r|\n)*?(?:Etiquetas|Etiqueta|Tags|Tag):\s*[^\n]+/gi, '')
            .trim()

          setTitulo(detalle.titulo || '')
          setDescripcion(cleanDesc)
          setTags(parsedTags)
          setEstado(estadoMap[detalle.estado] || 'Pendiente')
          setPrioridad(priorityMap[detalle.prioridad] || 'Media')
          setFechaLimite(detalle.fecha_limite ? detalle.fecha_limite.split('T')[0] : '')
          setSelectedResponsableId(detalle.id_responsable ? String(detalle.id_responsable) : '')
        }
      } catch (err) {
        console.error('[useActivityDetail] Error cargando actividad:', err)
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

    if (fechaLimite) {
      const selected = new Date(`${fechaLimite}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) {
        setError('La fecha límite no puede ser anterior a la fecha actual.')
        return
      }
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const descConEtiquetas = [
        descripcion.trim(),
        tags.length > 0 ? `Etiquetas: ${tags.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      const campos = {
        titulo: titulo.trim(),
        descripcion: descConEtiquetas || null,
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

function isValidUrl(string) {
  if (!string) return false
  const trimmed = string.trim()
  if (/\s/.test(trimmed)) return false
  try {
    const urlToTest = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const parsed = new URL(urlToTest)
    const hostParts = parsed.hostname.split('.')
    if (hostParts.length < 2) return false
    const tld = hostParts[hostParts.length - 1]
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld)
  } catch (e) {
    return false
  }
}

  const handleAddEvidencia = useCallback(async () => {
    const trimmed = nuevaEvidenciaUrl.trim()
    if (!actividadId || !trimmed) return

    if (!isValidUrl(trimmed)) {
      setError('Por favor, ingresa un enlace o URL válida (ej. https://drive.google.com/..., figma.com, etc.). No se permiten mensajes ni texto plano.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      let formattedUrl = trimmed
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`
      }
      const evidencia = await addEvidenciaActividad(actividadId, formattedUrl, nuevaEvidenciaDesc?.trim() || formattedUrl)
      
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

  const handleUploadPdfEvidencia = useCallback(async (fileList) => {
    if (!actividadId || !fileList || fileList.length === 0) return

    setIsSaving(true)
    setError('')

    try {
      const files = Array.from(fileList)
      for (const file of files) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        if (!isPdf) {
          throw new Error('Solo se permite subir archivos PDF (.pdf) y enlaces.')
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`)
        }

        let fileUrl = ''
        try {
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const filePath = `actividades/${actividadId}/${fileName}`

          const { error: uploadErr } = await supabase.storage
            .from('evidencias')
            .upload(filePath, file, { contentType: 'application/pdf', upsert: true })

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(filePath)
            fileUrl = publicUrlData?.publicUrl || ''
          }
        } catch (e) {
          console.warn('Supabase storage upload fallback:', e)
        }

        if (!fileUrl) {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = () => resolve('')
            reader.readAsDataURL(file)
          })
        }

        if (fileUrl) {
          const evidencia = await addEvidenciaActividad(actividadId, fileUrl, `PDF: ${file.name}`)
          setEvidencias((current) => [evidencia, ...current])
        }
      }

      setSuccess('Archivo PDF subido correctamente.')
    } catch (err) {
      setError(err.message || 'No se pudo subir el archivo PDF.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId])

  const handleDeleteEvidencia = useCallback(async (evidenciaItem) => {
    if (!evidenciaItem) return

    setIsSaving(true)
    setError('')

    try {
      await deleteEvidenciaActividad(evidenciaItem, actividadId)

      const targetId = typeof evidenciaItem === 'object' ? (evidenciaItem.id_evidencia || evidenciaItem.id) : (typeof evidenciaItem === 'number' || /^\d+$/.test(evidenciaItem) ? evidenciaItem : null)
      const targetUrl = typeof evidenciaItem === 'object' ? (evidenciaItem.url_evidencia || evidenciaItem.url) : (typeof evidenciaItem === 'string' ? evidenciaItem : null)

      setEvidencias((current) =>
        current.filter((item) => {
          const itemId = item.id_evidencia || item.id
          const itemUrl = item.url_evidencia || item.url
          if (targetId && itemId && String(itemId) === String(targetId)) return false
          if (targetUrl && itemUrl && (itemUrl === targetUrl || itemUrl.trim() === targetUrl.trim())) return false
          return true
        })
      )

      if (onActivityUpdated) {
        onActivityUpdated()
      }

      setSuccess('Evidencia eliminada correctamente.')
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la evidencia.')
    } finally {
      setIsSaving(false)
    }
  }, [actividadId, onActivityUpdated])

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

  const addTag = useCallback((newTag) => {
    const trimmed = (newTag || '').trim()
    if (!trimmed) return
    setTags((current) => (current.includes(trimmed) ? current : [...current, trimmed]))
  }, [])

  const removeTag = useCallback((tagToRemove) => {
    setTags((current) => current.filter((t) => t !== tagToRemove))
  }, [])

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
    tags,
    setTags,
    addTag,
    removeTag,
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
    handleUploadPdfEvidencia,
    handleDeleteEvidencia,
    handleDeleteActividad,
  }
}
