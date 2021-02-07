import { Redirect, Route, RouteComponentProps } from "react-router";
import DeviceRouter from "../common/DeviceRouter";
import { DataSourceProps, Services, UpnpDevice } from "../common/Types";
import UmiDeviceCard from "../common/Device.Umi";
import RendererDeviceCard from "../common/Device.Renderer";
import PlaylistManager from "../umi/playlist/PlaylistManager";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (props["data-source"].services.find(s => s.type.startsWith(Services.UmiPlaylist)))
        return <UmiDeviceCard {...props} />
    else
        return <RendererDeviceCard {...props} />
}

export default (props: RouteComponentProps<{ category: string }>) => <>
    <UmiActionSvgSymbols />
    <DeviceRouter {...props} deviceTemplate={TemplateSelector}>
        <Route path={`${props.match.path}/:device/playlists/(0|-1)`} exact render={() => <Redirect to={`/${props.match.params.category}`} />} />
        <Route path={`${props.match.path}/:device/playlists/:id(.*)*`} render={({ id = "PL:", ...other }: any) => <PlaylistManager {...other} id={id} />} />
    </DeviceRouter>
</>