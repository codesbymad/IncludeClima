import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import './Navigation.css'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [modalSairOpen, setModalSairOpen] = useState(false)

  // Verifica se o usuário logado possui permissão de líder
  const usuarioSalvo = localStorage.getItem('includeclima_user')
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  const mostrarOpcoesLider =
    !usuario || usuario.isLider !== false && usuario.idLider !== false

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${
          isOpen ? 'sidebar-overlay--open' : ''
        }`}
        onClick={onClose}
      />

      <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
        <div className="app-sidebar__header">
          <button
            type="button"
            className="app-sidebar__close-btn"
            onClick={onClose}
            title="Fechar Menu"
          >
            <Menu size={32} color="#FFFFFF" />
          </button>
          <span className="app-sidebar__brand">IncludeClima!</span>
        </div>

        <nav className="app-sidebar__nav">
          <button
            type="button"
            className="app-sidebar__link"
            onClick={() => handleNavigate('/home')}
          >
            Home
          </button>
          <button
            type="button"
            className="app-sidebar__link"
            onClick={() => handleNavigate('/resultados-gerais')}
          >
            Resultados Gerais
          </button>
          <button
            type="button"
            className="app-sidebar__link"
            onClick={() => handleNavigate('/pesquisas/criar')}
          >
            Criação de pesquisas
          </button>
          {mostrarOpcoesLider && (
            <button
              type="button"
              className="app-sidebar__link"
              onClick={() => handleNavigate('/lideranca')}
            >
              Liderança
            </button>
          )}
        </nav>

        <div className="app-sidebar__footer">
          <button
            type="button"
            className="app-sidebar__logout-btn"
            onClick={() => setModalSairOpen(true)}
          >
            <LogOut size={24} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={modalSairOpen}
        title="Deseja sair do IncludeClima pirata?"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={() => {
          localStorage.removeItem('includeclima_token')
          localStorage.removeItem('includeclima_user')
          setModalSairOpen(false)
          onClose()
          navigate('/login')
        }}
        onCancel={() => setModalSairOpen(false)}
      />
    </>
  )
}