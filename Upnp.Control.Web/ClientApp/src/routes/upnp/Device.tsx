import { BrowseContentAction, DownloadMetadataAction } from "../common/actions/Actions";
import { type ActionDescriptor, DeviceCard } from "../common/DeviceCard";
import DeviceInfo from "../common/DeviceInfo";
import ServicesList from "../common/DeviceServiceList";

const upnpActions: ActionDescriptor[] = [
    ["browse", BrowseContentAction],
    ["download", DownloadMetadataAction]
]

export default function Device({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={upnpActions}>
        <DeviceInfo dataSource={d} />
        <ServicesList dataSource={d?.services} />
    </DeviceCard>
}