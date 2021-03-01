import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { ViewerRouteProps, withViewerDataFetch } from "./BrowserUtils";
import { MediaViewer } from "./MediaViewer";

const Viewer = withViewerDataFetch(MediaViewer);

export default function ({ match: { path, params: { category } } }: RouteComponentProps<ViewerRouteProps>) {
    return <Switch>
        <Route path={`${path}/-1`} exact render={() => <Redirect to={`/${category}`} />} />
        <Route path={`${path}/:id(.+)*`} render={(props: RouteComponentProps<ViewerRouteProps>) =>
            <Viewer {...props} {...props.match.params} />} />
    </Switch>;
}