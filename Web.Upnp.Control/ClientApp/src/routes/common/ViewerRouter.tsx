import { Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import { withViewerDataFetch } from "./BrowserUtils";
import { MediaViewer } from "./MediaViewer";
import { DeviceRouteParams, ViewRouteParams } from "./Types";

const Viewer = withViewerDataFetch(MediaViewer);

function ViewerPage() {
    const params = useParams<ViewRouteParams>();
    return <Viewer {...params} />
}

export default function () {
    const { path, params: { category } } = useRouteMatch<DeviceRouteParams>();
    return <Switch>
        <Route path={`${path}/-1`} exact>
            <Redirect to={`/${category}`} />
        </Route>
        <Route path={`${path}/:id(.+)*`}>
            <ViewerPage />
        </Route>
    </Switch>;
}