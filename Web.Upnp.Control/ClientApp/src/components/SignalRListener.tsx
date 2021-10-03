import React, { ContextType } from "react";
import { SignalRContext } from "./SignalRConnection";

type MessageCallback = (...args: any) => void;

interface IMessageCallbackSet {
    [K: string]: MessageCallback;
}

type SignalRListenerProps = { callbacks: IMessageCallbackSet }

function apply(callbacks: IMessageCallbackSet, action: (methodName: string, method: MessageCallback) => void) {
    for (const key in callbacks) {
        const value = callbacks[key];
        if (typeof value === "function") {
            action(key, value);
        }
    }
}

export default class SignalRListener extends React.PureComponent<SignalRListenerProps> {

    static contextType = SignalRContext;
    context!: ContextType<typeof SignalRContext>;

    componentDidMount() {
        apply(this.props.callbacks, this.subscribe);
    }

    componentWillUnmount() {
        apply(this.props.callbacks, this.unsubscribe);
    }

    componentDidUpdate(prevProps: Readonly<SignalRListenerProps>) {
        if (prevProps.callbacks !== this.props.callbacks) {
            apply(prevProps.callbacks, this.unsubscribe);
            apply(this.props.callbacks, this.subscribe);
        }
    }

    subscribe = (methodName: string, method: MessageCallback) => {
        this.context?.on(methodName, method);
        console.info(`Subscibed to event '${methodName}'`);
    };

    unsubscribe = (methodName: string, method: MessageCallback) => {
        this.context?.off(methodName, method);
        console.info(`Unsubscibed from event '${methodName}'`);
    };

    render() {
        return this.props.children ?? null;
    }
}