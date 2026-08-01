import { useState, useEffect, useCallback } from 'react'
import { fetchEquiposUsuario, fetchIntegrantesEquipo } from '../services/equiposService'

export function useMisEquipos() {
  const [equipos, setEquipos] = useState([])
  const [equipoPrincipal, setEquipoPrincipal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const cargarEquipos = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const equiposUsuario = await fetchEquiposUsuario()
      
      if (equiposUsuario.length === 0) {
        setEquipos([])
        setEquipoPrincipal(null)
        return
      }

      // Para cada equipo, obtener sus integrantes y aplanar la estructura
      const equiposConIntegrantes = await Promise.all(
        equiposUsuario.map(async (equipoUsuario) => {
          const integrantes = await fetchIntegrantesEquipo(equipoUsuario.id_equipo)
          const rawProyectos = equipoUsuario.equipos?.proyectos
          const primerProyecto = Array.isArray(rawProyectos) ? (rawProyectos[0] || null) : (rawProyectos || null)

          return {
            id_equipo: equipoUsuario.id_equipo,
            rol: equipoUsuario.rol,
            especialidad: equipoUsuario.especialidad,
            equipos: equipoUsuario.equipos,
            proyectos: primerProyecto,
            integrantes
          }
        })
      )

      // Determinar equipo principal: el donde el usuario tiene rol 'pm'
      const equipoPM = equiposConIntegrantes.find(eq => eq.rol === 'pm')
      
      // Si no hay PM, usar el primero
      const principal = equipoPM || equiposConIntegrantes[0]
      
      // Separar principal del resto
      const secundarios = equiposConIntegrantes.filter(eq => eq.id_equipo !== principal.id_equipo)

      setEquipos(secundarios)
      setEquipoPrincipal(principal)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los equipos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarEquipos()
  }, [cargarEquipos])

  return {
    equipos,
    equipoPrincipal,
    isLoading,
    error,
    refreshEquipos: cargarEquipos
  }
}
