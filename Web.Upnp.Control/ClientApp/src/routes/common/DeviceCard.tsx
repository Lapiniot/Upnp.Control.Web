import React, { ComponentType, PropsWithChildren } from "react";
import DeviceIcon from "./DeviceIcon";
import { NavLink } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceActionProps } from "./Device.Actions";

export type DeviceProps = PropsWithChildren<DataSourceProps<UpnpDevice> & {
    category?: string;
    actions?: ComponentType<DeviceActionProps>[]
}>

export function DeviceCard({ "data-source": d, category, children, actions }: DeviceProps) {
    return <div className="card shadow">
        <div className="card-header d-flex">
            <DeviceIcon service={d.type} icons={d.icons} />
            <div>
                <h5 className="card-title">{d.presentUrl ? <NavLink to={d.presentUrl} className="p-0">{d.name}</NavLink> : d.name}</h5>
                <h6 className="card-subtitle">{d.description}</h6>
            </div>
        </div>
        <div className="card-body">
            {children}
        </div>
        <div className="card-footer no-decoration d-flex gap-2">
            {actions?.map(ActionWidget => <ActionWidget device={d} category={category} />)}
        </div>
    </div>;
}