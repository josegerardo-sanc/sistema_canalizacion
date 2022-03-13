import React, { Fragment, useEffect, useState } from "react";


import FormAddService from '../../../Components/Service/Add';

const ViewCatalog = (props) => {

    console.log(props)
    useEffect(() => {
        document.getElementById('title_module').innerText = "Productos y servicios";
    }, [])


    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <FormAddService {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}





export default ViewCatalog;