import { OpenMediaAction } from "../common/actions/OpenMediaAction";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";
import PlayerWidget from "../common/PlayerWidget";
import { DataSourceProps, UpnpDevice } from "../common/Types";

const rendererActions: ActionDescriptor[] = [["open", OpenMediaAction]];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={rendererActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>
}