import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import './Pesquisa.css'

const ALTERNATIVAS_LIKERT = [
  'Discordo totalmente',
  'Discordo parcialmente',
  'Não concordo nem discordo',
  'Concordo parcialmente',
  'Concordo totalmente',
]

const PERGUNTAS_PESQUISA = [
  {
    id: 1,
    enunciado:
      '1) Você considera que as atividades atribuídas a você estão alinhadas com suas habilidades e interesses?',
  },
  {
    id: 2,
    enunciado: '2) Suas tarefas são bem distribuídas e organizadas?',
  },
  {
    id: 3,
    enunciado:
      '3) Você sente que possui o suporte e os recursos necessários para realizar suas entregas na rotina da Include?',
  },
]

export default function ResponderPesquisa() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [respostas, setRespostas] = useState({})

  const [modalEnviarOpen, setModalEnviarOpen] = useState(false)
  const [modalApagarOpen, setModalApagarOpen] = useState(false)

  const selecionarOpcao = (perguntaId, opcao) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: opcao,
    }))
  }

  return (
    <div className="survey-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="survey-container">
        {/* Card de Cabeçalho da Pesquisa com borda externa #AD330E */}
        <section className="card-borda-externa survey-header-card">
          <h1 className="survey-header-card__title">
            Como está o clima na sua rotina?
          </h1>
          <p className="survey-header-card__desc">
            Queremos conhecer sua experiência com a rotina e as atividades
            desenvolvidas na Include! Esta pesquisa busca entender seu nível de
            satisfação com as tarefas, a organização e o dia a dia de trabalho,
            identificando pontos positivos e oportunidades de melhoria. Sua
            opinião é muito importante para construirmos um ambiente cada vez
            melhor!
          </p>
          <span className="survey-header-card__deadline">
            Faltam 10 dias para essa pesquisa ser encerrada
          </span>
        </section>

        {/* Cards das Perguntas */}
        {PERGUNTAS_PESQUISA.map((pergunta) => (
          <section
            key={pergunta.id}
            className="card-borda-externa question-card"
          >
            <h2 className="question-card__title">{pergunta.enunciado}</h2>

            <div className="question-card__options">
              {ALTERNATIVAS_LIKERT.map((opcao) => {
                const selecionada = respostas[pergunta.id] === opcao
                return (
                  <label
                    key={opcao}
                    className="likert-option"
                    onClick={() => selecionarOpcao(pergunta.id, opcao)}
                  >
                    <span
                      className={`likert-radio ${
                        selecionada ? 'likert-radio--selected' : ''
                      }`}
                    >
                      {selecionada && <span className="likert-radio__inner" />}
                    </span>
                    <span>{opcao}</span>
                  </label>
                )
              })}
            </div>
          </section>
        ))}

        {/* Card Final de Finalização (Enviar tudo / Apagar e sair) */}
        <section className="card-borda-externa survey-submit-card">
          <h2 className="survey-submit-card__title">
            Finalizou suas respostas, pirata?
          </h2>
          <div className="survey-submit-card__actions">
            <button
              type="button"
              className="survey-btn-send"
              onClick={() => setModalEnviarOpen(true)}
            >
              Enviar tudo
            </button>
            <button
              type="button"
              className="survey-btn-discard"
              onClick={() => setModalApagarOpen(true)}
            >
              Apagar e sair
            </button>
          </div>
        </section>
      </main>

      {/* Pop-up : "Enviar pesquisa e retornar a página inicial?" */}
      <ConfirmModal
        isOpen={modalEnviarOpen}
        title="Enviar pesquisa e retornar a página inicial?"
        confirmText="Enviar"
        onConfirm={() => {
          setModalEnviarOpen(false)
          navigate('/home')
        }}
        onCancel={() => setModalEnviarOpen(false)}
      />

      {/* Pop-up : "Realmente deseja descartar todas as respostas e retornar a tela inicial?" */}
      <ConfirmModal
        isOpen={modalApagarOpen}
        title="Realmente deseja descartar todas as respostas e retornar a tela inicial?"
        confirmText="Apagar"
        onConfirm={() => {
          setRespostas({})
          setModalApagarOpen(false)
          navigate('/home')
        }}
        onCancel={() => setModalApagarOpen(false)}
      />
    </div>
  )
}