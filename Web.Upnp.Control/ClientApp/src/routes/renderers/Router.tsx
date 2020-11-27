import React from "react";
import { RouteComponentProps } from "react-router";
import DeviceRouter from "../common/DeviceRouter";
import { DataSourceProps, Services, UpnpDevice } from "../common/Types";
import UmiDeviceCard from "../common/Device.Umi";
import RendererDeviceCard from "../common/Device.Renderer";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (props["data-source"].services.find(s => s.type.startsWith(Services.UmiPlaylist)))
        return <UmiDeviceCard {...props} />
    else
        return <RendererDeviceCard {...props} />
}

export default (props: RouteComponentProps<{ category: string }>) => <DeviceRouter {...props} deviceTemplate={TemplateSelector} />