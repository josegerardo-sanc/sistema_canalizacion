
import React, { Fragment, useState, useEffect } from "react";
import {
    Switch,
    Route,
    useRouteMatch
} from "react-router-dom";

import { connect } from "react-redux";

/**views */
import ViewProfile from "../Views/Dashboard/ViewProfile";
import NoMatch from "../Helpers/NoMatch";
import { pathSystem } from '../env'

import Index from '../Views/Dashboard/Tutor/Index'

/*#{ `${RutaDashboard}/user` }*/
const RoutingTutor = ({ Auth }) => {
    const { user } = Auth;
    let match = useRouteMatch();

    const { tutor } = pathSystem;

    return (
        <Switch>
            {
                user?.roleNames[0] == "Tutor" && (
                    <Fragment>
                        <Route exact path={`${match.path}`} component={ViewProfile} />
                        <Route exact path={`${match.path}${tutor.myGroup}`} component={Index} />
                    </Fragment >
                )
            }
            <Route component={NoMatch} />
        </Switch>
    )
}


/*connection with redux */
const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}

export default connect(mapStateToProps)(RoutingTutor);