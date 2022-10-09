import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";

import { handleAlertMessage } from '../Redux/Actions/AlertMessage'

//resources/js/Redux/Actions/fetchRequest.js
//'showMessage': falseo culta el mensaje cuando el status 200 en el fetRequest Global

const AlertMessage = ({ AlertMessage, handleAlertMessage }) => {

    const handleClose = () => {
        handleAlertMessage({
            showMessage: false
        });
    }

    //console.log(AlertMessage);
    if (AlertMessage.showMessage) {
        return (
            <Fragment>
                <div className={`alert alert-${AlertMessage.type} alert-dismissible fade show`} role="alert">
                    <ul className="list-group">
                        {AlertMessage.message.map(item => (<li key={item}>{item}</li>))}
                    </ul>
                    <button type="button" className="close" onClick={handleClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </Fragment >
        )
    }
    return <Fragment>
        <div style={{ minHeight: '30px' }}>

        </div>
    </Fragment>;
}
const mapStateToProps = ({ AlertMessage }) => {
    return {
        AlertMessage
    }
}

const mapDispatchToProps = {
    handleAlertMessage
}


export default connect(mapStateToProps, mapDispatchToProps)(AlertMessage);