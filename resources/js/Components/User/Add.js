import React, { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
/**helpers */
import AlertMessageSingular from "../../Helpers/AlertMessageSingular";
/**actions */
import { fetchRequest } from '../../Redux/Actions/fetchRequest'
/**configurations */
import { pathApi } from '../../env'
import {Careers, Enrollment, Semester, Shift } from "../../Helpers/School";

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
    const [showPassword, setShowPassword] = useState(false);

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
            console.log(data.alumno);

            let careers = 0;
            if (data.alumno != null) {
                careers = data.alumno.id_university_careers;
            }

            setDataForm({
                ...data,
                'type_rol': type_rol,
                ...data.alumno,
                careers
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
        handle_Save_Update("create");
    }
    const handle_Update = () => {
        handle_Save_Update("update");
    }

    const handlerResetData = () => {
        setDataForm({});
        setResponseReq({});
    }

    const handle_Save_Update = async (type) => {

        setLoading(true);
        setResponseReq({});
        let data_object = Object.assign({
            ...dataForm,
            'type_form': type
        });

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
            if (type == "create") {
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


    const handleShowPassword = (e) => {
        setShowPassword((showPassword) => !showPassword);
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
                {/**genero */}
                <div className="col-sm-6 form-group">
                    <label htmlFor="" className="form-label label_filter">Genero</label>
                    <div>
                        <div className="custom-control custom-radio custom-control-inline">
                            <input
                                onChange={onChangeInputData}
                                defaultValue={"Masculino"}
                                checked={dataForm.gender == "Masculino" ? true : false}
                                name="gender"
                                type="radio" id="_customRadioInline1" className="custom-control-input" />
                            <label className="custom-control-label" htmlFor="_customRadioInline1">Masculino</label>
                        </div>
                        <div className="custom-control custom-radio custom-control-inline">
                            <input
                                onChange={onChangeInputData}
                                defaultValue={"Femenino"}
                                checked={dataForm.gender == "Femenino" ? true : false}
                                name="gender"
                                type="radio" id="_customRadioInline2" className="custom-control-input" />
                            <label className="custom-control-label" htmlFor="_customRadioInline2">Femenino</label>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label">{'Correo *'}</label>
                        <input onChange={onChangeInputData} className="form-control" type="email" value={dataForm.email || ""} name="email" />
                    </div>
                </div>
                {/**password */}
                {
                    !dataForm.hasOwnProperty('id_users') && (
                        <div className="col-sm-12 form-row form-group" style={{ display: "none" }}>
                            <div className="col-sm-6 form-group">
                                <label htmlFor="password">Contraseña</label>
                                <div className="input-group mb-0">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" >
                                            <i className="fas fa-key"></i>
                                        </span>
                                    </div>
                                    <input
                                        name="password"
                                        onChange={onChangeInputData}
                                        value={dataForm.password || ""}
                                        type={`${showPassword ? "text" : "password"}`}
                                        className="form-control"
                                        id="password"
                                        placeholder="Ingresa tu clave"
                                        autoComplete="current-password"
                                        maxLength={100}
                                    />
                                    <div className="input-group-append" onClick={handleShowPassword}>
                                        <span className="input-group-text" id="span_icon">
                                            {
                                                showPassword ? (
                                                    <i className="far fa-eye"></i>
                                                ) : (

                                                    <i className="far fa-eye-slash"></i>
                                                )
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 form-group">
                                <label htmlFor="password_confirmation">Confirma contraseña</label>
                                <div className="input-group mb-0">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" >
                                            <i className="fas fa-key"></i>
                                        </span>
                                    </div>
                                    <input
                                        name="password_confirmation"
                                        onChange={onChangeInputData}
                                        value={dataForm.password_confirmation || ""}
                                        type={`${showPassword ? "text" : "password"}`}
                                        className="form-control"
                                        id="password_confirmation"
                                        placeholder="Confirma tu clave"
                                        autoComplete="current-password"
                                        maxLength={100}
                                    />
                                    <div className="input-group-append" onClick={handleShowPassword}>
                                        <span className="input-group-text" id="span_icon">
                                            {
                                                showPassword ? (
                                                    <i className="far fa-eye"></i>
                                                ) : (

                                                    <i className="far fa-eye-slash"></i>
                                                )
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/**rol */}
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
                <div className="col-sm-12">
                    {
                        dataForm.type_rol == "Alumno" && (
                            <FormStudent
                                onChangeInputData={onChangeInputData}
                                dataForm={dataForm}
                            />
                        )
                    }
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


const Form_Student = ({
    onChangeInputData,
    dataForm
}) => {
    const [responseMessage, setResponseMessage] = useState({})

    return (
        <Fragment>
            {/**datos escolares */}
            <div className="form-row">
                <AlertMessageSingular {...responseMessage}></AlertMessageSingular>
                {/**matricula */}
                <div className="col-sm-12 form-group">
                    <Enrollment onChangeInputData={onChangeInputData} matricula={dataForm.matricula}/>
                </div>
                {/**carreras */}
                <div className="col-sm-12 form-group">
                    <Careers setResponseMessage={setResponseMessage} onChangeInputData={onChangeInputData} careersSelected={dataForm.careers}/>
                </div>
                {/**semestres */}
                <div className="col-sm-6 form-group">
                    <Semester onChangeInputData={onChangeInputData} semester={dataForm.semester}/>
                </div>
                {/**turno */}
                <div className="col-sm-6 form-group">
                    <Shift onChangeInputData={onChangeInputData} school_shift={dataForm.school_shift}/>
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



FormUser.propTypes = {
    data: PropTypes.object.isRequired,
    handleUpdateTable: PropTypes.func.isRequired,
    setResponseData: PropTypes.func.isRequired
};

const FormStudent = connect(mapStateToProps, mapDispatchToProps)(Form_Student);
export default connect(mapStateToProps, mapDispatchToProps)(FormUser);

