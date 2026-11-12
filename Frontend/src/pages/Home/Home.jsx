import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listarHistorico } from '../../services/pesquisaService'
import { formatarIntervalo } from '../../utils/formatadores'
import { mensagemDeErro } from '../../utils/erros'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import mascoteHome from '../../assets/mascote-home.png'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('respondidas')

  const [modalRespondidaOpen, setModalRespondidaOpen] = useState(false)
  const [modalPendenteOpen, setModalPendenteOpen] = useState(false)

  const { usuario } = useAuth()
  const [pesquisas, setPesquisas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroLista, setErroLista] = useState('')
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState(null)

  useEffect(() => {
    listarHistorico()
      .then(setPesquisas)
      .catch((erro) =>
        setErroLista(mensagemDeErro(erro, 'Não foi possível carregar as pesquisas.'))
      )
      .finally(() => setCarregando(false))
  }, [])

  const converter = (p) => ({
    id: p.id_pesq,
    titulo: p.titulo,
    descricao: `Situação: ${p.situacao}`,
    periodo: formatarIntervalo(p.data_inicio, p.data_fim)
  })

  const pesquisasRespondidas = pesquisas.filter((p) => p.ja_respondeu).map(converter)
  const pesquisasPendentes = pesquisas
    .filter((p) => !p.ja_respondeu && p.situacao === 'Ativa')
    .map(converter)
  const listaAtual = activeTab === 'respondidas' ? pesquisasRespondidas : pesquisasPendentes

  return (
    <div className="home-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero com o Mascote Patinho grande e colado na borda direita */}
      <section className="home-hero">
        <div className="home-hero__text">
          <p className="home-hero__greeting">Seja bem vindo pirata,</p>
          <div className="home-hero__brand-box">
            <h1 className="home-hero__brand">A IncludeClima</h1>
          </div>
          <p className="home-hero__desc">
            Te espera para uma nova pesquisa,
            <br />
            agora é sua <u>hora de opinar!</u>
          </p>
          <p className="home-hero__cta">Vamos começar a aventura?</p>
        </div>

        <img
          src={mascoteHome}
          alt="Mascote IncludeClima"
          className="home-hero__mascote"
        />
      </section>

      {/* Painel do Quadro de Pesquisas */}
      <section className="home-board-container">
        <h2 className="home-board-title">Meu quadro</h2>

        <div className="home-tabs">
          <button
            type="button"
            className={`home-tab-btn ${
              activeTab === 'respondidas' ? 'home-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('respondidas')}
          >
            Pesquisas respondidas
          </button>
          <button
            type="button"
            className={`home-tab-btn ${
              activeTab === 'pendentes' ? 'home-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('pendentes')}
          >
            Pesquisas não respondidas
          </button>
        </div>

        <div className="home-board-card">
          {carregando && <p>Carregando pesquisas...</p>}
          {erroLista && <p>{erroLista}</p>}
          {!carregando && !erroLista && listaAtual.length === 0 && (
            <p>Nenhuma pesquisa nesta aba.</p>
          )}
          {activeTab === 'respondidas'
            ? pesquisasRespondidas.map((item) => (
                <div key={item.id} className="survey-card survey-card--answered">
                  <div className="survey-card__left">
                    <div className="survey-card__icon-wrap">
                      <Check size={38} strokeWidth={3.5} />
                    </div>
                    <div className="survey-card__info">
                      <h3 className="survey-card__title">{item.titulo}</h3>
                      <p className="survey-card__desc">{item.descricao}</p>
                      <p className="survey-card__date">{item.periodo}</p>
                    </div>
                  </div>

                  {usuario?.isLider && (
                    <button
                      type="button"
                      className="survey-card__arrow-btn"
                      onClick={() => {
                        setPesquisaSelecionada(item)
                        setModalRespondidaOpen(true)
                      }}
                      title="Conferir resultados"
                    >
                      <ArrowRight size={32} color="#000000" />
                    </button>
                  )}
                </div>
              ))
            : pesquisasPendentes.map((item) => (
                <div key={item.id} className="survey-card survey-card--pending">
                  <div className="survey-card__left">
                    <div className="survey-card__icon-wrap survey-card__icon-wrap--clock">
                      <Clock size={38} strokeWidth={3} />
                    </div>
                    <div className="survey-card__info">
                      <h3 className="survey-card__title">{item.titulo}</h3>
                      <p className="survey-card__desc">{item.descricao}</p>
                      <p className="survey-card__date">{item.periodo}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="survey-card__arrow-btn"
                    onClick={() => {
                      setPesquisaSelecionada(item)
                      setModalPendenteOpen(true)
                    }}
                    title="Responder pesquisa"
                  >
                    <ArrowRight size={32} color="#000000" />
                  </button>
                </div>
              ))}
        </div>
      </section>

      {/* Pop-up : Card Verde -> "Deseja conferir as informações sobre a pesquisa agora?" */}
      <ConfirmModal
        isOpen={modalRespondidaOpen}
        title="Deseja conferir as informações sobre a pesquisa agora?"
        confirmText="Conferir Dados"
        onConfirm={() => {
          setModalRespondidaOpen(false)
          navigate(`/resultados?id_pesq=${pesquisaSelecionada?.id}`)
        }}
        onCancel={() => setModalRespondidaOpen(false)}
      />

      {/* Pop-up : Card Cinza -> "Deseja responder a pesquisa agora?" */}
      <ConfirmModal
        isOpen={modalPendenteOpen}
        title="Deseja responder a pesquisa agora?"
        confirmText="Iniciar pesquisa!"
        onConfirm={() => {
          setModalPendenteOpen(false)
          navigate(`/pesquisa/${pesquisaSelecionada?.id}/responder`)
        }}
        onCancel={() => setModalPendenteOpen(false)}
      />
    </div>
  )
}