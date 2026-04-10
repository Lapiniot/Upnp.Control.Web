import { BrowseContentAction, DownloadMetadataAction } from "@routes/common/actions/Actions";
import { type ActionDescriptor, DeviceCard } from "@routes/common/DeviceCard";
import DeviceInfo from "@routes/common/DeviceInfo";
import ServicesList from "@routes/common/DeviceServiceList";

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