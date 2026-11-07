import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import bgLogin from '../../assets/bg-login.png'
import logoInclude from '../../assets/logo-include.png'
import barquinhoImg from '../../assets/barquinho.png'
import './Auth.css'

export default function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [lembrar, setLembrar] = useState(true)
  const [erroAberto, setErroAberto] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !senha.trim() || senha !== confirmarSenha) {
      setErroAberto(true)
      return
    }
    // após criar conta redireciona para o Login
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <img src={logoInclude} alt="Include Jr" className="auth-logo-top" />

      <div className="auth-card auth-card--cadastro">
        {/*Lado esquerdo com pintura e seta de voltar */}
        <div
          className="auth-left"
          style={{ backgroundImage: `url(${bgLogin})` }}
        >
          <button
            type="button"
            className="auth-back-arrow"
            onClick={() => navigate('/login')}
            title="Voltar para o Login"
          >
            <ArrowLeft size={28} />
          </button>

          <h2 className="auth-welcome-title">Ahoy! Seja bem-vindo ao</h2>
          <div className="auth-brand-badge">
            <span>IncludeClima!</span>
          </div>
          <p className="auth-welcome-desc">
            Faça login ou crie sua conta para começarmos essa aventura!
          </p>
        </div>

        {/* Lado direito com formulário de Cadastro */}
        <div className="auth-right">
          <h1 className="auth-form-title">Cadastre-se</h1>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="text"
                placeholder="Nome"
                className="auth-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

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

            <div className="auth-input-group">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                className="auth-input"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                {mostrarConfirmar ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="auth-options-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                />
                <span>Lembre-me sempre</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn">
              Criar conta
            </button>
          </form>
        </div>
      </div>

      {/*Pop-up de Erro caso falte preencher ou as senhas sejam diferentes*/}
      {erroAberto && (
        <div className="auth-modal-overlay" onClick={() => setErroAberto(false)}>
          <div className="popup-erro" onClick={() => setErroAberto(false)}>
            <h3 className="popup-erro__titulo">Algo de errado aconteceu!</h3>
            <p className="popup-erro__subtitulo">Mantenha a calma pirata</p>
            <img
              src={barquinhoImg}
              alt="Barquinho nas ondas"
              className="popup-erro__wave-img"
            />
            <p className="popup-erro__texto">
              o erro pode estar no seu Login ou Senha. Confira suas informações
              e tente novamente
            </p>
          </div>
        </div>
      )}
    </div>
  )
}