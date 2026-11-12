import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ChevronDown, TrendingUp } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../services/api'
import '../Home/Home.css'
import './Resultados.css'
import './ResultadosGerais.css'

const OPCOES_DIRETORIA = [
  'Geral',
  'Presidência',
  'Projetos',
  'Comercial',
  'Marketing',
  'Gestão de Pessoas',
  'Financeiro',
]

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

function formatarNumero(valor) {
  if (valor === null || valor === undefined) return '0,0'
  return Number(valor).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
}

export default function ResultadosGerais() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [etapa, setEtapa] = useState('listagem')
  const [divisao, setDivisao] = useState('Trimestre')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalCompararOpen, setModalCompararOpen] = useState(false)

  const [cardMarcadoId, setCardMarcadoId] = useState(null)
  const [tituloEscolhido, setTituloEscolhido] = useState('')

  // Estados da integração com /comparacao
  const [titulosApi, setTitulosApi] = useState([])
  const [areaComparacao, setAreaComparacao] = useState('Geral')
  const [menuAreaOpen, setMenuAreaOpen] = useState(false)
  const [resultadoComparacao, setResultadoComparacao] = useState(null)

  // Busca os títulos e edições disponíveis no back-end
  useEffect(() => {
    api
      .get('/comparacao/titulos')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTitulosApi(res.data)
        }
      })
      .catch(() => {
        setTitulosApi([])
      })
  }, [])

  // Consulta os dados comparativos quando entra na etapa 'comparando'
  useEffect(() => {
    if (etapa !== 'comparando') return

    // Descobre os IDs das duas edições a comparar (da API ou fallback para 2 e 3)
    const grupoApi =
      titulosApi.find((t) => t.titulo === tituloEscolhido) ||
      titulosApi.find((t) => t.pode_comparar)

    let idAnterior = 2
    let idAtual = 3

    if (grupoApi && grupoApi.edicoes?.length >= 2) {
      const edicoesOrdenadas = [...grupoApi.edicoes].sort((a, b) =>
        a.data_inicio.localeCompare(b.data_inicio)
      )
      idAnterior = edicoesOrdenadas[edicoesOrdenadas.length - 2].id_pesq
      idAtual = edicoesOrdenadas[edicoesOrdenadas.length - 1].id_pesq
    }

    const params = { anterior: idAnterior, atual: idAtual }
    if (areaComparacao !== 'Geral') {
      params.area = areaComparacao
    }

    api
      .get('/comparacao', { params })
      .then((res) => {
        if (res.data) {
          setResultadoComparacao(res.data)
        }
      })
      .catch(() => {
        setResultadoComparacao(null)
      })
  }, [etapa, tituloEscolhido, areaComparacao, titulosApi])

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

  // Valores exibidos no card comparativo (usa retorno da API quando disponível)
  const dadosInsuficientes = resultadoComparacao?.dados_insuficientes === true
  const respPrimeira = resultadoComparacao?.anterior?.participantes ?? 10
  const respSegunda = resultadoComparacao?.atual?.participantes ?? 11
  const mediaPrimeira = resultadoComparacao?.anterior?.media_geral ?? 2.73
  const faixaPrimeira = resultadoComparacao?.anterior?.faixa_geral ?? 'Atenção'
  const mediaSegunda = resultadoComparacao?.atual?.media_geral ?? 4.03
  const faixaSegunda = resultadoComparacao?.atual?.faixa_geral ?? 'Excelente'
  const crescimento = resultadoComparacao?.diferenca_geral ?? 1.3
  const tendenciaTexto =
    resultadoComparacao?.tendencia === 'Piora'
      ? 'Queda nos indicadores identificada'
      : resultadoComparacao?.tendencia === 'Estável'
      ? 'Estabilidade nos indicadores identificada'
      : 'Evolução positiva identificada'

  const listaVariacoes =
    resultadoComparacao?.variacoes?.length > 0
      ? resultadoComparacao.variacoes.map((v) => ({
          id: v.id_perg,
          nome: v.eixo || v.pergunta,
          diferenca: v.diferenca,
        }))
      : [
          { id: 1, nome: 'Alinhamento das atividades', diferenca: 1.2 },
          { id: 2, nome: 'Distribuição de tarefas', diferenca: 1.4 },
          { id: 3, nome: 'Tempo para realização', diferenca: 1.4 },
        ]

  return (
    <div className="general-results-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="general-results-container">
        {etapa === 'comparando' ? (
          <section className="comparison-figma-card">
            <div className="comparison-figma-top">
              <div>
                <h1 className="comparison-figma-title">
                  Comparativo de pesquisas
                </h1>
                <p className="comparison-figma-subtitle">
                  Pesquisa:{' '}
                  {resultadoComparacao?.titulo ||
                    tituloEscolhido ||
                    'Como está o clima na sua rotina?'}
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

              <div className="comparison-top-right">
                {/* Seletor de filtro por diretoria */}
                <div className="results-filter-row" style={{ marginBottom: 8 }}>
                  <span
                    className="comparison-small-label"
                    style={{ color: '#333333' }}
                  >
                    Diretoria:
                  </span>
                  <div className="results-filter-dropdown-wrap">
                    <button
                      type="button"
                      className="results-filter-btn"
                      onClick={() => setMenuAreaOpen(!menuAreaOpen)}
                    >
                      <span>{areaComparacao}</span>
                      <ChevronDown size={20} color="#FFFFFF" />
                    </button>

                    {menuAreaOpen && (
                      <div className="results-filter-menu">
                        {OPCOES_DIRETORIA.map((area) => (
                          <button
                            key={area}
                            type="button"
                            className="results-filter-menu__item"
                            onClick={() => {
                              setAreaComparacao(area)
                              setMenuAreaOpen(false)
                            }}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {!dadosInsuficientes && (
                  <div className="comparison-responses-counts">
                    <div className="comparison-count-block">
                      <span className="comparison-small-label">
                        Primeira pesquisa
                      </span>
                      <strong className="comparison-count-number">
                        {respPrimeira} Respostas
                      </strong>
                    </div>
                    <div className="comparison-count-block">
                      <span className="comparison-small-label">
                        Segunda pesquisa
                      </span>
                      <strong className="comparison-count-number">
                        {respSegunda} Respostas
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco de proteção de anonimato quando houver menos de 3 respostas */}
            {dadosInsuficientes ? (
              <div className="insufficient-data-box">
                <h2 className="insufficient-data-box__title">
                  Quantidade de respostas insuficiente
                </h2>
                <p className="insufficient-data-box__text">
                  {resultadoComparacao?.mensagem ||
                    'Não é possível exibir os resultados porque a quantidade de respostas ainda é insuficiente (mínimo de 3 participantes) para preservar o anonimato dos participantes.'}
                </p>
              </div>
            ) : (
              <>
                <div className="comparison-averages-row">
                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">
                      Média da primeira pesquisa
                    </span>
                    <strong className="comparison-avg-value">
                      {formatarNumero(mediaPrimeira)}
                    </strong>
                    <span className="comparison-avg-faixa">
                      ({faixaPrimeira})
                    </span>
                  </div>

                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">
                      Média da segunda pesquisa
                    </span>
                    <strong className="comparison-avg-value">
                      {formatarNumero(mediaSegunda)}
                    </strong>
                    <span className="comparison-avg-faixa">
                      ({faixaSegunda})
                    </span>
                  </div>

                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">Crescimento</span>
                    <strong
                      className="comparison-growth-value"
                      style={{
                        color: crescimento < 0 ? '#E02C00' : '#2CA500',
                      }}
                    >
                      {crescimento > 0 ? '+' : ''}
                      {formatarNumero(crescimento)}
                    </strong>
                  </div>
                </div>

                <div className="comparison-evolution-section">
                  <h2 className="comparison-section-heading">
                    Evolução de satisfação
                  </h2>

                  <div className="comparison-bar-block">
                    <span className="comparison-small-label">
                      Primeira pesquisa
                    </span>
                    <div className="comparison-bar-line">
                      <div className="comparison-bar-track">
                        <div
                          className="comparison-bar-fill comparison-bar-fill--first"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(mediaPrimeira) / 5) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="comparison-bar-score">
                        {formatarNumero(mediaPrimeira)}/5
                      </span>
                    </div>
                  </div>

                  <div className="comparison-bar-block">
                    <span className="comparison-small-label">
                      Segunda pesquisa
                    </span>
                    <div className="comparison-bar-line">
                      <div className="comparison-bar-track">
                        <div
                          className="comparison-bar-fill comparison-bar-fill--second"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(mediaSegunda) / 5) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="comparison-bar-score">
                        {formatarNumero(mediaSegunda)}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="comparison-changes-section">
                  <h2 className="comparison-section-heading">
                    Principais mudanças identificadas
                  </h2>

                  <div className="comparison-changes-list">
                    {listaVariacoes.map((item) => (
                      <div key={item.id} className="comparison-change-item">
                        <span>{item.nome}</span>
                        <span className="comparison-change-badge">
                          {item.diferenca > 0 ? '+ ' : ''}
                          {formatarNumero(item.diferenca)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="comparison-footer-row">
              {!dadosInsuficientes ? (
                <div className="comparison-positive-status">
                  <TrendingUp size={24} />
                  <span>{tendenciaTexto}</span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                className="comparison-back-btn"
                onClick={() => {
                  setEtapa('listagem')
                  setCardMarcadoId(null)
                  setTituloEscolhido('')
                  setAreaComparacao('Geral')
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