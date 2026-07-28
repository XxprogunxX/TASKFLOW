import { Bell, Book, ChevronDown, CheckSquare, Eye, Inbox, LayoutGrid, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Tablero', Icon: LayoutGrid, path: '/tablero' },
  { label: 'Mis Tableros', Icon: Book, path: '/mis-tableros' },
  { label: 'Mis Equipos', Icon: Users, path: null },
  { label: 'Bandeja', Icon: Inbox, path: null },
  { label: 'Mis Tareas', Icon: CheckSquare, path: null },
  { label: 'Especi...', Icon: Eye, path: null },
]

export default function Header({ active = 'Tablero', initials = '?', avatarColor = '#6D5BD0', nombreUsuario = 'Usuario', notificationCount = 3 }) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/70 bg-white shadow-sm"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
          >
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              TaskFlow
            </span>
            <ChevronDown className="h-4 w-4 text-[#4A3A6B]" />
          </div>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-2 sm:flex">
          {navItems.map((item) => {
            const isActive = item.label === active
            const content = (
              <>
                <item.Icon className="h-4 w-4" style={{ color: isActive ? '#4A3A6B' : '#6B6B80' }} />
                {item.label}
              </>
            )
            const className = 'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm'
            const style = {
              backgroundColor: isActive ? '#F5F3FF' : 'transparent',
              color: isActive ? '#4A3A6B' : '#6B6B80',
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
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Bell className="h-5 w-5 text-[#6B6B80]" />
            {notificationCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: '#E53E3E', color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
              >
                {notificationCount}
              </span>
            ) : null}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarColor, color: '#FFFFFF', fontFamily: 'Nunito, sans-serif' }}
            title={nombreUsuario}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
