import React, { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from 'prop-types';


import Toggle from 'react-toggle'
import "react-toggle/style.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
/**helpers */
import AlertMessageSingular from "../../Helpers/AlertMessageSingular";
import {
    returnFileSize,
    fileTypes,
    validFileType
} from '../../Helpers/ValidateImage'
/**config */
import { pathApi } from "../../env";
/**actions */
import { fetchRequest } from "../../Redux/Actions/fetchRequest";


import './add.css';

const FormAddService = (props) => {

    const { token } = props.Auth;
    const { fetchRequest } = props;
    const { location } = props;


    const [responseReq, setResponseReq] = useState({})
    const [loading, setLoading] = useState(false);
    const [dataForm, setDataForm] = useState({
        'is_active': true
    });

    let formDataImages = new FormData()
    const [formDataFile, setFormDataFile] = useState([]);
    const [showPromotion, setShowPromotion] = useState(true)
    const [showDescriptionShort, setShowDescriptionShort] = useState(true)
    const [listServices, setListServices] = useState([]);

    useEffect(() => {
        if (location.state != undefined && location.state != "") {
            setDataForm({
                'id_service': location.state.id_service,
                'type': location.state.type,
                'title': location.state.title,
                'description_short': location.state.description_short,
                'description_long': location.state.description_long,
                'price': location.state.price,
                'promotion': location.state.promotion,
                'path': location.state.path,
            })

            setListServices([
                ...location.state.list_services
            ])

        }
    }, [])



    const handle_Save = () => {
        handle_Save_Update();
    }
    const handle_Update = () => {
        handle_Save_Update();
    }

    const handlerResetData = () => {
        setDataForm({
            'is_active': true
        });
        setListServices([]);
        setFormDataFile([]);
    }

    const handle_Save_Update = async (type) => {

        //setLoading(true);
        let data_object = Object.assign({ ...dataForm, 'services': listServices });

        let formDataSend = new FormData();

        formDataSend.append('services', JSON.stringify(listServices));
        for (const key in dataForm) {
            formDataSend.append(key, dataForm[key]);
        }

        for (const item of formDataFile) {
            //console.log(item.file)
            formDataSend.append(item.id, item.file);
        }

        let file_primary = document.getElementById('file_primary').files[0];
        formDataSend.append('file_primary', file_primary);

        let request = {
            'url': `${pathApi}/saveService`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    //'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                //body: JSON.stringify(data_object)
                body: formDataSend
            }
        };
        let response = await fetchRequest(request);
        setResponseReq(response)


        let messages = response.message || "";
        let messages_array = [];

        messages_array.push(messages);

        if (response.status != 200) {
            if (response.errors) {
                messages_array = []
                for (const key in response.errors) {
                    messages_array.push(response.errors[key]);
                }
            }
        }

        if (response.status == 200) {
            if (dataForm.hasOwnProperty('id_service') == false) {
                handlerResetData();
                clearFormDataAndThumbnails();
                document.getElementById('file_primary').value = "";
            }
            notifySuccess(messages_array);
        } else {
            notifyError(messages_array);
        }

        setLoading(false);
    }


    var clearFormDataAndThumbnails = function () {
        for (var key of formDataImages.keys()) {
            formDataImages.delete(key);
        }

        document.querySelectorAll('.thumbnail').forEach(function (thumbnail) {
            thumbnail.remove();
        });
    }

    const onChangeInputData = (e) => {

        if (e.target.name == "type") {
            let type = e.target.value;
            if (type == "habitacion") {
                setShowPromotion(true);
                setShowDescriptionShort(true)
            } else {
                setShowPromotion(false);
                setShowDescriptionShort(false)
            }
        }

        if (e.target.type == "checkbox") {
            setDataForm({
                ...dataForm,
                [e.target.name]: e.target.checked
            });
        } else {
            setDataForm({
                ...dataForm,
                [e.target.name]: e.target.value
            });
        }
    }


    const changeFilePrimary = (e) => {
        let file = e.target.files[0];

        let currentFile = file;
        let typeFile = validFileType(currentFile);
        let sizeImg = currentFile.size
        let heigthMax = (5 * 1048576);
        return false;

        if (!typeFile) {
            alert("el tipo de archivo es inválido.")
            e.target.value = "";
        }
        if (currentFile.size > heigthMax) {
            alert("El peso del archivo supero los 5MB.");
            e.target.value = "";
        }
    }

    const notifyError = (messages_array) => {
        //toast("Default Notification !");
        toast.error(<Msg messages_array={messages_array} />);
    };

    const notifySuccess = (messages_array) => {
        toast.success(<Msg messages_array={messages_array} />)
    };


    const Msg = ({ closeToast, toastProps, messages_array }) => (
        <div>
            <ul>
                {messages_array.map(item => (<li key={item}>{item}</li>))}
            </ul>
        </div>
    )

    return (
        <Fragment>
            <ToastContainer />
            <div className="col-sm-12 mb-4 mt-4">
                <AlertMessageSingular {...responseReq}></AlertMessageSingular>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    {/**enabled service */}
                    <div className="form-group form-row">
                        <p className="col-md-1 font-weight-bold text-dark">{'Activo'}</p>
                        <div className="col-md">
                            <Toggle
                                id='is_active'
                                name="is_active"
                                defaultChecked={dataForm.is_active}
                                onChange={(e) => onChangeInputData(e)}
                            />
                        </div>
                    </div>
                    {/**type service */}
                    <div className="form-group form-row">
                        <p className="col-md-1 font-weight-bold text-dark">{'Tipo (*)'}</p>
                        <div className="col-md">
                            <select
                                id="type"
                                name="type"
                                value={dataForm.type || "0"}
                                onChange={onChangeInputData}
                                className="form-control"
                            >
                                <option value="0" disabled>{'Seleccione una opción'}</option>
                                <option value={'habitacion'}>{'Habitación'}</option>
                                <option value={'promocion'}>{'Promociones'}</option>
                                <option value={'salon'}>{'Salón para eventos'}</option>
                            </select>
                        </div>
                    </div>
                    {/**title */}
                    <div className="form-group form-row">
                        <p className="col-md-1 font-weight-bold text-dark">{'Titulo (*)'}</p>
                        <div className="col-md">
                            <input
                                value={dataForm.title || ""}
                                name="title"
                                onChange={onChangeInputData}
                                type="text"
                                className="form-control"
                                placeholder={""}
                            />
                        </div>
                    </div>
                    {/**description short */}
                    {showDescriptionShort && (
                        <div className="form-group form-row">
                            <p className="font-weight-bold text-dark">{'Descripcion corta (*)'}</p>
                            <textarea
                                name="description_short"
                                onChange={onChangeInputData}
                                className="form-control"
                                cols={5}
                                rows={5}
                                value={dataForm.description_short || ""}
                            />
                        </div>
                    )}
                    <div className="form-group form-row">
                        <p className="font-weight-bold text-dark">{'Descripcion larga (*)'}</p>
                        <textarea
                            name="description_long"
                            onChange={onChangeInputData}
                            className="form-control"
                            cols={5}
                            rows={10}
                            value={dataForm.description_long || ""}
                        />
                    </div>
                    {/**precios */}
                    <div className="form-row">
                        {/**prices */}
                        <div className="col-md">
                            <div className="form-group">
                                <p className="font-weight-bold text-dark">{'Precio (*)'}</p>
                                {/*input group*/}
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fas fa-dollar-sign"></i>
                                        </span>
                                    </div>
                                    <input
                                        value={dataForm.price || ""}
                                        name="price"
                                        onChange={onChangeInputData}
                                        type="number"
                                        className="form-control"
                                        placeholder={""}
                                    />
                                </div>
                                {/*input group */}
                            </div>
                        </div>
                        {/**prices */}
                        {/*promotions */}
                        {
                            showPromotion && (
                                <div className="col-md">
                                    <div className="form-group">
                                        <p className="font-weight-bold text-dark">{'Promocion'} <small>({'opcinal'})</small></p>
                                        {/*input group*/}
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <i className="fas fa-ruble-sign"></i>
                                                </span>
                                            </div>
                                            <input
                                                value={dataForm.promotion || ""}
                                                name="promotion"
                                                onChange={onChangeInputData}
                                                type="number"
                                                className="form-control"
                                                placeholder={""}
                                            />
                                        </div>
                                        {/*input group */}
                                    </div>
                                </div>
                            )
                        }
                        {/**promotions */}
                    </div>
                    {/**servicios */}
                    <div className="form-group row" style={{ backgroundColor: '#fff' }}>
                        <div className="mt-4 col-sm-12 form-group">
                            <blockquote className="blockquote font-size-16 mb-2 mt-2" style={{ borderColor: "#39a1d7" }}>
                                <p className="font-weight-bold text-dark">SERVICIOS QUE INCLUYE</p>
                            </blockquote>
                        </div>
                        <ListServices
                            listServices={listServices}
                            setListServices={setListServices}
                        />
                    </div>
                    {/**imagenes */}
                    <div className="mt-4 col-sm-12 form-group">
                        <blockquote className="blockquote font-size-16 mb-2 mt-2" style={{ borderColor: "#39a1d7" }}>
                            <p className="font-weight-bold text-dark">IMAGEN PRINCIPAL</p>
                        </blockquote>
                        <input
                            onChange={changeFilePrimary}
                            name="file_primary"
                            id="file_primary"
                            type="file"
                            className="form-control"
                        />
                    </div>
                    {/**imagenes */}
                    <div className="mt-4 col-sm-12 form-group">
                        <blockquote className="blockquote font-size-16 mb-2 mt-2" style={{ borderColor: "#39a1d7" }}>
                            <p className="font-weight-bold text-dark">IMAGENES SLIDER</p>
                        </blockquote>
                        <UploadFile
                            formDataFile={formDataFile}
                            setFormDataFile={setFormDataFile}
                            formData={formDataImages}
                        />
                    </div>
                    <div className="col-sm-12 d-flex justify-content-end" style={{ marginTop: '50px' }}>
                        < button
                            disabled={loading}
                            onClick={handle_Save}
                            type="button"
                            className="btn btn-primary waves-effect waves-light btn-rounded"
                        >{'Guardar'}</button>

                    </div>
                    {/**images */}
                </div>
            </div>
        </Fragment >
    )
}


