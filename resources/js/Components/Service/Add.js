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

    const [typeRegisterForm, setTypeRegisterForm] = useState(false);
    const [responseReq, setResponseReq] = useState({})
    const [loading, setLoading] = useState(false);
    const [dataForm, setDataForm] = useState({
        'is_active': true
    });

    let formDataImages = new FormData()
    const [formDataFile, setFormDataFile] = useState([]);
    const [showPromotion, setShowPromotion] = useState(true)
    const [showPrice, setShowPrice] = useState(true)
    const [showDescriptionShort, setShowDescriptionShort] = useState(true)
    const [listServices, setListServices] = useState([]);
    const [listImageServices, setListImageServices] = useState([]);
    const [catalog, setCatalog] = useState([]);
    useEffect(() => {
        if (location.state != undefined && location.state != "") {
            getService(location.state.id_service);
        }
    }, [])

    useEffect(() => {
        getCatalog();
    }, [])


    const [idsImagesDelete, setIdsImagesDelete] = useState([]);
    const updateListImageServices = (e, id_image_service) => {

        //console.log(id_image_service);
        if (e.target.classList.contains('close-button-update')) {
            e.target.parentNode.remove();
            setIdsImagesDelete([
                ...idsImagesDelete,
                { 'id_image_service': id_image_service }
            ])
        }
    }

    const getService = async (id_service) => {
        let request = {
            'url': `${pathApi}/getOneService/${id_service}`,
            'request': {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
            'showMessage': false,
        };
        let response = await fetchRequest(request);

        if (response.status == 200 && response.data) {

            let data = response.data;
            console.log(data);
            setDataForm({
                'id_service': data.id_service,
                'type': data.type,
                'title': data.title,
                'description_short': data.description_short,
                'description_long': data.description_long,
                'price': data.price,
                'promotion': data.promotion,
                'path': data.path,
            })

            setListServices([
                ...data.list_services
            ])
            setListImageServices([
                ...data.list_images_services
            ])
            typeRegister(data.type);
            setTypeRegisterForm(true);
        }
    }

    const getCatalog = async () => {
        let request = {
            'url': `${pathApi}/getCatalog/`,
            'request': {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        };
        let response = await fetchRequest(request);

        if (response.status == 200 && response.data) {
            setCatalog(response.data);
        }
    }

    const handle_Save = () => {

        //console.log(listServices);
        //console.log(idsImagesDelete);
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
        formDataSend.append('idsImagesDelete', JSON.stringify(idsImagesDelete));
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

    const typeRegister = (type) => {

        if (type == "habitacion") {
            setShowPromotion(true);
            setShowDescriptionShort(true)
            setShowPrice(true);
        }

        if (type == "promocion" || type == "salon") {
            setShowPromotion(false);
            setShowDescriptionShort(false)
        }

        if (type == "salon") {
            setShowPrice(false);
        }
    }

    const onChangeInputData = (e) => {

        let type = e.target.value;
        if (e.target.name == "type") {
            typeRegister(type);
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

        if (!typeFile) {
            toast.error("Tipo de archivo inválido.");
            e.target.value = "";
        }
        if (currentFile.size > heigthMax) {
            toast.error("El peso del archivo supero los 5MB.");
            e.target.value = "";
        }

        let image = URL.createObjectURL(currentFile);
        document.getElementById('image_primary_container').src = image;
        document.getElementById('image_primary_container').style.display = "block";

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

                {
                    typeRegisterForm ? (
                        <Fragment>
                            <h1>Actualizar <strong className="text-muted">{dataForm.type || ""}</strong></h1>
                        </Fragment>
                    )
                        : (
                            <Fragment>
                                <h1>Registrar <strong className="text-muted">{dataForm.type || ""}</strong></h1>
                            </Fragment>
                        )
                }

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
                        {
                            showPrice && (
                                <Fragment>

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
                                </Fragment>
                            )
                        }
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
                            catalog={catalog}
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
                        {typeRegisterForm == true ? (
                            <img className="img-fluid" alt="imagen principal" id="image_primary_container" style={{
                                height: '300px',
                                width: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                                src={`/storage/${dataForm.path}`}
                            />
                        ) : (
                            <img className="img-fluid" alt="imagen principal" id="image_primary_container" style={{
                                height: '300px',
                                width: '100%',
                                objectFit: 'cover',
                                display: 'none'
                            }} />
                        )}
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
                            listImageServices={listImageServices}
                            updateListImageServices={updateListImageServices}
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
    catalog,
    listServices,
    setListServices
}) => {


    const handleSelectedService = (e, id) => {

        if (e.target.checked == true) {
            //console.log("checked")
            setListServices([
                ...listServices,
                { 'id_catalog': id }
            ])
        } else {
            //console.log("des-checked")
            setListServices(listServices.filter(item => item.id_catalog != id))
        }

    }


    const isChecked = (id) => {

        let is_cheked = listServices.find(item => item.id_catalog == id);
        return is_cheked != undefined ? true : false;

    }

    return (
        <Fragment>
            <div className="d-flex flex-wrap justify-content-center align-items-center">
                {catalog.length > 0 ? (
                    <Fragment>
                        {catalog.map(item => (
                            <div style={{ width: "200px" }} key={item.id_catalog}>
                                <div className="form-check mb-2">
                                    <input
                                        defaultChecked={isChecked(item.id_catalog)}
                                        onChange={(e) => handleSelectedService(e, item.id_catalog)}
                                        value={item.id_catalog}
                                        className="form-check-input" type="checkbox"
                                        id={`defaultCheck1_${item.id_catalog}`} />
                                    <label className="form-check-label" htmlFor={`defaultCheck1_${item.id_catalog}`}>
                                        {item.name}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </Fragment>
                ) : (
                    <Fragment>
                        <h1>No hay servicios registrados para seleccionar.</h1>
                    </Fragment>
                )}
            </div>
        </Fragment >
    )
}

const UploadFile = ({
    setFormDataFile,
    formDataFile,
    formData,
    listImageServices,
    updateListImageServices
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



    //funciones solo para mostrar las imagenes cuando ya estan guardadas o almacenadas



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

                {
                    listImageServices.length > 0 && (
                        listImageServices.map(item => (
                            <Fragment>
                                <div className="thumbnail" data-id={item.id_image_service}>
                                    <img className="thumbnail"
                                        src={`/storage/${item.path}`} />
                                    <div
                                        className="close-button-update"
                                        data-id={item.id_image_service}
                                        onClick={(e) => updateListImageServices(e, item.id_image_service)}
                                    >x</div>
                                </div>
                            </Fragment>
                        ))
                    )
                }
            </div>
        </Fragment >
    )
}



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