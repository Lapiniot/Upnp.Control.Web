import { ComponentType, HTMLAttributes } from "react";
import DeviceIcon from "./DeviceIcon";
import { NavLink } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceActionProps } from "./Device.Actions";

export type DeviceProps = DataSourceProps<UpnpDevice> & {
    category?: string;
    actions?: [string, ComponentType<DeviceActionProps>][]
}

export function DeviceCard({ "data-source": d, category, children, actions, className, ...other }: DeviceProps & HTMLAttributes<HTMLDivElement>) {
    return <div className={`card shadow${className ? ` ${className}` : ""}`} {...other}>
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
        <div className="card-footer d-flex">
            <div className="d-flex flex-gap-2 flex-wrap text-decoration-none">
                {actions?.map(({ 0: key, 1: ActionWidget }) => <ActionWidget key={key} device={d} category={category} />)}
            </div>
        </div>
    </div>;
}