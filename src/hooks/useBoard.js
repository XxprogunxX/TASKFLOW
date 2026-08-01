import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getProyectoForUsuario } from '../services/proyectoService'
import { getAvatarColor, getInitials } from '../utils/projectUtils'

const columnConfig = {
  pendiente: { title: 'Por Hacer', accent: '#6366F1' },
  en_progreso: { title: 'En Progreso', accent: '#D69E2E' },
  en_revision: { title: 'En Revisión', accent: '#E53E3E' },
  completada: { title: 'Completado', accent: '#38A169' },
}

const priorityConfig = {
  alta: { label: 'Alta', styleKey: 'Alta' },
  media: { label: 'Media', styleKey: 'Media' },
  baja: { label: 'Baja', styleKey: 'Baja' },
  urgente: { label: 'Urgente', styleKey: 'Alta' },
}

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

const mapResponsableToTaskOwner = (responsable) => {
  if (!responsable?.id_usuario && !responsable?.id) {
    return {
      responsableId: null,
      hasResponsable: false,
      ownerName: 'Sin asignar',
      ownerInitials: null,
      ownerColor: null,
    }
  }

  const nombre = responsable.nombre || responsable.correo || 'Usuario'

  return {
    responsableId: responsable.id_usuario ?? responsable.id,
    hasResponsable: true,
    ownerName: nombre,
    ownerInitials: getInitials(nombre),
    ownerColor: getAvatarColor(nombre),
  }
}

