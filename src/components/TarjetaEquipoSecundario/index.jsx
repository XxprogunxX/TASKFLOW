import { Users, UserPlus } from 'lucide-react'
import { useState } from 'react'
import IntegranteEquipo from '../IntegranteEquipo'
import ModalInvitarMiembro from '../ModalInvitarMiembro'

const iconColors = ['#FCE7F3', '#D1FAE5'] // Rosa pastel, verde pastel

export default function TarjetaEquipoSecundario({ equipo, integrantes, colorIndex = 0 }) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const iconColor = iconColors[colorIndex % iconColors.length]
  
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm relative">
      <div className="absolute right-6 top-6">
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-600 transition hover:bg-purple-100"
          title="Invitar Miembro"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invitar</span>
        </button>
      </div>
      
      {/* Ícono del equipo */}
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl mt-4"
        style={{ backgroundColor: iconColor }}
      >
        <Users className="h-8 w-8" style={{ color: '#6D5BD0' }} />
      </div>
      
      {/* Nombre y descripción */}
      <h3
        className="mb-2 text-lg font-bold pr-20"
        style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {equipo.nombre}
      </h3>
      <p
        className="mb-6 text-sm"
        style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}
      >
        {equipo.descripcion || 'Sin descripción'}
      </p>
      
      {/* Lista de integrantes */}
      <div className="mb-4 flex-1 space-y-2">
        {integrantes.slice(0, 4).map((integrante) => (
          <IntegranteEquipo
            key={integrante.id_usuario}
            integrante={integrante}
            showRol={false}
            compact
          />
        ))}
        {integrantes.length > 4 && (
          <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            +{integrantes.length - 4} más
          </p>
        )}
      </div>
      
      {/* Línea divisoria */}
      <div className="my-4 border-t border-slate-200" />
      
      {/* Contador de integrantes */}
      <p className="text-xs" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
        {integrantes.length} integrante{integrantes.length !== 1 ? 's' : ''}
      </p>
      
      <ModalInvitarMiembro 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        equipoId={equipo.id_equipo} 
      />
    </div>
  )
}
