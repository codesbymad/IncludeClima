import { useState } from 'react'
import { Trash2, PlusCircle, Plus, X, ChevronDown, Calendar } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import './Pesquisa.css'

// Formata números digitados automaticamente para: DD/MM/AAAA - DD/MM/AAAA
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

// Verifica se uma data DD/MM/AAAA existe de verdade no calendário
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

// Valida o período completo digitado pelo usuário
function validarPeriodoTexto(texto) {
  const numeros = texto.replace(/\D/g, '')
  if (numeros.length === 0) return ''

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Valida a primeira data assim que tiver 8 dígitos (DDMMAAAA)
  if (numeros.length >= 8) {
    const d1 = validarDataReal(
      numeros.slice(0, 2),
      numeros.slice(2, 4),
      numeros.slice(4, 8)
    )
    if (!d1) {
      return 'Data de início inválida. Verifique o dia e o mês informados.'
    }
    if (d1 < hoje) {
      return 'A data de início não pode ser uma data que já passou.'
    }

    // Valida a segunda data quando completar os 16 dígitos
    if (numeros.length === 16) {
      const d2 = validarDataReal(
        numeros.slice(8, 10),
        numeros.slice(10, 12),
        numeros.slice(12, 16)
      )
      if (!d2) {
        return 'Data de finalização inválida. Verifique o dia e o mês informados.'
      }
      if (d2 < d1) {
        return 'A data de finalização deve ser igual ou posterior à data de início.'
      }
    }
  }

  return ''
}

export default function CriarPesquisa() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [erroData, setErroData] = useState('')
  const [menuTipoAbertoId, setMenuTipoAbertoId] = useState(null)

  const [perguntas, setPerguntas] = useState([
    {
      id: 1,
      titulo: '',
      tipo: 'multipla', // 'multipla' ou 'texto'
      opcoes: ['Opção 1'],
      obrigatoria: false,
    },
  ])

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
        tipo: 'multipla',
        opcoes: ['Opção 1'],
        obrigatoria: false,
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

  const adicionarOpcao = (id) => {
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, opcoes: [...p.opcoes, `Opção ${p.opcoes.length + 1}`] }
          : p
      )
    )
  }

  const atualizarOpcao = (perguntaId, indexOpcao, valor) => {
    setPerguntas((prev) =>
      prev.map((p) => {
        if (p.id !== perguntaId) return p
        const novasOpcoes = [...p.opcoes]
        novasOpcoes[indexOpcao] = valor
        return { ...p, opcoes: novasOpcoes }
      })
    )
  }

  const removerOpcao = (perguntaId, indexOpcao) => {
    setPerguntas((prev) =>
      prev.map((p) => {
        if (p.id !== perguntaId || p.opcoes.length <= 1) return p
        return {
          ...p,
          opcoes: p.opcoes.filter((_, idx) => idx !== indexOpcao),
        }
      })
    )
  }

  const alternarObrigatoria = (id) => {
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, obrigatoria: !p.obrigatoria } : p
      )
    )
  }

  return (
    <div className="survey-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="survey-container">
        {/* Card de Cabeçalho do Formuláriow */}
        <section className="card-borda-externa builder-header-card">
          <input
            type="text"
            className="builder-title-input"
            placeholder="Formulário sem título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="text"
            className="builder-desc-input"
            placeholder="Adicione descrição ao formulário"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div className="builder-date-wrapper">
            <div className="builder-date-field">
              <Calendar size={22} color="#AD330E" />
              <input
                type="text"
                className="builder-date-input"
                placeholder="Data de início - data de finalização (ex: 12/11/2026 - 30/11/2026)"
                value={periodo}
                onChange={handlePeriodoChange}
              />
            </div>
            {erroData && <span className="builder-date-error">{erroData}</span>}
          </div>
        </section>

        {/* Cards de Edição de Perguntas */}
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
              </div>

              {/* Bandeja seletora de tipo de pergunta */}
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
                      {pergunta.tipo === 'multipla'
                        ? 'Multipla escolha'
                        : 'Resposta aberta'}
                    </span>
                  </div>
                  <ChevronDown size={22} color="#444444" />
                </button>

                {menuTipoAbertoId === pergunta.id && (
                  <div className="builder-type-menu">
                    <button
                      type="button"
                      className={`builder-type-menu__item ${
                        pergunta.tipo === 'multipla'
                          ? 'builder-type-menu__item--active'
                          : ''
                      }`}
                      onClick={() =>
                        alterarTipoPergunta(pergunta.id, 'multipla')
                      }
                    >
                      <span className="builder-type-radio" />
                      <span>Multipla escolha (Escala)</span>
                    </button>
                    <button
                      type="button"
                      className={`builder-type-menu__item ${
                        pergunta.tipo === 'texto'
                          ? 'builder-type-menu__item--active'
                          : ''
                      }`}
                      onClick={() => alterarTipoPergunta(pergunta.id, 'texto')}
                    >
                      <span className="builder-type-radio" />
                      <span>Resposta aberta (Qualitativa)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo dinâmico conforme o tipo selecionado */}
            {pergunta.tipo === 'multipla' ? (
              <div className="builder-options-list">
                {pergunta.opcoes.map((opcao, idx) => (
                  <div key={idx} className="builder-option-row">
                    <span className="builder-option-circle" />
                    <input
                      type="text"
                      className="builder-option-input"
                      value={opcao}
                      onChange={(e) =>
                        atualizarOpcao(pergunta.id, idx, e.target.value)
                      }
                    />
                    {pergunta.opcoes.length > 1 && (
                      <button
                        type="button"
                        className="builder-remove-option-btn"
                        onClick={() => removerOpcao(pergunta.id, idx)}
                        title="Remover esta opção"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="builder-add-option-btn"
                  onClick={() => adicionarOpcao(pergunta.id)}
                >
                  <PlusCircle size={22} />
                  <span>Adicionar nova opção</span>
                </button>
              </div>
            ) : (
              <div className="builder-open-text-preview">
                Texto de resposta aberta (o membro digitará sua resposta aqui)
              </div>
            )}

            <div className="builder-question-footer">
              <div className="builder-footer-left">
                <button
                  type="button"
                  className="builder-delete-btn"
                  onClick={() => removerPergunta(pergunta.id)}
                  title="Excluir pergunta inteira"
                >
                  <Trash2 size={28} />
                </button>

                <div
                  className="builder-required-toggle"
                  onClick={() => alternarObrigatoria(pergunta.id)}
                >
                  <div
                    className={`toggle-track ${
                      pergunta.obrigatoria ? 'toggle-track--active' : ''
                    }`}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <span>Obrigatório</span>
                </div>
              </div>

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
      </main>
    </div>
  )
}