import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getProyectoForUsuario } from '../services/proyectoService'

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

const getInitials = (name) => {
  const normalizedName = (name || '').trim()

  if (!normalizedName) {
    return '?'
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const getAvatarColor = (name) => {
  const palette = ['#6D5BD0', '#D877FF', '#D69E2E', '#38A169', '#F97316', '#0EA5E9']
  const normalizedName = (name || '').trim().toLowerCase()

  let hash = 0
  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % palette.length
  return palette[index]
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

export function useBoard() {
  const [usuario, setUsuario] = useState(null)
  const [columnas, setColumnas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshBoard = useCallback(() => {
    setRefreshKey((current) => current + 1)
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
        }

        let proyectoId = null
        let proyectoNombre = 'Proyecto'

        if (perfil.idUsuario) {
          const proyectoData = await getProyectoForUsuario(perfil.idUsuario)
          proyectoId = proyectoData.proyectoId
          proyectoNombre = proyectoData.proyectoNombre || proyectoNombre
        }

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
            responsable:usuarios!id_responsable(id_usuario, nombre),
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

          return {
            id: actividad.id_actividad,
            title: actividad.titulo || 'Sin título',
            priority: prioridadConfigData.styleKey,
            priorityLabel: prioridadConfigData.label,
            priorityRaw: prioridadRaw,
            date: formatDate(actividad.fecha_limite),
            comments: actividad.comentarios?.[0]?.count ?? 0,
            attachments: actividad.evidencias?.[0]?.count ?? 0,
            ownerName: responsable?.nombre || 'Sin responsable',
            ownerInitials: getInitials(responsable?.nombre || 'Sin responsable'),
            ownerColor: getAvatarColor(responsable?.nombre || 'Sin responsable'),
            tags: [],
            estado: estadoKey,
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
  }, [refreshKey])

  return {
    usuario,
    columnas,
    isLoading,
    error,
    refreshBoard,
  }
}
