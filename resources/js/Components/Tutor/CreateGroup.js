import React, { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";

import AlertMessageSingular from "../../Helpers/AlertMessageSingular";
import { pathApi } from "../../env";
import { fetchRequest } from "../../Redux/Actions/fetchRequest";

/**components */
import { Careers, Period, Semester, Shift } from "../../Helpers/School";

const CreateGroup = ({
    Auth,
    fetchRequest
}) => {
    const { token } = Auth;
    const [responseMessage, setResponseMessage] = useState({})


    let [dataForm, setDataForm] = useState({});
    const onChangeInputData = (e) => {
        setDataForm({
            ...dataForm,
            [e.target.name]: e.target.value
        });
    }
    const date = new Date();

    const handleGroup = async () => {
        
        let year_period=document.getElementById('year_period').value;
        let data_object=Object.assign({...dataForm,'year_period':year_period});
        console.log(data_object);

        let request = {
            'url': `${pathApi}/schoolGroup`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data_object)
            },
            "showLoader": true
        };
        let response = await fetchRequest(request);
        setResponseMessage(response);
    }

    return (
        <Fragment>
            <div className="form-row">
                <div className="col-sm-12 mt-4 mb-4">
                    <AlertMessageSingular {...responseMessage}></AlertMessageSingular>
                </div>
                {/**carreras */}
                <div className="col-sm-12 form-group">
                    <Careers
                        setResponseMessage={setResponseMessage}
                        onChangeInputData={onChangeInputData}
                        careersSelected={dataForm.careers}
                    />
                </div>
                {/**semestres */}
                <div className="col-sm-6 form-group">
                    <Semester onChangeInputData={onChangeInputData} semester={dataForm.semester} />
                </div>
                {/**turno */}
                <div className="col-sm-6 form-group">
                    <Shift onChangeInputData={onChangeInputData} school_shift={dataForm.school_shift} />
                </div>
                {/**periodo */}
                <div className="col-sm-6 form-group">
                    <Period
                        onChangeInputData={onChangeInputData}
                        year_period={dataForm.year_period || date.getFullYear()}
                        period={dataForm.period}
                        setDataForm={setDataForm}
                    />
                </div>
                <div className="col-sm-12 form-group">
                    <button
                        type="button"
                        className="btn btn-primary waves-effect waves-light btn-rounded"
                        onClick={handleGroup}>
                        {'Crear grupo'}
                    </button>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);