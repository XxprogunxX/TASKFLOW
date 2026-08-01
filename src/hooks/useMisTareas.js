import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getAvatarColor, getInitials } from '../utils/projectUtils'
import { updateActividadCompleta } from '../services/actividadesService'
import { getProyectoForUsuario } from '../services/proyectoService'


const mapStatusLabel = (status) => {
  switch (status) {
    case 'en_progreso':
      return 'En proceso'
    case 'en_revision':
      return 'En Revisión'
    case 'completada':
      return 'Completada'
    case 'pendiente':
    default:
      return 'Pendiente'
  }
}

const formatDate = (val) => {
  if (!val) return 'Sin fecha'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date)
}

export function useMisTareas() {
  const [tasks, setTasks] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onlyMineFilter, setOnlyMineFilter] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: authData } = await supabase.auth.getUser()
      let currentUserId = null
      let proyectoId = null

      if (authData?.user) {
        const { data: usr } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', authData.user.id)
          .maybeSingle()

        if (usr) {
          currentUserId = usr.id_usuario
          setUsuario({
            idUsuario: usr.id_usuario,
            nombre: usr.nombre || authData.user.email || 'Usuario',
            correo: usr.correo || authData.user.email || '',
            iniciales: getInitials(usr.nombre || authData.user.email || 'Usuario'),
            color: getAvatarColor(usr.nombre || authData.user.email || 'Usuario'),
          })

          const { proyectoId: pid } = await getProyectoForUsuario(usr.id_usuario)
          proyectoId = pid
        }
      }

      if (!currentUserId) {
        setUsuario({
          nombre: 'Manuel Gonzalez',
          correo: 'manuel@example.com',
          iniciales: 'MG',
          color: '#6D5BD0',
        })
      }

      // Fetch from Supabase database `actividades` table
      let query = supabase
        .from('actividades')
        .select(`
          id_actividad,
          titulo,
          descripcion,
          prioridad,
          estado,
          fecha_limite,
          id_responsable,
          id_proyecto,
          responsable:usuarios!id_responsable(id_usuario, nombre, correo)
        `)
        .order('fecha_limite', { ascending: true })

      if (proyectoId) {
        query = query.eq('id_proyecto', proyectoId)
      }

      let { data: dbActividades, error: fetchErr } = await query

      if (fetchErr || !dbActividades || dbActividades.length === 0) {
        setTasks([])
      } else {
        const mapped = dbActividades.map((act) => {
          const isMine = currentUserId ? act.id_responsable === currentUserId : true
          const prio = (act.prioridad || 'media').toLowerCase()
          return {
            id: act.id_actividad,
            title: act.titulo || 'Sin título',
            date: formatDate(act.fecha_limite),
            rawDate: act.fecha_limite,
            status: act.estado || 'pendiente',
            statusLabel: mapStatusLabel(act.estado),
            tags: prio === 'alta' ? ['Backend', 'Seguridad'] : prio === 'media' ? ['DevOps'] : ['Diseño'],
            priority: prio === 'urgente' ? 'alta' : prio,
            priorityLabel: prio === 'alta' || prio === 'urgente' ? 'Alta' : prio === 'baja' ? 'Baja' : 'Media',
            isMine,
            idResponsable: act.id_responsable,
          }
        })
        setTasks(mapped)
      }
    } catch (err) {
      console.error('Error fetching tasks from Supabase:', err)
      setError(err.message || 'Error de conexión con la base de datos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const toggleTaskStatus = useCallback(async (taskId) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'completada' ? 'pendiente' : 'completada'
          return {
            ...t,
            status: newStatus,
            statusLabel: mapStatusLabel(newStatus),
          }
        }
        return t
      }),
    )

    // Update in Supabase Database
    if (typeof taskId === 'number' || (!taskId.toString().startsWith('mock-'))) {
      try {
        const targetTask = tasks.find((t) => t.id === taskId)
        if (targetTask) {
          const nextStatus = targetTask.status === 'completada' ? 'pendiente' : 'completada'
          await updateActividadCompleta(taskId, { estado: nextStatus })
        }
      } catch (err) {
        console.error('Error updating task in Supabase DB:', err)
      }
    }
  }, [tasks])

  const filteredTasks = tasks.filter((t) => (onlyMineFilter ? t.isMine : true))

  const tasksByPriority = {
    alta: filteredTasks.filter((t) => t.priority === 'alta'),
    media: filteredTasks.filter((t) => t.priority === 'media'),
    baja: filteredTasks.filter((t) => t.priority === 'baja'),
  }

  return {
    tasks: filteredTasks,
    allTasksCount: filteredTasks.length,
    tasksByPriority,
    usuario,
    isLoading,
    error,
    onlyMineFilter,
    setOnlyMineFilter,
    toggleTaskStatus,
    refreshTasks: loadTasks,
  }
}
