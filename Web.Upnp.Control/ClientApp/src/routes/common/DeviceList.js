import React from "react";
import "bootstrap/js/src/alert";
import { SignalRListener } from "../../components/SignalR";
import Loader from "../../components/LoadIndicator";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.handlers = new Map([
            ["SsdpDiscoveryEvent", this.onDiscoveryEvent]
        ]);
        this.alerts = [];
    }

    onDiscoveryEvent = (device, message) => {
        const reload = this.props.dataContext?.reload;
        if (typeof reload === "function") {
            this.alerts[device] = message;
            reload();
        }
    }

    render() {
        const { dataContext, itemTemplate: Item } = this.props;

        const alerts = Object.entries(this.alerts).map(e => {
            return <div className={`alert ${e[1] === "appeared" ? "alert-success" : "alert-warning"} alert-dismissible fade show mx-3 my-2`} role="alert">
                {e[0]}
                <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" />
            </div>
        });

        return <>
            <svg className="d-none" aria-hidden="true" focusable="false" role="img">
                <symbol id="upnp-renderer" viewBox="0 0 640 512">
                    <path fill="currentColor" d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z"></path>
                </symbol>
                <symbol id="upnp-server" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M480 160H32c-17.673 0-32-14.327-32-32V64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z">
                    </path>
                </symbol>
            </svg>
            <SignalRListener handlers={this.handlers}>{null}</SignalRListener>
            {dataContext?.source
                ? <>
                    {alerts}
                    <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
                        {[dataContext.source.map(item => <Item key={item.udn} data-source={item} />)]}
                    </div>
                </>
                : <Loader>Loading...</Loader>}
        </>
    }
}