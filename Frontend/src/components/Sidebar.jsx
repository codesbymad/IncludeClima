import { useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import './Navigation.css'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* fundo escuro ao abrir a sidebar*/}
      <div className="sidebar-overlay" onClick={onClose} />

      <aside className="app-sidebar">
        <div className="app-sidebar__header">
          <button
            type="button"
            className="app-sidebar__close-btn"
            onClick={onClose}
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
            onClick={() => handleNavigate('/resultados')}
          >
            Resultados
          </button>
          <button
            type="button"
            className="app-sidebar__link"
            onClick={() => handleNavigate('/pesquisas/criar')}
          >
            Criação de pesquisas
          </button>
        </nav>
      </aside>
    </>
  )
}