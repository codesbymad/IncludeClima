import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ChevronDown, TrendingUp } from 'lucide-react'
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
        id: 3,
        titulo: 'Como está o clima na sua rotina?',
        descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
        periodo: '12/10/2026 - 05/11/2026',
      },
      {
        id: 2,
        titulo: 'Ventos de liderança: como está essa relação?',
        descricao: 'Pesquisa sobre relação com a liderança',
        periodo: '12/10/2026 - 05/11/2026',
      },
      {
        id: 1,
        titulo: 'Clareza e eficiência na comunicação interna',
        descricao: 'Pesquisa sobre comunicação entre diretorias',
        periodo: '12/10/2026 - 05/11/2026',
      },
    ],
  },
  {
    id: 'q3-2026',
    trimestre: 'Terceiro trimestre de 2026 - JUL/SET',
    pesquisas: [
      {
        id: 4,
        titulo: 'Como está o clima na sua rotina?',
        descricao: 'Pesquisa sobre satisfação com rotina e tarefas',
        periodo: '12/07/2026 - 05/08/2026',
      },
      {
        id: 5,
        titulo: 'Ventos de liderança: como está essa relação?',
        descricao: 'Pesquisa sobre relação com a liderança',
        periodo: '12/07/2026 - 05/08/2026',
      },
      {
        id: 6,
        titulo: 'Clareza e eficiência na comunicação interna',
        descricao: 'Pesquisa sobre comunicação entre diretorias',
        periodo: '12/07/2026 - 05/08/2026',
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
          /* TELA DE COMPARATIVO DE PESQUISAS */
          <section className="comparison-figma-card">
            <div className="comparison-figma-top">
              <div>
                <h1 className="comparison-figma-title">
                  Comparativo de pesquisas
                </h1>
                <p className="comparison-figma-subtitle">
                  Pesquisa:{' '}
                  {tituloEscolhido || 'Como está o clima na sua rotina?'}
                </p>

                <div className="comparison-period-section">
                  <span className="comparison-small-label">
                    Período das pesquisas
                  </span>
                  <div className="comparison-period-badges">
                    <span className="comparison-period-pill">
                      3º Trimestre de 2026
                    </span>
                    <span className="comparison-period-arrow">──────►</span>
                    <span className="comparison-period-pill">
                      4º Trimestre de 2026
                    </span>
                  </div>
                </div>
              </div>

              <div className="comparison-responses-counts">
                <div className="comparison-count-block">
                  <span className="comparison-small-label">
                    Primeira pesquisa
                  </span>
                  <strong className="comparison-count-number">
                    10 Respostas
                  </strong>
                </div>
                <div className="comparison-count-block">
                  <span className="comparison-small-label">
                    Segunda pesquisa
                  </span>
                  <strong className="comparison-count-number">
                    11 Respostas
                  </strong>
                </div>
              </div>
            </div>

            {/* Médias e Crescimento (+1,3) */}
            <div className="comparison-averages-row">
              <div className="comparison-avg-col">
                <span className="comparison-small-label">
                  Média da primeira pesquisa
                </span>
                <strong className="comparison-avg-value">2,73</strong>
                <span className="comparison-avg-faixa">(Atenção)</span>
              </div>

              <div className="comparison-avg-col">
                <span className="comparison-small-label">
                  Média da segunda pesquisa
                </span>
                <strong className="comparison-avg-value">4,03</strong>
                <span className="comparison-avg-faixa">(Excelente)</span>
              </div>

              <div className="comparison-avg-col">
                <span className="comparison-small-label">Crescimento</span>
                <strong className="comparison-growth-value">+1,3</strong>
              </div>
            </div>

            {/* Barras de Evolução de Satisfação */}
            <div className="comparison-evolution-section">
              <h2 className="comparison-section-heading">
                Evolução de satisfação
              </h2>

              <div className="comparison-bar-block">
                <span className="comparison-small-label">Primeira pesquisa</span>
                <div className="comparison-bar-line">
                  <div className="comparison-bar-track">
                    <div
                      className="comparison-bar-fill comparison-bar-fill--first"
                      style={{ width: '54.6%' }}
                    />
                  </div>
                  <span className="comparison-bar-score">2,73/5</span>
                </div>
              </div>

              <div className="comparison-bar-block">
                <span className="comparison-small-label">Segunda pesquisa</span>
                <div className="comparison-bar-line">
                  <div className="comparison-bar-track">
                    <div
                      className="comparison-bar-fill comparison-bar-fill--second"
                      style={{ width: '80.6%' }}
                    />
                  </div>
                  <span className="comparison-bar-score">4,03/5</span>
                </div>
              </div>
            </div>

            {/* Principais mudanças identificadas */}
            <div className="comparison-changes-section">
              <h2 className="comparison-section-heading">
                Principais mudanças identificadas
              </h2>

              <div className="comparison-changes-list">
                <div className="comparison-change-item">
                  <span>Alinhamento das atividades</span>
                  <span className="comparison-change-badge">+ 1,2</span>
                </div>
                <div className="comparison-change-item">
                  <span>Distribuição de tarefas</span>
                  <span className="comparison-change-badge">+ 1,4</span>
                </div>
                <div className="comparison-change-item">
                  <span>Tempo para realização</span>
                  <span className="comparison-change-badge">+ 1,4</span>
                </div>
              </div>
            </div>

            {/* Rodapé: Evolução positiva identificada */}
            <div className="comparison-footer-row">
              <div className="comparison-positive-status">
                <TrendingUp size={24} />
                <span>Evolução positiva identificada</span>
              </div>

              <button
                type="button"
                className="comparison-back-btn"
                onClick={() => {
                  setEtapa('listagem')
                  setCardMarcadoId(null)
                  setTituloEscolhido('')
                }}
              >
                Voltar
              </button>
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
                      <ChevronDown size={20} color="#FFFFFF" />
                    </button>

                    {dropdownOpen && (
                      <div className="general-select-dropdown">
                        {['Ano', 'Semestre', 'Trimestre', 'Mês', 'Semana'].map(
                          (opcao) => (
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
                          )
                        )}
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
                  ? grupo.pesquisas.filter((p) => p.titulo === tituloEscolhido)
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
                            onClick={() =>
                              navigate(`/resultados?id_pesq=${item.id}`)
                            }
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