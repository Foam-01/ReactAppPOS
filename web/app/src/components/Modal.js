function Modal(props) {
  let modalSize = "modal-dialog";

  if (props.modalSize) {
    modalSize += " " + props.modalSize;
  }
  return (
    <>
      <div
        className="modal "
        id={props.id}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className={modalSize}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {props.title}
              </h5>
              <button
                id="btnModalclose "
                type="button"
                className="btn-close btnClose"
                data-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{props.children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
