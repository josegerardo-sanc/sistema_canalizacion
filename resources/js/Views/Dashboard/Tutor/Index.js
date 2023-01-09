import React, { Fragment, useState } from "react";
import { connect } from "react-redux";

import AlertMessageSingular from "../../../Helpers/AlertMessageSingular";
import { pathApi } from "../../../env";
/**actions */
import { fetchRequest } from "../../../Redux/Actions/fetchRequest";


/**components */
import CreateGroup from "../../../Components/Tutor/CreateGroup";

const Index = ({
    Auth,
    fetchRequest
}) => {

    const { token } = Auth;
    const [responseData, setResponseData] = useState(null);
    const [textMessage, setTextMessage] = useState(null);

    const handleFileImportSearch = () => {
        document.getElementById('file_import_search').click();
    }

    const changeFile = async (e) => {
        let file = e.target.files[0];
        console.log("file",file)
        let error_img = "";

        if ([
            "application/vnd.oasis.opendocument.spreadsheet",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
            "application/vnd.ms-excel"
        ].includes(file.type)) {
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

    function returnFileSize(number) {
        //El tamaño del archivo en bytes.
        if (number < 1024) {
            return number + 'bytes';
        } else if (number >= 1024 && number < 1048576) {
            return (number / 1024).toFixed(1) + 'KB';
        } else if (number >= 1048576) {
            return (number / 1048576).toFixed(1) + 'MB';
        }
    }


    const handleImportUsers = async () => {
        let file = document.getElementById('file_import_search').files;
        //console.log(file)

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
            if(response.errorImport.length>0){
                setTextMessage(response.message);
            }
            setResponseData(response);
        } else {
            alert("No hay archivos selecionados.")
        }
    }

    const handleCreateGroup=async()=>{
        let request = {
            'url': `${pathApi}/createGroup`,
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
        console.log(response)
    }

    return (
        <Fragment>
            <div className="row">
                <div className="col-sm-12">
                {textMessage!=null&&(
                <div className={`alert alert-success alert-dismissible fade show`} role="alert">
                    <strong>{textMessage}</strong>
                    <button type="button" className="close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                )}
                <AlertMessageSingular {...responseData} />
                </div>
                <div className="col-sm-12">
                    {/*card */}
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    onClick={handleFileImportSearch}
                                    className="btn btn-secondary waves-effect waves-light btn-rounded"
                                >
                                    <i
                                        style={{ zIndex: "-10" }}
                                        className="font-size-16 align-middle mr-2 fas fa-file-excel"></i>
                                    {'Importar Alumnos'}
                                </button>
                                <input type="file" id="file_import_search" onChange={changeFile} style={{ display: 'none' }} />
                                <button 
                                type="button"
                                className="btn btn-primary waves-effect waves-light btn-rounded"
                                onClick={handleCreateGroup}>
                                    {'Crear grupo'}
                                </button>
                            </div>

                            {/** */}
                            <CreateGroup/>
                        </div>
                    </div>
                    {/*Modal */}

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
export default connect(mapStateToProps, mapDispatchToProps)(Index);
//export default Index;