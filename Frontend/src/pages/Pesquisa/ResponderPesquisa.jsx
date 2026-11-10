import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pin } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import './Pesquisa.css'

const DIRETORIAS_INCLUDE = [
  'Presidência',
  'Projetos',
  'Comercial',
  'Marketing',
  'Gestão de Pessoas',
  'Financeiro',
]

const ALTERNATIVAS_LIKERT = [
  { valor: 1, texto: 'Muito insatisfeito(a)' },
  { valor: 2, texto: 'Insatisfeito(a)' },
  { valor: 3, texto: 'Neutro' },
  { valor: 4, texto: 'Satisfeito(a)' },
  { valor: 5, texto: 'Muito satisfeito(a)' },
]

const PERGUNTAS_PESQUISA = [
  {
    id: 1,
    enunciado:
      '1) Você considera que as atividades atribuídas a você estão alinhadas com suas habilidades e interesses?',
  },
  {
    id: 2,
    enunciado: '2)Suas tarefas são bem distribuídas e organizadas?',
  },
  {
    id: 3,
    enunciado:
      '3)Você considera que possui tempo suficiente para realizar suas tarefas com qualidade?',
  },
]

export default function ResponderPesquisa() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [diretoriaSelecionada, setDiretoriaSelecionada] = useState('Projetos')
  const [respostas, setRespostas] = useState({})

  const [modalEnviarOpen, setModalEnviarOpen] = useState(false)
  const [modalApagarOpen, setModalApagarOpen] = useState(false)

  const selecionarOpcao = (perguntaId, valor) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }))
  }

  return (
    <div className="survey-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="survey-container">
        {/* Card de Cabeçalho da Pesquisa */}
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

        {/* Card Fixo com Alfinete: Qual sua área de atuação/ diretoria na Include? */}
        <section className="card-borda-externa question-card">
          <div className="question-card__top-row">
            <h2 className="question-card__title">
              Qual sua área de atuação/ diretoria na Include?
            </h2>
            <Pin size={28} className="question-card__pin-icon" />
          </div>

          <div className="question-card__options">
            {DIRETORIAS_INCLUDE.map((dir) => {
              const selecionada = diretoriaSelecionada === dir
              return (
                <label
                  key={dir}
                  className="likert-option"
                  onClick={() => setDiretoriaSelecionada(dir)}
                >
                  <span
                    className={`likert-radio ${
                      selecionada ? 'likert-radio--selected' : ''
                    }`}
                  >
                    {selecionada && <span className="likert-radio__inner" />}
                  </span>
                  <span>{dir}</span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Cards das Perguntas (1 a 5) */}
        {PERGUNTAS_PESQUISA.map((pergunta) => (
          <section
            key={pergunta.id}
            className="card-borda-externa question-card"
          >
            <h2 className="question-card__title">{pergunta.enunciado}</h2>

            <div className="question-card__options">
              {ALTERNATIVAS_LIKERT.map((opcao) => {
                const selecionada = respostas[pergunta.id] === opcao.valor
                return (
                  <label
                    key={opcao.valor}
                    className="likert-option"
                    onClick={() => selecionarOpcao(pergunta.id, opcao.valor)}
                  >
                    <span
                      className={`likert-radio ${
                        selecionada ? 'likert-radio--selected' : ''
                      }`}
                    >
                      {selecionada && <span className="likert-radio__inner" />}
                    </span>
                    <span>{opcao.texto}</span>
                  </label>
                )
              })}
            </div>
          </section>
        ))}

        {/* Card Final de Finalização */}
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