import { useState } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import '../Pesquisa/Pesquisa.css'
import './Resultados.css'

const ALTERNATIVAS = [
  'Discordo totalmente',
  'Discordo parcialmente',
  'Não concordo nem discordo',
  'Concordo parcialmente',
  'Concordo totalmente',
]

const DADOS_METRICAS = [
  {
    id: 1,
    enunciado:
      '1) Você considera que as atividades atribuídas a você estão alinhadas com suas habilidades e interesses?',
    distribuicao: [
      { label: 'Discordo totalmente', percentual: 10, cor: '#FF3434' },
      { label: 'Discordo parcialmente', percentual: 40, cor: '#FF9860' },
      { label: 'Não concordo nem discordo', percentual: 20, cor: '#FFEA60' },
      { label: 'Concordo parcialmente', percentual: 30, cor: '#60FF72' },
      { label: 'Concordo totalmente', percentual: 0, cor: '#2CA500' },
    ],
  },
  {
    id: 2,
    enunciado: '2) Suas tarefas são bem distribuídas e organizadas?',
    distribuicao: [
      { label: 'Discordo totalmente', percentual: 0, cor: '#FF3434' },
      { label: 'Discordo parcialmente', percentual: 20, cor: '#FF9860' },
      { label: 'Não concordo nem discordo', percentual: 30, cor: '#FFEA60' },
      { label: 'Concordo parcialmente', percentual: 30, cor: '#60FF72' },
      { label: 'Concordo totalmente', percentual: 20, cor: '#2CA500' },
    ],
  },
  {
    id: 3,
    enunciado:
      '3) Você sente que possui o suporte e os recursos necessários para realizar suas entregas na rotina da Include?',
    distribuicao: [
      { label: 'Discordo totalmente', percentual: 10, cor: '#FF3434' },
      { label: 'Discordo parcialmente', percentual: 10, cor: '#FF9860' },
      { label: 'Não concordo nem discordo', percentual: 20, cor: '#FFEA60' },
      { label: 'Concordo parcialmente', percentual: 40, cor: '#60FF72' },
      { label: 'Concordo totalmente', percentual: 20, cor: '#2CA500' },
    ],
  },
]

export default function Resultados() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Abas do topo: 'perguntas' (frame "resultados.png") ou 'metricas' (frame "metricas.png")
  const [abaAtiva, setAbaAtiva] = useState('metricas')

  return (
    <div className="results-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Abas superiores: Perguntas | Resultados */}
      <div className="results-tabs">
        <button
          type="button"
          className={`results-tab-btn ${
            abaAtiva === 'perguntas' ? 'results-tab-btn--active' : ''
          }`}
          onClick={() => setAbaAtiva('perguntas')}
        >
          Perguntas
        </button>
        <button
          type="button"
          className={`results-tab-btn ${
            abaAtiva === 'metricas' ? 'results-tab-btn--active' : ''
          }`}
          onClick={() => setAbaAtiva('metricas')}
        >
          Resultados
        </button>
      </div>

      <main className="results-container">
        {abaAtiva === 'perguntas' ? (
          <>
            {/* Visão da aba "Perguntas" (frame resultados.png do Figma) */}
            <section className="card-borda-externa survey-header-card">
              <h1 className="survey-header-card__title">
                Como está o clima na sua rotina?
              </h1>
              <p className="survey-header-card__desc">
                Queremos conhecer sua experiência com a rotina e as atividades
                desenvolvidas na Include! Esta pesquisa busca entender seu nível
                de satisfação com as tarefas, a organização e o dia a dia de
                trabalho, identificando pontos positivos e oportunidades de
                melhoria. Sua opinião é muito importante para construirmos um
                ambiente cada vez melhor!
              </p>
              <span className="survey-header-card__deadline">
                Faltam 10 dias para essa pesquisa ser encerrada
              </span>
            </section>

            {DADOS_METRICAS.map((pergunta) => (
              <section
                key={pergunta.id}
                className="card-borda-externa question-card"
              >
                <h2 className="question-card__title">{pergunta.enunciado}</h2>
                <div className="question-card__options">
                  {ALTERNATIVAS.map((opcao) => (
                    <div
                      key={opcao}
                      className="likert-option likert-option--disabled"
                    >
                      <span className="likert-radio" />
                      <span>{opcao}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <>
            {/* Visão da aba "Resultados" (frame metricas.png do Figma) */}
            <section className="card-borda-externa metrics-summary-card">
              <h1 className="metrics-summary-card__count">10 Respostas</h1>
              <p className="metrics-summary-card__desc">
                Com base nas 10 respostas, temos um cenário que indica
                insatisfação moderada com a organização da rotina e a
                distribuição das atividades.
              </p>
            </section>

            {DADOS_METRICAS.map((pergunta) => (
              <section
                key={pergunta.id}
                className="card-borda-externa metrics-chart-card"
              >
                <h2 className="metrics-chart-card__title">
                  {pergunta.enunciado}
                </h2>

                <div className="chart-wrapper">
                  <span className="chart-y-label">% Respostas</span>

                  <div className="chart-bars-container">
                    {pergunta.distribuicao.map((item) => (
                      <div key={item.label} className="chart-bar-group">
                        <span className="chart-bar-label">{item.label}</span>
                        <div className="chart-bar-row">
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{
                                width: `${item.percentual}%`,
                                backgroundColor: item.cor,
                              }}
                            />
                          </div>
                          <span className="chart-bar-percent">
                            {item.percentual}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  )
}