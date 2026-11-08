import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ChevronDown } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import '../Home/Home.css'
import './Resultados.css'
import './ResultadosGerais.css'

const GRUPOS_PESQUISAS = [
  {
    id: 'q4-2026',
    trimestre: 'Quarto trimestre de 2026 - OUT/DEZ',
    pesquisas: [
      {
        id: 1,
        titulo: 'Como está o clima na sua rotina?',
        descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
        periodo: '12/10/2026 - 05/11/2026',
        mediaSatisfacao: '4,2 / 5,0 (Excelente)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 5, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 10, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 15, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 40, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 30, cor: '#2CA500' },
        ],
      },
      {
        id: 2,
        titulo: 'Ventos de liderança: como está essa relação?',
        descricao: 'Pesquisa sobre relação com a liderança',
        periodo: '12/10/2026 - 05/11/2026',
        mediaSatisfacao: '3,8 / 5,0 (Satisfatório)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 10, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 15, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 20, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 35, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 20, cor: '#2CA500' },
        ],
      },
      {
        id: 3,
        titulo: 'Clareza e eficiência na comunicação interna',
        descricao: 'Pesquisa sobre comunicação entre diretorias',
        periodo: '12/10/2026 - 05/11/2026',
        mediaSatisfacao: '4,0 / 5,0 (Satisfatório)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 5, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 15, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 20, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 30, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 30, cor: '#2CA500' },
        ],
      },
    ],
  },
  {
    id: 'q3-2026',
    trimestre: 'Terceiro trimestre de 2026 - OUT/DEZ',
    pesquisas: [
      {
        id: 4,
        titulo: 'Como está o clima na sua rotina?',
        descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
        periodo: '12/07/2026 - 05/08/2026',
        mediaSatisfacao: '2,7 / 5,0 (Atenção)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 10, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 40, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 20, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 30, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 0, cor: '#2CA500' },
        ],
      },
      {
        id: 5,
        titulo: 'Ventos de liderança: como está essa relação?',
        descricao: 'Pesquisa sobre relação com a liderança',
        periodo: '12/07/2026 - 05/08/2026',
        mediaSatisfacao: '3,1 / 5,0 (Satisfatório)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 10, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 25, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 25, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 25, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 15, cor: '#2CA500' },
        ],
      },
      {
        id: 6,
        titulo: 'Clareza e eficiência na comunicação interna',
        descricao: 'Pesquisa sobre comunicação entre diretorias',
        periodo: '12/07/2026 - 05/08/2026',
        mediaSatisfacao: '3,5 / 5,0 (Satisfatório)',
        distribuicao: [
          { label: 'Discordo totalmente', percentual: 5, cor: '#FF3434' },
          { label: 'Discordo parcialmente', percentual: 20, cor: '#FF9860' },
          { label: 'Não concordo nem discordo', percentual: 25, cor: '#FFEA60' },
          { label: 'Concordo parcialmente', percentual: 30, cor: '#60FF72' },
          { label: 'Concordo totalmente', percentual: 20, cor: '#2CA500' },
        ],
      },
    ],
  },
]

