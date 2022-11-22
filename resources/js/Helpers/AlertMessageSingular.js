import React, { Fragment, useEffect, useState } from "react";


//resources/js/Redux/Actions/fetchRequest.js
//'showMessage': falseo culta el mensaje cuando el status 200 en el fetRequest Global

const AlertMessageSingular = (
    response
) => {



    const [alertMessage, setAlertMessage] = useState({ showMessage: false })

    const handleClose = () => {
        setAlertMessage({
            showMessage: false
        });
    }


    useEffect(() => {


        if (response.hasOwnProperty('status')) {

            let showMessageRequest = response.status == 200 ? false : true;
            let messages = response.message || "";
            let messages_array = [];

            messages_array.push(messages);

            if (response.status != 200) {
                if (response.errors) {
                    messages_array = []
                    for (const key in response.errors) {
                        messages_array.push(response.errors[key]);
                    }
                }
                if (response.errorImport) {
                    messages_array = [];
                    for (const item of response.errorImport) {
                        console.log(item.value ?? email);
                        let messageImport = `Fila:${item.row} columna:${item.attribute} , ${item.value.email} , ${item.error}`;
                        messages_array.push(messageImport);
                    }
                }
            }
            setAlertMessage({
                message: messages_array,
                type: response.status != 200 ? 'warning' : 'success',
                showMessage: true
            });
        } else {
            setAlertMessage({
                showMessage: false
            });
        }

    }, [response])

    if (alertMessage.showMessage) {
        return (
            <Fragment>
                <div className={`alert alert-${alertMessage.type} alert-dismissible fade show`} role="alert">
                    <ul className="list-group">
                        {alertMessage.message.map(item => (<li key={item}>{item}</li>))}
                    </ul>
                    <button type="button" className="close" onClick={handleClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </Fragment >
        )
    }

    return ''
}




export default AlertMessageSingular;