import { AddBookmarkAction } from "./actions/AddBookmarkAction";
import { OpenMediaAction } from "./actions/OpenMediaAction";
import { ActionDescriptor, DeviceCard } from "./DeviceCard";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

const rendererActions: ActionDescriptor[] = [
    ["open", OpenMediaAction],
    ["add-bookmark", AddBookmarkAction, { className: "m-0" }]
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={rendererActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>
}