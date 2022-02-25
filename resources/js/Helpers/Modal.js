import React, { Fragment } from "react";


const Modal = (props) => {
    //console.log(props);
    return (
        <Fragment>
            <div
                className="modal fade modal_helper"
                tabIndex="-1" role="dialog"
                aria-labelledby="myLargeModalLabel"
                aria-hidden="true"

            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title mt-0" id="myLargeModalLabel">{props.title}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {props.children}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Modal;