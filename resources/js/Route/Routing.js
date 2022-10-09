import React, { Fragment } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";


/**storage de redux */
import { pathSystem } from "../env";

/**views */
import Dashboard from "../Views/Dashboard";
import Login from '../Views/Login'
import ViewRecoveryPassword from '../Views/ViewRecoveryPassword'
import NoMatch from "../Helpers/NoMatch";
import ViewProfile from "../Views/Dashboard/ViewProfile";
/**Routing */
import RoutingUser from './RoutingUser';

const Routing = () => {
    return (

        <BrowserRouter>
            <Switch>
                <DenyAccessAuthenticated exact path="/" component={Login} />
                <DenyAccessAuthenticated path={pathSystem.login} component={Login} />
                <DenyAccessAuthenticated path={pathSystem.password} component={ViewRecoveryPassword} />
                <AllowAccessAuthenticated exact path={pathSystem.dashboard} component={() => <h1>Panel administrativo</h1>} />
                <AllowAccessAuthenticated exact path={`${pathSystem.dashboard}/${pathSystem.profile}`} component={ViewProfile} />
                <AllowAccessAuthenticated path={`${pathSystem.dashboard}/${pathSystem.administrador.user}`} component={RoutingUser} />
                <Route path="*" component={NoMatch} />
            </Switch>
        </BrowserRouter>
    )
}


/*connection with redux */
const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}


const AllowAccessAuth = (props) => {
    const { component: Component, Auth, ...rest } = props;
    if (Auth.auth) {
        return (
            <Fragment>
                <Route {...rest}
                    render={routeProps => (
                        <Dashboard>
                            <Component {...routeProps} />
                        </Dashboard>
                    )}
                />
            </Fragment>
        )
    }
    return <Redirect to={pathSystem.login} />
}

/**DenyAccessAuthenticated */
const DenyAccessAuth = (props) => {

    const { component: Component, Auth, ...rest } = props;
    if (!Auth.auth) {
        return (
            <Fragment>
                <Route {...rest}
                    render={routeProps => (
                        <Component {...routeProps} />
                    )}
                />
            </Fragment>
        )
    }
    return <Redirect to={`${pathSystem.dashboard}`} />
}


const DenyAccessAuthenticated = connect(mapStateToProps, null)(DenyAccessAuth);
const AllowAccessAuthenticated = connect(mapStateToProps)(AllowAccessAuth);

export default Routing;

