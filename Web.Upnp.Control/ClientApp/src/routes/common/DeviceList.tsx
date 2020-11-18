import React, { ComponentType } from "react";
import "bootstrap/js/src/alert";
import { SignalRListener, SignalRMessageHandler } from "../../components/SignalR";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DataFetchProps } from "../../components/DataFetch";

type AlertProps = {
    type: string;
    name: string;
    description: string;
    onDismiss?: () => void | undefined;
};

function DiscoveryAlert({ type, name, description, onDismiss }: AlertProps) {
    const appeared = type === "appeared";
    return <div className={`alert ${appeared ? "alert-success" : "alert-warning"} alert-dismissible fade show m-3 d-flex justify-content-center`} role="alert">
        <h6>{name}&nbsp;({description}){appeared ? " appeared on the network" : " disappeared from the network"}</h6>
        <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={onDismiss} />
    </div>;
}

interface DiscoveryMessage {
    type: string;
    info: UpnpDevice;
}

type DeviceListState = {
    alerts: Map<string, DiscoveryMessage>
}

export type TemplatedDataComponentProps<T = any, P = {}> = P & { itemTemplate: ComponentType<DataSourceProps<T>> }

export function DeviceContainer({ itemTemplate: Template, dataContext }: DataFetchProps<UpnpDevice> & TemplatedDataComponentProps<UpnpDevice> & { category: string; device: string }) {
    return <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
        {dataContext?.source && <Template data-source={dataContext.source} />}
    </div>;
}

export class DeviceListContainer extends React.Component<DataFetchProps<UpnpDevice[]> & TemplatedDataComponentProps<UpnpDevice> & { category: string }, DeviceListState> {

    onDiscoveryEvent = (device: string, message: DiscoveryMessage) => {
        this.showAlert(device, message);
        const reload = this.props.dataContext?.reload;
        if (typeof reload === "function") reload();
    }

    handlers: Map<string, SignalRMessageHandler> = new Map([["SsdpDiscoveryEvent", this.onDiscoveryEvent]]);

    state: DeviceListState = { alerts: new Map() };

    showAlert = (device: string, message: DiscoveryMessage) => {
        this.state.alerts.set(device, message);
        this.setState({ alerts: this.state.alerts });
    }

    dismissAlert = (key: string) => {
        this.state.alerts.delete(key);
        this.setState({ alerts: this.state.alerts });
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching } = this.props;

        const alerts = Array.from(this.state.alerts).map(({ 0: key, 1: { type, info: { name, description } } }) =>
            <DiscoveryAlert key={key} type={type} name={name} description={description} onDismiss={() => this.dismissAlert(key)} />);

        return <div className="position-relative w-100 h-100">
            {fetching || !dataContext?.source
                ? <LoadIndicatorOverlay />
                : <SignalRListener handlers={this.handlers}>
                    {alerts}
                    <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
                        {[dataContext.source.map(item => <Item key={item.udn} data-source={item} />)]}
                    </div>
                </SignalRListener>}
        </div>
    }
}