import * as signalR from "@microsoft/signalr";
import React from "react";

const { Provider, Consumer } = React.createContext();

class SignalRConnection extends React.Component {
    constructor(props) {
        super(props);
        this.hub = new signalR.HubConnectionBuilder().withUrl(props.hubUrl).build();
    }

    render() {
        return <Provider value={hub}>{props.children}</Provider>
    }
}

export { Consumer as SignalRConsumer, Provider as SignalRProvider, SignalRConnection };