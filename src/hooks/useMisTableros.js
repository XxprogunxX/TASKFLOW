import { useCallback, useEffect, useState } from 'react'
import { createProyecto, deleteProyecto, fetchProyectosUsuario } from '../services/proyectoService'
import { colorOptions } from '../utils/projectUtils'

export function useMisTableros() {
  const [proyectos, setProyectos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const cargarProyectos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchProyectosUsuario()
      setProyectos(data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los proyectos.')
      setProyectos([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarProyectos()
  }, [cargarProyectos])

  const crearProyecto = useCallback(async ({ nombre, descripcion, color }) => {
    setIsCreating(true)
    setError(null)

    try {
      const nuevoProyecto = await createProyecto({ nombre, descripcion, color })
      setProyectos((current) => [nuevoProyecto, ...current])
      return nuevoProyecto
    } catch (err) {
      const message = err.message || 'No se pudo crear el proyecto.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsCreating(false)
    }
  }, [])

  const eliminarProyecto = useCallback(async (idProyecto) => {
    setError(null)
    try {
      await deleteProyecto(idProyecto)
      setProyectos((current) => current.filter((p) => p.id !== idProyecto))
      if (typeof window !== 'undefined') {
        if (localStorage.getItem('taskflow_active_project_id') === String(idProyecto)) {
          localStorage.removeItem('taskflow_active_project_id')
        }
      }
    } catch (err) {
      const message = err.message || 'No se pudo eliminar el proyecto.'
      setError(message)
      throw new Error(message)
    }
  }, [])

  return {
    proyectos,
    isLoading,
    error,
    isCreating,
    crearProyecto,
    eliminarProyecto,
    recargarProyectos: cargarProyectos,
    colorOptions,
  }
}
