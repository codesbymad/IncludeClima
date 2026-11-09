import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clock, ArrowRight } from 'lucide-react'
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

  // 6 pesquisas
  const pesquisasRespondidas = [
    {
      id: 1,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 2,
      titulo: 'Ventos de liderança: como está essa relação?',
      descricao: 'Relação com a liderança',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 3,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 4,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 5,
      titulo: 'Ventos de liderança: como está essa relação?',
      descricao: 'Clareza e eficiência da comunicação',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 6,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Oportunidades de crescimento e benefícios',
      periodo: '12/10/2026 - 05/11/2026',
    },
  ]

  const pesquisasPendentes = [
    {
      id: 101,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 102,
      titulo: 'Ventos de liderança: como está essa relação?',
      descricao: 'Relação com a liderança',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 103,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 104,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 105,
      titulo: 'Como está o clima na sua rotina?',
      descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
      periodo: '12/10/2026 - 05/11/2026',
    },
    {
      id: 106,
      titulo: 'Ventos de liderança: como está essa relação?',
      descricao: 'Desafios enfrentados no dia a dia',
      periodo: '12/10/2026 - 05/11/2026',
    },
  ]

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

                  <button
                    type="button"
                    className="survey-card__arrow-btn"
                    onClick={() => setModalRespondidaOpen(true)}
                    title="Conferir resultados"
                  >
                    <ArrowRight size={32} color="#000000" />
                  </button>
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
                    onClick={() => setModalPendenteOpen(true)}
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
          navigate('/resultados')
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
          navigate('/pesquisa/1/responder')
        }}
        onCancel={() => setModalPendenteOpen(false)}
      />
    </div>
  )
}