import { Route, Redirect, RouteComponentProps } from "react-router-dom"
import PlaylistManager from "./playlist/PlaylistManager";
import DeviceRouter from "../common/DeviceRouter";
import UmiDeviceCard from "../common/Device.Umi";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, PlaylistRoutePath } from "../common/Types";

export default (props: RouteComponentProps<CategoryRouteParams>) => <>
    <UmiActionSvgSymbols />
    <DeviceRouter {...props} deviceTemplate={UmiDeviceCard}>
        <Route path={`${props.match.path}/:device/playlists/(0|-1)`} exact render={() => <Redirect to={`/${props.match.params.category}`} />} />
        <Route path={`${props.match.path}/:device/playlists/:id(.+)` as PlaylistRoutePath} render={props => <PlaylistManager {...props} />} />
        <Route path={`${props.match.path}/:device/playlists` as PlaylistRoutePath} render={({ match: { url } }) => <Redirect to={`${url}${url.endsWith("/") ? "" : "/"}PL:`} />} />
    </DeviceRouter>
</>