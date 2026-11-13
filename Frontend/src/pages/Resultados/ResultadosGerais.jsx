import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ChevronDown, TrendingUp } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import {
  listarTitulosComparacao,
  compararEdicoes,
  listarDiretorias,
} from '../../services/pesquisaService'
import { mensagemDeErro } from '../../utils/erros'
import { formatarIntervalo, formatarNumero } from '../../utils/formatadores'
import '../Home/Home.css'
import './Resultados.css'
import './ResultadosGerais.css'

const DIVISOES = ['Semana', 'Mês', 'Trimestre', 'Semestre', 'Ano']

function rotuloGrupo(dataInicio, divisao) {
  const [ano, mes, dia] = String(dataInicio).slice(0, 10).split('-').map(Number)
  if (divisao === 'Ano') return `${ano}`
  if (divisao === 'Semestre') return `${mes <= 6 ? '1º' : '2º'} semestre de ${ano}`
  if (divisao === 'Mês') return `${String(mes).padStart(2, '0')}/${ano}`
  if (divisao === 'Semana') {
    const inicio = new Date(ano, mes - 1, dia)
    const diaDaSemana = (inicio.getDay() + 6) % 7

    inicio.setDate(inicio.getDate() - diaDaSemana)

    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)

    const formatarData = (data) =>
      `${String(data.getDate()).padStart(2, '0')}/${String(
        data.getMonth() + 1
      ).padStart(2, '0')}/${data.getFullYear()}`

    return `Semana de ${formatarData(inicio)} a ${formatarData(fim)}`
  }
  return `${Math.ceil(mes / 3)}º trimestre de ${ano}`
}

function agrupar(edicoes, divisao) {
  const grupos = new Map()
  edicoes.forEach((e) => {
    const rotulo = rotuloGrupo(e.inicio, divisao)
    if (!grupos.has(rotulo)) grupos.set(rotulo, { rotulo, ordem: e.inicio, itens: [] })
    const grupo = grupos.get(rotulo)
    grupo.itens.push(e)
    if (e.inicio > grupo.ordem) grupo.ordem = e.inicio
  })
  return [...grupos.values()].sort((a, b) => b.ordem.localeCompare(a.ordem))
}

