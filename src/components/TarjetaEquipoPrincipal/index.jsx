import { Users, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import IntegranteEquipo from '../IntegranteEquipo'

export default function TarjetaEquipoPrincipal({ equipo, integrantes, proyecto }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-lg" style={{ border: '2px solid #6D5BD0' }}>
      {/* Header: Estrella + "EQUIPO PRINCIPAL" */}
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-4 w-4" style={{ color: '#F59E0B' }} fill="#F59E0B" />
        <span
          className="text-xs font-bold"
          style={{ color: '#6D5BD0', fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em' }}
        >
          EQUIPO PRINCIPAL
        </span>
      </div>
      
      {/* Ícono grande del equipo */}
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: '#E9D5FF' }}
      >
        <Users className="h-10 w-10" style={{ color: '#6D5BD0' }} />
      </div>
      
      {/* Nombre y descripción */}
      <h2
        className="mb-3 text-2xl font-bold"
        style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {equipo.nombre}
      </h2>
      <p
        className="mb-6 text-sm leading-relaxed"
        style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}
      >
        {equipo.descripcion || 'Sin descripción'}
      </p>
      
      {/* Proyecto asociado */}
      {proyecto ? (
        <div className="mb-6">
          <span className="text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            Proyecto:{' '}
          </span>
          <Link
            to={`/proyecto/${proyecto.id_proyecto}`}
            className="text-sm font-semibold underline hover:opacity-80"
            style={{ color: '#6D5BD0', fontFamily: 'Nunito, sans-serif' }}
          >
            {proyecto.nombre}
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="mb-6">
          <span className="text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            Proyecto:{' '}
          </span>
          <span className="text-sm italic" style={{ color: '#9CA3AF', fontFamily: 'Nunito, sans-serif' }}>
            Sin proyecto asignado
          </span>
        </div>
      )}
      
      {/* Línea divisoria */}
      <div className="mb-6 border-t border-slate-200" />
      
      {/* Lista detallada de integrantes */}
      <div className="flex-1 space-y-1">
        {integrantes.map((integrante) => (
          <IntegranteEquipo
            key={integrante.id_usuario}
            integrante={integrante}
            showRol
          />
        ))}
      </div>
    </div>
  )
}
