import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";


/**components */
import TitleModule from '../Helpers/TitleModule'
import Navar from "../Components/Layout/Navar";
import Sidebar from "../Components/Layout/Sidebar";
import Footer from "../Components/Layout/Footer";
import Preloader, { LoaderPreloader } from '../Helpers/Preloader'
/**actions redux */
import { verifySessionAuth } from '../Redux/Actions/Auth'

const Dashboard = (props) => {
    let location = useLocation();


    useEffect(() => {
        setTimeout(() => {
            document.getElementsByClassName('LoaderPreloader')[0].style.display = 'none';
        }, 2000);
        return () => {
            document.getElementsByClassName('LoaderPreloader')[0].style.display = 'block';
        }
    }, [])


    return (
        <Fragment>
            <LoaderPreloader></LoaderPreloader>
            <Preloader></Preloader>
            <div className="container-fluid">
                <div id="layout-wrapper">
                    <Navar></Navar>
                    <Sidebar></Sidebar>
                    <div className="main-content">
                        <div className="page-content">
                            <TitleModule></TitleModule>
                            {props.children}
                        </div>
                        <Footer></Footer>
                    </div>
                </div>
            </div>
        </Fragment>
    )

}

const mapDispatchToProps = {
    verifySessionAuth
}

export default connect(null, mapDispatchToProps)(Dashboard);