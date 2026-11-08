import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import Cadastro from '../pages/Auth/Cadastro'
import Home from '../pages/Home/Home'
import ResponderPesquisa from '../pages/Pesquisa/ResponderPesquisa'
import CriarPesquisa from '../pages/Pesquisa/CriarPesquisa'
import Resultados from '../pages/Resultados/Resultados'
import ResultadosGerais from '../pages/Resultados/ResultadosGerais'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
      <Route path="/pesquisa/:id/responder" element={<ResponderPesquisa />} />
      <Route path="/pesquisas/criar" element={<CriarPesquisa />} />
      <Route path="/resultados" element={<Resultados />} />
      <Route path="/resultados-gerais" element={<ResultadosGerais />} />
    </Routes>
  )
}