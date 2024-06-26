import PlayerWidget from "../common/PlayerWidget";
import { BrowseContentAction } from "../common/actions/Actions";
import { OpenAudioAction } from "../common/actions/OpenMediaAction";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";
import { ManagePlaylistsAction } from "../common/actions/ManagePlaylistsAction";
import { PlaylistMenuAction } from "../common/actions/PlaylistMenuAction";

const umiActions: ActionDescriptor[] = [
    ["browse", BrowseContentAction],
    ["playlists", ManagePlaylistsAction],
    ["quick-playlist", PlaylistMenuAction, { className: "m-0 ms-auto" }],
    ["open", OpenAudioAction, { className: "m-0" }]
]

export default function ({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={umiActions} className="container-inline card-stripped-sm">
        <PlayerWidget udn={d?.udn} />
    </DeviceCard>
}