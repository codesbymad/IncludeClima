import { Menu } from 'lucide-react'
import logoInclude from '../assets/logo-include.png'
import './Navigation.css'

export default function Header({ onOpenSidebar }) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu-btn"
          onClick={onOpenSidebar}
          title="Abrir Menu"
        >
          <Menu size={32} color="#FFFFFF" />
        </button>
        <span className="app-header__brand">IncludeClima!</span>
      </div>

      <img src={logoInclude} alt="Include Jr" className="app-header__logo" />
    </header>
  )
}