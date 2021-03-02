import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { withViewerDataFetch } from "./BrowserUtils";
import { MediaViewer } from "./MediaViewer";
import { DeviceRouteParams, ViewRoutePath } from "./Types";

const Viewer = withViewerDataFetch(MediaViewer);

export default function ({ match: { path, params: { category } } }: RouteComponentProps<DeviceRouteParams>) {
    return <Switch>
        <Route path={`${path}/-1`} exact render={() => <Redirect to={`/${category}`} />} />
        <Route path={`${path}/:id(.+)*` as ViewRoutePath} render={props => <Viewer {...props.match.params} />} />
    </Switch>;
}