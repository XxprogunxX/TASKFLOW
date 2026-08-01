import { useState, useEffect } from 'react'
import { User, Mail, Shield, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { supabase } from '../supabaseClient'
import { getAvatarColor, getInitials } from '../utils/projectUtils'

export default function ProfilePage() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [rol, setRol] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) return

        setCorreo(authData.user.email || '')

        const { data: usr } = await supabase
          .from('usuarios')
          .select('nombre, rol')
          .eq('auth_id', authData.user.id)
          .maybeSingle()

        if (usr) {
          setNombre(usr.nombre || '')
          setRol(usr.rol || 'Miembro')
        } else {
          setNombre(authData.user.email ? authData.user.email.split('@')[0] : '')
          setRol('Miembro')
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) throw new Error('No hay usuario autenticado')

      // 1. Actualizar tabla de usuarios en Supabase
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ nombre, rol })
        .eq('auth_id', authData.user.id)

      if (updateError) throw updateError

      // 2. Limpiar cache local del avatar para que el Header lo refresque inmediatamente
      localStorage.removeItem('taskflow_user_avatar')

      setMessage({
        type: 'success',
        text: '¡Perfil actualizado correctamente!',
      })
    } catch (err) {
      console.error('Error actualizando perfil:', err)
      setMessage({
        type: 'error',
        text: 'Ocurrió un error al actualizar el perfil. Intenta de nuevo.',
      })
    } finally {
      setSaving(false)
    }
  }

  const initials = getInitials(nombre || correo || 'Usuario')
  const avatarColor = getAvatarColor(nombre || correo || 'Usuario')

  return (
    <div className="min-h-screen bg-[#FFF5F7]" style={{ backgroundColor: '#FFF5F7', color: '#2D2D3F' }}>
      <Header
        active="Perfil"
        initials={initials}
        avatarColor={avatarColor}
        nombreUsuario={nombre || 'Usuario'}
      />

      <main className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm">
          <h1
            className="text-2xl font-extrabold"
            style={{ color: '#4A3A6B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Mi Perfil
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B6B80', fontFamily: 'Nunito, sans-serif' }}>
            Gestiona y actualiza tu información personal en TaskFlow.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6D5BD0]" />
          </div>
        ) : (
          <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80">
            {/* Header del Perfil con Avatar */}
            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: avatarColor, fontFamily: 'Nunito, sans-serif' }}
              >
                {initials}
              </div>
              <div className="text-center sm:text-left">
                <h2
                  className="text-xl font-bold text-[#4A3A6B]"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {nombre || 'Usuario'}
                </h2>
                <p className="text-sm text-[#7C7C93]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {correo}
                </p>
                <span
                  className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#F5F3FF', color: '#6D5BD0' }}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {rol || 'Miembro'}
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                )}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4A3A6B]">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C7C93]" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="h-12 w-full rounded-2xl border border-[#E5E7F0] bg-white pl-12 pr-4 text-sm text-[#2D2D3F] outline-none transition focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4A3A6B]">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C7C93]" />
                  <input
                    type="email"
                    disabled
                    value={correo}
                    className="h-12 w-full cursor-not-allowed rounded-2xl border border-[#E5E7F0] bg-slate-50 pl-12 pr-4 text-sm text-[#7C7C93] outline-none"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#7C7C93]">
                  El correo electrónico está vinculado a tu cuenta y no se puede modificar.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4A3A6B]">
                  Rol / Puesto
                </label>
                <div className="relative">
                  <Shield className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C7C93]" />
                  <input
                    type="text"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    placeholder="Ej. Desarrollador Frontend, Diseñador UX"
                    className="h-12 w-full rounded-2xl border border-[#E5E7F0] bg-white pl-12 pr-4 text-sm text-[#2D2D3F] outline-none transition focus:border-[#6D5BD0]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)',
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
