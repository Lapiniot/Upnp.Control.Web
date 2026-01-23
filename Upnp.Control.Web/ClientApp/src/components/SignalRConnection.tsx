import React, { PropsWithChildren } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export const SignalRContext = React.createContext<HubConnection | null>(null);

type SignalRConnectionProps = { url: string }
type SignalRConnectionState = { connected: boolean; error: Error | string | null }

export class SignalRConnection extends React.Component<PropsWithChildren<SignalRConnectionProps>, SignalRConnectionState> {
    hub: HubConnection;

    constructor(props: SignalRConnectionProps) {
        super(props);
        this.state = { error: null, connected: false };
        this.hub = new HubConnectionBuilder()
            .withUrl(resolve(props.url))
            .withAutomaticReconnect([2, 4, 8, 15, 30, 60])
            .build();
    }

    override async componentDidMount() {
        try {
            await this.hub.start();
            this.onSuccess();
        } catch (error) {
            this.onError(error);
        }
    }

    override async componentDidUpdate({ url: prevUrl }: Readonly<React.PropsWithChildren<SignalRConnectionProps>>): Promise<void> {
        if (this.props.url !== prevUrl) {
            try {
                await this.hub.stop();
                this.hub.baseUrl = resolve(this.props.url);
                await this.hub.start();
                this.onSuccess();
            } catch (error) {
                this.onError(error);
            }
        }
    }

    override async componentWillUnmount() {
        try {
            await this.hub.stop();
            console.info(`Disconnected from SignalR hub at '${this.hub.baseUrl}'`);
        } catch (error) {
            console.error(`Error disconnecting from a SignalR hub at '${this.hub.baseUrl}': ${error}`);
        }
    }

    private onSuccess() {
        console.info(`Established SignalR connection to the hub at '${this.hub.baseUrl}'`);
        this.setState({ error: null, connected: true });
    }

    private onError(error: unknown) {
        console.error(`Error connecting to a SignalR hub at '${this.hub.baseUrl}': ${error instanceof Error ? error.message : error}`);
        this.setState({ error: `Cannot establish connection to the server. Some features may not work as expected.`, connected: false });
    }

    override render() {
        const { error } = this.state;
        return <>
            {error && <div className="alert-warning" role="alert">
                <svg className="icon me-2"><use href="symbols.svg#warning" /></svg>Connection problems! {typeof error === "string" ? error : error.message}
            </div>}
            <SignalRContext value={this.hub}>{this.props.children}</SignalRContext>
        </>
    }
}

function resolve(url: string, base: string = location.origin): string {
    return URL.canParse(url, base) ? new URL(url, base).href : url;
}