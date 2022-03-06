import React, { Fragment, useEffect, useState } from "react";



/**components */
import Smtp from "../../Components/Smtp";

const ViewConfigEmail = () => {

    useEffect(() => {
        document.getElementById('title_module').innerText = "Configuracion SMTP";
    }, [])


    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <Smtp></Smtp>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default ViewConfigEmail;