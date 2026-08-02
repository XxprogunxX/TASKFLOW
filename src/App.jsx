import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import MisTablerosPage from './pages/MisTablerosPage.jsx'
import ProyectoDetailPage from './pages/ProyectoDetailPage.jsx'
import MisEquiposPage from './pages/MisEquiposPage.jsx'
import MisTareasPage from './pages/MisTareasPage.jsx'
import PanelAvancePage from './pages/PanelAvancePage.jsx'
import BandejaPage from './pages/BandejaPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { RootRedirect, PublicOnlyRoute, ProtectedRoute } from './components/RootRedirect.jsx'

import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Rutas protegidas que requieren sesión activa */}
      <Route path="/tablero" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
      <Route path="/panel-avance" element={<ProtectedRoute><PanelAvancePage /></ProtectedRoute>} />
      <Route path="/mis-tableros" element={<ProtectedRoute><MisTablerosPage /></ProtectedRoute>} />
      <Route path="/mis-equipos" element={<ProtectedRoute><MisEquiposPage /></ProtectedRoute>} />
      <Route path="/mis-tareas" element={<ProtectedRoute><MisTareasPage /></ProtectedRoute>} />
      <Route path="/bandeja" element={<ProtectedRoute><BandejaPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/proyecto/:id" element={<ProtectedRoute><ProyectoDetailPage /></ProtectedRoute>} />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

