import { Routes, Route, Navigate } from 'react-router-dom'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/cadastro" element={<div>Cadastro</div>} />
      <Route path="/home" element={<div>Home</div>} />
      <Route path="/pesquisa/:id/responder" element={<div>Responder Pesquisa</div>} />
      <Route path="/pesquisas/criar" element={<div>Confecção de Pesquisa</div>} />
      <Route path="/resultados" element={<div>Resultados e Métricas</div>} />
    </Routes>
  )
}