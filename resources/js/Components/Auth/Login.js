import React, { useState, useEffect, Fragment } from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'

/**actions redux */
import { saveSesionAuth } from '../../Redux/Actions/Auth'
import { fetchRequest } from '../../Redux/Actions/fetchRequest'
/**configurations */
import { pathApi } from '../../env'

/**helpers */
import AlertMessage from "../../Helpers/AlertMessage";
import Preloader from "../../Helpers/Preloader";

const Login = ({
    saveSesionAuth,
    fetchRequest
}) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});

    const handleChange = (e) => {

        //console.log(e.target.type, e.target.checked);
        if (e.target.type == "checkbox") {
            setData({
                ...data,
                [e.target.name]: e.target.checked
            });
        } else {
            setData({
                ...data,
                [e.target.name]: e.target.value
            });
        }
    };


    const handleonKeyPress = (ev) => {
        if (ev.key === 'Enter') {
            handleClickSubmit();
        }
    }


    const handleClickSubmit = async () => {
        let request = {
            'url': `${pathApi}/authenticate`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            },
            'showMessage': true
        };
        const response = await fetchRequest(request);
        if (response.status == 200) {
            setTimeout(() => {
                saveSesionAuth(response.data);
            }, 500);
        }
    }


    return (

        <Fragment>
            <Preloader></Preloader>
            <AlertMessage></AlertMessage>
            <form className="form-horizontal" action="index">
                <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input name="email" onChange={handleChange} onKeyPress={handleonKeyPress} type="text" className="form-control" id="email" placeholder="Correo electrónico" maxLength={100} />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input name="password" onChange={handleChange} onKeyPress={handleonKeyPress} type="password" className="form-control" id="password" placeholder="Contraseña" autoComplete="current-password" maxLength={100} />
                </div>

                <div className="custom-control custom-checkbox">
                    <input name="remember_session" onChange={handleChange} type="checkbox" className="custom-control-input" id="remember_session" />
                    <label className="custom-control-label" htmlFor="remember_session">Permanecer registrado</label>
                    {/*
                    {data.remember_session && (
                        <small className="d-block text-danger"><strong>sesión activa</strong> durante 15 días.</small>
                    )}
                    
                    */}
                </div>

                <div className="mt-3">
                    <button
                        onClick={handleClickSubmit}
                        disabled={loading}
                        className="btn btn-primary btn-block waves-effect waves-light" type="button">iniciar sesión</button>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/recovery-password" className="text-muted">
                        <i className="mdi mdi-lock mr-1"></i> ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form >
        </Fragment>
    )
}

const mapDispatchToProps = {
    saveSesionAuth, fetchRequest
}

/*
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch1: (state) => {
            dispatch(saveSesionAuth(state))
        }
    }
}
*/

export default connect(null, mapDispatchToProps)(Login);