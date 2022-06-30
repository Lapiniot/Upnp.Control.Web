import React, { PropsWithChildren } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export const SignalRContext = React.createContext<HubConnection | null>(null);

type SignalRConnectionProps = { hubUrl: string }
type SignalRConnectionState = { connected: boolean; error: Error | string | null }

export class SignalRConnection extends React.Component<PropsWithChildren<SignalRConnectionProps>, SignalRConnectionState> {
    hub: signalR.HubConnection;

    constructor(props: SignalRConnectionProps) {
        super(props);
        this.state = { error: null, connected: false };
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
        const { error } = this.state;
        return <>
            {error && <div className="alert-warning" role="alert">
                <svg className="icon me-2"><use href="symbols.svg#report_problem" /></svg>Connection problems! {typeof error === "string" ? error : error.message}
            </div>}
            <SignalRContext.Provider value={this.hub}>{this.props.children}</SignalRContext.Provider>
        </>
    }
}