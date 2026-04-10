import { OpenMediaAction } from "@routes/common/actions/OpenMediaAction";
import { type ActionDescriptor, DeviceCard } from "@routes/common/DeviceCard";
import PlayerWidget from "@routes/common/PlayerWidget";

const rendererActions: ActionDescriptor[] = [["open", OpenMediaAction]];

export default function Device({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={rendererActions}>
        <PlayerWidget udn={d?.udn} />
    </DeviceCard>
}