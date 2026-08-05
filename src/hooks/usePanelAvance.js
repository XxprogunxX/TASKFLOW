import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getAvatarColor, getInitials } from '../utils/projectUtils'
import { getProyectoForUsuario } from '../services/proyectoService'

export function usePanelAvance() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usuario, setUsuario] = useState(null)

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: authData } = await supabase.auth.getUser()
      let currentUserId = null
      let proyectoId = null
      let proyectoNombre = 'Proyecto no encontrado'

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

          const proy = await getProyectoForUsuario(usr.id_usuario)
          if (proy && proy.proyectoId) {
            proyectoId = proy.proyectoId
            proyectoNombre = proy.proyectoNombre || 'Proyecto'
          }
        }
      }

      if (!currentUserId) {
        setUsuario({
          nombre: 'Usuario',
          correo: '',
          iniciales: 'U',
          color: '#6D5BD0',
        })
      }

      let allTasks = []
      let usersMap = {} // id -> name, initials, color

      if (proyectoId) {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('actividades')
          .select(`
            id_actividad,
            estado,
            prioridad,
            id_responsable,
            responsable:usuarios!id_responsable(id_usuario, nombre)
          `)
          .eq('id_proyecto', proyectoId)

        if (tasksError) throw tasksError
        if (tasksData) allTasks = tasksData
        
        // Obtenemos el equipo del proyecto para listar a todos los miembros
        const { data: pEquipoData } = await supabase
          .from('proyectos')
          .select('id_equipo')
          .eq('id_proyecto', proyectoId)
          .maybeSingle()

        if (pEquipoData?.id_equipo) {
          const { data: miembrosData } = await supabase
            .from('usuarios_equipos')
            .select(`
              usuario:usuarios(id_usuario, nombre)
            `)
            .eq('id_equipo', pEquipoData.id_equipo)

          if (miembrosData) {
            miembrosData.forEach((m) => {
              const uObj = Array.isArray(m.usuario) ? m.usuario[0] : m.usuario
              if (uObj) {
                const name = uObj.nombre || 'Usuario Desconocido'
                usersMap[uObj.id_usuario] = {
                  id: uObj.id_usuario,
                  name: name,
                  initials: getInitials(name),
                  color: getAvatarColor(name),
                  total: 0,
                  completed: 0,
                }
              }
            })
          }
        }
      }

      // If we don't have members, at least populate from tasks
      allTasks.forEach(t => {
        if (t.id_responsable && !usersMap[t.id_responsable]) {
           const name = t.responsable?.nombre || 'Usuario Desconocido'
           usersMap[t.id_responsable] = {
             id: t.id_responsable,
             name: name,
             initials: getInitials(name),
             color: getAvatarColor(name),
             total: 0,
             completed: 0
           }
        }
        
        if (t.id_responsable && usersMap[t.id_responsable]) {
          usersMap[t.id_responsable].total += 1
          if (t.estado === 'completada') {
            usersMap[t.id_responsable].completed += 1
          }
        }
      })

      // If empty for layout
      if (allTasks.length === 0 && Object.keys(usersMap).length === 0) {
        // Add fake user for UI so it's not totally empty if someone wants to see
      }

      // Calculate stats
      const total = allTasks.length
      const countsByStatus = { pendiente: 0, en_progreso: 0, en_revision: 0, completada: 0 }
      const countsByPriority = { alta: 0, media: 0, baja: 0 }
      
      allTasks.forEach(t => {
        const estado = t.estado || 'pendiente'
        const prio = (t.prioridad || 'media').toLowerCase()
        const normalizedPrio = prio === 'urgente' ? 'alta' : prio
        
        if (countsByStatus[estado] !== undefined) countsByStatus[estado]++
        if (countsByPriority[normalizedPrio] !== undefined) countsByPriority[normalizedPrio]++
      })

      const completedPct = total > 0 ? Math.round((countsByStatus.completada / total) * 100) : 0
      const inProcessPct = total > 0 ? Math.round((countsByStatus.en_progreso / total) * 100) : 0
      const inReviewPct = total > 0 ? Math.round((countsByStatus.en_revision / total) * 100) : 0
      const pendingPct = total > 0 ? Math.round((countsByStatus.pendiente / total) * 100) : 0

      setData({
        proyectoNombre,
        total,
        countsByStatus,
        countsByPriority,
        completedPct,
        inProcessPct,
        inReviewPct,
        pendingPct,
        workload: Object.values(usersMap).sort((a,b) => b.total - a.total)
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Error de conexión con la base de datos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    data,
    isLoading,
    error,
    usuario,
    refreshDashboard: loadDashboardData
  }
}
