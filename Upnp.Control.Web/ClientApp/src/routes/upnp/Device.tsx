import DeviceInfo from "../common/DeviceInfo";
import ServicesList from "../common/DeviceServiceList";
import { DownloadMetadataAction, BrowseContentAction } from "../common/actions/Actions";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";

const upnpActions: ActionDescriptor[] = [
    ["download", DownloadMetadataAction],
    ["browse", BrowseContentAction]
]

export default function ({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    return <DeviceCard {...props} dataSource={d} actions={upnpActions}>
        <DeviceInfo dataSource={d} />
        <ServicesList dataSource={d?.services} />
    </DeviceCard>
}