import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import bgLogin from '../../assets/bg-login.png'
import logoInclude from '../../assets/logo-include.png'
import barquinhoImg from '../../assets/barquinho.png'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { entrar } = useAuth()
  const [mensagemErro, setMensagemErro] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroAberto, setErroAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (enviando) return
    if (!email.trim() || !senha.trim()) {
      setMensagemErro('Informe seu email e sua senha.')
      setErroAberto(true)
      return
    }
    setEnviando(true)
    try {
      await entrar(email.trim(), senha)
      navigate('/home')
    } catch (erro) {
      setMensagemErro(
        erro.response
          ? erro.response.data?.erro || 'Não foi possível entrar. Tente novamente.'
          : 'Não foi possível conectar ao servidor.'
      )
      setErroAberto(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-page">
      <img src={logoInclude} alt="Include Jr" className="auth-logo-top" />

      <div className="auth-card auth-card--login">
        <div
          className="auth-left"
          style={{ backgroundImage: `url(${bgLogin})` }}
        >
          <h2 className="auth-welcome-title">Ahoy! Seja bem-vindo ao</h2>
          <div className="auth-brand-badge">
            <span>IncludeClima!</span>
          </div>
          <p className="auth-welcome-desc">
            Faça login ou crie sua conta para começarmos essa aventura!
          </p>
        </div>

        <div className="auth-right">
          <h1 className="auth-form-title">Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="email"
                placeholder="Email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
            </div>

            <div className="auth-input-group">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Senha"
                className="auth-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={enviando}
            >
              {enviando ? 'Entrando...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer-text">
            Não possui conta?
            <Link to="/cadastro" className="auth-footer-link">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      {/* Pop-up de Erro*/}
      {erroAberto && (
        <div className="auth-modal-overlay" onClick={() => setErroAberto(false)}>
          <div className="popup-erro" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-erro__titulo">Algo de errado aconteceu!</h3>
            <p className="popup-erro__subtitulo">Mantenha a calma pirata</p>
            <img
              src={barquinhoImg}
              alt="Barquinho nas ondas"
              className="popup-erro__wave-img"
            />
            <p className="popup-erro__texto">
              {mensagemErro}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}