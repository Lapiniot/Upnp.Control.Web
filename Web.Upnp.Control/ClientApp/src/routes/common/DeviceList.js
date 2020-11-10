import React from "react";
import "bootstrap/js/src/alert";
import { SignalRListener } from "../../components/SignalR";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";

function DiscoveryAlert({ type, name, description, onDismiss = () => { } }) {
    const appeared = type === "appeared";
    return <div className={`alert ${appeared ? "alert-success" : "alert-warning"} alert-dismissible fade show m-3 d-flex justify-content-center`} role="alert">
        <h6>{name}&nbsp;({description}){appeared ? " appeared on the network" : " disappeared from the network"}</h6>
        <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" onClick={onDismiss} />
    </div>;
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([["SsdpDiscoveryEvent", this.onDiscoveryEvent]]);
        this.state = { alerts: new Map() };
    }

    onDiscoveryEvent = (device, message) => {
        this.showAlert(device, message);
        const reload = this.props.dataContext?.reload;
        if (typeof reload === "function") reload();
    }

    showAlert = (device, message) => {
        this.state.alerts.set(device, message);
        this.setState({ alerts: this.state.alerts });
    }

    dismissAlert = key => {
        this.state.alerts.delete(key);
        this.setState({ alerts: this.state.alerts });
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching } = this.props;

        const alerts = Array.from(this.state.alerts).map(({ 0: key, 1: { type, info: { name, description } } }) =>
            <DiscoveryAlert key={key} type={type} name={name} description={description} onDismiss={() => this.dismissAlert(key)} />);

        return <div className="position-relative w-100 h-100">
            {fetching ? <LoadIndicatorOverlay />
                : <SignalRListener handlers={this.handlers}>
                    {alerts}
                    <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
                        {[dataContext.source.map(item => <Item key={item.udn} data-source={item} />)]}
                    </div>
                </SignalRListener>}
        </div>
    }
}