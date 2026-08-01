import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import MisTablerosPage from './pages/MisTablerosPage.jsx'
import ProyectoDetailPage from './pages/ProyectoDetailPage.jsx'
import MisEquiposPage from './pages/MisEquiposPage.jsx'
import MisTareasPage from './pages/MisTareasPage.jsx'
import PanelAvancePage from './pages/PanelAvancePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/tablero" element={<BoardPage />} />
      <Route path="/panel-avance" element={<PanelAvancePage />} />
      <Route path="/mis-tableros" element={<MisTablerosPage />} />
      <Route path="/mis-equipos" element={<MisEquiposPage />} />
      <Route path="/mis-tareas" element={<MisTareasPage />} />
      <Route path="/proyecto/:id" element={<ProyectoDetailPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
