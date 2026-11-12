import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from './ConfirmModal'
import './Navigation.css'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { usuario, sair } = useAuth()
  const [modalSairOpen, setModalSairOpen] = useState(false)

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

        {usuario?.isLider && (
          <>
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
          </>
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

      {/* Pop-up do Figma novo: "Deseja sair do IncludeClima pirata?" */}
      <ConfirmModal
        isOpen={modalSairOpen}
        title="Deseja sair do IncludeClima pirata?"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={() => {
          setModalSairOpen(false)
          sair()
          handleNavigate('/login')
        }}
        onCancel={() => setModalSairOpen(false)}
      />
    </>
  )
}