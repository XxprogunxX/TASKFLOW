import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { AlertTriangle, CheckCircle2, Clock, LayoutGrid, TrendingUp } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import Header from '../components/Header'
import { usePanelAvance } from '../hooks/usePanelAvance'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function PanelAvancePage() {
  const { data, isLoading, usuario } = usePanelAvance()

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFF5F7]">
        <Header active="Panel de Avance" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 rounded bg-slate-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const {
    proyectoNombre,
    total,
    countsByStatus,
    countsByPriority,
    completedPct,
    inProcessPct,
    inReviewPct,
    pendingPct,
    workload,
  } = data

  const barData = {
    labels: ['Pendiente', 'En proceso', 'En Revisión', 'Completada'],
    datasets: [
      {
        label: 'Actividades',
        data: [
          countsByStatus.pendiente,
          countsByStatus.en_progreso,
          countsByStatus.en_revision,
          countsByStatus.completada,
        ],
        backgroundColor: ['#6D5BD0', '#EAB308', '#F472B6', '#22C55E'],
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { display: false, beginAtZero: true },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: 'Nunito, sans-serif' }, color: '#64748B' },
      },
    },
  }

  const donutData = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [
      {
        data: [countsByPriority.alta, countsByPriority.media, countsByPriority.baja],
        backgroundColor: ['#EF4444', '#EAB308', '#22C55E'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
    },
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF5F7]">
      <Header
        active="Panel de Avance"
        initials={usuario?.iniciales}
        avatarColor={usuario?.color}
        nombreUsuario={usuario?.nombre}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: '#2D2342', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Panel de Avance
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Indicadores generales del proyecto · {proyectoNombre}
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <LayoutGrid className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-3xl font-extrabold text-purple-600">{total}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-[#2D2342]">Total actividades</h3>
              <p className="text-xs text-slate-500">registradas en el sistema</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-3xl font-extrabold text-green-600">{countsByStatus.completada}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-[#2D2342]">Completadas</h3>
              <p className="text-xs text-slate-500">{completedPct}% de avance general</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-3xl font-extrabold text-amber-600">{countsByStatus.en_progreso}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-[#2D2342]">En proceso</h3>
              <p className="text-xs text-slate-500">{countsByStatus.en_revision} en revisión</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <AlertTriangle className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-3xl font-extrabold text-purple-600">{countsByStatus.pendiente}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-[#2D2342]">Pendientes</h3>
              <p className="text-xs text-slate-500">sin iniciar</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="mb-6 font-bold text-[#2D2342]">Actividades por Estado</h3>
            <div className="h-64 w-full">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Donut Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="mb-6 font-bold text-[#2D2342]">Distribución por Prioridad</h3>
            <div className="flex flex-col sm:flex-row h-auto sm:h-64 items-center justify-center gap-6 sm:gap-12">
              <div className="relative h-48 w-48">
                <Doughnut data={donutData} options={donutOptions} />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
                    <span className="text-sm font-medium text-slate-700">Alta</span>
                  </div>
                  <span className="font-bold text-[#EF4444]">{countsByPriority.alta}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#EAB308]" />
                    <span className="text-sm font-medium text-slate-700">Media</span>
                  </div>
                  <span className="font-bold text-[#EAB308]">{countsByPriority.media}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
                    <span className="text-sm font-medium text-slate-700">Baja</span>
                  </div>
                  <span className="font-bold text-[#22C55E]">{countsByPriority.baja}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium text-slate-500">Total</span>
                  <span className="font-bold text-[#2D2342]">{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sprint Progress */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="mb-6 font-bold text-[#2D2342]">Avance General del Sprint</h3>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Completado</span>
                  <span className="font-bold text-green-600">{completedPct}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completedPct}%`, background: 'linear-gradient(90deg, #6d5bd0 0%, #22c55e 100%)' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#6D5BD0]" />
                    <span className="text-sm font-medium text-slate-600">Pendiente</span>
                  </div>
                  <span className="text-sm font-medium text-purple-400">{countsByStatus.pendiente} <span className="opacity-50">({pendingPct}%)</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#6D5BD0] transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
                    <span className="text-sm font-medium text-slate-600">En proceso</span>
                  </div>
                  <span className="text-sm font-medium text-amber-500">{countsByStatus.en_progreso} <span className="opacity-50">({inProcessPct}%)</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#EAB308] transition-all duration-500" style={{ width: `${inProcessPct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#F472B6]" />
                    <span className="text-sm font-medium text-slate-600">En Revisión</span>
                  </div>
                  <span className="text-sm font-medium text-pink-400">{countsByStatus.en_revision} <span className="opacity-50">({inReviewPct}%)</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#F472B6] transition-all duration-500" style={{ width: `${inReviewPct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    <span className="text-sm font-medium text-slate-600">Completada</span>
                  </div>
                  <span className="text-sm font-medium text-green-500">{countsByStatus.completada} <span className="opacity-50">({completedPct}%)</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#22C55E] transition-all duration-500" style={{ width: `${completedPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Workload */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="mb-6 font-bold text-[#2D2342]">Carga de Trabajo por Miembro</h3>
            <div className="space-y-5">
              {workload.length === 0 ? (
                <p className="text-sm text-slate-500">No hay miembros en el proyecto.</p>
              ) : (
                workload.map((member) => {
                  const pct = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0
                  // Vary progress bar color slightly based on user initials just for looks
                  const colors = ['#6D5BD0', '#EAB308', '#F472B6', '#22C55E']
                  const barColor = colors[member.name.length % colors.length]

                  return (
                    <div key={member.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.initials}
                          </div>
                          <span className="text-sm font-bold text-[#2D2342]">{member.name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#6D5BD0]">
                          {member.completed}/{member.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
