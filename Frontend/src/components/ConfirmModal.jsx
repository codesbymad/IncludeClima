import barquinhoImg from '../assets/barquinho.png'
import './ConfirmModal.css'

export default function ConfirmModal({
  isOpen,
  title,
  confirmText,
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-modal__title">{title}</h3>

        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__btn-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="confirm-modal__btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>

        <img
          src={barquinhoImg}
          alt="Barquinho nas ondas"
          className="confirm-modal__wave-img"
        />
      </div>
    </div>
  )
}