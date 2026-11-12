import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pin } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import {
  listarPerguntas,
  listarDiretorias,
  listarHistorico,
  enviarRespostas,
} from '../../services/pesquisaService'
import { mensagemDeErro, detalhesDeErro } from '../../utils/erros'
import { diasRestantes } from '../../utils/formatadores'
import { ESCALA_LIKERT } from '../../utils/escala'
import './Pesquisa.css'

const ESTILO_ERRO = { color: '#B00020', fontSize: 14, marginTop: 8 }

export default function ResponderPesquisa() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [pesquisa, setPesquisa] = useState(null)
  const [perguntas, setPerguntas] = useState([])
  const [diretorias, setDiretorias] = useState([])
  const [respostas, setRespostas] = useState({})
  const [problemas, setProblemas] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [erroEnvio, setErroEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const [modalEnviarOpen, setModalEnviarOpen] = useState(false)
  const [modalApagarOpen, setModalApagarOpen] = useState(false)

  useEffect(() => {
    Promise.all([listarPerguntas(id), listarDiretorias(), listarHistorico()])
      .then(([listaPerguntas, listaDiretorias, historico]) => {
        setPerguntas(listaPerguntas)
        setDiretorias(listaDiretorias)
        setPesquisa(
          historico.find((p) => String(p.id_pesq) === String(id)) || null
        )
      })
      .catch((erro) =>
        setErroCarga(mensagemDeErro(erro, 'Não foi possível carregar a pesquisa.'))
      )
      .finally(() => setCarregando(false))
  }, [id])

  const responder = (perguntaId, valor) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
    setProblemas((prev) => {
      const copia = { ...prev }
      delete copia[perguntaId]
      return copia
    })
  }

  const validar = () => {
    const faltando = {}
    for (const p of perguntas) {
      const valor = respostas[p.pesquisa_pergunta_id]
      const vazio =
        valor === undefined || valor === null || String(valor).trim() === ''
      if (vazio) faltando[p.pesquisa_pergunta_id] = 'Responda esta pergunta.'
    }
    setProblemas(faltando)
    return Object.keys(faltando).length === 0
  }

  const montarEnvio = () =>
    perguntas.map((p) => {
      const valor = respostas[p.pesquisa_pergunta_id]
      return p.tipo === 'LIKERT'
        ? { pesquisa_pergunta_id: p.pesquisa_pergunta_id, valor_numerico: valor }
        : {
            pesquisa_pergunta_id: p.pesquisa_pergunta_id,
            valor_texto: String(valor).trim(),
          }
    })

  const abrirConfirmacao = () => {
    setErroEnvio('')
    if (!validar()) {
      setErroEnvio('Faltam respostas. Confira as perguntas marcadas.')
      return
    }
    setModalEnviarOpen(true)
  }

  const enviar = async () => {
    setModalEnviarOpen(false)
    setEnviando(true)
    try {
      await enviarRespostas(id, montarEnvio())
      navigate('/home')
    } catch (erro) {
      const status = erro.response?.status
      const detalhes = detalhesDeErro(erro)
      if (status === 409) {
        setErroEnvio('Você já participou desta pesquisa.')
      } else if (status === 400 && detalhes.length > 0) {
        const marcados = {}
        detalhes.forEach((d) => {
          if (d.pesquisa_pergunta_id) marcados[d.pesquisa_pergunta_id] = d.motivo
        })
        setProblemas(marcados)
        setErroEnvio('Corrija as perguntas marcadas e envie novamente.')
      } else {
        setErroEnvio(mensagemDeErro(erro, 'Não foi possível enviar as respostas.'))
      }
    } finally {
      setEnviando(false)
    }
  }

  const bloqueada =
    pesquisa && (pesquisa.situacao !== 'Ativa' || pesquisa.ja_respondeu)

  const textoPrazo = (() => {
    if (!pesquisa) return ''
    const dias = diasRestantes(pesquisa.data_fim)
    if (dias > 1) return `Faltam ${dias} dias para essa pesquisa ser encerrada`
    if (dias === 1) return 'Falta 1 dia para essa pesquisa ser encerrada'
    if (dias === 0) return 'Esta pesquisa encerra hoje'
    return 'Esta pesquisa já foi encerrada'
  })()

  return (
    <div className="survey-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="survey-container">
        <section className="card-borda-externa survey-header-card">
          <h1 className="survey-header-card__title">
            {pesquisa?.titulo || 'Pesquisa de clima'}
          </h1>
          <p className="survey-header-card__desc">
            {pesquisa?.descricao || 'Queremos conhecer sua experiência na Include! Esta pesquisa busca entender seu nível de satisfação, identificando pontos positivos e oportunidades de melhoria. Sua opinião é muito importante para construirmos um ambiente cada vez melhor!'}
          </p>
          {textoPrazo && (
            <span className="survey-header-card__deadline">{textoPrazo}</span>
          )}
        </section>

        {carregando && <p>Carregando pesquisa...</p>}
        {erroCarga && <p style={ESTILO_ERRO}>{erroCarga}</p>}

        {bloqueada && (
          <section className="card-borda-externa question-card">
            <h2 className="question-card__title">
              {pesquisa.ja_respondeu
                ? 'Você já participou desta pesquisa.'
                : 'Esta pesquisa não está aberta para respostas.'}
            </h2>
            <button
              type="button"
              className="survey-btn-send"
              onClick={() => navigate('/home')}
            >
              Voltar para a página inicial
            </button>
          </section>
        )}

        {!carregando && !erroCarga && !bloqueada && (
          <>
            {perguntas.map((p) => {
              const pid = p.pesquisa_pergunta_id

              if (p.tipo === 'DIRETORIA') {
                return (
                  <section key={pid} className="card-borda-externa question-card">
                    <div className="question-card__top-row">
                      <h2 className="question-card__title">{p.enunciado}</h2>
                      <Pin size={28} className="question-card__pin-icon" />
                    </div>
                    <div className="question-card__options">
                      {diretorias.map((dir) => {
                        const selecionada = respostas[pid] === dir
                        return (
                          <label
                            key={dir}
                            className="likert-option"
                            onClick={() => responder(pid, dir)}
                          >
                            <span
                              className={`likert-radio ${
                                selecionada ? 'likert-radio--selected' : ''
                              }`}
                            >
                              {selecionada && (
                                <span className="likert-radio__inner" />
                              )}
                            </span>
                            <span>{dir}</span>
                          </label>
                        )
                      })}
                    </div>
                    {problemas[pid] && <span style={ESTILO_ERRO}>{problemas[pid]}</span>}
                  </section>
                )
              }

              if (p.tipo === 'LIKERT') {
                return (
                  <section key={pid} className="card-borda-externa question-card">
                    <h2 className="question-card__title">{p.enunciado}</h2>
                    <div className="question-card__options">
                      {ESCALA_LIKERT.map((opcao) => {
                        const selecionada = respostas[pid] === opcao.valor
                        return (
                          <label
                            key={opcao.valor}
                            className="likert-option"
                            onClick={() => responder(pid, opcao.valor)}
                          >
                            <span
                              className={`likert-radio ${
                                selecionada ? 'likert-radio--selected' : ''
                              }`}
                            >
                              {selecionada && (
                                <span className="likert-radio__inner" />
                              )}
                            </span>
                            <span>{opcao.rotulo}</span>
                          </label>
                        )
                      })}
                    </div>
                    {problemas[pid] && <span style={ESTILO_ERRO}>{problemas[pid]}</span>}
                  </section>
                )
              }

              return (
                <section key={pid} className="card-borda-externa question-card">
                  <h2 className="question-card__title">{p.enunciado}</h2>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    className="builder-desc-input"
                    placeholder="Escreva sua resposta aqui"
                    value={respostas[pid] || ''}
                    onChange={(e) => responder(pid, e.target.value)}
                  />
                  {problemas[pid] && <span style={ESTILO_ERRO}>{problemas[pid]}</span>}
                </section>
              )
            })}

            <section className="card-borda-externa survey-submit-card">
              <h2 className="survey-submit-card__title">
                Deseja finalizar e enviar suas respostas?
              </h2>

              <p className="survey-submit-card__anonymity-text">
                Lembre-se: o IncludeClima adota uma política de anonimato
                durante as pesquisas. Nenhuma resposta será associada a você.
                Sinta-se seguro(a) para expressar sua opinião com sinceridade!
              </p>

              {erroEnvio && <p style={ESTILO_ERRO}>{erroEnvio}</p>}

              <div className="survey-submit-card__actions">
                <button
                  type="button"
                  className="survey-btn-send"
                  disabled={enviando}
                  onClick={abrirConfirmacao}
                >
                  {enviando ? 'Enviando...' : 'Enviar tudo'}
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
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={modalEnviarOpen}
        title="Enviar pesquisa e retornar a página inicial?"
        confirmText="Enviar"
        onConfirm={enviar}
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