export default function ResultadosGerais() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [etapa, setEtapa] = useState('listagem')
  const [divisao, setDivisao] = useState('Trimestre')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalCompararOpen, setModalCompararOpen] = useState(false)
  const [edicoesEscolhidas, setEdicoesEscolhidas] = useState([])
  const [aviso, setAviso] = useState('')

  const [titulos, setTitulos] = useState(null)
  const [erroTitulos, setErroTitulos] = useState('')
  const [diretorias, setDiretorias] = useState([])
  const [erroDiretorias, setErroDiretorias] = useState(false)
  const [areaComparacao, setAreaComparacao] = useState('Geral')
  const [menuAreaOpen, setMenuAreaOpen] = useState(false)
  const [comparacao, setComparacao] = useState({ chave: null, dados: null, erro: '' })

  useEffect(() => {
    listarTitulosComparacao()
      .then(setTitulos)
      .catch((e) =>
        setErroTitulos(mensagemDeErro(e, 'Não foi possível carregar as pesquisas.'))
      )
  }, [])

  useEffect(() => {
    listarDiretorias()
      .then(setDiretorias)
      .catch(() => setErroDiretorias(true))
  }, [])

  const edicoes = (titulos || []).flatMap((t) =>
    t.edicoes.map((e) => ({
      id: e.id_pesq,
      titulo: t.titulo,
      podeComparar: t.pode_comparar,
      inicio: e.data_inicio,
      fim: e.data_fim,
      participantes: e.participantes,
    }))
  )
  const grupos = agrupar(edicoes, divisao)

  const edicoesSelecionadas = edicoes
  .filter((e) => edicoesEscolhidas.includes(e.id))
  .sort((a, b) => a.inicio.localeCompare(b.inicio))

  const idAnterior = edicoesSelecionadas[0]?.id || null
  const idAtual = edicoesSelecionadas[1]?.id || null

  const tituloEscolhido = edicoesSelecionadas[0]?.titulo || ''

  const chave = `${idAnterior}|${idAtual}|${areaComparacao}`

  useEffect(() => {
    if (etapa !== 'comparando' || !idAnterior || !idAtual) return
    let cancelado = false
    compararEdicoes(
      idAnterior,
      idAtual,
      areaComparacao === 'Geral' ? null : areaComparacao
    )
      .then((dados) => {
        if (!cancelado) setComparacao({ chave, dados, erro: '' })
      })
      .catch((e) => {
        if (!cancelado)
          setComparacao({
            chave,
            dados: null,
            erro: mensagemDeErro(e, 'Não foi possível carregar a comparação.'),
          })
      })
    return () => {
      cancelado = true
    }
  }, [etapa, idAnterior, idAtual, areaComparacao, chave])

  const resultado = comparacao.chave === chave ? comparacao : null
  const dados = resultado?.dados || null

  const handleBotaoTopo = () => {
    if (etapa === 'listagem') {
      setModalCompararOpen(true)
    } else if (etapa === 'selecionando') {
      if (edicoesEscolhidas.length !== 2) {
        setAviso('Selecione duas edições para continuar.')
        return
      }

      setAviso('')
      setEtapa('selecionados')
    } else if (etapa === 'selecionados') {
      setEtapa('comparando')
    }
  }

  const voltar = () => {
    setEtapa('listagem')
    setEdicoesEscolhidas([])
    setAreaComparacao('Geral')
    setAviso('')
  }

  const handleSelecionarEdicao = (item) => {
    if (edicoesEscolhidas.includes(item.id)) {
      setEdicoesEscolhidas((atuais) =>
        atuais.filter((id) => id !== item.id)
      )
      setAviso('')
      return
    }

    if (edicoesEscolhidas.length >= 2) return

    const primeiraEscolhida = edicoes.find(
      (e) => e.id === edicoesEscolhidas[0]
    )

    if (
      primeiraEscolhida &&
      primeiraEscolhida.titulo !== item.titulo
    ) {
      setAviso('As duas edições precisam ter o mesmo título.')
      return
    }

    setEdicoesEscolhidas((atuais) => [...atuais, item.id])
    setAviso('')
  }

  const TENDENCIAS = {
    Melhora: 'Evolução positiva identificada',
    Piora: 'Queda nos indicadores identificada',
    Estável: 'Estabilidade nos indicadores identificada',
  }
  const tendenciaTexto = TENDENCIAS[dados?.tendencia] || null

  const largura = (media) => `${Math.min(100, (Number(media) / 5) * 100)}%`

  return (
    <div className="general-results-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="general-results-container">
        {erroTitulos && <p>{erroTitulos}</p>}
        {!erroTitulos && !titulos && <p>Carregando pesquisas...</p>}

        {titulos && etapa === 'comparando' && (
          <section className="comparison-figma-card">
            <div className="comparison-figma-top">
              <div>
                <h1 className="comparison-figma-title">Comparativo de pesquisas</h1>
                <p className="comparison-figma-subtitle">
                  Pesquisa: {tituloEscolhido}
                </p>

                {dados?.anterior && dados?.atual && (
                  <div className="comparison-period-section">
                    <span className="comparison-small-label">
                      Período das pesquisas
                    </span>
                    <div className="comparison-period-badges">
                      <span className="comparison-period-pill">
                        {formatarIntervalo(
                          dados.anterior.data_inicio,
                          dados.anterior.data_fim
                        )}
                      </span>
                      <span className="comparison-period-arrow">──────►</span>
                      <span className="comparison-period-pill">
                        {formatarIntervalo(
                          dados.atual.data_inicio,
                          dados.atual.data_fim
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="comparison-top-right">
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

                    {erroDiretorias && (
                      <span>Não foi possível carregar as diretorias.</span>
                    )}

                    {menuAreaOpen && (
                      <div className="results-filter-menu">
                        {['Geral', ...diretorias].map((area) => (
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

                {dados?.anterior && dados?.atual && !dados.dados_insuficientes && (
                  <div className="comparison-responses-counts">
                    <div className="comparison-count-block">
                      <span className="comparison-small-label">
                        Primeira pesquisa
                      </span>
                      <strong className="comparison-count-number">
                        {dados.anterior.participantes} participantes
                      </strong>
                    </div>
                    <div className="comparison-count-block">
                      <span className="comparison-small-label">
                        Segunda pesquisa
                      </span>
                      <strong className="comparison-count-number">
                        {dados.atual.participantes} participantes
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!idAnterior && (
              <div className="insufficient-data-box">
                <h2 className="insufficient-data-box__title">
                  Não há duas edições para comparar
                </h2>
                <p className="insufficient-data-box__text">
                  Este título ainda não tem duas edições com respostas.
                </p>
              </div>
            )}

            {idAnterior && !resultado && <p>Carregando comparação...</p>}
            {resultado?.erro && <p>{resultado.erro}</p>}

            {dados?.dados_insuficientes && (
              <div className="insufficient-data-box">
                <h2 className="insufficient-data-box__title">
                  Quantidade de respostas insuficiente
                </h2>
                <p className="insufficient-data-box__text">{dados.mensagem}</p>
              </div>
            )}

            {dados?.anterior && dados?.atual && !dados.dados_insuficientes && (
              <>
                <div className="comparison-averages-row">
                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">
                      Média da primeira pesquisa
                    </span>
                    <strong className="comparison-avg-value">
                      {formatarNumero(dados.anterior.media_geral)}
                    </strong>
                    <span className="comparison-avg-faixa">
                      ({dados.anterior.faixa_geral})
                    </span>
                  </div>
                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">
                      Média da segunda pesquisa
                    </span>
                    <strong className="comparison-avg-value">
                      {formatarNumero(dados.atual.media_geral)}
                    </strong>
                    <span className="comparison-avg-faixa">
                      ({dados.atual.faixa_geral})
                    </span>
                  </div>
                  <div className="comparison-avg-col">
                    <span className="comparison-small-label">Diferença</span>
                    <strong
                      className="comparison-growth-value"
                      style={{
                        color: dados.diferenca_geral < 0 ? '#E02C00' : '#2CA500',
                      }}
                    >
                      {dados.diferenca_geral > 0 ? '+' : ''}
                      {formatarNumero(dados.diferenca_geral)}
                    </strong>
                  </div>
                </div>

                <div className="comparison-evolution-section">
                  <h2 className="comparison-section-heading">
                    Evolução de satisfação
                  </h2>
                  {[
                    ['Primeira pesquisa', dados.anterior.media_geral, 'first'],
                    ['Segunda pesquisa', dados.atual.media_geral, 'second'],
                  ].map(([nome, media, tipo]) => (
                    <div key={tipo} className="comparison-bar-block">
                      <span className="comparison-small-label">{nome}</span>
                      <div className="comparison-bar-line">
                        <div className="comparison-bar-track">
                          <div
                            className={`comparison-bar-fill comparison-bar-fill--${tipo}`}
                            style={{ width: largura(media) }}
                          />
                        </div>
                        <span className="comparison-bar-score">
                          {formatarNumero(media)}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="comparison-changes-section">
                  <h2 className="comparison-section-heading">
                    Principais mudanças identificadas ({dados.perguntas_em_comum}{' '}
                    perguntas em comum)
                  </h2>
                  <div className="comparison-changes-list">
                    {dados.variacoes.slice(0, 3).map((v) => (
                      <div key={v.id_perg} className="comparison-change-item">
                        <span>{v.eixo || v.pergunta}</span>
                        <span
                          className="comparison-change-badge"
                          style={
                            v.diferenca < 0
                              ? { backgroundColor: '#FFD6D0', color: '#B00020' }
                              : undefined
                          }
                        >
                          {v.diferenca > 0 ? '+ ' : ''}
                          {formatarNumero(v.diferenca)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="comparison-footer-row">
              {dados && !dados.dados_insuficientes && tendenciaTexto && (
                <div className="comparison-positive-status">
                  <TrendingUp size={24} />
                  <span>{tendenciaTexto}</span>
                </div>
              )}
              <button type="button" className="comparison-back-btn" onClick={voltar}>
                Voltar
              </button>
            </div>
          </section>
        )}

        {titulos && etapa !== 'comparando' && (
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
                        {DIVISOES.map((opcao) => (
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
                  Selecione duas edições do mesmo título:
                </span>
              )}
              {etapa === 'selecionados' && (
                <span className="general-top-label">Edições selecionadas:</span>
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

            {aviso && <p>{aviso}</p>}
            {grupos.length === 0 && <p>Nenhuma pesquisa cadastrada.</p>}

            {grupos.map((grupo) => {
              const itens =
              etapa === 'selecionados'
                ? grupo.itens.filter((e) => edicoesEscolhidas.includes(e.id))
                : grupo.itens
              if (itens.length === 0) return null

              return (
                <section key={grupo.rotulo} className="quarter-section">
                  <h2 className="quarter-title">{grupo.rotulo}</h2>
                  <div className="quarter-cards-list">
                    {itens.map((item) => {
                      const selecionado = edicoesEscolhidas.includes(item.id)
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
                                disabled={
                                  !item.podeComparar ||
                                  item.participantes === 0 ||
                                  (edicoesEscolhidas.length === 2 && !selecionado)
                                }
                                className={`compare-radio-circle ${
                                  selecionado ? 'compare-radio-circle--selected' : ''
                                }`}
                                onClick={() => handleSelecionarEdicao(item)}
                                title={
                                  item.participantes === 0
                                    ? 'Esta edição não possui participantes'
                                    : item.podeComparar
                                      ? 'Selecionar esta edição'
                                      : 'Só há uma edição deste título'
                                }
                              >
                                {selecionado && (
                                  <span className="compare-radio-inner" />
                                )}
                              </button>
                            )}

                            <div className="survey-card__info">
                              <h3 className="survey-card__title">{item.titulo}</h3>
                              <p className="survey-card__desc">
                                {item.participantes} participantes
                                {etapa === 'selecionando' && !item.podeComparar
                                  ? ' · Só 1 edição, não dá para comparar'
                                  : ''}
                              </p>
                              <p className="survey-card__date">
                                {formatarIntervalo(item.inicio, item.fim)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="survey-card__arrow-btn"
                            onClick={() => navigate(`/resultados?id_pesq=${item.id}`)}
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
          setEdicoesEscolhidas([])
          setAviso('')
          setEtapa('selecionando')
        }}
        onCancel={() => setModalCompararOpen(false)}
      />
    </div>
  )
}