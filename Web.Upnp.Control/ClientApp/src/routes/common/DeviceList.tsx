import React, { ComponentType, createRef } from "react";
import { SignalRListener, SignalRMessageHandler } from "../../components/SignalR";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, DiscoveryMessage, UpnpDevice } from "./Types";
import { DataFetchProps } from "../../components/DataFetch";
import NotificationsHost from "../../components/NotificationsHost";

export type TemplatedDataComponentProps<T = any, P = {}> = { itemTemplate: ComponentType<DataSourceProps<T> & P> }

type DeviceContainerProps = DataFetchProps<UpnpDevice> & TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> & DeviceRouteParams;

export function DeviceContainer({ itemTemplate: Template, dataContext, category, fetching }: DeviceContainerProps) {
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className="h-100 overflow-auto d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
            {dataContext?.source && <Template data-source={dataContext.source} category={category} device={dataContext.source.udn} />}
        </div>
    </>;
}

export type ViewMode = "grid" | "carousel" | "auto";

type DeviceListContainerProps = DataFetchProps<UpnpDevice[]> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    CategoryRouteParams & { viewMode?: ViewMode };

export class DeviceListContainer extends React.Component<DeviceListContainerProps> {
    static defaultProps: Partial<DeviceListContainerProps> = { viewMode: "grid" }
    nhRef = createRef<NotificationsHost>();

    onDiscoveryEvent = (device: string, { info: { name, description }, type }: DiscoveryMessage) => {
        this.nhRef.current?.show({
            id: device, title: name, color: type === "appeared" ? "success" : "warning", delay: 120000,
            message: <>
                <b>&laquo;{description}&raquo;</b> has { type === "appeared" ? "appeared on" : "disappeared from"} the network
            </>
        });
        this.props.dataContext?.reload?.();
    }

    handlers: Map<string, SignalRMessageHandler> = new Map([["SsdpDiscoveryEvent", this.onDiscoveryEvent]]);

    render() {
        const { dataContext, itemTemplate: Item, fetching, category, viewMode } = this.props;
        const viewClass = viewMode === "grid"
            ? "grid-responsive-auto"
            : viewMode === "carousel"
                ? "grid-carousel"
                : "grid-carousel grid-responsive-auto-lg";
        return <>
            {fetching && <LoadIndicatorOverlay />}
            <SignalRListener handlers={this.handlers}>
                <div className={`h-100 d-grid grid-scroll-snap ${viewClass}`}>
                    {[dataContext?.source.map(item => <Item key={item.udn} data-source={item} category={category} device={item.udn} />)]}
                </div>
                <NotificationsHost ref={this.nhRef} />
            </SignalRListener>
        </>
    }
}