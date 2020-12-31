import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DownloadMetadataAction, BrowseContentAction } from "./Device.Actions";
import { DeviceCard } from "./DeviceCard";

const upnpActions = [DownloadMetadataAction, BrowseContentAction];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    const { "data-source": d } = props;
    return <DeviceCard {...props} actions={upnpActions}>
        <DeviceInfo data-source={d} />
        <ServicesList data-source={d.services} data-row-id={d.udn} />
    </DeviceCard>
}