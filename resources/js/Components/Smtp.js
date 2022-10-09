import React, { Fragment, useState, useEffect } from "react"
import { connect } from "react-redux"

/**actions */
import { fetchRequest } from '../Redux/Actions/fetchRequest'

/**config */
import { pathApi } from "../env"

/**helpers */
import AlertMessageSingular from "../Helpers/AlertMessageSingular"

const Smtp = ({
    fetchRequest,
    Auth
}) => {


    const { token } = Auth;
    const [loading, setLoading] = useState(false);
    let [dataForm, setDataForm] = useState({});
    const [responseData, setResponseData] = useState({});

    useEffect(() => {
        getConfigEmail();
    }, [])


    const handle_Save = () => {
        handle_Save_Update("create");
    }
    const handle_Update = () => {
        handle_Save_Update("update");
    }

    const handlerResetData = () => {
        setDataForm({});
        setResponseData({})
    }

    const handle_Save_Update = async (type) => {
        setResponseData({})
        //setLoading(true);
        let data_object = Object.assign({ ...dataForm, 'type_form': type });

        let request = {
            'url': `${pathApi}/saveConfigEmail`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data_object)
            }
        };
        let response = await fetchRequest(request);
        setResponseData(response)
        //console.log(response);
        if (response.status == 200) {

        }
        //setLoading(false);
    }

    const getConfigEmail = async () => {
        setResponseData({})
        setLoading(true);
        let data_object = Object.assign({});
        let request = {
            'url': `${pathApi}/getConfigEmail`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data_object)
            }
        };
        let response = await fetchRequest(request);
        //console.log(response);
        if (response.status == 200) {
            setDataForm({
                ...response.data
            })
        }
        setLoading(false);
    }

    const onChangeInputData = (e) => {
        setDataForm({
            ...dataForm,
            [e.target.name]: e.target.value
        });
    }

    {/*
    MAIL_HOST=smtp.mailtrap.io
    MAIL_PORT=2525
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_MAILER=smtp

    MAIL_ENCRYPTION=null
    MAIL_FROM_ADDRESS=null
    MAIL_FROM_NAME="${APP_NAME}"
    */}
    return (
        <Fragment>
            <AlertMessageSingular {...responseData} />

            <div className="row">
                <div className="col-sm-12 form-group">
                    <p className="font-weight-bold text-dark">{'Nombre de host'}</p>
                    <input
                        type="text"
                        value={dataForm.host || ""}
                        onChange={onChangeInputData}
                        className="form-control"
                        placeholder="host"
                        name="host" />
                </div>
                <div className="col-sm-12 form-group">
                    <p className="font-weight-bold text-dark">{'Nombre de usuario'}</p>
                    <input
                        type="text"
                        value={dataForm.username || ""}
                        onChange={onChangeInputData} className="form-control" placeholder="usuario" name="username" />
                </div>
                <div className="col-sm-12 form-group">
                    <p className="font-weight-bold text-dark">{'Contraseña'}</p>
                    <input
                        type="text"
                        value={dataForm.password || ""}
                        onChange={onChangeInputData} className="form-control" placeholder="**********" name="password" />
                </div>
                <div className="form-row col-sm-12">
                    <div className="col-sm-12 col-md-6 form-group">
                        <p className="font-weight-bold text-dark">{'Puerto del servidor'}</p>
                        <input
                            type="number"
                            value={dataForm.puerto || ""}
                            maxLength={5}
                            onChange={onChangeInputData}
                            className="form-control"
                            placeholder="585"
                            name="puerto" />

                    </div>
                    <div className="col-sm-12 col-md-6 form-group">
                        <p className="font-weight-bold text-dark">{'Tipo de encryption'}</p>
                        <select
                            onChange={onChangeInputData}
                            className="form-control"
                            name="encryption"
                            value={dataForm.encryption || "0"}
                        >
                            <option value="0" disabled>Seleccione una opción</option>
                            <option value="tls">TLS</option>
                        </select>
                    </div>
                </div>

                <div className="col-sm-12 form-group">
                    <blockquote className="blockquote font-size-16 mb-2 mt-2" style={{ borderColor: "#39a1d7" }}>
                        <p className="font-weight-bold text-dark">DATOS DEL REMITENTE</p>
                    </blockquote>
                    <p className="font-weight-bold text-dark">{'Correo'}</p>
                    <input
                        type="email"
                        value={dataForm.email_remitente || ""}
                        onChange={onChangeInputData} className="form-control" placeholder="hotelFortinPlaza@gmail.com" name="email_remitente" />
                </div>
                <div className="col-sm-12 form-group">
                    <p className="font-weight-bold text-dark">{'Nombre'}</p>
                    <input
                        value={dataForm.name_remitente || ""}
                        onChange={onChangeInputData} className="form-control" placeholder="gerardo" name="name_remitente" />
                </div>
                <div className="form-group col-sm-12 d-flex justify-content-end">
                    <Fragment>
                        <button onClick={handlerResetData} type="button" className="btn btn-danger waves-effect waves-light btn-rounded">{'Limpiar'}</button>
                        < button disabled={loading} onClick={handle_Save} type="button" className="btn btn-primary waves-effect waves-light btn-rounded">{'Guardar'}</button>
                    </Fragment>
                </div>
            </div>
        </Fragment>
    )
}

const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}

const mapDispatchToProps = {
    fetchRequest
}


export default connect(mapStateToProps, mapDispatchToProps)(Smtp)