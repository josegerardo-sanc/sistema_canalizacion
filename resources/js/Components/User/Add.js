import React, { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
/**helpers */
import AlertMessageSingular from "../../Helpers/AlertMessageSingular";
/**actions */
import { fetchRequest } from '../../Redux/Actions/fetchRequest'
/**configurations */
import { pathApi } from '../../env'

const FormUser = ({
    Auth,
    fetchRequest,
    data,
    handleUpdateTable,
    setResponseData
}) => {

    const { token } = Auth;
    const [responseReq, setResponseReq] = useState({})
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false);
    let [dataForm, setDataForm] = useState({});

    useEffect(() => {
        getRoles();
    }, [])


    useEffect(() => {
        setResponseReq({})
        if (data.id_users) {
            let type_rol = "";
            for (const roles of data.roles) {
                type_rol = roles.name;
            }
            setDataForm({
                ...data,
                'type_rol': type_rol
            });

        } else {
            handlerResetData()
        }
    }, [data])



    const getRoles = async () => {
        setLoading(true)
        let request = {
            'url': `${pathApi}/getRoles`,
            'request': {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
            'showMessage': false,
            'showLoader': false
        };
        let response = await fetchRequest(request);
        if (response.status == 200) {
            setRoles(response.data)
        }
        setLoading(false);
    }

    const handle_Save = () => {
        handle_Save_Update("usuario_create");
    }
    const handle_Update = () => {
        handle_Save_Update("usuario_update");
    }

    const handlerResetData = () => {
        setDataForm({});
    }

    const handle_Save_Update = async (type) => {

        setLoading(true);
        let data_object = Object.assign({ ...dataForm, 'type_form': type });

        let request = {
            'url': `${pathApi}/saveUser`,
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
        setResponseReq(response)
        //console.log(response);
        if (response.status == 200) {
            setResponseData(response);
            if (type == "usuario_create") {
                handlerResetData();
            }
            handleUpdateTable();
            window.$('.modal_helper').modal('hide');
        }
        setLoading(false);
    }

    const onChangeInputData = (e) => {
        setDataForm({
            ...dataForm,
            [e.target.name]: e.target.value
        });
    }

    return (
        <Fragment>
            <div className="col-sm-12 mb-4 mt-4">
                <AlertMessageSingular {...responseReq}></AlertMessageSingular>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="control-label">{'Nombre*'}</label>
                        <input onChange={onChangeInputData} className="form-control" type="text" value={dataForm.name || ""} name="name" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="control-label">{'Primer Apellido *'}</label>
                        <input onChange={onChangeInputData} className="form-control" type="text" value={dataForm.last_name || ""} name="last_name" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="control-label">{'Segundo Apellido *'}</label>
                        <input onChange={onChangeInputData} className="form-control" type="text" value={dataForm.second_last_name || ""} name="second_last_name" />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label">{'Correo *'}</label>
                        <input onChange={onChangeInputData} className="form-control" type="email" value={dataForm.email || ""} name="email" />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label">{'Rol*'}</label>
                        <select onChange={onChangeInputData} className="form-control" name="type_rol" id="type_rol" value={dataForm.type_rol || "0"}>
                            <option value="0" disabled>{'Seleccione una opción'}</option>
                            {/*
                            {roles.map(item => item.name != "Cliente" && (<option value={item.name} key={item.id}>{item.name}</option>))}
                            */}
                            {roles.map(item => (<option value={item.name} key={item.id}>{item.name}</option>))}
                        </select>
                    </div>
                </div>
                <div className="col-sm-12 d-flex justify-content-end">
                    {
                        (data.hasOwnProperty('id_users')) ? (
                            <button disabled={loading} onClick={handle_Update} type="button" className="btn btn-warning">{'Actualizar'}</button>
                        ) : (
                            <Fragment>
                                <button onClick={handlerResetData} type="button" className="btn btn-danger mr-1 ml-1">{'Limpiar'}</button>
                                < button disabled={loading} onClick={handle_Save} type="button" className="btn btn-primary">{'Guardar'}</button>
                            </Fragment>
                        )
                    }
                </div>
            </div>
        </Fragment >
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


FormUser.propTypes = {
    data: PropTypes.object.isRequired,
    handleUpdateTable: PropTypes.func.isRequired,
    setResponseData: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(FormUser);

