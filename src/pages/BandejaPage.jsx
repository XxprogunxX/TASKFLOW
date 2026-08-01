import { CheckSquare, MessageSquare, Clock, CheckCircle, Plus, Mail, Check, X, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import { useBandeja } from '../hooks/useBandeja'

const NOTIF_CONFIG = {
  task: {
    theme: 'pink',
    Icon: CheckSquare
  },
  comment: {
    theme: 'purple',
    Icon: MessageSquare
  },
  deadline: {
    theme: 'red',
    Icon: Clock
  },
  completed: {
    theme: 'green',
    Icon: CheckCircle
  },
  project: {
    theme: 'yellow',
    Icon: Plus
  },
  mention: {
    theme: 'purple',
    Icon: MessageSquare
  },
  default: {
    theme: 'purple',
    Icon: MessageSquare
  }
}

const THEME_STYLES = {
  pink: {
    bg: 'bg-[#FF4A7A]',
    lightBg: 'bg-[#FF4A7A]/10',
    border: 'border-[#FF4A7A]/20',
    iconText: 'text-[#FF4A7A]'
  },
  purple: {
    bg: 'bg-[#6D5BD0]',
    lightBg: 'bg-[#6D5BD0]/10',
    border: 'border-[#6D5BD0]/20',
    iconText: 'text-[#6D5BD0]'
  },
  red: {
    bg: 'bg-[#EF4444]',
    lightBg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/20',
    iconText: 'text-[#EF4444]'
  },
  green: {
    bg: 'bg-[#10B981]',
    lightBg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/20',
    iconText: 'text-[#10B981]'
  },
  yellow: {
    bg: 'bg-[#F59E0B]',
    lightBg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/20',
    iconText: 'text-[#F59E0B]'
  }
}

export default function BandejaPage() {
  const { 
    invitaciones, 
    notificaciones, 
    isLoading, 
    usuario, 
    aceptarInvitacion, 
    rechazarInvitacion,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    borrarNotificacion
  } = useBandeja()

  const handleAceptar = async (id) => {
    const res = await aceptarInvitacion(id)
    if (!res.success) alert('Error al aceptar: ' + res.error)
  }

  const handleRechazar = async (id) => {
    const res = await rechazarInvitacion(id)
    if (!res.success) alert('Error al rechazar: ' + res.error)
  }

  const unreadCount = invitaciones.length + notificaciones.filter(n => n.isUnread).length
  const totalItems = invitaciones.length + notificaciones.length

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF5F7]">
      <Header
        active="Bandeja"
        initials={usuario?.iniciales}
        avatarColor={usuario?.color}
        nombreUsuario={usuario?.nombre}
        notificationCount={unreadCount}
      />

      <main className="mx-auto w-full max-w-[1000px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Cabecera de la Bandeja */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#2D2342]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Bandeja de Entrada
            </h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center rounded-full bg-[#FF4A7A] px-3 py-1 text-sm font-bold text-white shadow-sm">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={marcarTodasLeidas}
              className="text-sm font-bold text-[#6D5BD0] transition hover:text-[#50409A]"
            >
              Marcar todo como leído
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invitaciones Reales (Prioridad Alta) */}
            {invitaciones.map((inv) => (
              <div 
                key={inv.id} 
                className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-[#6D5BD0]/20 transition hover:shadow-md"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6D5BD0] text-white shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D2342] text-[15px]">
                      Invitación al equipo "{inv.equipoNombre}"
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-[#6B6B80]">
                      Te han invitado a unirte como <strong>{inv.rol}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto pr-8">
                  <span className="hidden sm:block text-xs font-bold text-[#9CA3AF] mr-2">
                    {inv.fecha}
                  </span>
                  <button
                    onClick={() => handleRechazar(inv.id)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-[#EEF0F5] bg-white px-3 py-1.5 text-sm font-bold text-[#6B6B80] transition hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleAceptar(inv.id)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: '#6D5BD0' }}
                  >
                    <Check className="h-4 w-4" />
                    Aceptar
                  </button>
                </div>

                {/* Unread Dot */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#6D5BD0]" />
              </div>
            ))}

            {/* Notificaciones Reales */}
            {notificaciones.map((notif) => {
              const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.default
              const theme = THEME_STYLES[config.theme]
              const IconComp = config.Icon

              return (
                <div 
                  key={notif.id} 
                  onClick={() => notif.isUnread && marcarNotificacionLeida(notif.id)}
                  className={`relative flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border transition hover:shadow-md ${theme.border} ${notif.isUnread ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm ${theme.bg}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D2342] text-[15px]">
                        {notif.title}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[#6B6B80]">
                        {notif.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pr-8">
                    <span className="text-xs font-bold text-[#9CA3AF]" style={{ fontFamily: 'monospace' }}>
                      {notif.time}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        borrarNotificacion(notif.id)
                      }}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Unread Dot */}
                  {notif.isUnread && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#6D5BD0]" />
                  )}
                </div>
              )
            })}

            {totalItems === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm mt-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Mail className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold text-[#2D2342]">No hay notificaciones</p>
                <p className="mt-2 text-sm text-slate-500">Aquí aparecerán tus invitaciones a equipos, alertas de tareas y menciones.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
