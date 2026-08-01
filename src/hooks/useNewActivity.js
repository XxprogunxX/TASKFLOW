import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { fetchMiembrosProyecto } from '../services/actividadesService'
import { getProyectoForUsuario } from '../services/proyectoService'

const priorityMap = {
  Alta: 'alta',
  Media: 'media',
  Baja: 'baja',
}

const estadoMap = {
  'Por Hacer': 'pendiente',
  'En Progreso': 'en_progreso',
  'En Revisión': 'en_revisión',
  'Completado': 'completada',
}

export function useNewActivity({ isOpen, onActivityCreated, proyectoId: propProyectoId }) {
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

        let pid = propProyectoId
        if (!pid) {
          const res = await getProyectoForUsuario(perfil.id_usuario)
          pid = res.proyectoId
        }

        if (!pid) {
          if (isMounted) {
            setResponsables([])
          }
          return
        }

        const mapped = await fetchMiembrosProyecto(pid)

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

      let insertPid = propProyectoId
      if (!insertPid) {
        const res = await getProyectoForUsuario(perfil?.id_usuario)
        insertPid = res.proyectoId
      }

      if (!insertPid) {
        throw new Error('No se encontró un proyecto activo para esta cuenta.')
      }

      const descripcionConEtiquetas = [description.trim(), tags.length > 0 ? `Etiquetas: ${tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n')

      const { data: actividadData, error: actividadError } = await supabase
        .from('actividades')
        .insert({
          id_proyecto: insertPid,
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
