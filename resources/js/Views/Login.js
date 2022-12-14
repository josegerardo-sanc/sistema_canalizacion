import React, { Fragment, useState, useEffect } from "react";
import {
    useLocation
} from "react-router-dom";
/*Componets */
import Login from '../Components/Auth/Login';
import Preloader from "../Helpers/Preloader";

import logo from '../Components/Layout/logo-large.svg'

/**styles */
import './style.css'
const ViewLogin = () => {

    let location = useLocation();
    console.log(location);
    const searchParams = new URLSearchParams(location.search)

    return (
        <Fragment>
            <Preloader></Preloader>
            <div className="containerLogin">
                <div className="row justify-content-center align-center centerLogin">
                    <div className="bg-white col-lg-6 col-xl-4">
                        <div className="bg-login text-center">
                            <div className="bg-login-overlay"></div>
                            <div className="position-relative">
                                <h5 className="text-white font-size-20">Bienvenido de nuevo </h5>
                                <p className="text-white-50 mb-0">Inicie sesión para continuar.</p>
                                <a href="index" className="logo logo-admin mt-4">
                                    <img src={logo} alt="logo" height="140" style={{
                                        borderRadius: "7px"
                                    }} />
                                </a>
                            </div>
                        </div>
                        <div className="p-4">
                            {
                                searchParams.has('message') && (
                                    <Fragment>
                                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                                            <strong>{searchParams.get('message')}</strong>
                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                    </Fragment>
                                )
                            }
                            <Login></Login>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default ViewLogin;