export function useBoard(selectedProyectoId = null) {
  const [usuario, setUsuario] = useState(null)
  const [columnas, setColumnas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshBoard = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  /** CA03: actualiza la tarjeta en memoria sin refetch completo del tablero */
  const updateTaskResponsable = useCallback((actividadId, responsable) => {
    const ownerData = responsable
      ? mapResponsableToTaskOwner({ id: responsable.id, nombre: responsable.nombre })
      : mapResponsableToTaskOwner(null)

    setColumnas((current) =>
      current.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === actividadId
            ? {
                ...task,
                ...ownerData,
              }
            : task,
        ),
      })),
    )
  }, [])

  /** Actualiza campos editables de una actividad en memoria (estado, prioridad, fecha, título) */
  const updateTaskFields = useCallback((actividadId, campos) => {
    setColumnas((current) =>
      current.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => {
          if (task.id !== actividadId) return task

          const updatedTask = { ...task }

          // Actualizar título
          if (campos.titulo !== undefined) {
            updatedTask.title = campos.titulo
          }

          // Actualizar estado (mover a otra columna)
          if (campos.estado !== undefined) {
            updatedTask.estado = campos.estado
          }

          // Actualizar prioridad
          if (campos.prioridad !== undefined) {
            const prioridadRaw = campos.prioridad.toLowerCase()
            const prioridadConfigData = priorityConfig[prioridadRaw] || priorityConfig.media
            updatedTask.priority = prioridadConfigData.styleKey
            updatedTask.priorityLabel = prioridadConfigData.label
            updatedTask.priorityRaw = prioridadRaw
          }

          // Actualizar fecha límite
          if (campos.fecha_limite !== undefined) {
            updatedTask.date = formatDate(campos.fecha_limite)
          }

          // Actualizar responsable
          if (campos.responsable !== undefined) {
            const ownerData = campos.responsable
              ? mapResponsableToTaskOwner({ id: campos.responsable.id, nombre: campos.responsable.nombre })
              : mapResponsableToTaskOwner(null)
            Object.assign(updatedTask, ownerData)
          }

          return updatedTask
        }),
      })),
    )
  }, [])

  /** Elimina una actividad del tablero en memoria */
  const deleteTaskFromBoard = useCallback((actividadId) => {
    setColumnas((current) =>
      current.map((column) => ({
        ...column,
        count: column.tasks.filter((task) => task.id !== actividadId).length,
        tasks: column.tasks.filter((task) => task.id !== actividadId),
      })),
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchBoardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData?.user) {
          throw new Error('No se pudo autenticar al usuario.')
        }

        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', authData.user.id)
          .maybeSingle()

        if (usuarioError) {
          throw usuarioError
        }

        const perfil = {
          idUsuario: usuarioData?.id_usuario ?? null,
          nombre: usuarioData?.nombre || authData.user.email || 'Usuario',
          correo: usuarioData?.correo || authData.user.email || '',
          iniciales: getInitials(usuarioData?.nombre || authData.user.email || 'Usuario'),
          color: getAvatarColor(usuarioData?.nombre || authData.user.email || 'Usuario'),
          sinProyectos: false,
          proyectoId: null,
        }

        let proyectoId = selectedProyectoId || localStorage.getItem('taskflow_active_project_id') || null
        let proyectoNombre = 'Proyecto'

        if (proyectoId) {
          const { data: pData } = await supabase
            .from('proyectos')
            .select('id_proyecto, nombre')
            .eq('id_proyecto', proyectoId)
            .maybeSingle()

          if (pData) {
            proyectoId = pData.id_proyecto
            proyectoNombre = pData.nombre
          } else {
            proyectoId = null
          }
        }

        if (!proyectoId && perfil.idUsuario) {
          const proyectoData = await getProyectoForUsuario(perfil.idUsuario)
          proyectoId = proyectoData.proyectoId
          proyectoNombre = proyectoData.proyectoNombre || proyectoNombre
        }

        if (proyectoId) {
          localStorage.setItem('taskflow_active_project_id', String(proyectoId))
        }

        perfil.proyectoId = proyectoId
        perfil.proyectoNombre = proyectoNombre

        if (!proyectoId) {
          perfil.sinProyectos = true
        }

        const actividadesQuery = supabase
          .from('actividades')
          .select(`
            id_actividad,
            titulo,
            prioridad,
            estado,
            fecha_limite,
            id_proyecto,
            id_responsable,
            responsable:usuarios!id_responsable(id_usuario, nombre, correo),
            comentarios(count),
            evidencias(count)
          `)
          .order('fecha_limite', { ascending: true, nullsFirst: false })

        const { data: actividadesData, error: actividadesError } = proyectoId
          ? await actividadesQuery.eq('id_proyecto', proyectoId)
          : await actividadesQuery

        if (actividadesError) {
          throw actividadesError
        }

        const tareas = (actividadesData || []).map((actividad) => {
          const responsable = Array.isArray(actividad.responsable)
            ? actividad.responsable[0]
            : actividad.responsable
          const prioridadRaw = (actividad.prioridad || '').toLowerCase()
          const prioridadConfigData = priorityConfig[prioridadRaw] || priorityConfig.media
          const estadoRaw = (actividad.estado || '').toLowerCase()
          const estadoKey = Object.keys(columnConfig).find((key) => key === estadoRaw) || 'pendiente'
          const ownerData = mapResponsableToTaskOwner(responsable)

          return {
            id: actividad.id_actividad,
            title: actividad.titulo || 'Sin título',
            priority: prioridadConfigData.styleKey,
            priorityLabel: prioridadConfigData.label,
            priorityRaw: prioridadRaw,
            date: formatDate(actividad.fecha_limite),
            comments: actividad.comentarios?.[0]?.count ?? 0,
            attachments: actividad.evidencias?.[0]?.count ?? 0,
            tags: [],
            estado: estadoKey,
            ...ownerData,
          }
        })

        const totalTareas = tareas.length
        const columnasData = Object.entries(columnConfig).map(([estadoKey, config]) => {
          const tareasColumna = tareas.filter((tarea) => tarea.estado === estadoKey)
          const porcentaje = totalTareas > 0 ? Math.round((tareasColumna.length / totalTareas) * 100) : 0

          return {
            title: config.title,
            accent: config.accent,
            count: tareasColumna.length,
            progress: porcentaje,
            tasks: tareasColumna,
          }
        })

        if (isMounted) {
          setUsuario({
            ...perfil,
            proyectoNombre,
          })
          setColumnas(columnasData)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el tablero.')
          setColumnas([])
          setUsuario(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchBoardData()

    return () => {
      isMounted = false
    }
  }, [refreshKey, selectedProyectoId])

  return {
    usuario,
    columnas,
    isLoading,
    error,
    refreshBoard,
    updateTaskResponsable,
    updateTaskFields,
    deleteTaskFromBoard,
  }
}
