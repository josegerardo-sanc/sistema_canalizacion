import React, { Fragment } from "react";
import {
    useLocation, Link
} from "react-router-dom";

const NoMatch = () => {

    let location = useLocation();
    console.log(location)
    return (
        <Fragment>
            <div style={{
                zIndex: 99999,
                position: "fixed",
                top: '0px',
                left: '0px',
                minWidth: "100vh",
                minHeight: "100vh",
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                boxSizing: "content-box"

            }}>
                <div className="text-center p-3"
                    style={{
                        position: 'relative',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {
                        location.pathname == "/ErrorverifyAccount" ?
                            (<Fragment>
                                <div className="img">
                                    <img src="/images/error-img.png" className="img-fluid" alt="" />
                                </div>
                                <h1 className="error-page mt-5"><span>403!</span></h1>
                                <h4 className="mb-4 mt-5">
                                    Lo sentimos, este enlace ya fue utilizado o es inválido.
                                </h4>
                            </Fragment>)
                            : (
                                <Fragment>
                                    <div className="img">
                                        <img src="/images/error-img.png" className="img-fluid" alt="" />
                                    </div>
                                    <h1 className="error-page mt-5"><span>404!</span></h1>
                                    <h4 className="mb-4 mt-5">
                                        Lo sentimos, página no encontrada <code>{location.pathname}</code>
                                    </h4>
                                </Fragment>
                            )
                    }
                    {/*<p className="mb-4 w-75 mx-auto">It will be as simple as Occidental in fact, it will Occidental to an English person</p>*/}
                    <Link to="/" className="btn btn-primary mb-4 waves-effect waves-light">
                        <i className="fas fa-undo"></i>
                        Regresar
                    </Link>
                </div>
            </div>
        </Fragment >
    )
}

export {
    NoMatch as default
};