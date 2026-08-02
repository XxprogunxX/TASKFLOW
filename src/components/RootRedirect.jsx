import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export function RootRedirect() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data?.session?.user)
      } catch (err) {
        console.error('Error al verificar sesión:', err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5F7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6D5BD0] border-t-transparent"></div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/tablero" replace /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data?.session?.user)
      } catch (err) {
        console.error('Error al verificar sesión:', err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5F7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6D5BD0] border-t-transparent"></div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/tablero" replace /> : children
}

export function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data?.session?.user)
      } catch (err) {
        console.error('Error al verificar sesión:', err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5F7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6D5BD0] border-t-transparent"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}


