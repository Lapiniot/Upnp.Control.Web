import React, { type ContextType, type PropsWithChildren } from "react";
import { SignalRContext } from "./SignalRContext";

interface Callback { (...args: unknown[]): void }

type SignalRListenerProps = { callbacks: Record<string, Callback> }

function apply(callbacks: Record<string, Callback>, action: (methodName: string, method: Callback) => void) {
    for (const key in callbacks) {
        action(key, callbacks[key]);
    }
}

export default class SignalRListener extends React.PureComponent<PropsWithChildren<SignalRListenerProps>> {

    static override contextType = SignalRContext;
    override context: ContextType<typeof SignalRContext> = null;

    override componentDidMount() {
        apply(this.props.callbacks, this.subscribe);
    }

    override componentWillUnmount() {
        apply(this.props.callbacks, this.unsubscribe);
    }

    override componentDidUpdate(prevProps: Readonly<SignalRListenerProps>) {
        if (prevProps.callbacks !== this.props.callbacks) {
            apply(prevProps.callbacks, this.unsubscribe);
            apply(this.props.callbacks, this.subscribe);
        }
    }

    subscribe = (methodName: string, method: Callback) => {
        this.context?.on(methodName, method);
        console.info(`Subscibed to event '${methodName}'`);
    };

    unsubscribe = (methodName: string, method: Callback) => {
        this.context?.off(methodName, method);
        console.info(`Unsubscibed from event '${methodName}'`);
    };

    override render() {
        return this.props.children ?? null;
    }
}