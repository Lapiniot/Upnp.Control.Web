import { Redirect, Route, useHistory, useLocation, useRouteMatch } from "react-router";
import RendererDeviceCard from "../common/Device.Renderer";
import UmiDeviceCard from "../common/Device.Umi";
import DeviceRouter from "../common/DeviceRouter";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, DataSourceProps, Services, UpnpDevice } from "../common/Types";
import { PlaylistPage } from "../umi/playlist/PlaylistPage";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (props["data-source"].services.find(s => s.type.startsWith(Services.UmiPlaylist)))
        return <UmiDeviceCard {...props} />
    else
        return <RendererDeviceCard {...props} />
}

export default function () {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch<CategoryRouteParams>();
    return <>
        <UmiActionSvgSymbols />
        <DeviceRouter location={location} history={history} match={match} deviceTemplate={TemplateSelector} listViewMode="auto">
            <Route path={`${match.path}/:device/playlists/(0|-1)`} exact>
                <Redirect to={`/${match.params.category}`} />
            </Route>
            <Route path={`${match.path}/:device/playlists/:id(.*)*`}>
                <PlaylistPage />
            </Route>
        </DeviceRouter>
    </>;
}