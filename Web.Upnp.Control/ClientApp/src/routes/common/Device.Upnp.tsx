import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DownloadMetadataAction, BrowseContentAction, AddBookmarkAction } from "./Device.Actions";
import { ActionDescriptor, DeviceCard } from "./DeviceCard";

const upnpActions: ActionDescriptor[] = [
    ["download", DownloadMetadataAction],
    ["browse", BrowseContentAction],
    ["add-bookmark", AddBookmarkAction, { className: "ms-auto" }]
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    const { "data-source": d } = props;
    return <DeviceCard {...props} actions={upnpActions}>
        <DeviceInfo data-source={d} />
        <ServicesList data-source={d.services} data-row-id={d.udn} />
    </DeviceCard>
}