import { Redirect, Route, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import UmiDeviceCard from "../common/Device.Umi";
import DeviceRouter from "../common/DeviceRouter";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams } from "../common/Types";
import { PlaylistPage } from "./playlist/PlaylistPage";

export default function () {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch<CategoryRouteParams>();
    return <>
        <UmiActionSvgSymbols />
        <DeviceRouter location={location} history={history} match={match} deviceTemplate={UmiDeviceCard} listViewMode="auto">
            <Route path={`${match.path}/:device/playlists/(0|-1)`} exact>
                <Redirect to={`/${match.params.category}`} />
            </Route>
            <Route path={`${match.path}/:device/playlists/:id(.*)*`}>
                <PlaylistPage />
            </Route>
        </DeviceRouter>
    </>;
}