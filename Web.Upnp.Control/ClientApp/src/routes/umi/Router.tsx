import { Redirect, Route, useRouteMatch } from "react-router-dom";
import UmiDeviceCard from "./Device";
import DeviceRouter from "../upnp/Router";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams } from "../common/Types";
import PlaylistPage from "./playlist/Playlist";

export default function () {
    const { path, params: { category } } = useRouteMatch<CategoryRouteParams>();
    return <>
        <UmiActionSvgSymbols />
        <DeviceRouter deviceTemplate={UmiDeviceCard} listViewMode="auto">
            <Route path={`${path}/:device/playlists/(0|-1)`} exact>
                <Redirect to={`/${category}`} />
            </Route>
            <Route path={`${path}/:device/playlists/:id(.*)*`}>
                <PlaylistPage />
            </Route>
        </DeviceRouter>
    </>;
}