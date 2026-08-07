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
  'Pendiente': 'pendiente',
  'Por Hacer': 'pendiente',
  'En proceso': 'en_progreso',
  'En Progreso': 'en_progreso',
  'En revisión': 'en_revision',
  'En Revisión': 'en_revision',
  'Completada': 'completada',
  'Completado': 'completada',
}

export function useNewActivity({ isOpen, onActivityCreated, proyectoId: propProyectoId, initialColumn = 'Pendiente' }) {
  const [responsables, setResponsables] = useState([])
  const [selectedResponsable, setSelectedResponsable] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Media')
  const [estadoInicial, setEstadoInicial] = useState(initialColumn)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [deliveryUrl, setDeliveryUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoadingResponsables, setIsLoadingResponsables] = useState(false)

  const [pdfFiles, setPdfFiles] = useState([])
  const [links, setLinks] = useState([])

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('Media')
    setEstadoInicial(initialColumn)
    setTags([])
    setTagInput('')
    setDeliveryUrl('')
    setPdfFiles([])
    setLinks([])
    setSelectedResponsable(null)
    setError('')
    setSuccess('')
  }, [initialColumn])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      return
    }

    setEstadoInicial(initialColumn)

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
  }, [isOpen, resetForm, propProyectoId])

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

  const handlePdfFileSelection = useCallback((fileList) => {
    setError('')
    const incomingFiles = Array.from(fileList || [])
    if (incomingFiles.length === 0) return

    const validPdfs = []
    for (const file of incomingFiles) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        setError('Solo se permite subir archivos PDF (.pdf) y enlaces.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`El archivo "${file.name}" supera el tamaño máximo permitido de 10 MB.`)
        return
      }
      validPdfs.push(file)
    }

    setPdfFiles((current) => [...current, ...validPdfs])
  }, [])

  const removePdfFile = useCallback((indexToRemove) => {
    setPdfFiles((current) => current.filter((_, idx) => idx !== indexToRemove))
  }, [])

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

  const addLink = useCallback((urlToAdd) => {
    setError('')
    const trimmed = (urlToAdd || deliveryUrl).trim()
    if (!trimmed) return

    if (!isValidUrl(trimmed)) {
      setError('Por favor, ingresa un enlace o URL válida (ej. https://drive.google.com/..., figma.com, etc.).')
      return
    }

    let formattedUrl = trimmed
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    setLinks((current) => (current.includes(formattedUrl) ? current : [...current, formattedUrl]))
    setDeliveryUrl('')
  }, [deliveryUrl])

  const removeLink = useCallback((indexToRemove) => {
    setLinks((current) => current.filter((_, idx) => idx !== indexToRemove))
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('Por favor, ingresa el nombre/título de la actividad.')
      return
    }

    if (!selectedResponsable) {
      setError('Por favor, selecciona un responsable para la actividad.')
      return
    }

    if (!priority) {
      setError('Por favor, selecciona una prioridad para la actividad.')
      return
    }

    if (!dueDate) {
      setError('Por favor, selecciona una fecha límite de entrega para la actividad.')
      return
    }

    if (dueDate) {
      const selected = new Date(`${dueDate}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) {
        setError('La fecha límite no puede ser anterior a la fecha actual.')
        return
      }
    }

    if (deliveryUrl.trim() && !isValidUrl(deliveryUrl.trim())) {
      setError('Por favor, ingresa un enlace o URL válida en el campo de enlace.')
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

      const allTags = [...tags, tagInput.trim()].filter(Boolean)
      const uniqueTags = Array.from(new Set(allTags))
      const descripcionConEtiquetas = [description.trim(), uniqueTags.length > 0 ? `Etiquetas: ${uniqueTags.join(', ')}` : '']
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

      if (actividadId) {
        // Upload PDF Files
        for (const pdfFile of pdfFiles) {
          let fileUrl = ''
          try {
            const fileName = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
            const filePath = `actividades/${actividadId}/${fileName}`

            const { error: uploadErr } = await supabase.storage
              .from('evidencias')
              .upload(filePath, pdfFile, { contentType: 'application/pdf', upsert: true })

            if (!uploadErr) {
              const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(filePath)
              fileUrl = publicUrlData?.publicUrl || ''
            }
          } catch (e) {
            console.warn('Supabase storage upload fallback:', e)
          }

          if (!fileUrl) {
            // Data URL fallback if storage bucket is not configured
            fileUrl = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target.result)
              reader.onerror = () => resolve('')
              reader.readAsDataURL(pdfFile)
            })
          }

          if (fileUrl) {
            await supabase.from('evidencias').insert({
              id_actividad: actividadId,
              url_evidencia: fileUrl,
              descripcion: `PDF: ${pdfFile.name}`,
            })
          }
        }

        // Insert Links
        const allLinks = [...links]
        if (deliveryUrl.trim()) {
          let formattedUrl = deliveryUrl.trim()
          if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`
          }
          if (!allLinks.includes(formattedUrl)) {
            allLinks.push(formattedUrl)
          }
        }

        for (const linkUrl of allLinks) {
          await supabase.from('evidencias').insert({
            id_actividad: actividadId,
            url_evidencia: linkUrl,
            descripcion: 'Enlace de evidencia',
          })
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
  }, [description, dueDate, estadoInicial, deliveryUrl, links, pdfFiles, onActivityCreated, priority, resetForm, selectedResponsable, tags, title, propProyectoId])

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
    deliveryUrl,
    setDeliveryUrl,
    pdfFiles,
    links,
    handlePdfFileSelection,
    removePdfFile,
    addLink,
    removeLink,
    addTag,
    removeTag,
    handleSubmit,
    isSubmitting,
    isLoadingResponsables,
    error,
    success,
  }
}
