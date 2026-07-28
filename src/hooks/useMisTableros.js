import { useCallback, useState } from 'react'

const colorOptions = [
  { id: 'purple', value: '#6D5BD0' },
  { id: 'pink', value: '#EC4899' },
  { id: 'green', value: '#38A169' },
  { id: 'gold', value: '#D69E2E' },
  { id: 'blue', value: '#3B82F6' },
  { id: 'red', value: '#E53E3E' },
]

const initialProyectos = [
  {
    id: 'proy-1',
    nombre: 'Sistema de Gestión Escolar',
    descripcion: 'Plataforma para administrar actividades académicas',
    color: colorOptions[0].value,
    progreso: 65,
    tareasCompletadas: 16,
    tareasTotal: 24,
    miembros: [
      { iniciales: 'MG', color: '#D69E2E' },
      { iniciales: 'CL', color: '#2D2D6B' },
      { iniciales: 'AM', color: '#EC4899' },
    ],
  },
  {
    id: 'proy-2',
    nombre: 'App Móvil de Asistencia',
    descripcion: 'Registro de asistencia estudiantil',
    color: colorOptions[5].value,
    progreso: 30,
    tareasCompletadas: 5,
    tareasTotal: 18,
    miembros: [
      { iniciales: 'LH', color: '#38A169' },
      { iniciales: 'DF', color: '#6D5BD0' },
      { iniciales: 'VS', color: '#38A169' },
    ],
  },
  {
    id: 'proy-3',
    nombre: 'Portal de Calificaciones',
    descripcion: 'Gestión y visualización de calificaciones',
    color: colorOptions[2].value,
    progreso: 85,
    tareasCompletadas: 17,
    tareasTotal: 20,
    miembros: [
      { iniciales: 'ID', color: '#D69E2E' },
      { iniciales: 'MT', color: '#E53E3E' },
      { iniciales: 'MG', color: '#6D5BD0' },
    ],
  },
  {
    id: 'proy-4',
    nombre: 'Biblioteca Digital',
    descripcion: 'Repositorio de recursos educativos',
    color: colorOptions[3].value,
    progreso: 15,
    tareasCompletadas: 4,
    tareasTotal: 30,
    miembros: [
      { iniciales: 'AM', color: '#EC4899' },
      { iniciales: 'CL', color: '#6D5BD0' },
      { iniciales: 'LH', color: '#38A169' },
    ],
  },
]

export function useMisTableros() {
  const [proyectos, setProyectos] = useState(initialProyectos)

  const crearProyecto = useCallback(({ nombre, descripcion, color }) => {
    const nuevoProyecto = {
      id: `proy-${Date.now()}`,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      color,
      progreso: 0,
      tareasCompletadas: 0,
      tareasTotal: 0,
      miembros: [],
    }

    setProyectos((current) => [nuevoProyecto, ...current])
    return nuevoProyecto
  }, [])

  return { proyectos, crearProyecto, colorOptions }
}
