import { OpenMediaAction } from "../common/actions/OpenMediaAction";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";
import PlayerWidget from "../common/PlayerWidget";
import { UpnpDevice } from "../common/Types";

const rendererActions: ActionDescriptor[] = [["open", OpenMediaAction]];

export default function ({ dataSource: d, ...props }: DataSourceProps<UpnpDevice> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={rendererActions}>
        <PlayerWidget udn={d?.udn} />
    </DeviceCard>
}