import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Pin } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import {
  buscarMedias,
  buscarFeedbacks,
  listarPerguntas,
  listarHistorico,
  listarDiretorias,
} from '../../services/pesquisaService'
import { mensagemDeErro } from '../../utils/erros'
import {
  formatarNumero,
  formatarIntervalo,
  diasRestantes,
} from '../../utils/formatadores'
import { ESCALA_LIKERT, CORES_ESCALA, CORES_FAIXA } from '../../utils/escala'
import '../Pesquisa/Pesquisa.css'
import './Resultados.css'
import './ResultadosGerais.css'

const MINIMO_RESPOSTAS_ANONIMATO = 3
const NOTAS = [1, 2, 3, 4, 5]

const somar = (dist) => NOTAS.reduce((soma, n) => soma + (dist?.[n] || 0), 0)
const texto = (valor) => String(valor).replace('.', ',')

function percentuais(dist) {
  const total = somar(dist)
  return ESCALA_LIKERT.map((opcao, i) => ({
    label: opcao.rotulo,
    percentual: total
      ? Math.round(((dist?.[opcao.valor] || 0) / total) * 1000) / 10
      : 0,
    cor: CORES_ESCALA[i],
  }))
}

function juntarDistribuicoes(metricas) {
  const acumulado = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  metricas.forEach((m) =>
    NOTAS.forEach((n) => {
      acumulado[n] += m.distribuicao?.[n] || 0
    })
  )
  return acumulado
}

