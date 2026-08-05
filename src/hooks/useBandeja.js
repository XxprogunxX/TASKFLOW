import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getAvatarColor, getInitials } from '../utils/projectUtils'

// Helper function to convert DB timestamps to relative time ("hace 2 horas")
function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInMins = Math.floor(diffInMs / 60000)
  
  if (diffInMins < 60) return `hace ${diffInMins} min`
  const diffInHours = Math.floor(diffInMins / 60)
  if (diffInHours < 24) return `hace ${diffInHours} horas`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'hace 1 día'
  return `hace ${diffInDays} días`
}

export function useBandeja() {
  const [invitaciones, setInvitaciones] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usuario, setUsuario] = useState(null)

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) {
        throw new Error('No estás autenticado')
      }

      // 1. Fetch user profile
      let { data: usr } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle()

      if (!usr && authData.user.email) {
        const { data: usrByEmail } = await supabase
          .from('usuarios')
          .select('*')
          .eq('correo', authData.user.email)
          .maybeSingle()
        usr = usrByEmail
      }

      let nombre = usr?.nombre || authData.user.user_metadata?.nombre || authData.user.email || 'Usuario'
      if (authData.user.email && usr?.nombre === authData.user.email.split('@')[0]) {
        nombre = authData.user.user_metadata?.nombre || usr?.nombre || nombre
      }

      setUsuario({
        nombre,
        correo: usr?.correo || authData.user.email || '',
        iniciales: getInitials(nombre),
        color: getAvatarColor(nombre),
      })

      // 2. Fetch invitaciones
      const email = authData.user.email
      const { data: invs, error: invError } = await supabase
        .from('invitaciones')
        .select(`
          id_invitacion,
          estado,
          fecha_creacion,
          rol,
          equipo:equipos(id_equipo, nombre)
        `)
        .eq('correo_invitado', email)
        .eq('estado', 'pendiente')
        .order('fecha_creacion', { ascending: false })

      if (invError) throw invError

      if (invs) {
        setInvitaciones(invs.map(i => ({
          id: i.id_invitacion,
          equipoId: i.equipo?.id_equipo,
          equipoNombre: i.equipo?.nombre || 'Equipo Desconocido',
          rol: i.rol,
          fecha: new Date(i.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          estado: i.estado
        })))
      }

      // 3. Fetch notificaciones (si hay perfil)
      if (usr) {
        const { data: notifs, error: notifError } = await supabase
          .from('notificaciones')
          .select('*')
          .eq('id_usuario', usr.id_usuario)
          .order('fecha_creacion', { ascending: false })

        if (notifError) throw notifError

        if (notifs) {
          setNotificaciones(notifs.map(n => ({
            id: n.id_notificacion,
            type: n.tipo,
            title: n.titulo,
            description: n.descripcion,
            time: getRelativeTime(n.fecha_creacion),
            isUnread: n.estado === 'no_leido'
          })))
        }
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)

    // 1. Auto-refresh polling silencioso cada 4 segundos
    const pollInterval = setInterval(() => {
      loadData(false)
    }, 4000)

    // 2. Realtime listener silencioso
    const channel = supabase
      .channel('bandeja_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificaciones' },
        () => {
          loadData(false)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitaciones' },
        () => {
          loadData(false)
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [loadData])

  // --- Funciones para Invitaciones ---
  const aceptarInvitacion = async (id) => {
    try {
      const { error: rpcError } = await supabase.rpc('aceptar_invitacion', { p_id_invitacion: id })
      if (rpcError) throw rpcError
      
      setInvitaciones(prev => prev.filter(i => i.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const rechazarInvitacion = async (id) => {
    try {
      const { error } = await supabase
        .from('invitaciones')
        .update({ estado: 'rechazada' })
        .eq('id_invitacion', id)

      if (error) throw error
      
      setInvitaciones(prev => prev.filter(i => i.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // --- Funciones para Notificaciones ---
  const marcarNotificacionLeida = async (id) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ estado: 'leido' })
        .eq('id_notificacion', id)

      if (error) throw error
      
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      const { error } = await supabase.rpc('marcar_todas_notificaciones_leidas')
      if (error) throw error

      setNotificaciones(prev => prev.map(n => ({ ...n, isUnread: false })))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const borrarNotificacion = async (id) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id_notificacion', id)

      if (error) throw error
      
      setNotificaciones(prev => prev.filter(n => n.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    invitaciones,
    notificaciones,
    isLoading,
    error,
    usuario,
    aceptarInvitacion,
    rechazarInvitacion,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    borrarNotificacion
  }
}
