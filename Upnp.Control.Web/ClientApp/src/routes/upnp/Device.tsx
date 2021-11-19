import DeviceInfo from "../common/DeviceInfo";
import ServicesList from "../common/DeviceServiceList";
import { DataSourceProps, UpnpDevice } from "../common/Types";
import { DownloadMetadataAction, BrowseContentAction } from "../common/actions/Actions";
import { ActionDescriptor, DeviceCard } from "../common/DeviceCard";

const upnpActions: ActionDescriptor[] = [
    ["download", DownloadMetadataAction],
    ["browse", BrowseContentAction]
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    const { "data-source": d } = props;
    return <DeviceCard {...props} actions={upnpActions}>
        <DeviceInfo data-source={d} />
        <ServicesList data-source={d.services} data-row-id={d.udn} />
    </DeviceCard>
}