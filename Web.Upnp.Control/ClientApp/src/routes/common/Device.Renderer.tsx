import React, { ComponentType } from "react";
import { DeviceActionProps, OpenMediaAction } from "./Device.Actions";
import { DeviceCard } from "./DeviceCard";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

const rendererActions: [string, ComponentType<DeviceActionProps>][] = [["open", OpenMediaAction]];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={rendererActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>
}