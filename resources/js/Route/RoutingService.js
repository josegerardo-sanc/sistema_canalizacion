
import React, { Fragment, useState, useEffect } from "react";
import {
    Switch,
    Route,
    useRouteMatch
} from "react-router-dom";

import { connect } from "react-redux";

/**views */
import ViewCatalog from "../Views/Dashboard/ViewService";
import ViewConfigEmail from "../Views/Dashboard/ViewConfigEmail";

/*#{ `${RutaDashboard}/service/habitations` }*/
{/*#{ `${RutaDashboard}/service/config/smtp` } */ }
const RoutingHabitations = ({ Auth }) => {

    //console.log(props)
    let match = useRouteMatch();
    //console.log(match.path)


    return (
        <Fragment>
            <Switch>
                <Route exact path={`${match.path}`}>
                    <ViewCatalog></ViewCatalog>
                </Route>
                {/*#{ `${RutaDashboard}/service/config/smtp` } */}
                <Route exact path={`${match.path}/config/smtp`}>
                    <ViewConfigEmail />
                </Route>
            </Switch>
        </Fragment >
    )
}


/*connection with redux */
const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}

export default connect(mapStateToProps)(RoutingHabitations);