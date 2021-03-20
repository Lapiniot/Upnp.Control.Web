import React, { ComponentType } from "react";
import { SignalRListener, SignalRMessageHandler } from "../../components/SignalR";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, UpnpDevice } from "./Types";
import { DataFetchProps } from "../../components/DataFetch";
import { Toast } from "../../components/Toast";

interface DiscoveryMessage {
    type: string;
    info: UpnpDevice;
}

type DeviceListState = {
    alerts: Map<string, DiscoveryMessage>
}

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

export class DeviceListContainer extends React.Component<DeviceListContainerProps, DeviceListState> {

    onDiscoveryEvent = (device: string, message: DiscoveryMessage) => {
        const reload = this.props.dataContext?.reload;
        if (typeof reload === "function") {
            reload(null, { alerts: this.state.alerts.set(device, message) });
        }
    }

    static defaultProps: Partial<DeviceListContainerProps> = { viewMode: "grid" }

    handlers: Map<string, SignalRMessageHandler> = new Map([["SsdpDiscoveryEvent", this.onDiscoveryEvent]]);

    state: DeviceListState = { alerts: new Map() };

    dismissAlert = (element: HTMLDivElement) => {
        const key = element.dataset["id"];
        if (key) {
            this.state.alerts.delete(key);
            this.setState({ alerts: this.state.alerts });
        }
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching, category, viewMode } = this.props;
        const viewClass = viewMode === "grid"
            ? "grid-responsive-auto"
            : viewMode === "carousel"
                ? "grid-carousel"
                : "grid-carousel grid-responsive-auto-lg";
        return <>
            {fetching || !dataContext?.source
                ? <LoadIndicatorOverlay />
                : <SignalRListener handlers={this.handlers}>
                    {/* {!fetching && this.state.alerts.size > 0 &&
                        <div className="m-3 mb-0 d-flex flex-wrap justify-content-center gap-3">{
                            Array.from(this.state.alerts).map(({ 0: key, 1: { type, info: { name, description } } }) =>
                                <Toast key={key} data-id={key} header={name} color={type === "appeared" ? "success" : "warning"}
                                    delay={120000} onDismissed={this.dismissAlert}><b>&laquo;{description}&raquo;</b> has {type === "appeared" ? "appeared on" : "disappeared from"} the network</Toast>
                            )}
                        </div>} */}
                    <div className={`h-100 d-grid grid-scroll-snap ${viewClass}`}>
                        {[dataContext.source.map(item => <Item key={item.udn} data-source={item} category={category} device={item.udn} />)]}
                    </div>
                </SignalRListener>}
        </>
    }
}