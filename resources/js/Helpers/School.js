import React, { Fragment, useEffect, useState } from "react"
import { connect } from "react-redux"
import { fetchRequest } from "../Redux/Actions/fetchRequest"
import { pathApi } from "../env"

const Semester = ({
    onChangeInputData,
    semester
}) => {

    return (
        <Fragment>
            <label htmlFor="semester" className="form-label label_filter">Semestre</label>
            <select
                name="semester"
                onChange={onChangeInputData}
                value={semester || 0}
                id="semester"
                className="form-control">
                <option value="0" disabled>Selecciona tu semestre</option>
                <option value="1">1º Semestre</option>
                <option value="2">2º Semestre</option>
                <option value="3">3º Semestre</option>
                <option value="4">4º Semestre</option>
                <option value="5">5º Semestre</option>
                <option value="6">6º Semestre</option>
                <option value="7">7º Semestre</option>
                <option value="8">8º Semestre</option>
                <option value="9">9º Semestre</option>
            </select>
        </Fragment>
    )
}

const Shift = ({
    onChangeInputData,
    school_shift
}) => {
    return (
        <Fragment>
            <label htmlFor="school_shift" className="form-label label_filter">Turno</label>
            <select
                name="school_shift"
                onChange={onChangeInputData}
                value={school_shift || 0}
                id="school_shift"
                className="form-control">
                <option value="0" disabled >Selecciona una opción</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
            </select>
        </Fragment>
    )
}


const Enrollment = ({
    onChangeInputData,
    matricula
}) => {

    const validMatricula = (e) => {
        var expreg = /^[0-9]{2}[Ee]{1}[0-9]{5}$/;

        if (e.target.value != "") {
            e.target.value = e.target.value.toUpperCase();
        }

        if (expreg.test(e.target.value)) {
            e.target.classList.remove('is-invalid');
            //e.target.classList.add('is-valid')
        } else {
            e.target.classList.add('is-invalid');
        }
        //console.log(e.target.value, "matricula valid" + expreg.test(e.target.value))

    }

    return (
        <Fragment>
            <label htmlFor="matricula">Matricula</label>
            <div className="input-group mb-0">
                <input
                    name="matricula"
                    onChange={onChangeInputData}
                    value={matricula || ""}
                    onKeyUp={(e) => validMatricula(e)}
                    type="text"
                    className="form-control"
                    maxLength={8}
                    placeholder="Matricula"
                />
            </div>
        </Fragment>
    )
}


const CareersSchool = ({
    onChangeInputData,
    careersSelected,
    Auth,
    fetchRequest,
    setResponseMessage
}) => {

    console.log("careersSelected", careersSelected)

    const { token } = Auth;
    const [careers, setCareers] = useState([]);

    useEffect(() => {
        handleGetCareers()
    }, [])

    /**get careers */
    const handleGetCareers = async () => {
        let request = {
            'url': `${pathApi}/getCareers`,
            'request': {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            },
            "showLoader": false
        };
        const response = await fetchRequest(request);
        console.log(response)
        if (response.status != 200) {
            setResponseMessage(response)
        } else {
            setCareers(response.data)
        }

    }

    return (
        <Fragment>
            <label htmlFor="careers">Carrera</label>
            <select
                className="form-control"
                name="careers"
                id="careers"
                onChange={onChangeInputData}
                value={careersSelected || 0}
            >
                <option value={0} disabled>{'Selecciona tu carrera'}</option>
                {
                    careers.map(item => <option key={item.id_university_careers} value={item.id_university_careers}>{item.name}</option>)
                }
            </select>
        </Fragment>)
}


const Period = ({
    onChangeInputData,
    year_period,
    period,
    setDataForm
}) => {


    useEffect(() => {
        console.log(period)
        const date = new Date();
        let yearMax = date.getFullYear();
        let yearSelected = yearMax;
        let yearMin = 2000;
        let option = "<option disabled value='0'>Selecione el año escolar</option>";
        while (yearMax >= yearMin) {
            let selected = yearSelected == yearMax ? "selected" : "";
            option += `<option ${selected} value=${yearMax}>${yearMax}</option>`;
            yearMax = yearMax - 1;
        }
        let selectedPeriod = document.getElementById('year_period');
        selectedPeriod.innerHTML = option;
    }, [])

    return (
        <Fragment>
            <label htmlFor="careers">Selecione el periodo escolar</label>
            <div className="form-row">
                <select
                    className="col-sm-3 form-control"
                    name="year_period"
                    id="year_period"
                    onChange={onChangeInputData}
                    value={year_period || 0}
                >
                </select>
                <select
                    className="col-sm-9 form-control"
                    name="period"
                    id="period"
                    onChange={onChangeInputData}
                    value={period || 0}
                >
                    <option value="0" disabled>Selecione el periodo escolar</option>
                    <option value="Enero-Junio">Enero-Junio</option>
                    <option value="Julio-Diciembre">Julio-Diciembre</option>
                </select>
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

const Careers = connect(mapStateToProps, mapDispatchToProps)(CareersSchool);

export {
    Semester,
    Shift,
    Enrollment,
    Careers,
    Period
};