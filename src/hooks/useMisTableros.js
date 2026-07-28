import { useCallback, useEffect, useState } from 'react'
import { createProyecto, fetchProyectosUsuario } from '../services/proyectoService'
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

  return {
    proyectos,
    isLoading,
    error,
    isCreating,
    crearProyecto,
    recargarProyectos: cargarProyectos,
    colorOptions,
  }
}
