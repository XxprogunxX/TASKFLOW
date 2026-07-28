import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getProyectoForUsuario } from '../services/proyectoService'

const priorityMap = {
  Alta: 'alta',
  Media: 'media',
  Baja: 'baja',
}

const estadoMap = {
  'Por Hacer': 'pendiente',
  'En Progreso': 'en_progreso',
  'En Revisión': 'en_revision',
  'Completado': 'completada',
}

const getInitials = (name) => {
  const normalizedName = (name || '').trim()
  if (!normalizedName) return '?'

  const parts = normalizedName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const getAvatarColor = (name) => {
  const palette = ['#6D5BD0', '#D877FF', '#D69E2E', '#38A169', '#F97316', '#0EA5E9']
  const normalizedName = (name || '').trim().toLowerCase()
  let hash = 0

  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash)
  }

  return palette[Math.abs(hash) % palette.length]
}

export function useNewActivity({ isOpen, onActivityCreated }) {
  const [responsables, setResponsables] = useState([])
  const [selectedResponsable, setSelectedResponsable] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Media')
  const [estadoInicial, setEstadoInicial] = useState('Por Hacer')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoadingResponsables, setIsLoadingResponsables] = useState(false)

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('Media')
    setEstadoInicial('Por Hacer')
    setTags([])
    setTagInput('')
    setFiles([])
    setSelectedResponsable(null)
    setError('')
    setSuccess('')
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      return
    }

    let isMounted = true

    const loadResponsables = async () => {
      setIsLoadingResponsables(true)
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

        if (perfilError) {
          throw perfilError
        }

        if (!perfil?.id_usuario) {
          if (isMounted) {
            setResponsables([])
          }
          return
        }

        const { data: memberships, error: membershipsError } = await supabase
          .from('usuarios_equipos')
          .select('id_equipo')
          .eq('id_usuario', perfil.id_usuario)

        if (membershipsError) {
          throw membershipsError
        }

        const equipoIds = [...new Set((memberships || []).map((item) => item.id_equipo).filter(Boolean))]

        if (equipoIds.length === 0) {
          if (isMounted) {
            setResponsables([])
          }
          return
        }

        const { data: usuariosEquipo, error: usuariosEquipoError } = await supabase
          .from('usuarios')
          .select('id_usuario, nombre, correo')
          .in('id_usuario', (
            await supabase
              .from('usuarios_equipos')
              .select('id_usuario')
              .in('id_equipo', equipoIds)
          ).data?.map((item) => item.id_usuario) || [])

        if (usuariosEquipoError) {
          throw usuariosEquipoError
        }

        const mapped = (usuariosEquipo || []).map((usuario) => ({
          id: usuario.id_usuario,
          nombre: usuario.nombre || usuario.correo || 'Sin nombre',
          iniciales: getInitials(usuario.nombre || usuario.correo || 'Sin nombre'),
          color: getAvatarColor(usuario.nombre || usuario.correo || 'Sin nombre'),
        }))

        if (isMounted) {
          setResponsables(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudieron cargar los responsables.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingResponsables(false)
        }
      }
    }

    loadResponsables()

    return () => {
      isMounted = false
    }
  }, [isOpen, resetForm])

  const addTag = useCallback((event) => {
    event.preventDefault()
    const trimmed = tagInput.trim()
    if (!trimmed) return

    setTags((current) => (current.includes(trimmed) ? current : [...current, trimmed]))
    setTagInput('')
  }, [tagInput])

  const removeTag = useCallback((tagToRemove) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove))
  }, [])

  const handleFileSelection = useCallback((event) => {
    const filesFromInput = Array.from(event.target.files || [])
    if (filesFromInput.length > 0) {
      setFiles((current) => [...current, ...filesFromInput])
    }
  }, [])

  const removeFile = useCallback((fileName) => {
    setFiles((current) => current.filter((file) => file.name !== fileName))
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }

    if (!priority) {
      setError('Selecciona una prioridad.')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        throw new Error('No se pudo validar la sesión.')
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', userData.user.id)
        .maybeSingle()

      if (perfilError) {
        throw perfilError
      }

      const { proyectoId } = await getProyectoForUsuario(perfil?.id_usuario)

      if (!proyectoId) {
        throw new Error('No se encontró un proyecto activo para esta cuenta.')
      }

      const descripcionConEtiquetas = [description.trim(), tags.length > 0 ? `Etiquetas: ${tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n')

      const { data: actividadData, error: actividadError } = await supabase
        .from('actividades')
        .insert({
          id_proyecto: proyectoId,
          id_responsable: selectedResponsable?.id ?? null,
          titulo: title.trim(),
          descripcion: descripcionConEtiquetas || null,
          prioridad: priorityMap[priority] || 'media',
          estado: estadoMap[estadoInicial] || 'pendiente',
          fecha_limite: dueDate || null,
        })
        .select('id_actividad')
        .single()

      if (actividadError) {
        throw actividadError
      }

      const actividadId = actividadData?.id_actividad

      if (actividadId && files.length > 0) {
        for (const file of files) {
          const filePath = `${userData.user.id}/${actividadId}/${file.name}`
          const { error: uploadError } = await supabase.storage.from('evidencias').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

          if (uploadError) {
            throw uploadError
          }

          const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(filePath)
          const publicUrl = publicUrlData?.publicUrl

          if (!publicUrl) {
            throw new Error('No se pudo obtener la URL pública del archivo.')
          }

          const { error: evidenciaError } = await supabase.from('evidencias').insert({
            id_actividad: actividadId,
            url_evidencia: publicUrl,
            descripcion: file.name,
          })

          if (evidenciaError) {
            throw evidenciaError
          }
        }
      }

      if (onActivityCreated) {
        onActivityCreated()
      }

      setSuccess('Actividad creada correctamente.')
      resetForm()
    } catch (err) {
      setError(err.message || 'No se pudo crear la actividad.')
    } finally {
      setIsSubmitting(false)
    }
  }, [description, dueDate, estadoInicial, files, onActivityCreated, priority, resetForm, selectedResponsable, tags, title])

  return {
    responsables,
    selectedResponsable,
    setSelectedResponsable,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    estadoInicial,
    setEstadoInicial,
    tags,
    setTags,
    tagInput,
    setTagInput,
    files,
    setFiles,
    addTag,
    removeTag,
    handleFileSelection,
    removeFile,
    handleSubmit,
    isSubmitting,
    isLoadingResponsables,
    error,
    success,
  }
}
