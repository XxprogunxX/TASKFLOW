import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function useLoginForm(onLoginSuccess = () => console.log('Login exitoso')) {
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage] = useState(() => location.state?.successMessage ?? null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined, credentials: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = {}
    if (!validateEmail(values.email)) {
      newErrors.email = 'Ingresa un correo válido'
    }
    if (!values.password || values.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setErrors({ credentials: 'Correo o contraseña incorrectos' })
        return
      }

      onLoginSuccess({ email: values.email })
      navigate('/tablero')
    } catch {
      setErrors({ credentials: 'Correo o contraseña incorrectos' })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    values,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  }
}
