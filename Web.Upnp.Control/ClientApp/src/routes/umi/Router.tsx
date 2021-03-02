import { Route, Redirect, RouteComponentProps } from "react-router-dom"
import PlaylistManager from "./playlist/PlaylistManager";
import DeviceRouter from "../common/DeviceRouter";
import UmiDeviceCard from "../common/Device.Umi";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, PlaylistRoutePath } from "../common/Types";
import { strict } from "assert";

export default (props: RouteComponentProps<CategoryRouteParams>) => <>
    <UmiActionSvgSymbols />
    <DeviceRouter {...props} deviceTemplate={UmiDeviceCard}>
        <Route path={`${props.match.path}/:device/playlists/(0|-1)`} exact render={() => <Redirect to={`/${props.match.params.category}`} />} />
        <Route path={`${props.match.path}/:device/playlists/:id(.*)*` as PlaylistRoutePath} render={props => <PlaylistManager {...props} />} />
    </DeviceRouter>
</>