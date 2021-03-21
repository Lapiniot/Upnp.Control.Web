import { ComponentType, HTMLAttributes } from "react";
import DeviceIcon from "./DeviceIcon";
import { NavLink } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceActionProps } from "./actions/Actions";
import { AddBookmarkAction } from "./actions/AddBookmarkAction";

type ActionWidgetComponent = ComponentType<DeviceActionProps & HTMLAttributes<HTMLElement>>;

export type ActionDescriptor = [key: string, component: ActionWidgetComponent, props?: HTMLAttributes<HTMLElement>];

export type DeviceCardProps = DataSourceProps<UpnpDevice> & {
    category?: string;
    actions?: ActionDescriptor[]
}

export function DeviceCard({ "data-source": d, category, children, actions, className, ...other }: DeviceCardProps & HTMLAttributes<HTMLDivElement>) {
    return <div className={`card${className ? ` ${className}` : ""}`} {...other}>
        <div className="card-header d-flex bg-transparent border-0">
            <DeviceIcon service={d.type} icons={d.icons} />
            <div className="flex-fill overflow-hidden">
                <h5 className="card-title text-truncate">{d.presentUrl ? <NavLink to={d.presentUrl} className="p-0">{d.name}</NavLink> : d.name}</h5>
                <h6 className="card-subtitle text-truncate">{d.description}</h6>
            </div>
            <AddBookmarkAction category={category} device={d} />
        </div>
        <div className="card-body overflow-hidden">
            {children}
        </div>
        <div className="card-footer d-flex bg-transparent border-0">
            <div className="flex-grow-1 d-flex flex-gap-2 flex-wrap align-items-center align-content-center">
                {actions?.map(({ 0: key, 1: ActionWidget, 2: props }) =>
                    <ActionWidget key={key} device={d} category={category} {...props} />)}
            </div>
        </div>
    </div>;
}