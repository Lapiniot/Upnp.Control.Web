import { useHistory, useLocation, useRouteMatch } from "react-router";
import DeviceRouter from "../common/DeviceRouter";
import { CategoryRouteParams } from "../common/Types";

export default function () {
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch<CategoryRouteParams>();
    return <DeviceRouter history={history} location={location} match={match} listViewMode="grid" />;
}