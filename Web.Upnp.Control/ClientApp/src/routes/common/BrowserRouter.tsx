import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { Browser as BrowserBase } from "./Browser";
import { withBrowserDataFetch } from "./BrowserUtils";
import { BrowseRoutePath, DeviceRouteParams } from "./Types";

const Browser = withBrowserDataFetch(BrowserBase, false);

export default ({ match: { path, params: { category } } }: RouteComponentProps<DeviceRouteParams>) => <Switch>
    <Route path={`${path}/-1`} exact render={() => <Redirect to={`/${category}`} />} />
    <Route path={`${path}/:id(.*)*` as BrowseRoutePath} render={props => <Browser {...props} />} />
</Switch>;