export default function ResultadosGerais() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [etapa, setEtapa] = useState('listagem')
  const [divisao, setDivisao] = useState('Trimestre')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalCompararOpen, setModalCompararOpen] = useState(false)

  const [cardMarcadoId, setCardMarcadoId] = useState(null)
  const [tituloEscolhido, setTituloEscolhido] = useState('')

  const selecionarTituloPesquisa = (pesquisa) => {
    setCardMarcadoId(pesquisa.id)
    setTituloEscolhido(pesquisa.titulo)
  }

  const handleBotaoTopo = () => {
    if (etapa === 'listagem') {
      setModalCompararOpen(true)
    } else if (etapa === 'selecionando') {
      // Se o usuário não clicou em nenhum ainda, seleciona o primeiro por padrão para não travar
      if (!tituloEscolhido) {
        setTituloEscolhido('Como está o clima na sua rotina?')
      }
      setEtapa('selecionados')
    } else if (etapa === 'selecionados') {
      setEtapa('comparando')
    }
  }

  return (
    <div className="general-results-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="general-results-container">
        {etapa === 'comparando' ? (
          <section className="comparison-board-panel">
            <div className="comparison-board-header">
              <h1 className="comparison-board-title">
                Comparativo: {tituloEscolhido}
              </h1>
              <button
                type="button"
                className="comparison-back-btn"
                onClick={() => {
                  setEtapa('listagem')
                  setCardMarcadoId(null)
                  setTituloEscolhido('')
                }}
              >
                Voltar para Resultados Gerais
              </button>
            </div>

            <div className="comparison-grid">
              {GRUPOS_PESQUISAS.flatMap((grupo) =>
                grupo.pesquisas
                  .filter((p) => p.titulo === tituloEscolhido)
                  .map((pesquisa) => (
                    <div key={pesquisa.id} className="comparison-item-card">
                      <span className="comparison-item-quarter">
                        {grupo.trimestre}
                      </span>
                      <h3 className="comparison-item-title">
                        {pesquisa.titulo}
                      </h3>
                      <p className="survey-card__date">
                        Período: {pesquisa.periodo} | Média:{' '}
                        <strong>{pesquisa.mediaSatisfacao}</strong>
                      </p>

                      <div className="chart-wrapper" style={{ marginLeft: 8 }}>
                        <span className="chart-y-label">% Respostas</span>
                        <div className="chart-bars-container">
                          {pesquisa.distribuicao.map((item) => (
                            <div key={item.label} className="chart-bar-group">
                              <span className="chart-bar-label">
                                {item.label}
                              </span>
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
                    </div>
                  ))
              )}
            </div>
          </section>
        ) : (
          <>
            <div className="general-top-bar">
              {etapa === 'listagem' && (
                <div className="general-filter-group">
                  <span className="general-top-label">Divisão por:</span>
                  <div className="general-select-wrap">
                    <button
                      type="button"
                      className="general-select-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span>{divisao}</span>
                      <ChevronDown size={24} />
                    </button>

                    {dropdownOpen && (
                      <div className="general-select-dropdown">
                        {['Trimestre', 'Semestre', 'Ano'].map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            className="general-select-option"
                            onClick={() => {
                              setDivisao(opcao)
                              setDropdownOpen(false)
                            }}
                          >
                            {opcao}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {etapa === 'selecionando' && (
                <span className="general-top-label">
                  Selecione o título desejado:
                </span>
              )}

              {etapa === 'selecionados' && (
                <span className="general-top-label">Títulos selecionados:</span>
              )}

              <button
                type="button"
                className="general-action-btn"
                onClick={handleBotaoTopo}
              >
                {etapa === 'listagem' && (
                  <>
                    Realizar comparação de
                    <br />
                    resultados
                  </>
                )}
                {etapa === 'selecionando' && 'Realizar seleção'}
                {etapa === 'selecionados' && 'Comparar'}
              </button>
            </div>


            {GRUPOS_PESQUISAS.map((grupo) => {
              const pesquisasVisiveis =
                etapa === 'selecionados'
                  ? grupo.pesquisas.filter(
                      (p) => p.titulo === tituloEscolhido
                    )
                  : grupo.pesquisas

              if (pesquisasVisiveis.length === 0) return null

              return (
                <section key={grupo.id} className="quarter-section">
                  <h2 className="quarter-title">{grupo.trimestre}</h2>

                  <div className="quarter-cards-list">
                    {pesquisasVisiveis.map((item) => {
                      
                      const estaSelecionado =
                        etapa === 'selecionados'
                          ? true
                          : cardMarcadoId === item.id

                      return (
                        <div
                          key={item.id}
                          className="survey-card survey-card--answered"
                        >
                          <div className="survey-card__left">
                            {etapa === 'listagem' ? (
                              <div className="survey-card__icon-wrap">
                                <Check size={38} strokeWidth={3.5} />
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={`compare-radio-circle ${
                                  estaSelecionado
                                    ? 'compare-radio-circle--selected'
                                    : ''
                                }`}
                                onClick={() => selecionarTituloPesquisa(item)}
                                title="Selecionar este título de pesquisa"
                              >
                                {estaSelecionado && (
                                  <span className="compare-radio-inner" />
                                )}
                              </button>
                            )}

                            <div className="survey-card__info">
                              <h3 className="survey-card__title">
                                {item.titulo}
                              </h3>
                              <p className="survey-card__desc">
                                {item.descricao}
                              </p>
                              <p className="survey-card__date">{item.periodo}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="survey-card__arrow-btn"
                            onClick={() => navigate('/resultados')}
                            title="Ver resultados detalhados"
                          >
                            <ArrowRight size={32} color="#000000" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </main>

      {/* Pop-up : "Deseja iniciar comparação?"*/}
      <ConfirmModal
        isOpen={modalCompararOpen}
        title="Deseja iniciar comparação?"
        confirmText="Iniciar!"
        onConfirm={() => {
          setModalCompararOpen(false)
          setCardMarcadoId(null)
          setTituloEscolhido('')
          setEtapa('selecionando')
        }}
        onCancel={() => setModalCompararOpen(false)}
      />
    </div>
  )
}