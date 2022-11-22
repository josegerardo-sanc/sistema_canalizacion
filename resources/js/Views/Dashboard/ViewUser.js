import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
/**componentes */
import FormAddUser from '../../Components/User/Add';
import ListUser from "../../Components/User/List";
import Modal from '../../Helpers/Modal'
import AlertMessageSingular from "../../Helpers/AlertMessageSingular";

/**configurations */
import { pathApi } from "../../env";

/**actions */
import { fetchRequest } from "../../Redux/Actions/fetchRequest";

const ViewUser = ({
    Auth,
    fetchRequest
}) => {

    const { token } = Auth;
    useEffect(() => {
        document.getElementById('title_module').innerText = "Usuario";
    }, [])
    const [responseData, setResponseData] = useState({});
    const [updateTable, setUpdateTable] = useState(false);
    const handleUpdateTable = () => {
        setUpdateTable(!updateTable);
    }

    const [data, setData] = useState({});
    const [openModal, setOpenModal] = useState({
        'type': null,
        'titleModal': ''
    });


    const handleOpenEdit = (e, item) => {
        /**state */
        setData(item)
        setResponseData({});
        /**modal */
        setStateModal(e)
    }

    const handleOpenModal = (e) => {
        e.preventDefault();
        setData({});
        setResponseData({});
        setStateModal(e);
    }

    const setStateModal = ({ target }) => {

        let typeModal = target.getAttribute("data-type");
        let titleModal = target.getAttribute("data-title");

        if (typeModal != null) {
            setOpenModal({
                'type': typeModal,
                'titleModal': titleModal
            });
            window.$('.modal_helper').modal('show');
        }
    }


    const handleExportUsers = async () => {
        let typeRol = document.getElementById('typeRol').value;
        let request = {
            'url': `${pathApi}/exportUsers`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    //'Accept': 'multipart/form-data',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'filter_rol': typeRol
                })
            },
            'file_blob': true
        };
        let response = await fetchRequest(request);
    }

    const handleImportUsers = async () => {
        let file = document.getElementById('file_import_search').files;
        console.log(file)

        if (file.length > 0) {
            var formData = new FormData()
            formData.append('file', file[0])

            let request = {
                'url': `${pathApi}/importUsers`,
                'request': {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        //'Accept': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                    'body': formData
                },
                'showLoader': true
            };
            let response = await fetchRequest(request);
            setResponseData(response);
        } else {
            alert("No hay archivos selecionados.")
        }
    }


    const handleFileImportSearch = async () => {
        document.getElementById('file_import_search').click();
    }

    const changeFile = async (e) => {
        let file = e.target.files[0];
        //console.log(file)
        let error_img = "";

        if (validFileType(file)) {
            /**validacion del peso */
            let sizeImg = file.size;
            //KB  1024
            //3MB EN EL BACKEND 3145728
            //1MB (1048576=kilobyte)
            let heigthMax = (1 * 1048576);
            if (sizeImg > heigthMax) {
                error_img = `Peso maximo ${returnFileSize(heigthMax)} MB ${returnFileSize(sizeImg)}.`;
            }
        } else {
            error_img = `Formato invalido ${file.name.split('.').pop()}`;
        }

        if (error_img != "") {
            alert(`Nombre del archivo ${file.name}  ${error_img} `);
        } else {
            await handleImportUsers();
        }

        document.getElementById('file_import_search').value = "";

    }

    const fileTypes = [
        "application/vnd.oasis.opendocument.spreadsheet",
        "text/csv",
        "application/vnd.ms-excel"
    ];

    function validFileType(file) {
        return fileTypes.includes(file.type);
    }


    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                    <AlertMessageSingular {...responseData} />
                </div>
                <div className="col-sm-12">
                    {/*card */}
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-primary waves-effect waves-light btn-rounded" onClick={handleOpenModal} data-title="Nuevo usuario" data-type="user">
                                    <i className="font-size-16 align-middle mr-2 fas fa-user-alt "></i>
                                    {'Nuevo usuario'}
                                </button>
                                &nbsp;&nbsp;
                                <button
                                    type="button"
                                    onClick={handleExportUsers}
                                    className="btn btn-success waves-effect waves-light btn-rounded"
                                >
                                    <i className="font-size-16 align-middle mr-2 fas fa-file-excel"></i>
                                    {'Exportar'}
                                </button>
                                &nbsp;&nbsp;
                                <button
                                    type="button"
                                    onClick={handleFileImportSearch}
                                    className="btn btn-secondary waves-effect waves-light btn-rounded"
                                >
                                    <i
                                        style={{ zIndex: "-10" }}
                                        className="font-size-16 align-middle mr-2 fas fa-file-excel"></i>
                                    {'Importar'}
                                </button>
                                <input type="file" id="file_import_search" onChange={changeFile} style={{ display: 'none' }} />
                            </div>
                            <ListUser
                                handleOpenEdit={handleOpenEdit}
                                updateTable={updateTable}
                                setResponseData={setResponseData}
                            />
                        </div>
                    </div>
                    {/*card */}
                    <Modal
                        title={openModal.titleModal}
                    >
                        {openModal.type == "user" && (
                            <FormAddUser
                                data={data}
                                handleUpdateTable={handleUpdateTable}
                                setResponseData={setResponseData}
                            />
                        )}
                    </Modal>
                </div>
            </div>
        </Fragment>
    )
}

const mapStateToProps = ({
    Auth
}) => {
    return {
        Auth
    }
}

const mapDispatchToProps = {
    fetchRequest
}


export default connect(mapStateToProps, mapDispatchToProps)(ViewUser);