import React from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

type SignalRConnectionProps = { hubUrl: string }

export const SignalRContext = React.createContext<HubConnection | null>(null);

export class SignalRConnection extends React.Component<SignalRConnectionProps, { connected: boolean; error: Error | string | null; }> {

    hub: signalR.HubConnection;
    state = { error: null, connected: false };

    constructor(props: SignalRConnectionProps) {
        super(props);
        this.hub = new HubConnectionBuilder()
            .withUrl(props.hubUrl)
            .withAutomaticReconnect([2, 4, 8, 15, 30, 60])
            .build();
    }

    async componentDidMount() {
        try {
            await this.hub.start();
            console.info(`Established SignalR connection to the hub at '${this.hub.baseUrl}'`);
            this.setState({ error: null, connected: true });
        } catch (error) {
            console.error(`Error connecting to a SignalR hub at '${this.hub.baseUrl}': ${error instanceof Error ? error.message : error}`);
            this.setState({ error: `Cannot establish connection to the server. Some features may not work as expected.`, connected: false });
        }
    }

    async componentWillUnmount() {
        try {
            await this.hub.stop();
            console.info(`Disconnected from SignalR hub at '${this.hub.baseUrl}'`);
        } catch (error) {
            console.error(`Error disconnecting from a SignalR hub at '${this.hub.baseUrl}': ${error}`);
        }
    }

    render() {
        return <>
            {this.state.error && <div className="alert alert-warning rounded-0 py-1 py-md-2 m-0 text-center" role="alert">
                <strong>Connection problems!</strong> {this.state.error}
            </div>}
            <SignalRContext.Provider value={this.hub}>{this.props.children}</SignalRContext.Provider>
        </>
    }
}