const ListServices = ({
    listServices,
    setListServices
}) => {

    const [newService, setNewService] = useState("");
    const handleService = (e) => {
        setNewService(e.target.value)
    }

    const handleSaveNewService = () => {
        if (newService != "") {
            setListServices([
                ...listServices,
                {
                    'service': newService,
                    'active': true,
                    'id_list_service': Date.now()
                }
            ])
        }

        setNewService("");
    }

    const handleDelete = (item) => {
        //console.log(item.id)
        //console.log(listServices.filter((ser) => ser.id_list_service != item.id_list_service))

        setListServices(listServices.filter((ser) => ser.id_list_service != item.id_list_service))
    }

    const handleStatusService = (item) => {


        let newList = listServices.map((service) => {
            if (service.id_list_service == item.id_list_service) {
                service.active = !service.active;
            }
            return service;
        })

        //console.log(newList)
        setListServices(newList)
    }


    return (
        <Fragment>
            <table className="table-responsive-sm table table-nowrap table-centered mb-0 table-striped">
                <thead>
                    <tr>
                        <th>
                            <input
                                onChange={handleService}
                                value={newService}
                                type={"text"}
                                className="form-control"
                                placeholder="Ingresa tu servicio" />
                        </th>
                        <th>
                            <button
                                title="Agrege un servicio"
                                onClick={handleSaveNewService}
                                className="btn btn-success waves-effect waves-light "
                            >
                                Agregar Servicio
                            </button>
                        </th>
                    </tr>
                    <tr style={{ backgroundColor: "#1864ab", color: 'white' }}>
                        <td align="center" >
                            Servicios
                        </td>
                        <td align="center">
                            Acciones
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {
                        listServices.length > 0 ? (
                            <Fragment>
                                {listServices.map((item, index) =>
                                    <tr key={index}>
                                        <td align="center">
                                            <h5 className="text-truncate font-size-14 m-0 text-dark">
                                                {item.service}
                                            </h5>
                                        </td>
                                        <td align="center" className="d-flex justify-content-around">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    checked={item.active}
                                                    onChange={(e) => handleStatusService(item)}
                                                    type="checkbox" className="custom-control-input" id={`customCheck1_${item.id_list_service}`} />
                                                <label className="custom-control-label" htmlFor={`customCheck1_${item.id_list_service}`}>Activo</label>
                                            </div>
                                            < button
                                                onClick={(e) => handleDelete(item)}
                                                type="button"
                                                className="btn btn-danger waves-effect waves-light btn-rounded btn-sm"
                                            >
                                                <i className="fas fa-trash"></i> Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ) : (
                            <Fragment>
                                <tr>
                                    <td align="center">
                                        <h5 className="text-truncate font-size-14 m-0 text-dark">
                                            Mi primer servicio ejemplo.
                                        </h5>
                                    </td>
                                    <td className="d-flex justify-content-around">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                disabled={true}
                                                defaultChecked={true}
                                                type="checkbox" className="custom-control-input" id="customCheck1" />
                                            <label className="custom-control-label" htmlFor="customCheck1">Activo</label>
                                        </div>
                                        < button
                                            disabled={true}
                                            type="button"
                                            className="btn btn-danger waves-effect waves-light btn-rounded btn-sm"
                                        >
                                            <i className="fas fa-trash"></i> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            </Fragment>
                        )
                    }

                </tbody>
            </table>
        </Fragment >
    )
}

const UploadFile = ({
    setFormDataFile,
    formDataFile,
    formData
}) => {


    const changeFile = (e) => {
        let file = e.target.files;
        let objectFiles = [];

        for (var i = 0; i < file.length; i++) {

            let currentFile = file[i];

            let typeFile = validFileType(currentFile);
            let sizeImg = currentFile.size
            let heigthMax = (5 * 1048576);

            if (typeFile && (currentFile.size <= heigthMax)) {
                var thumbnail_id = Math.floor(Math.random() * 30000) + '_' + Date.now();
                formData.append(thumbnail_id, currentFile);
                objectFiles.push({
                    'id': thumbnail_id,
                    'file': currentFile
                });
                createThumbnail(currentFile, thumbnail_id);
            } else {
                console.log(currentFile.name, typeFile, returnFileSize(sizeImg), returnFileSize(heigthMax))
            }
        }

        if (objectFiles.length > 0) {
            setFormDataFile([
                ...formDataFile,
                ...objectFiles
            ]);
        }
        e.target.value = "";
    }


    var createThumbnail = function (currentFile, thumbnail_id) {
        var thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail', thumbnail_id);
        thumbnail.dataset.id = thumbnail_id;

        thumbnail.setAttribute('style', `background-image: url(${URL.createObjectURL(currentFile)})`);
        document.getElementById('preview-images').appendChild(thumbnail);
        createCloseButton(thumbnail_id);
    }

    var createCloseButton = function (thumbnail_id) {
        var closeButton = document.createElement('div');
        closeButton.classList.add('close-button');
        closeButton.innerText = 'x';
        document.getElementsByClassName(thumbnail_id)[0].appendChild(closeButton);
    }
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('close-button')) {
            e.target.parentNode.remove();
            formData.delete(e.target.parentNode.dataset.id);
            let id = e.target.parentNode.dataset.id;
        }
    });

    return (
        <Fragment>
            <div className="form-row">
                <input
                    accept="image"
                    name="file[]"
                    multiple
                    onChange={changeFile}
                    type={"file"}
                    className="form-control col-md"
                    id="imageGalery"
                    placeholder="Selecione un imagen" />
            </div>
            <div className="mt-4 col-sm-12" id="preview-images" style={{
                backgroundColor: '#dedede',
                padding: '10px',
                minHeight: '150px',
                height: 'auto'
            }}>

            </div>
        </Fragment >
    )
}

ListServices.propTypes = {
    listServices: PropTypes.array.isRequired,
    setListServices: PropTypes.func.isRequired,
};



const mapDispatchToProps = {
    fetchRequest
};

const mapStateToProps = ({
    Auth
}) => {
    return {
        Auth
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FormAddService);