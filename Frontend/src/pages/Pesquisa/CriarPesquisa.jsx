  import { useEffect, useState } from 'react'
  import { useNavigate, useLocation } from 'react-router-dom'
  import { Trash2, Plus, ChevronDown, Calendar, Pin } from 'lucide-react'
  import {
    reaplicarPesquisa,
    criarPesquisa,
    listarDiretorias,
    listarPerguntas,
    listarEixos,
  } from '../../services/pesquisaService'
  import { lerPeriodo } from '../../utils/periodo'
  import { mensagemDeErro } from '../../utils/erros'
  import { ESCALA_LIKERT } from '../../utils/escala'
  import Header from '../../components/Header'
  import Sidebar from '../../components/Sidebar'
  import ConfirmModal from '../../components/ConfirmModal'
  import './Pesquisa.css'

  function formatarPeriodo(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 16)
    let resultado = ''

    for (let i = 0; i < numeros.length; i++) {
      if (i === 2 || i === 4) resultado += '/'
      if (i === 8) resultado += ' - '
      if (i === 10 || i === 12) resultado += '/'
      resultado += numeros[i]
    }
    return resultado
  }

  function validarDataReal(diaStr, mesStr, anoStr) {
    const dia = parseInt(diaStr, 10)
    const mes = parseInt(mesStr, 10)
    const ano = parseInt(anoStr, 10)

    if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 2024) {
      return null
    }

    const dataObj = new Date(ano, mes - 1, dia)

    if (
      dataObj.getFullYear() !== ano ||
      dataObj.getMonth() !== mes - 1 ||
      dataObj.getDate() !== dia
    ) {
      return null
    }

    return dataObj
  }

  function validarPeriodoTexto(texto) {
    const numeros = texto.replace(/\D/g, '')
    if (numeros.length === 0) return ''

    if (numeros.length >= 8) {
      const d1 = validarDataReal(
        numeros.slice(0, 2),
        numeros.slice(2, 4),
        numeros.slice(4, 8)
      )

      if (!d1) return 'Data de início inválida. Verifique o dia e o mês.'

      if (numeros.length === 16) {
        const d2 = validarDataReal(
          numeros.slice(8, 10),
          numeros.slice(10, 12),
          numeros.slice(12, 16)
        )

        if (!d2) return 'Data de finalização inválida. Verifique o dia e o mês.'

        if (d2 < d1) {
          return 'A data de finalização deve ser igual ou posterior à data de início.'
        }
      }
    }

    return ''
  }

  export default function CriarPesquisa() {
    const navigate = useNavigate()
    const location = useLocation()

    const [diretorias, setDiretorias] = useState([])
    const [eixos, setEixos] = useState([])

    useEffect(() => {
      listarDiretorias()
        .then(setDiretorias)
        .catch(() => setDiretorias([]))
    }, [])

    useEffect(() => {
      listarEixos()
        .then(setEixos)
        .catch(() => setEixos([]))
    }, [])

    const dadosReaplicacao = location.state?.reaplicar || null

    const ID_PESQUISA_MODELO = 3

    const [perguntas, setPerguntas] = useState(
      dadosReaplicacao?.perguntas || [
        {
          id: 1,
          titulo: '',
          tipo: 'LIKERT',
          eixo: 'Personalizado'
        },
      ]
    )

    const [erroPublicar, setErroPublicar] = useState('')

    useEffect(() => {
      if (dadosReaplicacao) return

      listarPerguntas(ID_PESQUISA_MODELO)
        .then((dados) => {
          setPerguntas(
            dados
              .filter((pergunta) => pergunta.tipo !== 'DIRETORIA')
              .map((pergunta) => ({
                id: pergunta.pesquisa_pergunta_id,
                titulo: pergunta.enunciado,
                tipo: pergunta.tipo,
                eixo: pergunta.eixo,
              }))
          )
        })
        .catch(() => {
          setErroPublicar(
            'Não foi possível carregar o questionário padrão.'
          )
        })
    }, [dadosReaplicacao])

    const [publicando, setPublicando] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [titulo, setTitulo] = useState(
      dadosReaplicacao ? dadosReaplicacao.titulo : ''
    )

    const [descricao, setDescricao] = useState(
      dadosReaplicacao ? dadosReaplicacao.descricao : ''
    )

    const [periodo, setPeriodo] = useState('')
    const [erroData, setErroData] = useState('')
    const [menuTipoAbertoId, setMenuTipoAbertoId] = useState(null)
    const [modalCancelarOpen, setModalCancelarOpen] = useState(false)

    const handlePeriodoChange = (e) => {
      const formatado = formatarPeriodo(e.target.value)
      setPeriodo(formatado)
      setErroData(validarPeriodoTexto(formatado))
    }

    const adicionarPergunta = () => {
      setPerguntas((prev) => [
        ...prev,
        {
          id: Date.now(),
          titulo: '',
          tipo: 'LIKERT',
          eixo: 'Personalizado'
        },
      ])
    }

    const removerPergunta = (id) => {
      if (perguntas.length === 1) return

      setPerguntas((prev) => prev.filter((p) => p.id !== id))
    }

    const atualizarTituloPergunta = (id, novoTitulo) => {
      setPerguntas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, titulo: novoTitulo } : p))
      )
    }

    const alterarTipoPergunta = (id, novoTipo) => {
      setPerguntas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, tipo: novoTipo } : p))
      )

      setMenuTipoAbertoId(null)
    }

    const alterarEixoPergunta = (id, novoEixo) => {
      setPerguntas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, eixo: novoEixo } : p))
      )
    }

    const publicar = async () => {
      setErroPublicar('')

      if (!titulo.trim()) {
        return setErroPublicar('Informe o título da pesquisa.')
      }

      if (!descricao.trim()) {
        return setErroPublicar('Informe a descrição da pesquisa.')
      }

      const intervalo = lerPeriodo(periodo)

      if (intervalo.erro) {
        return setErroPublicar(intervalo.erro)
      }

      if (
      perguntas.some(
        (pergunta) =>
          !pergunta.titulo.trim() ||
          !pergunta.eixo ||
          !pergunta.tipo
      )
    ) {
      return setErroPublicar(
        'Preencha todas as perguntas e selecione seus eixos.'
      )
    }

      setPublicando(true)

      try {
        if (dadosReaplicacao?.idOrigem) {
          await reaplicarPesquisa(dadosReaplicacao.idOrigem, {
            descricao: descricao.trim(),
            data_inicio: intervalo.data_inicio,
            data_fim: intervalo.data_fim,
          })
        } else {
          await criarPesquisa({
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            ...intervalo,
            perguntas: perguntas.map((pergunta) => ({
              enunciado: pergunta.titulo.trim(),
              tipo: pergunta.tipo,
              eixo: pergunta.eixo,
            })),
          })
        }

        navigate('/home')
      } catch (erro) {
        setErroPublicar(
          mensagemDeErro(erro, 'Não foi possível publicar a pesquisa.')
        )
      } finally {
        setPublicando(false)
      }
    }

    return (
      <div className="survey-page">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="survey-container">
          <section className="card-borda-externa builder-header-card">
            <input
              type="text"
              className="builder-title-input"
              placeholder="Formulário sem título"
              value={titulo}
              readOnly={Boolean(dadosReaplicacao)}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <textarea
              rows={dadosReaplicacao ? 3 : 1}
              className="builder-desc-input"
              placeholder="Adicione descrição ao formulário"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <div className="builder-date-wrapper">
              <div className="builder-date-field">
                <Calendar size={20} color="#FA4A15" />

                <input
                  type="text"
                  className="builder-date-input"
                  placeholder="Data de inicio - data de finalização"
                  value={periodo}
                  onChange={handlePeriodoChange}
                />
              </div>

              {erroData && (
                <span className="builder-date-error">{erroData}</span>
              )}
            </div>
          </section>

          <section className="card-borda-externa question-card">
            <div className="question-card__top-row">
              <h2 className="question-card__title">
                Qual sua área de atuação/ diretoria na Include?
              </h2>

              <Pin size={28} className="question-card__pin-icon" />
            </div>

            <div className="question-card__options">
              {diretorias.map((dir) => (
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

          {!dadosReaplicacao && (
            <p>
              O questionário é editável e pode ser personalizado conforme os objetivos de cada pesquisa. As perguntas exibidas são apenas um modelo de exemplo para auxiliar na criação.
            </p>
          )}

          {perguntas.map((pergunta) => (
            <section
              key={pergunta.id}
              className="card-borda-externa builder-question-card"
            >
              <div className="builder-question-top">
                <div className="builder-question-input-wrap">
                  <input
                    type="text"
                    className="builder-question-input"
                    placeholder="Pergunta sem título"
                    value={pergunta.titulo}
                    readOnly={Boolean(dadosReaplicacao)}
                    onChange={(e) =>
                      atualizarTituloPergunta(pergunta.id, e.target.value)
                    }
                  />

                  {!dadosReaplicacao && (
                    <button
                      type="button"
                      className="builder-inline-trash-btn"
                      onClick={() => removerPergunta(pergunta.id)}
                      title="Excluir pergunta"
                    >
                      <Trash2 size={24} />
                    </button>
                  )}
                </div>

                <div className="builder-type-dropdown-wrap">
                  {dadosReaplicacao ? (
                    <div className="builder-type-badge">
                      <div className="builder-type-badge__left">
                        <span className="builder-type-radio" />

                        <span>
                          {pergunta.tipo === 'LIKERT'
                            ? 'Múltipla escolha'
                            : 'Texto aberto'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="builder-type-badge"
                        onClick={() =>
                          setMenuTipoAbertoId(
                            menuTipoAbertoId === pergunta.id
                              ? null
                              : pergunta.id
                          )
                        }
                      >
                        <div className="builder-type-badge__left">
                          <span className="builder-type-radio" />

                          <span>
                            {pergunta.tipo === 'LIKERT'
                              ? 'Múltipla escolha'
                              : 'Texto aberto'}
                          </span>
                        </div>

                        <ChevronDown size={22} color="#333333" />
                      </button>

                      {menuTipoAbertoId === pergunta.id && (
                        <div className="builder-type-menu">
                          <button
                            type="button"
                            className={`builder-type-menu__item ${
                              pergunta.tipo === 'LIKERT'
                                ? 'builder-type-menu__item--active'
                                : ''
                            }`}
                            onClick={() =>
                              alterarTipoPergunta(pergunta.id, 'LIKERT')
                            }
                          >
                            <span className="builder-type-radio" />
                            <span>Múltipla escolha</span>
                          </button>

                          <button
                            type="button"
                            className={`builder-type-menu__item ${
                              pergunta.tipo === 'TEXTO'
                                ? 'builder-type-menu__item--active'
                                : ''
                            }`}
                            onClick={() =>
                              alterarTipoPergunta(pergunta.id, 'TEXTO')
                            }
                          >
                            <span className="builder-type-radio" />
                            <span>Texto aberto (Qualitativa)</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                  {!dadosReaplicacao && (
                  <div className="builder-axis-select-wrap">
                    <select
                      className="builder-axis-select"
                      value={pergunta.eixo || 'Personalizado'}
                      onChange={(e) =>
                        alterarEixoPergunta(pergunta.id, e.target.value)
                      }
                    >
                      {eixos.map((eixo) => (
                        <option key={eixo} value={eixo}>
                          {eixo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              <div className="builder-question-body-row">
                {pergunta.tipo === 'LIKERT' ? (
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
                    Resposta qualitativa aberta (o membro digitará seus desafios e
                    experiências)
                  </div>
                )}

                {!dadosReaplicacao && (
                  <button
                    type="button"
                    className="builder-new-question"
                    onClick={adicionarPergunta}
                  >
                    <span className="builder-new-question__label">
                      Nova pergunta
                    </span>

                    <span className="builder-new-question__circle">
                      <Plus size={30} strokeWidth={2.5} />
                    </span>
                  </button>
                )}
              </div>
            </section>
          ))}

          <div className="builder-bottom-actions">
            {erroPublicar && (
              <p style={{ color: '#B00020' }}>{erroPublicar}</p>
            )}

            <button
              type="button"
              className="builder-btn-cancel"
              onClick={() => setModalCancelarOpen(true)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="builder-btn-publish"
              onClick={publicar}
              disabled={publicando}
            >
              {publicando ? 'Publicando...' : 'Publicar Pesquisa'}
            </button>
          </div>
        </main>

        <ConfirmModal
          isOpen={modalCancelarOpen}
          title="Cancelar criação de pesquisa? seus dados serão apagado"
          confirmText="Continuar criação"
          cancelText="Cancelar e apagar"
          onConfirm={() => setModalCancelarOpen(false)}
          onCancel={() => {
            setModalCancelarOpen(false)
            navigate('/home')
          }}
        />
      </div>
    )
  }