import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Pagination from "react-js-pagination";

import Toggle from 'react-toggle'
import "react-toggle/style.css"
/**helpers */
import AlertMessageSingular from "../../Helpers/AlertMessageSingular";

/**config */
import { pathApi, pathDashboard } from "../../env";
/**actions */
import { fetchRequest } from "../../Redux/Actions/fetchRequest";
import { data } from "jquery";


import ServicioImg from '../../Resource/servicios.jpg';

const ListServices = ({
    Auth,
    fetchRequest,
    updateTable
}) => {
    const { token } = Auth;
    const [type, setType] = useState(0);
    const [services, setServices] = useState([])


    const [activePage, setActivePage] = useState(1);
    const [itemsCountPerPage, setItemsCountPerPage] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);

    const [dataPagination, setDataPagination] = useState({
        'startRow': 0,
        'endRow': 0
    });

    useEffect(() => {
        getService();
    }, [])


    const getService = async (numberPage = 1, itemsCountPerPage = 10) => {

        let search = document.getElementById('search').value;
        let type = document.getElementById('typeService').value;

        let request = {
            'url': `${pathApi}/getService`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'type': type,
                    'search': search,
                    'numberPage': numberPage,
                    'endRow': itemsCountPerPage
                })
            },
            'showMessage': false,
        };
        let response = await fetchRequest(request);
        //console.log(response);

        if (response.status == 200) {
            setServices(response.data);

            setTotalItemsCount(response.totalRows);
            setActivePage(response.numberPage);

            setDataPagination({
                'startRow': response.startRow,
                'endRow': response.endRow,
                'totalRows': response.totalRows,
                'numberPage': response.numberPage
            });
        }
    }

    const handleDelete = async (e, item) => {

        let request = {
            'url': `${pathApi}/deleteService/${item.id_service}`,
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
        //console.log(response);
        if (response.status == 200) {
            setServices(services.filter(serv => serv.id_service != item.id_service));
            setTotalItemsCount(totalItemsCount - 1);
        }
    }

    const handleUpdateAccount = async (e, item) => {

        let statusAccountUser = e.target.checked;

        let request = {
            'url': `${pathApi}/updateStatusService`,
            'request': {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'id_service': item.id_service,
                    'statusActive': statusAccountUser
                })
            }
        };
        let response = await fetchRequest(request);
        //console.log(response);
        if (response.status == 200) {
            getService();
        }
    }

    const handleItemsCountPerPage = ({ target }) => {
        setItemsCountPerPage(target.value);
        //console.log("numberPage" + activePage, "itemsCountPerPage" + target.value)
        getService(activePage, target.value)
    }

    const handleNumberPage = (numberPage) => {
        //console.log("numberPage" + numberPage, "itemsCountPerPage" + itemsCountPerPage)
        getService(numberPage, itemsCountPerPage)
    }

    let clearTime = "";
    const handleSearchUser = ({ target }) => {
        clearTimeout(clearTime)
        clearTime = setTimeout(() => {
            getService(1, itemsCountPerPage);
        }, 1000);
    }


    const handleType = (e) => {
        setType(e.target.value);
        getService(1, itemsCountPerPage);
    }


    const handleListServicesIncludes = (list_services) => {
        if (list_services.length > 0) {
            return (
                <div className="plan-features p-4 text-muted mt-2">
                    {
                        list_services.map((serv, indice) => {
                            return (
                                <p key={list_services.id_list_service}>
                                    <i className="mdi mdi-check-bold text-primary mr-4"></i>
                                    {serv.service}
                                </p>
                            )
                        })
                    }
                </div>
            )
        }

        return '';

    }


    const handlePaintCard = () => {
        let { startRow } = dataPagination;
        let rows = services.map((item, key) => {

            startRow = startRow + 1;

            let row =
                <div className="col-md-6 col-lg-6 col-xl-4" key={item.id_service}>
                    <div className="card" style={{ boxShadow: "0px 0px 8px" }}>
                        <div className="card-body">
                            <h6 className="card-subtitle font-14 text-muted">
                                <div className="d-flex justify-content-end align-items-center">
                                    <strong className="font-weight-bold text-dark m-1">
                                        {item.type}
                                    </strong>
                                    <Toggle
                                        id='statusAccountUser'
                                        defaultChecked={(item.is_active == "1" ? true : false)}
                                        onChange={(e) => handleUpdateAccount(e, item)}
                                    />
                                </div>
                            </h6>
                        </div>
                        <img className="img-fluid" src={`/storage/${item.path}`} alt="principal" />
                        <div className="card-body">
                            <h3 className="mt-1 text-primary text-capitalize">{item.title}</h3>
                            {/*
                            <p className="card-text">
                                {item.description_short}
                            </p>
                            */}
                            {
                                item.type != "salon" && (
                                    <div className="text-center bg-soft-light">
                                        <h1 className="m-0">Precio<sup><small>$</small></sup>{item.price}</h1>
                                    </div>
                                )
                            }
                            {
                                (item.type == "habitacion" && item.promotion > 0) && (
                                    <div className="text-center bg-soft-light" style={{ textDecoration: 'line-through' }}>
                                        <h1 className="m-0">Promoción<sup><small>$</small></sup> {item.promotion}</h1>
                                    </div>
                                )
                            }
                            {handleListServicesIncludes(item.list_services)}
                            <Link
                                to={{
                                    pathname: `${pathDashboard}/service`,
                                    state: { 'id_service': item.id_service }
                                }}
                                className=" btn btn-primary waves-effect waves-light"
                            >
                                <i className="dripicons-preview"></i>
                                Editar
                            </Link>
                            <button
                                title="Eliminar"
                                onClick={(e) => handleDelete(e, item)}
                                type="button" className="m-1 btn btn-danger waves-effect waves-light">
                                Eliminar
                                <i
                                    className="bx bx-trash-alt"
                                ></i>
                            </button>
                        </div>
                    </div>
                </div>;

            return row;

        })

        if (!services.length > 0) {
            return <h1 className="m-3 text-center">No se encontrarón resultados.</h1>
        }

        return rows;
    }

    return (
        <Fragment>
            <div className="form-row">

                <div className="form-group col-sm-12 col-md-4">
                    <label className="form-control-label" style={{ opacity: '0' }}>Buscar</label>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar"
                            id="search"
                            onChange={handleSearchUser}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" id="basic-addon2">
                                <i className="fas fa-search"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="form-group col-sm-12 col-md-4">
                    <label className="form-control-label">Tipo</label>
                    <select
                        value={type || 0}
                        onChange={handleType}
                        id="typeService"
                        className="form-control">
                        <option value={0} disabled>Seleccione una opción</option>
                        <option value={'habitacion'}>{'Habitación'}</option>
                        <option value={'promocion'}>{'Promociones'}</option>
                        <option value={'salon'}>{'Salón para eventos'}</option>
                        <option value={"all"}>Todos(*)</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                {handlePaintCard()}
            </div>
            <div className="form-row">
                <div className="col-sm-12 col-md-6 d-flex align-items-center form-control border-0">
                    {/** Mostrando <strong>{dataPagination.startRow + 1}</strong> a <strong>{dataPagination.startRow + dataPagination.endRow}</strong> de <strong>{totalItemsCount}</strong> registros */}

                    Mostrando <strong className="mr-1 ml-1">{dataPagination.startRow + 1}</strong> a
                    <select className="mr-1 ml-1 form-control" value={itemsCountPerPage} onChange={handleItemsCountPerPage} style={{ width: '80px' }}>
                        <option value={10}>10</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    de
                    <strong className="mr-1 ml-1">{totalItemsCount}</strong>
                    registros
                </div>
                <div className="col-sm-12 col-md-6 row justify-content-end">


                    <Pagination
                        linkClass={"page-link"}
                        itemClass={"page-item"}
                        activePage={activePage}
                        itemsCountPerPage={parseInt(itemsCountPerPage)}
                        totalItemsCount={totalItemsCount}
                        pageRangeDisplayed={5}
                        onChange={(numberPage) => handleNumberPage(numberPage)}
                    />
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ListServices);