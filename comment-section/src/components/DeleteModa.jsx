function DeleteModal({ isModalOpen, onClose, onConfirm }) {
  return (
    isModalOpen && (
      <>
        <div className="backdrop"></div>
        <div className="modal">
          <div className="modal_content">
            <h2>Delete Comment</h2>
            <p>
              Are you sure you want to delete this comment? this will remove it
              and it can not be undone
            </p>
            <div className="btns">
              <button onClick={onClose} className="cancel">
                NO,CANCEL
              </button>
              <button onClick={onConfirm} className="confirm">
                YES,DELETE
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default DeleteModal;
