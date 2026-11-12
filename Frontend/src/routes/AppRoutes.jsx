import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import RotaPrivada from './RotaPrivada'
import Login from '../pages/Auth/Login'
import Cadastro from '../pages/Auth/Cadastro'
import Home from '../pages/Home/Home'
import ResponderPesquisa from '../pages/Pesquisa/ResponderPesquisa'
import CriarPesquisa from '../pages/Pesquisa/CriarPesquisa'
import Resultados from '../pages/Resultados/Resultados'
import ResultadosGerais from '../pages/Resultados/ResultadosGerais'

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<RotaPrivada><Home /></RotaPrivada>} />
        <Route path="/pesquisa/:id/responder" element={<RotaPrivada><ResponderPesquisa /></RotaPrivada>} />
        <Route path="/pesquisas/criar" element={<RotaPrivada apenasLider><CriarPesquisa /></RotaPrivada>} />
        <Route path="/resultados" element={<RotaPrivada apenasLider><Resultados /></RotaPrivada>} />
        <Route path="/resultados-gerais" element={<RotaPrivada apenasLider><ResultadosGerais /></RotaPrivada>} />
        <Route path="*" element={<Navigate to="/login" replace /> } />
      </Routes>
    </AuthProvider>
  )
}