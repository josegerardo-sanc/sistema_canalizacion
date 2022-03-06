import React, { Fragment, useEffect, useState } from "react";


const ViewCatalog = () => {

    useEffect(() => {
        document.getElementById('title_module').innerText = "Servicios";
    }, [])


    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <FormAddService />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

import Toggle from 'react-toggle'
import "react-toggle/style.css"
//['habitacion','promicion','salon'];
const FormAddService = () => {

    const handleActiveService = ({ target }) => {

    }

    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    {/**enabled service */}
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Servicio Activo'}</p>
                        <div className="col-md">
                            <Toggle
                                id='activeService'
                                defaultChecked={true}
                                onChange={(e) => handleActiveService(e)}
                            />
                        </div>
                    </div>
                    {/**type service */}
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Tipo (*)'}</p>
                        <select id="type_service" defaultValue={0} className="form-control">
                            <option value={0}>{'Seleccione una opción'}</option>
                            <option value={'habitacion'}>{'Habitacion'}</option>
                            <option value={'promicion'}>{'Promocion'}</option>
                            <option value={'salon'}>{'Salon'}</option>
                        </select>
                    </div>
                    {/**title */}
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Titulo (*)'}</p>
                        <InputGroup
                            id={"title"}
                            placeholder={""}
                            icon={<i className="fas fa-heading"></i>}
                        />
                    </div>
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Descripcion corta (*)'}</p>
                        <input id="description_short" type="text" className="form-control" />
                    </div>
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Descripcion larga (*)'}</p>
                        <input id="description_long" type="text" className="form-control" />
                    </div>
                    {/**precios */}
                    <div className="form-row">
                        <div className="col-md">
                            <div className="form-group">
                                <p className="font-weight-bold text-dark">{'Precio (*)'}</p>
                                <InputGroup
                                    id={"price"}
                                    placeholder={""}
                                    icon={<i className="fas fa-dollar-sign"></i>}
                                />
                            </div>
                        </div>
                        <div className="col-md">
                            <div className="form-group">
                                <p className="font-weight-bold text-dark">{'Promocion'} <small>({'opcinal'})</small></p>
                                <InputGroup
                                    id={"price"}
                                    placeholder={""}
                                    icon={<i className="fas fa-ruble-sign"></i>}
                                />
                            </div>
                        </div>
                    </div>
                    {/**servicios */}
                    <div className="form-row">
                        <div className="col-md-6">

                        </div>
                    </div>
                    {/**images */}
                </div>
            </div>
        </Fragment >
    )
}

const InputGroup = ({
    id,
    placeholder,
    icon
}) => {
    return (
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text" id={`${id}_2`}>{icon}</span>
            </div>
            <input id={id} type="text" className="form-control" placeholder={placeholder} aria-label={placeholder} aria-describedby={`${id}_2`} />
        </div>
    )
}



export default ViewCatalog;