import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";


/**components */
import TitleModule from '../Helpers/TitleModule'
import Navar from "../Components/Layout/Navar";
import Sidebar from "../Components/Layout/Sidebar";
import Footer from "../Components/Layout/Footer";



/**actions redux */
import { verifySessionAuth } from '../Redux/Actions/Auth'


const Dashboard = (props) => {
    console.log(props)
    let location = useLocation();

    useEffect(() => {
        //console.log(location.pathname)
        //props.verifySessionAuth();
    }, [location.pathname]);

    return (

        <Fragment>
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