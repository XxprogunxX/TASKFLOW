import { useEffect, useState, useRef } from 'react'
import { Bell, Book, ChevronDown, CheckSquare, Inbox, LayoutGrid, Users, TrendingUp, LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getAvatarColor, getInitials } from '../../utils/projectUtils'

const navItems = [
  { label: 'Tablero', Icon: LayoutGrid, path: '/tablero' },
  { label: 'Panel de Avance', Icon: TrendingUp, path: '/panel-avance' },
  { label: 'Mis Tableros', Icon: Book, path: '/mis-tableros' },
  { label: 'Mis Equipos', Icon: Users, path: '/mis-equipos' },
  { label: 'Bandeja', Icon: Inbox, path: '/bandeja' },
  { label: 'Mis Tareas', Icon: CheckSquare, path: '/mis-tareas' },
]

export default function Header({
  active = 'Tablero',
  initials: propInitials,
  avatarColor: propAvatarColor,
  nombreUsuario: propNombreUsuario,
  notificationCount: propNotificationCount,
}) {
  const [userData, setUserData] = useState(() => {
    let cached = null
    try {
      const stored = localStorage.getItem('taskflow_user_avatar')
      if (stored) cached = JSON.parse(stored)
    } catch {
      // Ignore storage errors
    }

    return {
      initials: (propInitials && propInitials !== '?') ? propInitials : (cached?.initials || null),
      avatarColor: (propAvatarColor && propAvatarColor !== '#6D5BD0') ? propAvatarColor : (cached?.color || null),
      nombreUsuario: (propNombreUsuario && propNombreUsuario !== 'Usuario') ? propNombreUsuario : (cached?.name || null),
      notificationCount: (propNotificationCount !== undefined && propNotificationCount !== 3) ? propNotificationCount : (cached?.notificationCount ?? null),
    }
  })

  useEffect(() => {
    let isMounted = true

    async function loadHeaderData() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) return

        // 1. Fetch usuario profile name
        let { data: usr } = await supabase
          .from('usuarios')
          .select('nombre, correo, avatar_url, id_usuario')
          .eq('auth_id', authData.user.id)
          .maybeSingle()

        if (!usr && authData.user.email) {
          const { data: usrByEmail } = await supabase
            .from('usuarios')
            .select('nombre, correo, avatar_url, id_usuario')
            .eq('correo', authData.user.email)
            .maybeSingle()
          usr = usrByEmail
        }

        let name = usr?.nombre || authData.user.user_metadata?.nombre || authData.user.email || 'Usuario'
        if (authData.user.email && usr?.nombre === authData.user.email.split('@')[0]) {
          name = authData.user.user_metadata?.nombre || usr?.nombre
        }
        
        const calcInitials = getInitials(name)
        const calcColor = getAvatarColor(name)

        // 2. Fetch pending invitations count
        const email = authData.user.email
        let totalUnread = 0

        if (email) {
          const { count: invCount } = await supabase
            .from('invitaciones')
            .select('*', { count: 'exact', head: true })
            .eq('correo_invitado', email)
            .eq('estado', 'pendiente')

          totalUnread += invCount || 0
        }

        // 3. Fetch unread notifications count
        if (usr?.id_usuario) {
          const { count: notifCount } = await supabase
            .from('notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('id_usuario', usr.id_usuario)
            .eq('estado', 'no_leido')

          totalUnread += notifCount || 0
        }

        const resolvedInitials = (propInitials && propInitials !== '?') ? propInitials : calcInitials
        const resolvedColor = (propAvatarColor && propAvatarColor !== '#6D5BD0') ? propAvatarColor : calcColor
        const resolvedName = (propNombreUsuario && propNombreUsuario !== 'Usuario') ? propNombreUsuario : name
        const resolvedCount = (propNotificationCount !== undefined && propNotificationCount !== 3) ? propNotificationCount : totalUnread

        // Save to cache for instant render on future page switches
        try {
          localStorage.setItem('taskflow_user_avatar', JSON.stringify({
            initials: resolvedInitials,
            color: resolvedColor,
            name: resolvedName,
            notificationCount: resolvedCount,
          }))
        } catch {
          // Ignore storage errors
        }

        if (isMounted) {
          setUserData({
            initials: resolvedInitials,
            avatarColor: resolvedColor,
            nombreUsuario: resolvedName,
            notificationCount: resolvedCount,
          })
        }
      } catch (err) {
        console.error('Error cargando datos del header:', err)
      }
    }

    loadHeaderData()

    // 1. Polling cada 4 segundos para actualizar la campana automáticamente sin recargar
    const pollInterval = setInterval(() => {
      loadHeaderData()
    }, 4000)

    // 2. Realtime channel listener para actualizaciones instantáneas vía WebSockets
    const channel = supabase
      .channel('header_realtime_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificaciones' },
        () => {
          loadHeaderData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitaciones' },
        () => {
          loadHeaderData()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [propInitials, propAvatarColor, propNombreUsuario, propNotificationCount])

  const displayInitials = userData.initials || (propInitials && propInitials !== '?' ? propInitials : null) || '?'
  const displayColor = userData.avatarColor || (propAvatarColor && propAvatarColor !== '#6D5BD0' ? propAvatarColor : null) || '#6D5BD0'
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('taskflow_user_avatar')
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  const displayNombre = userData.nombreUsuario || (propNombreUsuario && propNombreUsuario !== 'Usuario' ? propNombreUsuario : null) || 'Usuario'
  const displayCount = userData.notificationCount !== null ? userData.notificationCount : (propNotificationCount !== undefined && propNotificationCount !== 3 ? propNotificationCount : 0)

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/70 bg-white shadow-sm"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-3 sm:px-5 lg:px-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-2xl p-1 transition hover:bg-slate-50 outline-none"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
            >
              <LayoutGrid className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-base font-bold"
                style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                TaskFlow
              </span>
              <ChevronDown className={`h-4 w-4 text-[#4A3A6B] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-3xl bg-white p-3 shadow-xl border border-slate-100/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.label === active
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive ? 'bg-[#F5F3FF] text-[#6D5BD0]' : 'text-[#4A3A6B] hover:bg-slate-50'
                      }`}
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <item.Icon className="h-4 w-4" style={{ color: isActive ? '#6D5BD0' : '#7C7C93' }} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="my-2 border-t border-slate-100" />

              <Link
                to="/perfil"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#4A3A6B] hover:bg-slate-50 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <User className="h-4 w-4 text-[#6D5BD0]" />
                Mi Perfil
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#E53E3E] hover:bg-red-50/50 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <LogOut className="h-4 w-4 text-[#E53E3E]" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <nav
          className="hidden items-center justify-center gap-0.5 lg:flex px-1.5 py-1 rounded-full"
          style={{ backgroundColor: '#F5F3FF', border: '1px solid #EAE6FF' }}
        >
          {navItems.map((item) => {
            const isActive = item.label === active
            const content = (
              <>
                <item.Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isActive ? '#6D5BD0' : '#7C7C93' }} />
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            )
            const className = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:opacity-90'
            const style = {
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? '#6D5BD0' : '#7C7C93',
              boxShadow: isActive ? '0 2px 6px rgba(109, 91, 208, 0.08)' : 'none',
              fontFamily: 'Nunito, sans-serif',
            }

            if (item.path) {
              return (
                <Link key={item.label} to={item.path} className={className} style={style}>
                  {content}
                </Link>
              )
            }

            return (
              <button key={item.label} type="button" className={className} style={style}>
                {content}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/bandeja"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-slate-50 transition-colors"
            title="Ir a Bandeja de notificaciones"
          >
            <Bell className="h-5 w-5 text-[#6B6B80]" />
            {displayCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: '#E53E3E', color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
              >
                {displayCount}
              </span>
            ) : null}
          </Link>

          <Link
            to="/perfil"
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: displayColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
            title={`Editar perfil de ${displayNombre}`}
          >
            {displayInitials}
          </Link>
        </div>
      </div>
    </header>
  )
}