function BarrasDistribuicao({ itens, larga = false }) {
  return (
    <div className="chart-wrapper">
      <span className="chart-y-label">% Respostas</span>
      <div
        className={`chart-bars-container ${
          larga ? 'chart-bars-container--wide' : ''
        }`}
      >
        {itens.map((item) => (
          <div key={item.label} className="chart-bar-group">
            <span className="chart-bar-label">{item.label}</span>
            <div className="chart-bar-row">
              <div
                className={`chart-bar-track ${
                  larga ? 'chart-bar-track--wide' : ''
                }`}
              >
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${item.percentual}%`,
                    backgroundColor: item.cor,
                  }}
                />
              </div>
              <span className="chart-bar-percent">
                {texto(item.percentual)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Resultados() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const idPesq = searchParams.get('id_pesq')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('metricas')
  const [filtroArea, setFiltroArea] = useState('Geral')
  const [menuFiltroOpen, setMenuFiltroOpen] = useState(false)

  const [base, setBase] = useState(null)
  const [erro, setErro] = useState('')
  const [mediasArea, setMediasArea] = useState({ area: null, dados: null })
  const [feedbacks, setFeedbacks] = useState({ area: null, dados: null })

  const [erroParticipacao, setErroParticipacao] = useState('')
  const [erroFeedback, setErroFeedback] = useState('')


  useEffect(() => {
    if (!idPesq) return
    let cancelado = false

    async function carregarResultados() {
      const [resultadoMedias, resultadoHistorico, resultadoPerguntas, resultadoDiretorias] =
        await Promise.allSettled([
          buscarMedias(idPesq),
          listarHistorico(),
          listarPerguntas(idPesq),
          listarDiretorias(),
        ])

      if (cancelado) return

      if (resultadoMedias.status === 'rejected') {
        setErro(
          mensagemDeErro(
            resultadoMedias.reason,
            'Não foi possível carregar os resultados.'
          )
        )
        return
      }

      const gerais = resultadoMedias.value

      const historico =
        resultadoHistorico.status === 'fulfilled'
          ? resultadoHistorico.value
          : []

      const perguntas =
        resultadoPerguntas.status === 'fulfilled'
          ? resultadoPerguntas.value
          : []

      const diretorias =
        resultadoDiretorias.status === 'fulfilled'
          ? resultadoDiretorias.value
          : []

      let participacao = []
      let erroParticipacaoLocal = ''

      if (resultadoDiretorias.status === 'rejected') {
        erroParticipacaoLocal =
          'Não foi possível carregar a participação por diretoria.'
      } else {
        const resultados = await Promise.allSettled(
          diretorias.map((d) => buscarMedias(idPesq, d))
        )

        participacao = resultados.map((resultado, i) => ({
          nome: diretorias[i],
          quantidade:
            resultado.status === 'fulfilled'
              ? somar(resultado.value.metricas_por_pergunta?.[0]?.distribuicao)
              : null,
        }))

        if (resultados.some((resultado) => resultado.status === 'rejected')) {
          erroParticipacaoLocal =
            'Não foi possível carregar a participação por diretoria.'
        }
      }

      if (cancelado) return

      setErroParticipacao(erroParticipacaoLocal)
      setBase({
        gerais,
        perguntas,
        diretorias,
        participacao,
        pesquisa:
          historico.find((p) => String(p.id_pesq) === String(idPesq)) || null,
      })
    }

    carregarResultados().catch((e) => {
      if (!cancelado) {
        setErro(
          mensagemDeErro(e, 'Não foi possível carregar os resultados.')
        )
      }
    })

    return () => {
      cancelado = true
    }
  }, [idPesq])


  // Médias da diretoria escolhida
  useEffect(() => {
    if (!idPesq || filtroArea === 'Geral') return
    let cancelado = false
    buscarMedias(idPesq, filtroArea)
      .then((dados) => {
        if (!cancelado) setMediasArea({ area: filtroArea, dados })
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemDeErro(e))
      })
    return () => {
      cancelado = true
    }
  }, [idPesq, filtroArea])


  useEffect(() => {
    if (!idPesq) return
    let cancelado = false

    buscarFeedbacks(idPesq, filtroArea === 'Geral' ? null : filtroArea)
      .then((dados) => {
        if (!cancelado) {
          setFeedbacks({ area: filtroArea, dados })
          setErroFeedback('')
        }
      })
      .catch((e) => {
        if (!cancelado) {
          setFeedbacks({ area: filtroArea, dados: null })
          setErroFeedback(
            mensagemDeErro(e, 'Não foi possível carregar os comentários.')
          )
        }
      })

    return () => {
      cancelado = true
    }
  }, [idPesq, filtroArea])


  const erroTela = !idPesq
    ? 'Nenhuma pesquisa selecionada. Volte à Home e escolha uma pesquisa.'
    : erro

  const dadosFiltro = !base
    ? null
    : filtroArea === 'Geral'
    ? base.gerais
    : mediasArea.area === filtroArea
    ? mediasArea.dados
    : null
  const feedbacksAtuais = feedbacks.area === filtroArea ? feedbacks.dados : null
  const opcoesFiltro = ['Geral', ...(base?.diretorias || [])]

  const metricas = dadosFiltro?.metricas_por_pergunta || []
  const totalRespostas = metricas.length ? somar(metricas[0].distribuicao) : 0
  const insuficiente =
    Boolean(dadosFiltro) && totalRespostas < MINIMO_RESPOSTAS_ANONIMATO

  const distGlobal = juntarDistribuicoes(metricas)
  const totalNotas = somar(distGlobal)
  const pct = (parte) =>
    totalNotas ? Math.round((parte / totalNotas) * 1000) / 10 : 0
  const insatisfacao = pct(distGlobal[1] + distGlobal[2])
  const satisfacao = pct(distGlobal[4] + distGlobal[5])

  const mediaGeralPorPergunta = new Map(
    (base?.gerais?.metricas_por_pergunta || []).map((m) => [m.pergunta, m.media])
  )
  const perguntas = metricas.map((m, i) => ({
    id: i,
    curto: m.eixo,
    enunciado: m.pergunta,
    media: m.media,
    faixa: m.faixa,
    desvio: m.desvio_padrao,
    alerta: m.alerta_variacao,
    referencia: mediaGeralPorPergunta.get(m.pergunta),
    distribuicao: percentuais(m.distribuicao),
  }))

  const enunciadoDiretoria =
    base?.perguntas?.find((p) => p.tipo === 'DIRETORIA')?.enunciado ||
    'Qual sua área de atuação/ diretoria na Include?'

  const totalParticipacao =
  base?.participacao.reduce(
    (soma, d) => soma + (d.quantidade ?? 0),
    0
  ) || 0

  const handleReaplicarPesquisa = () => {
    navigate('/pesquisas/criar', {
      state: {
        reaplicar: {
          idOrigem: Number(idPesq),
          titulo: base?.pesquisa?.titulo || '',
          descricao: base?.pesquisa?.descricao || 'Pesquisa de clima organizacional da Include Jr.',
          perguntas: (base?.perguntas || [])
            .filter((p) => p.tipo !== 'DIRETORIA')
            .map((p) => ({
              id: p.pesquisa_pergunta_id,
              titulo: p.enunciado,
              tipo: p.tipo,
            })),
        },
      },
    })
  }

  const textoPrazo = (() => {
    const pesquisa = base?.pesquisa
    if (!pesquisa) return ''
    const dias = diasRestantes(pesquisa.data_fim)
    if (pesquisa.situacao === 'Encerrada' || dias < 0)
      return `Pesquisa encerrada (${formatarIntervalo(
        pesquisa.data_inicio,
        pesquisa.data_fim
      )})`
    if (dias === 0) return 'Esta pesquisa encerra hoje'
    return `Faltam ${dias} dias para essa pesquisa ser encerrada`
  })()

  return (
    <div className="results-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
        {erroTela && (
          <section className="card-borda-externa metrics-summary-card">
            <p>{erroTela}</p>
          </section>
        )}

        {!erroTela && !base && <p>Carregando resultados...</p>}

        {!erroTela && base && abaAtiva === 'perguntas' && (
          <>
            <section className="card-borda-externa survey-header-card">
              <h1 className="survey-header-card__title">
                {base.pesquisa?.titulo || 'Pesquisa de clima'}
              </h1>
              {textoPrazo && (
                <span className="survey-header-card__deadline">{textoPrazo}</span>
              )}
            </section>

            {base.perguntas.map((p) => {
              if (p.tipo === 'DIRETORIA') {
                return (
                  <section
                    key={p.pesquisa_pergunta_id}
                    className="card-borda-externa question-card"
                  >
                    <div className="question-card__top-row">
                      <h2 className="question-card__title">
                        {enunciadoDiretoria}
                      </h2>
                      <Pin size={28} className="question-card__pin-icon" />
                    </div>
                    <div className="question-card__options">
                      {base.diretorias.map((dir) => (
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
                )
              }
              return (
                <section
                  key={p.pesquisa_pergunta_id}
                  className="card-borda-externa question-card"
                >
                  <h2 className="question-card__title">{p.enunciado}</h2>
                  {p.tipo === 'LIKERT' ? (
                    <div className="question-card__options">
                      {ESCALA_LIKERT.map((opcao) => (
                        <div
                          key={opcao.valor}
                          className="likert-option likert-option--disabled"
                        >
                          <span className="likert-radio" />
                          <span>{opcao.rotulo}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="builder-open-text-preview">
                      Resposta aberta (texto livre)
                    </div>
                  )}
                </section>
              )
            })}
          </>
        )}

        {!erroTela && base && abaAtiva === 'metricas' && (
          <>
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
                    {opcoesFiltro.map((item) => (
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

            {!dadosFiltro && <p>Carregando...</p>}

            {insuficiente && (
              <section className="card-borda-externa metrics-summary-card">
                <div
                  className="insufficient-data-box"
                  style={{ margin: 0, width: '100%' }}
                >
                  <h2 className="insufficient-data-box__title">
                    Quantidade de respostas insuficiente
                  </h2>
                  <p className="insufficient-data-box__text">
                    {filtroArea === 'Geral'
                      ? 'Não é possível exibir os resultados desta pesquisa porque a quantidade de respostas ainda é insuficiente (mínimo de 3 participantes) para preservar o anonimato.'
                      : `Não é possível exibir os resultados da diretoria de ${filtroArea} porque a quantidade de respostas ainda é insuficiente (mínimo de 3 participantes) para preservar o anonimato dos participantes.`}
                  </p>
                </div>
              </section>
            )}

            {dadosFiltro && !insuficiente && (
              <>
                <section className="card-borda-externa metrics-summary-card">
                  <h1 className="metrics-summary-card__count">
                    {filtroArea === 'Geral'
                      ? `${totalRespostas} Respostas`
                      : `${totalRespostas} Respostas (${filtroArea})`}
                  </h1>
                  <p className="metrics-summary-card__desc">
                    Com base nas {totalRespostas} respostas
                    {filtroArea === 'Geral' ? '' : ` da diretoria de ${filtroArea}`},
                    a média geral é {formatarNumero(dadosFiltro.media_geral)}/5,
                    classificada como {dadosFiltro.faixa_geral}.
                  </p>
                </section>

                {filtroArea === 'Geral' && erroParticipacao && (
                  <section className="card-borda-externa metrics-chart-card">
                    <p>{erroParticipacao}</p>
                  </section>
                )}

                {filtroArea === 'Geral' && !erroParticipacao && totalParticipacao > 0 && (
                  <section className="card-borda-externa metrics-chart-card">
                    <div className="question-card__top-row">
                      <h2 className="metrics-chart-card__title">
                        {enunciadoDiretoria}
                      </h2>
                      <Pin size={28} className="question-card__pin-icon" />
                    </div>
                    <BarrasDistribuicao
                      itens={base.participacao
                      .filter((d) => d.quantidade !== null)
                      .map((d) => ({
                        label: d.nome,
                        percentual:
                          Math.round((d.quantidade / totalParticipacao) * 1000) / 10,
                        cor: '#FF9860',
                      }))}
                    />
                  </section>
                )}

                {perguntas.map((pergunta) => (
                  <section
                    key={pergunta.id}
                    className="card-borda-externa metrics-chart-card"
                  >
                    <h2 className="metrics-chart-card__title">
                      {pergunta.enunciado}
                    </h2>

                    <div className="metrics-question-content-row">
                      <BarrasDistribuicao itens={pergunta.distribuicao} />

                      <div className="metrics-average-box">
                        <span className="metrics-average-box__label">
                          Média de satisfação
                        </span>
                        <div
                          className="metrics-average-pill"
                          style={{ backgroundColor: CORES_FAIXA[pergunta.faixa] }}
                        >
                          {formatarNumero(pergunta.media)}/5
                        </div>
                        <span className="metrics-average-box__faixa">
                          {pergunta.faixa}
                        </span>
                        {pergunta.alerta && pergunta.alerta !== 'Normal' && (
                          <span
                            className="metrics-average-box__faixa"
                            style={{ color: '#B00020' }}
                          >
                            Atenção: {pergunta.alerta} (desvio{' '}
                            {formatarNumero(pergunta.desvio)})
                          </span>
                        )}
                      </div>
                    </div>
                  </section>
                ))}

                <section className="card-borda-externa metrics-bottom-summary-card">
                  <h2 className="metrics-bottom-summary__title">
                    {filtroArea === 'Geral'
                      ? 'Resumo geral dos resultados dessa pesquisa'
                      : `Resumo dos resultados da diretoria de ${filtroArea}`}
                  </h2>

                  <div className="metrics-kpis-row">
                    <div className="metrics-kpi-item">
                      <span className="metrics-kpi-value">{totalRespostas}</span>
                      <span className="metrics-kpi-label">Participantes</span>
                    </div>
                    <div className="metrics-kpi-item">
                      <span className="metrics-kpi-value">
                        {texto(insatisfacao)}%
                      </span>
                      <span className="metrics-kpi-label">
                        Respostas de
                        <br />
                        insatisfação
                      </span>
                    </div>
                    <div className="metrics-kpi-item">
                      <span className="metrics-kpi-value">
                        {texto(satisfacao)}%
                      </span>
                      <span className="metrics-kpi-label">
                        Respostas de
                        <br />
                        satisfação
                      </span>
                    </div>
                    <div className="metrics-kpi-item">
                      <div
                        className="metrics-average-pill metrics-average-pill--large"
                        style={{
                          backgroundColor: CORES_FAIXA[dadosFiltro.faixa_geral],
                        }}
                      >
                        {formatarNumero(dadosFiltro.media_geral)}/5
                      </div>
                      <span className="metrics-kpi-label">
                        Índice geral de satisfação ({dadosFiltro.faixa_geral})
                      </span>
                    </div>
                  </div>

                  {filtroArea === 'Geral' ? (
                    <div className="metrics-general-distribution">
                      <h3 className="metrics-Distribution-subtitle">
                        Distribuição das respostas
                      </h3>
                      <BarrasDistribuicao itens={percentuais(distGlobal)} larga />
                    </div>
                  ) : (
                    <div className="metrics-area-comparison">
                      <h3 className="metrics-Distribution-subtitle">
                        Comparativo em relação a média geral
                      </h3>
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
                          {perguntas.map((p) => {
                            const diferenca =
                              p.referencia === undefined
                                ? null
                                : p.media - p.referencia
                            return (
                              <tr key={p.id}>
                                <td>{p.curto}</td>
                                <td>
                                  {p.referencia === undefined
                                    ? '-'
                                    : formatarNumero(p.referencia)}
                                </td>
                                <td>{formatarNumero(p.media)}</td>
                                <td
                                  className={
                                    diferenca !== null && diferenca < 0
                                      ? 'diff-negative'
                                      : 'diff-positive'
                                  }
                                >
                                  {diferenca === null
                                    ? '-'
                                    : `${diferenca > 0 ? '+' : ''}${formatarNumero(
                                        diferenca
                                      )}`}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="card-borda-externa metrics-chart-card">
                  <h2 className="metrics-chart-card__title">
                    Desafios do dia a dia (por categoria)
                  </h2>
                  {erroFeedback && <p>{erroFeedback}</p>}

                  {!erroFeedback && !feedbacksAtuais && (
                    <p>Carregando comentários...</p>
                  )}

                  {!erroFeedback &&
                    feedbacksAtuais &&
                    Object.keys(feedbacksAtuais).length === 0 && (
                      <p>Nenhum comentário registrado.</p>
                    )}

                  {!erroFeedback &&
                    feedbacksAtuais &&
                    Object.entries(feedbacksAtuais).map(([categoria, lista]) => (
                      <div key={categoria} style={{ marginBottom: 16 }}>
                        <h3>
                          {categoria} ({lista.length})
                        </h3>
                        <ul>
                          {lista.map((comentario, i) => (
                            <li key={i}>{comentario}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </section>
              </>
            )}

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