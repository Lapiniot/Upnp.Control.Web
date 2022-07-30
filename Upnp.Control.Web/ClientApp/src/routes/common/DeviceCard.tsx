import { ComponentType, HTMLAttributes } from "react";
import { Link } from "../../components/NavLink";
import { DeviceActionProps } from "./actions/Actions";
import { AddBookmarkAction } from "./actions/AddBookmarkAction";
import DeviceIcon from "./DeviceIcon";
import { UpnpDevice, UpnpDeviceCategory } from "./Types";

type ActionWidgetComponent = ComponentType<DeviceActionProps & HTMLAttributes<HTMLElement>>;

export type ActionDescriptor = [key: string, component: ActionWidgetComponent, props?: HTMLAttributes<HTMLElement>];

type DeviceCardProps = HTMLAttributes<HTMLDivElement> & DataSourceProps<UpnpDevice> & {
    category: UpnpDeviceCategory,
    actions?: ActionDescriptor[]
}

export function DeviceCard({ dataSource: d, category, children, actions, className, ...other }: DeviceCardProps) {
    const placeholderCls = d ? "" : ` placeholder-${($cfg[category]?.placeholders?.effect) ?? $cfg.placeholders.effect}`;
    return <div className={`card${placeholderCls}${className ? ` ${className}` : ""}`} {...other}>
        <div className="card-header hstack bg-transparent border-0">
            <DeviceIcon device={d} className={!d ? "placeholder" : undefined} />
            {d ? <div className="flex-fill overflow-hidden">
                <h5 className="card-title text-truncate">{d.presentUrl ? <Link to={d.presentUrl} className="p-0">{d.name}</Link> : d.name}</h5>
                <h6 className="card-subtitle text-truncate">{d.description}</h6>
            </div> : <div className="flex-fill overflow-hidden">
                <h5 className="card-title text-truncate w-75 d-block placeholder">&nbsp;</h5>
                <h6 className="card-subtitle text-truncate w-50 d-block placeholder">&nbsp;</h6>
            </div>}
            <AddBookmarkAction category={category} device={d} />
        </div>
        <div className="card-body min-h-0">
            {children}
        </div>
        <div className="card-footer hstack flex-wrap g-2 bg-transparent border-0">
            {actions?.map(({ 0: key, 1: ActionWidget, 2: props }) =>
                <ActionWidget key={key} device={d} category={category} {...props} />)}
        </div>
    </div>
}