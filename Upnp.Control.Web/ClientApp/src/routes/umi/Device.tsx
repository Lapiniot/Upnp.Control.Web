import { type ActionDescriptor, DeviceCard } from "@routes/common/DeviceCard";
import PlayerWidget from "@routes/common/PlayerWidget";
import { BrowseContentAction } from "@routes/common/actions/Actions";
import { ManagePlaylistsAction } from "@routes/common/actions/ManagePlaylistsAction";
import { OpenAudioAction } from "@routes/common/actions/OpenMediaAction";
import { PlaylistMenuAction } from "@routes/common/actions/PlaylistMenuAction";

const umiActions: ActionDescriptor[] = [
    ["browse", BrowseContentAction],
    ["playlists", ManagePlaylistsAction],
    ["quick-playlist", PlaylistMenuAction, { className: "m-0 ms-auto" }],
    ["open", OpenAudioAction, { className: "m-0" }]
]

export default function Device({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={umiActions} className="container-inline card-stripped-sm">
        <PlayerWidget udn={d?.udn} />
    </DeviceCard>
}