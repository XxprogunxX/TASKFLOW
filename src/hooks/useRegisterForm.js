import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const mapSignUpError = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
    return 'Este correo ya está registrado'
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Error de conexión. Intenta de nuevo.'
  }

  return message || 'No se pudo crear la cuenta. Intenta de nuevo.'
}

export function useRegisterForm(onRegisterSuccess = () => console.log('Registro exitoso')) {
  const navigate = useNavigate()
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined, submit: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = {}
    if (!values.fullName || values.fullName.trim().length < 3) {
      newErrors.fullName = 'Ingresa tu nombre completo (mínimo 3 caracteres)'
    }
    if (!validateEmail(values.email)) {
      newErrors.email = 'Ingresa un correo válido'
    }
    if (!values.password || values.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas deben coincidir'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { nombre: values.fullName.trim() },
        },
      })

      if (signUpError) {
        setErrors({ submit: mapSignUpError(signUpError.message) })
        return
      }

      if (!data.user) {
        setErrors({ submit: 'No se pudo crear la cuenta. Intenta de nuevo.' })
        return
      }

      await supabase.auth.signOut()

      onRegisterSuccess({ email: values.email, fullName: values.fullName.trim() })
      navigate('/login', { state: { successMessage: 'Cuenta creada, inicia sesión' } })
    } catch {
      setErrors({ submit: 'Error de conexión. Intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  }
}
