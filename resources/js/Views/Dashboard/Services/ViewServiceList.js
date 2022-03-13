import React, { Fragment, useEffect, useState } from "react";


import ListServices from '../../../Components/Service/List';

const ViewServiceList = () => {

    useEffect(() => {
        document.getElementById('title_module').innerText = "Lista de productos y servicios";
    }, [])


    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <ListServices />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}





export default ViewServiceList;