import DeviceInfo from "../common/DeviceInfo";
import ServicesList from "../common/DeviceServiceList";
import { UpnpDevice } from "../common/Types";
import { DownloadMetadataAction, BrowseContentAction } from "../common/actions/Actions";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";

const upnpActions: ActionDescriptor[] = [
    ["download", DownloadMetadataAction],
    ["browse", BrowseContentAction]
];

export default function ({ dataSource: d, ...props }: DataSourceProps<UpnpDevice> & { category: DeviceCategory }) {
    return <DeviceCard {...props} dataSource={d} actions={upnpActions}>
        <DeviceInfo dataSource={d} />
        <ServicesList dataSource={d?.services} />
    </DeviceCard>
}