import PlayerWidget from "../common/PlayerWidget";
import { DataSourceProps, UpnpDevice } from "../common/Types";
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
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={umiActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>;
}