import * as signalR from "@microsoft/signalr";
import React from "react";

export type SignalRMessageHandler = (...args: any) => void;
type SignalRConnectionProps = { hubUrl: string }
type SignalRListenerProps = { handlers: Iterable<[string, SignalRMessageHandler]> }

const SignalRContext = React.createContext<signalR.HubConnection | null>(null);

export class SignalRConnection extends React.Component<SignalRConnectionProps, { connected: boolean; error: Error | string | null; }> {

    hub: signalR.HubConnection;
    state = { error: null, connected: false };

    constructor(props: SignalRConnectionProps) {
        super(props);
        this.hub = new signalR.HubConnectionBuilder()
            .withUrl(props.hubUrl)
            .withAutomaticReconnect([2, 4, 8, 16, 32, 64])
            .build();
    }

    async componentDidMount() {
        try {
            await this.hub.start();
            console.info(`Established SignalR connection to the hub at '${this.hub.baseUrl}'`);
            this.setState({ error: null, connected: true });
        } catch (error) {
            const message = `Error connecting to a SignalR hub at '${this.hub.baseUrl}': ${error.message}`;
            console.error(message);
            this.setState({ error: `Cannot establish connection to events hub. Some features may not work.`, connected: false });
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
        return <React.Fragment>
            {this.state.error && <div className="alert bg-danger text-white text-center m-3" role="alert">
                {this.state.error}
                <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close" />
            </div>}
            <SignalRContext.Provider value={this.hub}>{this.props.children}</SignalRContext.Provider>
        </React.Fragment>
    }
}

export class SignalRListener extends React.Component<SignalRListenerProps> {

    static contextType = SignalRContext;

    componentDidMount() {
        this.foreach((e, h) => {
            this.context.on(e, h);
            console.info(`Subscibed to event '${e}'`);
        });
    }

    componentWillUnmount() {
        this.foreach((e, h) => {
            this.context.off(e, h);
            console.info(`Unsubscibed from event '${e}'`);
        });
    }

    foreach(func: (key: string, handler: SignalRMessageHandler) => void) {

        for (let [key, handler] of this.props.handlers)
            func(key, handler);
    }

    render() {
        return this.props.children;
    }
}