import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import Cadastro from '../pages/Auth/Cadastro'
import Home from '../pages/Home/Home'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
      <Route path="/pesquisa/:id/responder" element={<div>Responder Pesquisa</div>} />
      <Route path="/pesquisas/criar" element={<div>Confecção de Pesquisa</div>} />
      <Route path="/resultados" element={<div>Resultados e Métricas</div>} />
    </Routes>
  )
}