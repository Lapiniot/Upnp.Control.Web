import { OpenMediaAction } from "./Device.Actions";
import { ActionDescriptor, DeviceCard } from "./DeviceCard";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

const rendererActions: ActionDescriptor[] = [["open", OpenMediaAction]];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={rendererActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>
}