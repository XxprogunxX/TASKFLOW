import { useState } from 'react'
import { LayoutGrid, Users, Bell, CheckSquare, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLoginForm } from '../hooks/useLoginForm'
import BoardPage from './BoardPage.jsx'
export default function LoginPage({ onLoginSuccess = () => console.log('Login exitoso') }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLoginSuccess = (data) => {
    onLoginSuccess(data)
    setIsLoggedIn(true)
  }

  const { values, errors, isLoading, successMessage, handleChange, handleSubmit } = useLoginForm(handleLoginSuccess)

  const features = [
    {
      icon: LayoutGrid,
      title: 'Tablero Kanban',
      description: 'Organiza por estado',
    },
    {
      icon: Users,
      title: 'Equipos',
      description: 'Colabora fácilmente',
    },
    {
      icon: Bell,
      title: 'Notificaciones',
      description: 'Mantente al día',
    },
    {
      icon: CheckSquare,
      title: 'Mis Tareas',
      description: 'Tu trabajo prioritario',
    },
  ]

  if (isLoggedIn) {
    return <BoardPage />
  }

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
                Organiza tu trabajo escolar con facilidad
              </h1>
              <p className="text-white/80 text-lg max-w-xl font-normal" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Gestiona actividades, asigna responsables y visualiza el avance de tu equipo en tiempo real.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
              {features.map((feature) => {
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

        <section className="w-full md:w-1/2 flex items-center justify-center bg-[#FFF7F8] px-6 py-12">
          <div className="w-full max-w-md">
            {/* Control de Pestañas (Estilo Figma: Iniciar sesión / Crear cuenta) */}
            <div className="mx-auto mb-8 flex w-full max-w-sm rounded-full bg-[#F3EFFF] p-1.5 shadow-inner">
              <button
                type="button"
                className="flex-1 rounded-full bg-white py-2.5 text-center text-sm font-bold text-[#6C63FF] shadow-sm transition-all"
              >
                Iniciar sesión
              </button>
              <Link
                to="/register"
                className="flex-1 rounded-full py-2.5 text-center text-sm font-semibold text-[#8E8A9F] transition-all hover:text-[#6C63FF]"
              >
                Crear cuenta
              </Link>
            </div>

            <h2 className="text-3xl font-extrabold text-[#2D2342] mb-2 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              Bienvenido
            </h2>
            <p className="text-[#7C7890] mb-8 text-sm font-normal" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Inicia sesión para acceder a tu espacio de trabajo
            </p>

            {successMessage && (
              <p className="mb-6 text-sm text-[#2F855A] text-center font-semibold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {successMessage}
              </p>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#2D2342] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@escuela.edu.mx"
                  value={values.email}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border ${errors.email ? 'border-red-400' : 'border-[#E8E5F2]'} bg-[#FAFAFD] px-4 py-3.5 text-[#2D2342] placeholder:text-[#A49FBA] outline-none focus:border-[#6C63FF] focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/20`}
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
                <label htmlFor="password" className="block text-sm font-bold text-[#2D2342] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={values.password}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border ${errors.password ? 'border-red-400' : 'border-[#E8E5F2]'} bg-[#FAFAFD] pl-4 pr-12 py-3.5 text-[#2D2342] placeholder:text-[#A49FBA] outline-none focus:border-[#6C63FF] focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/20`}
                    style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6C63FF] transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs text-[#E53E3E] flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl py-3.5 text-white font-bold shadow-md shadow-[#6C63FF]/20 transition hover:opacity-95 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #3D328F 100%)', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '0.95rem' }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
              {errors.credentials && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-[#E53E3E] flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.credentials}
                  </p>
                </div>
              )}
            </form>

            <p className="text-center text-xs sm:text-sm text-[#7C7890] mt-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ¿Olvidaste tu contraseña?{' '}
              <Link to="/forgot-password" className="font-bold text-[#6C63FF] hover:underline">
                Recuperar acceso
              </Link>
            </p>

            <p className="text-center text-xs sm:text-sm text-[#7C7890] mt-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-bold text-[#FF5C8D] hover:underline">
                Regístrate aquí
              </Link>
            </p>

            {/* Caja de información demo igual que Figma */}
            <div className="mt-8 rounded-2xl border border-dashed border-[#E5E0FA] bg-white/70 py-3 px-4 text-center text-xs text-[#8E8A9F]">
              Demo: cualquier correo y contraseña funcionan
            </div>
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
