import React, { ComponentType, createRef, HTMLAttributes } from "react";
import { SignalRListener, SignalRMessageHandler } from "../../components/SignalR";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, DiscoveryMessage, UpnpDevice } from "./Types";
import { DataFetchProps } from "../../components/DataFetch";
import NotificationsHost from "../../components/NotificationsHost";

export type TemplatedDataComponentProps<T = any, P = {}> = { itemTemplate: ComponentType<DataSourceProps<T> & P> }

export type ViewMode = "grid" | "carousel" | "auto";

function GridContainer({ viewMode, className, children, ...other }: HTMLAttributes<HTMLDivElement> & { viewMode?: ViewMode }) {
    const viewClass = viewMode === "grid"
        ? "grid-responsive-auto"
        : viewMode === "carousel"
            ? "grid-carousel"
            : "grid-carousel grid-responsive-auto-lg";
    return <div {...other} className={`h-100 d-grid grid-scroll-snap ${viewClass}${className ? " " + className : ""}`}>
        {children}
    </div>;
}

type DeviceContainerProps = DataFetchProps<UpnpDevice> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    DeviceRouteParams & { viewMode?: ViewMode };

export function DeviceContainer({ itemTemplate: Item, dataContext, category, fetching, viewMode }: DeviceContainerProps) {
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <GridContainer viewMode={viewMode}>
            {dataContext?.source && <Item data-source={dataContext.source} category={category} device={dataContext.source.udn} />}
        </GridContainer>
    </>;
}

type DeviceListContainerProps = DataFetchProps<UpnpDevice[]> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    CategoryRouteParams & { viewMode?: ViewMode };

export class DeviceListContainer extends React.Component<DeviceListContainerProps> {
    static defaultProps: Partial<DeviceListContainerProps> = { viewMode: "grid" }
    nhRef = createRef<NotificationsHost>();

    onDiscoveryEvent = (device: string, { device: { name, description }, type }: DiscoveryMessage) => {
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
        return <>
            {fetching && <LoadIndicatorOverlay />}
            <SignalRListener handlers={this.handlers}>
                <GridContainer viewMode={viewMode}>
                    {[dataContext?.source.map(item => <Item key={item.udn} data-source={item} category={category} device={item.udn} />)]}
                </GridContainer>
                <NotificationsHost ref={this.nhRef} />
            </SignalRListener>
        </>
    }
}