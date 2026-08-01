import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.')
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden.')
      }

      // Actualizar la contraseña del usuario en Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al actualizar la contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#fdf5f4] px-4 py-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <span className="sphere s1" />
        <span className="sphere s2" />
        <span className="sphere s3" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl" style={{ border: '1px solid #EDE9FE' }}>
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
          >
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#2D2342] text-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Nueva Contraseña
          </h2>
          <p className="text-slate-500 text-xs text-center mt-2 px-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 flex items-center gap-1.5" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-1.5" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <CheckCircle className="h-4 w-4 shrink-0" />
            Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-extrabold uppercase text-slate-400 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-extrabold uppercase text-slate-400 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-75"
            style={{ background: 'linear-gradient(135deg, #6d5bd0, #3a2f8f)', fontFamily: 'Nunito, sans-serif' }}
          >
            {isLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6d5bd0] hover:underline"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>

      <style>{`
        .sphere {
          position: absolute;
          border-radius: 50%;
          background: rgba(109, 91, 208, 0.08);
          filter: blur(4px);
          animation: floatSphere ease-in-out infinite;
        }
        .s1 { width: 140px; height: 140px; top: 15%; left: 10%; animation-duration: 8s; }
        .s2 { width: 180px; height: 180px; bottom: 10%; right: 5%; animation-duration: 10s; }
        .s3 { width: 90px; height: 90px; top: 60%; left: 60%; animation-duration: 7s; }
        @keyframes floatSphere {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }
      `}</style>
    </main>
  )
}
