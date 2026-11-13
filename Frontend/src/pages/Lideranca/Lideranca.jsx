import { useState, useEffect } from 'react'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { alterarLider, listarLideres } from '../../services/pesquisaService'
import { mensagemDeErro } from '../../utils/erros'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import ConfirmModal from '../../components/ConfirmModal'
import patinhoLider from '../../assets/patinho-lider.png'
import barquinhoImg from '../../assets/barquinho.png'
import './Lideranca.css'

export default function Lideranca() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lideres, setLideres] = useState([])
  const [erroLista, setErroLista] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    listarLideres()
      .then(setLideres)
      .catch((e) =>
        setErroLista(mensagemDeErro(e, 'Não foi possível carregar os líderes.'))
      )
      .finally(() => setCarregando(false))
  }, [])

  const [liderSelecionado, setLiderSelecionado] = useState(null)
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false)
  const [modalAdicionarOpen, setModalAdicionarOpen] = useState(false)
  const [novoEmail, setNovoEmail] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')

  const abrirModalExcluir = (lider) => {
    setLiderSelecionado(lider)
    setModalExcluirOpen(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!liderSelecionado || processando) return
    setProcessando(true)
    try {
      await alterarLider(liderSelecionado.email, false)
      setLideres(await listarLideres())
      setErroLista('')
    } catch (erro) {
      setErroLista(mensagemDeErro(erro, 'Não foi possível remover a liderança.'))
    } finally {
      setProcessando(false)
      setModalExcluirOpen(false)
      setLiderSelecionado(null)
    }
  }

  const handleAdicionarLider = async (e) => {
    e.preventDefault()
    if (processando) return
    const emailLimpo = novoEmail.trim().toLowerCase()
    if (!emailLimpo || !emailLimpo.includes('@')) {
      setMensagemErro('Informe um e-mail válido.')
      return
    }
    setProcessando(true)
    try {
      await alterarLider(emailLimpo, true)
      setLideres(await listarLideres())
      setNovoEmail('')
      setMensagemErro('')
      setModalAdicionarOpen(false)
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro, 'Não foi possível adicionar a liderança.'))
    } finally {
      setProcessando(false)
    }
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

        {erroLista && <p>{erroLista}</p>}

        {carregando && <p>Carregando líderes...</p>}

        {!carregando && !erroLista && lideres.length === 0 && (
          <p>Nenhum líder cadastrado.</p>
        )}

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
        title={`Remover a liderança de ${liderSelecionado?.nome || 'este usuário'}? A conta será mantida.`}
        confirmText="Remover liderança"
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
                <button
                  type="submit"
                  className="add-leader-modal__btn-submit"
                  disabled={processando}
                >
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