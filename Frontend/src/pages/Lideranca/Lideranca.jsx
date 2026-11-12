import { useState, useEffect } from 'react'
import { PlusCircle, ArrowRight } from 'lucide-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../services/api'
import patinhoLider from '../../assets/patinho-lider.png'
import barquinhoImg from '../../assets/barquinho.png'
import './Lideranca.css'

const LIDERES_INICIAIS = [
  {
    id: 1,
    nome: 'Letícia Portela Gonçalves',
    email: 'leticia.portgon@alu.ufc.br',
  },
  {
    id: 2,
    nome: 'Rodrigo Ribeiro Diogenis',
    email: 'rodrib.dio@alu.ufc.br',
  },
  {
    id: 3,
    nome: 'Pedro Ricardo Feitosa',
    email: 'Pedrinho_feitosa@alu.ufc.br',
  },
]

export default function Lideranca() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lideres, setLideres] = useState(() => {
    const salvos = localStorage.getItem('includeclima_lideres')
    return salvos ? JSON.parse(salvos) : LIDERES_INICIAIS
  })

  const [liderSelecionado, setLiderSelecionado] = useState(null)
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false)
  const [modalAdicionarOpen, setModalAdicionarOpen] = useState(false)
  const [novoEmail, setNovoEmail] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')

  // Sincroniza a lista local no navegador
  useEffect(() => {
    localStorage.setItem('includeclima_lideres', JSON.stringify(lideres))
  }, [lideres])

  // Abre o modal de confirmação para remover liderança
  const abrirModalExcluir = (lider) => {
    setLiderSelecionado(lider)
    setModalExcluirOpen(true)
  }

  // Chama PATCH /usuarios/lider com isLider: false
  const handleConfirmarExclusao = async () => {
    if (!liderSelecionado) return

    try {
      await api.patch('/usuarios/lider', {
        email: liderSelecionado.email,
        isLider: false,
      })
    } catch {
      // Mantém a atualização na interface mesmo se o back-end estiver offline
    }

    setLideres((prev) =>
      prev.filter((item) => item.email !== liderSelecionado.email)
    )
    setModalExcluirOpen(false)
    setLiderSelecionado(null)
  }

  // Chama PATCH /usuarios/lider com isLider: true
  const handleAdicionarLider = async (e) => {
    e.preventDefault()
    const emailLimpo = novoEmail.trim()

    if (!emailLimpo || !emailLimpo.includes('@')) {
      setMensagemErro('Informe um e-mail válido.')
      return
    }

    let nomeRetornado = emailLimpo
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

    try {
      const res = await api.patch('/usuarios/lider', {
        email: emailLimpo,
        isLider: true,
      })
      if (res.data?.nome) {
        nomeRetornado = res.data.nome
      }
    } catch (error) {
      if (error.response?.data?.erro) {
        setMensagemErro(error.response.data.erro)
        return
      }
    }

    setLideres((prev) => {
      if (prev.some((l) => l.email.toLowerCase() === emailLimpo.toLowerCase())) {
        return prev
      }
      return [
        ...prev,
        {
          id: Date.now(),
          nome: nomeRetornado,
          email: emailLimpo,
        },
      ]
    })

    setNovoEmail('')
    setMensagemErro('')
    setModalAdicionarOpen(false)
  }

  return (
    <div className="leadership-page">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="leadership-container">
        {/* Topo com título e botão de Novo Líder */}
        <div className="leadership-top-bar">
          <h1 className="leadership-title">Listagem de Atuais Líderes</h1>

          <button
            type="button"
            className="leadership-add-btn"
            onClick={() => {
              setNovoEmail('')
              setMensagemErro('')
              setModalAdicionarOpen(true)
            }}
          >
            <span className="leadership-add-btn__label">Novo Líder</span>
            <PlusCircle size={38} strokeWidth={1.8} color="#FFFFFF" />
          </button>
        </div>

        {/* Lista de cards de líderes */}
        <div className="leadership-list">
          {lideres.map((lider) => (
            <div key={lider.id} className="leader-card">
              <div className="leader-card__left">
                <img
                  src={patinhoLider}
                  alt="Mascote Líder"
                  className="leader-card__avatar"
                />
                <div className="leader-card__info">
                  <h2 className="leader-card__name">{lider.nome}</h2>
                  <p className="leader-card__email">Email: {lider.email}</p>
                </div>
              </div>

              <button
                type="button"
                className="leader-card__arrow-btn"
                onClick={() => abrirModalExcluir(lider)}
                title="Gerenciar liderança"
              >
                <ArrowRight size={38} strokeWidth={2} color="#000000" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de confirmação para remover líder */}
      <ConfirmModal
        isOpen={modalExcluirOpen}
        title="Deseja excluir este Líder?"
        confirmText="Excluir Liderança"
        cancelText="Cancelar"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => {
          setModalExcluirOpen(false)
          setLiderSelecionado(null)
        }}
      />

      {/* Modal para adicionar novo líder */}
      {modalAdicionarOpen && (
        <div
          className="confirm-modal-overlay"
          onClick={() => setModalAdicionarOpen(false)}
        >
          <div
            className="add-leader-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="add-leader-modal__title">
              Nova Liderança para os piratas!
            </h3>

            <form
              className="add-leader-modal__form"
              onSubmit={handleAdicionarLider}
            >
              <label className="add-leader-modal__label">Email:</label>
              <input
                type="email"
                className="add-leader-modal__input"
                value={novoEmail}
                onChange={(e) => {
                  setNovoEmail(e.target.value)
                  setMensagemErro('')
                }}
              />
              {mensagemErro && (
                <span className="add-leader-modal__error">{mensagemErro}</span>
              )}

              <div className="add-leader-modal__actions">
                <button type="submit" className="add-leader-modal__btn-submit">
                  Adicionar nova liderança
                </button>
                <button
                  type="button"
                  className="add-leader-modal__btn-cancel"
                  onClick={() => setModalAdicionarOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>

            <img
              src={barquinhoImg}
              alt="Barquinho nas ondas"
              className="confirm-modal__wave-img"
            />
          </div>
        </div>
      )}
    </div>
  )
}