import { LayoutGrid, TrendingUp, Bell, CheckSquare, Plus, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRegisterForm } from '../hooks/useRegisterForm'

export default function RegisterPage({ onRegisterSuccess }) {
  const { values, errors, isLoading, handleChange, handleSubmit } = useRegisterForm(onRegisterSuccess)

  return (
    <>
      <main className="min-h-screen flex flex-col md:flex-row">
        <section
          className="relative w-full md:w-1/2 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6d5bd0 0%, #4f46c9 45%, #3a2f8f 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <span className="sphere s1" />
            <span className="sphere s2" />
            <span className="sphere s3" />
            <span className="sphere s4" />
            <span className="sphere s5" />
          </div>

          <div className="relative z-10 flex min-h-screen flex-col justify-center px-10 py-12 md:px-16">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                TaskFlow
              </span>
            </div>

            <div className="max-w-2xl">
              <h1 className="text-white font-extrabold text-4xl md:text-5xl leading-tight mb-5" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                Únete al equipo hoy
              </h1>
              <p className="text-white/80 text-lg max-w-xl font-normal" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Crea tu cuenta y empieza a colaborar con tu equipo en segundos.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
              {[
                { icon: LayoutGrid, title: 'Tablero Kanban', description: 'Organiza por estado' },
                { icon: TrendingUp, title: 'Panel de Avance', description: 'Indicadores del proyecto' },
                { icon: Bell, title: 'Notificaciones', description: 'Mantente al día' },
                { icon: CheckSquare, title: 'Mis Tareas', description: 'Tu trabajo prioritario' },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-white/15 p-2 mb-3">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                      {feature.title}
                    </p>
                    <p className="text-white/70 text-xs font-normal" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="w-full md:w-1/2 flex items-center justify-center bg-[#FFF5F7] px-6 py-16">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-extrabold text-[#4A3A6B] mb-2 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              Crear cuenta
            </h2>
            <p className="text-[#6B6B80] mb-8 text-base font-normal" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Completa el formulario para unirte al sistema
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[#2D2D3F] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Nombre completo <span className="text-[#E53E3E]">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="ej. María García"
                  value={values.fullName}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.fullName ? 'border-red-400' : 'border-gray-200'} bg-white px-4 py-3 text-[#2D2D3F] outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20`}
                  style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem' }}
                />
                {errors.fullName && (
                  <p className="mt-2 text-xs text-[#E53E3E] flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#2D2D3F] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Correo electrónico <span className="text-[#E53E3E]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@escuela.edu.mx"
                  value={values.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} bg-white px-4 py-3 text-[#2D2D3F] outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20`}
                  style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem' }}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-[#E53E3E] flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#2D2D3F] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Contraseña <span className="text-[#E53E3E]">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={values.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.password ? 'border-red-400' : 'border-gray-200'} bg-white px-4 py-3 text-[#2D2D3F] outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20`}
                  style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem' }}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-[#E53E3E] flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2D2D3F] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Confirmar contraseña <span className="text-[#E53E3E]">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} bg-white px-4 py-3 text-[#2D2D3F] outline-none focus:border-[#6d5bd0] focus:ring-2 focus:ring-[#6d5bd0]/20`}
                  style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem' }}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-[#E53E3E] flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-3 text-white font-semibold shadow-md transition hover:opacity-90 disabled:opacity-70"
                style={{ background: 'linear-gradient(90deg, #ec4899, #6d5bd0)', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '1rem' }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  {isLoading ? 'Creando cuenta...' : 'Crear mi cuenta'}
                </span>
              </button>
              {errors.submit && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-[#E53E3E] flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.submit}
                  </p>
                </div>
              )}
            </form>

            <p className="text-center text-sm mt-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <span className="text-[#6B6B80]">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-[#6d5bd0] font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </section>
      </main>

      <style>{`
        .sphere {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          filter: blur(2px);
          animation: floatSphere ease-in-out infinite, pulseGlow ease-in-out infinite;
        }

        .s1 {
          width: 160px;
          height: 160px;
          top: 10%;
          left: 8%;
          animation-duration: 9s, 6s;
          animation-delay: 0s, 0.5s;
        }

        .s2 {
          width: 90px;
          height: 90px;
          top: 15%;
          left: 55%;
          animation-duration: 7s, 5s;
          animation-delay: 1s, 0s;
        }

        .s3 {
          width: 60px;
          height: 60px;
          top: 35%;
          left: 78%;
          animation-duration: 10s, 7s;
          animation-delay: 2s, 1.5s;
        }

        .s4 {
          width: 220px;
          height: 220px;
          bottom: 10%;
          left: 5%;
          animation-duration: 12s, 8s;
          animation-delay: 0.5s, 2s;
        }

        .s5 {
          width: 45px;
          height: 45px;
          top: 55%;
          left: 35%;
          animation-duration: 8s, 6s;
          animation-delay: 1.5s, 0.5s;
        }

        @keyframes floatSphere {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -18px);
          }
          50% {
            transform: translate(-6px, 10px);
          }
          75% {
            transform: translate(-14px, -8px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  )
}
