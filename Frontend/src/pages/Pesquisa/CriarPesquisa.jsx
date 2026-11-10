import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Trash2, Plus, ChevronDown, Calendar, Pin } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import './Pesquisa.css'

const DIRETORIAS_FIXAS = [
  'Presidência',
  'Projetos',
  'Comercial',
  'Marketing',
  'Gestão de Pessoas',
  'Financeiro',
]

const ESCALA_LIKERT_FIXA = [
  'Muito insatisfeito(a)',
  'Insatisfeito(a)',
  'Neutro',
  'Satisfeito(a)',
  'Muito satisfeito(a)',
]

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
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 2024) return null
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

  // Verifica se veio do botão "Reaplicar pesquisa" da tela de Resultados
  const dadosReaplicacao = location.state?.reaplicar || null

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

  const [perguntas, setPerguntas] = useState(
    dadosReaplicacao?.perguntas || [
      {
        id: 1,
        titulo: '',
        tipo: 'LIKERT', // 'LIKERT' (Múltipla escolha) ou 'TEXTO' (Qualitativa)
      },
    ]
  )

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

  return (
    <div className="survey-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="survey-container">
        {/* Card de Cabeçalho do Formulário */}
        <section className="card-borda-externa builder-header-card">
          <input
            type="text"
            className="builder-title-input"
            placeholder="Formulário sem título"
            value={titulo}
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
            {erroData && <span className="builder-date-error">{erroData}</span>}
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
            {DIRETORIAS_FIXAS.map((dir) => (
              <div key={dir} className="likert-option likert-option--disabled">
                <span className="likert-radio" />
                <span>{dir}</span>
              </div>
            ))}
          </div>
        </section>

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
                  onChange={(e) =>
                    atualizarTituloPergunta(pergunta.id, e.target.value)
                  }
                />
                <button
                  type="button"
                  className="builder-inline-trash-btn"
                  onClick={() => removerPergunta(pergunta.id)}
                  title="Excluir pergunta"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              {/* Bandeja Múltipla escolha / Qualitativa */}
              <div className="builder-type-dropdown-wrap">
                <button
                  type="button"
                  className="builder-type-badge"
                  onClick={() =>
                    setMenuTipoAbertoId(
                      menuTipoAbertoId === pergunta.id ? null : pergunta.id
                    )
                  }
                >
                  <div className="builder-type-badge__left">
                    <span className="builder-type-radio" />
                    <span>
                      {pergunta.tipo === 'LIKERT'
                        ? 'Multipla escolha'
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
                      onClick={() => alterarTipoPergunta(pergunta.id, 'LIKERT')}
                    >
                      <span className="builder-type-radio" />
                      <span>Multipla escolha</span>
                    </button>
                    <button
                      type="button"
                      className={`builder-type-menu__item ${
                        pergunta.tipo === 'TEXTO'
                          ? 'builder-type-menu__item--active'
                          : ''
                      }`}
                      onClick={() => alterarTipoPergunta(pergunta.id, 'TEXTO')}
                    >
                      <span className="builder-type-radio" />
                      <span>Texto aberto (Qualitativa)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="builder-question-body-row">
              {pergunta.tipo === 'LIKERT' ? (
                <div className="question-card__options">
                  {ESCALA_LIKERT_FIXA.map((opcao) => (
                    <div
                      key={opcao}
                      className="likert-option likert-option--disabled"
                    >
                      <span className="likert-radio" />
                      <span>{opcao}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="builder-open-text-preview">
                  Resposta qualitativa aberta (o membro digitará seus desafios e
                  experiências)
                </div>
              )}

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
            </div>
          </section>
        ))}

        {/* Botões inferiores de Cancelar e Publicar Pesquisa */}
        <div className="builder-bottom-actions">
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
            onClick={() => navigate('/home')}
          >
            Publicar Pesquisa
          </button>
        </div>
      </main>

      {/* Pop-up do Figma: "Cancelar criação de pesquisa? seus dados serão apagado" */}
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