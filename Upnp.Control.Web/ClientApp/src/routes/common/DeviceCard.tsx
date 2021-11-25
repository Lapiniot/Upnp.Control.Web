import { ComponentType, HTMLAttributes } from "react";
import DeviceIcon from "./DeviceIcon";
import { Link } from "../../components/NavLink";
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
        <div className="card-header hstack bg-transparent border-0">
            <DeviceIcon device={d} />
            <div className="flex-fill overflow-hidden">
                <h5 className="card-title text-truncate">{d.presentUrl ? <Link to={d.presentUrl} className="p-0">{d.name}</Link> : d.name}</h5>
                <h6 className="card-subtitle text-truncate">{d.description}</h6>
            </div>
            <AddBookmarkAction category={category} device={d} />
        </div>
        <div className="card-body min-h-0">
            {children}
        </div>
        <div className="card-footer hstack flex-wrap gap-2 bg-transparent border-0">
            {actions?.map(({ 0: key, 1: ActionWidget, 2: props }) =>
                <ActionWidget key={key} device={d} category={category} {...props} />)}
        </div>
    </div>;
}