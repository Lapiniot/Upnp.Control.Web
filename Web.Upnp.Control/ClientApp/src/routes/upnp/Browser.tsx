import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { Browser as BrowserBase } from "../common/Browser";
import { withBrowserDataFetch } from "../common/BrowserUtils";
import { BrowseRouteParams, DeviceRouteParams } from "../common/Types";

const BrowserDataView = withBrowserDataFetch(BrowserBase, false);

function Browser() {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch<BrowseRouteParams>();
    return <BrowserDataView location={location} history={history} match={match} />
}

export default function () {
    const { path, params: { category } } = useRouteMatch<DeviceRouteParams>();
    return <Switch>
        <Route path={`${path}/-1`} exact>
            <Redirect to={`/${category}`} />
        </Route>
        <Route path={`${path}/:id(.*)*`}>
            <Browser />
        </Route>
    </Switch>
}