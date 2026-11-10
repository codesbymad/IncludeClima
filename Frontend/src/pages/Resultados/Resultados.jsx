import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Pin } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../Pesquisa/Pesquisa.css'
import './Resultados.css'

const OPCOES_FILTRO = [
  'Geral',
  'Presidência',
  'Projetos',
  'Comercial',
  'Marketing',
  'Gestão de Pessoas',
  'Financeiro',
]

const DIRETORIAS_PARTICIPACAO = [
  { nome: 'Presidência', percentual: 10 },
  { nome: 'Projetos', percentual: 20 },
  { nome: 'Comercial', percentual: 20 },
  { nome: 'Marketing', percentual: 30 },
  { nome: 'Gestão de Pessoas', percentual: 10 },
  { nome: 'Financeiro', percentual: 10 },
]

const ESCALA_LABELS = [
  'Muito insatisfeito(a)',
  'Insatisfeito(a)',
  'Neutro',
  'Satisfeito(a)',
  'Muito satisfeito(a)',
]

const DADOS_GERAL = {
  totalRespostas: 10,
  mediaGeral: 2.73,
  discordancia: '50%',
  concordancia: '30%',
  distribuicaoGeral: [
    { label: 'Muito insatisfeito(a)', percentual: 10, cor: '#FF3434' },
    { label: 'Insatisfeito(a)', percentual: 40, cor: '#FF9860' },
    { label: 'Neutro', percentual: 20, cor: '#FFEA60' },
    { label: 'Satisfeito(a)', percentual: 30, cor: '#60FF72' },
    { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
  ],
  perguntas: [
    {
      id: 1,
      curto: 'Alinhamento das atividade',
      enunciado:
        '1) Você considera que as atividades atribuídas a você estão alinhadas com suas habilidades e interesses?',
      media: 2.7,
      distribuicao: [
        { label: 'Muito insatisfeito(a)', percentual: 10, cor: '#FF3434' },
        { label: 'Insatisfeito(a)', percentual: 40, cor: '#FF9860' },
        { label: 'Neutro', percentual: 20, cor: '#FFEA60' },
        { label: 'Satisfeito(a)', percentual: 30, cor: '#60FF72' },
        { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
      ],
    },
    {
      id: 2,
      curto: 'Distribuição das tarefas',
      enunciado: '2)Suas tarefas são bem distribuídas e organizadas?',
      media: 3.4,
      distribuicao: [
        { label: 'Muito insatisfeito(a)', percentual: 0, cor: '#FF3434' },
        { label: 'Insatisfeito(a)', percentual: 20, cor: '#FF9860' },
        { label: 'Neutro', percentual: 30, cor: '#FFEA60' },
        { label: 'Satisfeito(a)', percentual: 40, cor: '#60FF72' },
        { label: 'Muito satisfeito(a)', percentual: 10, cor: '#2CA500' },
      ],
    },
    {
      id: 3,
      curto: 'Tempo para realização',
      enunciado:
        '3)Você considera que possui tempo suficiente para realizar suas tarefas com qualidade?',
      media: 2.1,
      distribuicao: [
        { label: 'Muito insatisfeito(a)', percentual: 40, cor: '#FF3434' },
        { label: 'Insatisfeito(a)', percentual: 30, cor: '#FF9860' },
        { label: 'Neutro', percentual: 10, cor: '#FFEA60' },
        { label: 'Satisfeito(a)', percentual: 20, cor: '#60FF72' },
        { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
      ],
    },
  ],
}

const DADOS_POR_DIRETORIA = {
  Marketing: {
    totalRespostas: 3,
    mediaGeral: 2.78,
    discordancia: '44,4%',
    concordancia: '33,3%',
    perguntas: [
      {
        id: 1,
        curto: 'Alinhamento das atividade',
        enunciado:
          '1) Você considera que as atividades atribuídas a você estão alinhadas com suas habilidades e interesses?',
        media: 3.0,
        mediaGeralRef: 2.7,
        diferenca: '+0,30',
        positiva: true,
        distribuicao: [
          { label: 'Muito insatisfeito(a)', percentual: 0, cor: '#FF3434' },
          { label: 'Insatisfeito(a)', percentual: 33.3, cor: '#FF9860' },
          { label: 'Neutro', percentual: 33.3, cor: '#FFEA60' },
          { label: 'Satisfeito(a)', percentual: 33.3, cor: '#60FF72' },
          { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
        ],
      },
      {
        id: 2,
        curto: 'Distribuição das tarefas',
        enunciado: '2)Suas tarefas são bem distribuídas e organizadas?',
        media: 3.67,
        mediaGeralRef: 3.4,
        diferenca: '+0,27',
        positiva: true,
        distribuicao: [
          { label: 'Muito insatisfeito(a)', percentual: 0, cor: '#FF3434' },
          { label: 'Insatisfeito(a)', percentual: 0, cor: '#FF9860' },
          { label: 'Neutro', percentual: 33.3, cor: '#FFEA60' },
          { label: 'Satisfeito(a)', percentual: 66.7, cor: '#60FF72' },
          { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
        ],
      },
      {
        id: 3,
        curto: 'Tempo para realização',
        enunciado:
          '3)Você considera que possui tempo suficiente para realizar suas tarefas com qualidade?',
        media: 1.67,
        mediaGeralRef: 2.1,
        diferenca: '-0,43',
        positiva: false,
        distribuicao: [
          { label: 'Muito insatisfeito(a)', percentual: 33.3, cor: '#FF3434' },
          { label: 'Insatisfeito(a)', percentual: 66.7, cor: '#FF9860' },
          { label: 'Neutro', percentual: 0, cor: '#FFEA60' },
          { label: 'Satisfeito(a)', percentual: 0, cor: '#60FF72' },
          { label: 'Muito satisfeito(a)', percentual: 0, cor: '#2CA500' },
        ],
      },
    ],
  },
}

// Classificação de Faixas de Interpretação
function classificarFaixa(media) {
  if (media < 2.0) return { nome: 'Crítico', classe: 'pill--critico' }
  if (media < 3.0) return { nome: 'Atenção', classe: 'pill--critico' }
  if (media < 4.0) return { nome: 'Satisfatório', classe: 'pill--satisfatorio' }
  return { nome: 'Excelente', classe: 'pill--satisfatorio' }
}

function formatarNota(num) {
  return Number(num).toFixed(2).replace('.', ',').replace(/,0$/, '')
}

export default function Resultados() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const idPesq = searchParams.get('id_pesq') || 3

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('metricas')
  const [filtroArea, setFiltroArea] = useState('Geral')
  const [menuFiltroOpen, setMenuFiltroOpen] = useState(false)
  const [dadosApi, setDadosApi] = useState(null)

  // Tenta sincronizar com o endpoint real do Back-end: GET /pesquisas/:id_pesq/relatorios/medias
  useEffect(() => {
    const mapAreaParam = {
      Presidência: 'Presidencia',
      'Gestão de Pessoas': 'Gestao de Pessoas',
    }
    const areaQuery =
      filtroArea === 'Geral'
        ? ''
        : `?area=${encodeURIComponent(mapAreaParam[filtroArea] || filtroArea)}`

    api
      .get(`/pesquisas/${idPesq}/relatorios/medias${areaQuery}`)
      .then((res) => {
        if (res.data && res.data.metricas_por_pergunta?.length > 0) {
          setDadosApi(res.data)
        }
      })
      .catch(() => {
        // Caso o back-end não esteja rodando localmente, mantém os dados do protótipo do Figma
        setDadosApi(null)
      })
  }, [idPesq, filtroArea])

  const dadosAtuais =
    filtroArea === 'Geral'
      ? DADOS_GERAL
      : DADOS_POR_DIRETORIA[filtroArea] || DADOS_POR_DIRETORIA.Marketing

  const handleReaplicarPesquisa = () => {
    navigate('/pesquisas/criar', {
      state: {
        reaplicar: {
          titulo: 'Como está o clima na sua rotina?',
          descricao:
            'Queremos conhecer sua experiência com a rotina e as atividades desenvolvidas na Include! Esta pesquisa busca entender seu nível de satisfação com as tarefas, a organização e o dia a dia de trabalho, identificando pontos positivos e oportunidades de melhoria. Sua opinião é muito importante para construirmos um ambiente cada vez melhor!',
          perguntas: DADOS_GERAL.perguntas.map((p) => ({
            id: p.id,
            titulo: p.enunciado,
            tipo: 'LIKERT',
          })),
        },
      },
    })
  }

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
            {/* Visão da aba "Perguntas" */}
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

            {/* Card Fixo da Diretoria com Alfinete */}
            <section className="card-borda-externa question-card">
              <div className="question-card__top-row">
                <h2 className="question-card__title">
                  Qual sua área de atuação/ diretoria na Include?
                </h2>
                <Pin size={28} className="question-card__pin-icon" />
              </div>
              <div className="question-card__options">
                {OPCOES_FILTRO.slice(1).map((dir) => (
                  <div
                    key={dir}
                    className="likert-option likert-option--disabled"
                  >
                    <span className="likert-radio" />
                    <span>{dir}</span>
                  </div>
                ))}
              </div>
            </section>

            {DADOS_GERAL.perguntas.map((pergunta) => (
              <section
                key={pergunta.id}
                className="card-borda-externa question-card"
              >
                <h2 className="question-card__title">{pergunta.enunciado}</h2>
                <div className="question-card__options">
                  {ESCALA_LABELS.map((opcao) => (
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
            {/* Filtro Superior Direito: Resultado: Geral / Marketing */}
            <div className="results-filter-row">
              <span className="results-filter-label">Resultado:</span>
              <div className="results-filter-dropdown-wrap">
                <button
                  type="button"
                  className="results-filter-btn"
                  onClick={() => setMenuFiltroOpen(!menuFiltroOpen)}
                >
                  <span>{filtroArea}</span>
                  <ChevronDown size={20} color="#FFFFFF" />
                </button>

                {menuFiltroOpen && (
                  <div className="results-filter-menu">
                    {OPCOES_FILTRO.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="results-filter-menu__item"
                        onClick={() => {
                          setFiltroArea(item)
                          setMenuFiltroOpen(false)
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card 1: Total de Respostas */}
            <section className="card-borda-externa metrics-summary-card">
              <h1 className="metrics-summary-card__count">
                {filtroArea === 'Geral'
                  ? `${dadosAtuais.totalRespostas} Respostas`
                  : `0${dadosAtuais.totalRespostas} Respostas (${filtroArea})`}
              </h1>
              <p className="metrics-summary-card__desc">
                {filtroArea === 'Geral'
                  ? 'Com base nas 10 respostas, temos um cenário que indica insatisfação moderada com a organização da rotina e a distribuição das atividades.'
                  : `Com base nas 0${dadosAtuais.totalRespostas} respostas dadas pela diretoria de ${filtroArea}, temos um cenário que indica insatisfação moderada com a organização da rotina e a distribuição das atividades.`}
              </p>
            </section>

            {/* Card de Distribuição por Diretoria*/}
            {filtroArea === 'Geral' && (
              <section className="card-borda-externa metrics-chart-card">
                <div className="question-card__top-row">
                  <h2 className="metrics-chart-card__title">
                    Qual sua área de atuação/ diretoria na Include?
                  </h2>
                  <Pin size={28} className="question-card__pin-icon" />
                </div>

                <div className="chart-wrapper">
                  <span className="chart-y-label">% Respostas</span>
                  <div className="chart-bars-container">
                    {DIRETORIAS_PARTICIPACAO.map((dir) => (
                      <div key={dir.nome} className="chart-bar-group">
                        <span className="chart-bar-label">{dir.nome}</span>
                        <div className="chart-bar-row">
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{
                                width: `${dir.percentual}%`,
                                backgroundColor: '#FF9860',
                              }}
                            />
                          </div>
                          <span className="chart-bar-percent">
                            {dir.percentual}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Cards das Perguntas */}
            {dadosAtuais.perguntas.map((pergunta) => {
              const faixaInfo = classificarFaixa(pergunta.media)
              return (
                <section
                  key={pergunta.id}
                  className="card-borda-externa metrics-chart-card"
                >
                  <h2 className="metrics-chart-card__title">
                    {pergunta.enunciado}
                  </h2>

                  <div className="metrics-question-content-row">
                    <div className="chart-wrapper">
                      <span className="chart-y-label">% Respostas</span>

                      <div className="chart-bars-container">
                        {pergunta.distribuicao.map((item) => (
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
                                {String(item.percentual).replace('.', ',')}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coluna da Direita: Média de satisfação + Pílula colorida + Faixa */}
                    <div className="metrics-average-box">
                      <span className="metrics-average-box__label">
                        Média de satisfação
                      </span>
                      <div
                        className={`metrics-average-pill ${faixaInfo.classe}`}
                      >
                        {formatarNota(pergunta.media)}/5
                      </div>
                      <span className="metrics-average-box__faixa">
                        {faixaInfo.nome}
                      </span>
                    </div>
                  </div>
                </section>
              )
            })}

            {/* Card de Resumo Geral ou Resumo da Diretoria */}
            <section className="card-borda-externa metrics-bottom-summary-card">
              <h2 className="metrics-bottom-summary__title">
                {filtroArea === 'Geral'
                  ? 'Resumo geral dos resultados dessa pesquisa'
                  : `Resumo dos resultados da diretoria de ${filtroArea}`}
              </h2>

              <div className="metrics-kpis-row">
                <div className="metrics-kpi-item">
                  <span className="metrics-kpi-value">
                    {dadosAtuais.totalRespostas}
                  </span>
                  <span className="metrics-kpi-label">Participantes</span>
                </div>

                <div className="metrics-kpi-item">
                  <span className="metrics-kpi-value">
                    {dadosAtuais.discordancia}
                  </span>
                  <span className="metrics-kpi-label">
                    Respostas de
                    <br />
                    discordância
                  </span>
                </div>

                <div className="metrics-kpi-item">
                  <span className="metrics-kpi-value">
                    {dadosAtuais.concordancia}
                  </span>
                  <span className="metrics-kpi-label">
                    Respostas de
                    <br />
                    concordância
                  </span>
                </div>

                <div className="metrics-kpi-item">
                  <div
                    className={`metrics-average-pill metrics-average-pill--large ${
                      classificarFaixa(dadosAtuais.mediaGeral).classe
                    }`}
                  >
                    {String(
                      dadosApi?.media_geral || dadosAtuais.mediaGeral
                    ).replace('.', ',')}
                    /5
                  </div>
                  <span className="metrics-kpi-label">
                    {filtroArea === 'Geral'
                      ? 'Índice geral de\nsatisfação'
                      : `Índice de satisfação\n${filtroArea}`}
                  </span>
                </div>
              </div>

              {filtroArea === 'Geral' ? (
                
                <div className="metrics-general-distribution">
                  <h3 className="metrics-Distribution-subtitle">
                    Distribuição das respostas
                  </h3>
                  <div className="chart-wrapper">
                    <span className="chart-y-label">% Respostas</span>
                    <div className="chart-bars-container chart-bars-container--wide">
                      {DADOS_GERAL.distribuicaoGeral.map((item) => (
                        <div key={item.label} className="chart-bar-group">
                          <span className="chart-bar-label">{item.label}</span>
                          <div className="chart-bar-row">
                            <div className="chart-bar-track chart-bar-track--wide">
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
              ) : (

                <div className="metrics-area-comparison">
                  <h3 className="metrics-Distribution-subtitle">
                    Comparativo em relação a média geral
                  </h3>
                  <p className="metrics-comparison-hint">
                    Comparação das médias por pergunta
                  </p>

                  <table className="metrics-comparison-table">
                    <thead>
                      <tr>
                        <th>Pergunta</th>
                        <th>Geral</th>
                        <th>{filtroArea}</th>
                        <th>Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosAtuais.perguntas.map((p) => (
                        <tr key={p.id}>
                          <td>{p.curto}</td>
                          <td>
                            {p.mediaGeralRef.toFixed(2).replace('.', ',')}
                          </td>
                          <td>{p.media.toFixed(2).replace('.', ',')}</td>
                          <td
                            className={
                              p.positiva ? 'diff-positive' : 'diff-negative'
                            }
                          >
                            {p.diferenca}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Card Final: "Deseja reaplicar esta pesquisa? */}
            <section className="card-borda-externa metrics-reapply-card">
              <h2 className="metrics-bottom-summary__title">
                Deseja reaplicar esta pesquisa?
              </h2>
              <p className="metrics-reapply-desc">
                Uma nova aplicação permitirá coletar respostas atualizadas e
                reavaliar os resultados, possibilitando acompanhar a evolução da
                satisfação dos membros.
              </p>
              <button
                type="button"
                className="metrics-reapply-btn"
                onClick={handleReaplicarPesquisa}
              >
                Reaplicar pesquisa
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  )
}