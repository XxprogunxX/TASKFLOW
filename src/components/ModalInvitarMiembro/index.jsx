import { Mail, Shield, X, Send } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function ModalInvitarMiembro({ isOpen, onClose, equipoId }) {
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('developer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!email.trim() || !email.includes('@')) {
        throw new Error('Ingresa un correo electrónico válido')
      }

      const { error: dbError } = await supabase
        .from('invitaciones')
        .insert([
          { id_equipo: equipoId, correo_invitado: email.trim(), rol }
        ])

      if (dbError) throw dbError

      setSuccess(true)
      setEmail('')
      setRol('developer')
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2D2342]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Invitar Miembro
            </h2>
            <p className="mt-1 text-sm text-[#6B6B80]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Añade un nuevo integrante al equipo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-600 border border-green-100 font-bold">
            ¡Invitación enviada con éxito!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#2D2342]">Correo del Invitado</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                required
                disabled={isLoading || success}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#2D2342]">Rol en el Equipo</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                disabled={isLoading || success}
                className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
              >
                <option value="developer">Developer</option>
                <option value="qa">QA</option>
                <option value="business_analyst">Business Analyst</option>
                <option value="po">Product Owner</option>
                <option value="pm">Project Manager</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #3a2f8f 100%)' }}
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Invitación
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
