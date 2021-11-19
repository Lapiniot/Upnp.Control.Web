import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { Browser as BrowserBase } from "../common/Browser";
import { withBrowserDataFetch } from "../common/BrowserUtils";
import { DeviceRouteParams } from "../common/Types";

const Browser = withBrowserDataFetch(BrowserBase, false);

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