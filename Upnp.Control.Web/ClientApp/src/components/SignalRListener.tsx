import React, { ContextType, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { SignalRContext } from "./SignalRConnection";

interface Callback { (...args: any): void }

type SignalRListenerProps = { callbacks: Record<string, Callback> }

function apply(callbacks: Record<string, Callback>, action: (methodName: string, method: Callback) => void) {
    for (const key in callbacks) {
        action(key, callbacks[key]);
    }
}

export default class SignalRListener extends React.PureComponent<PropsWithChildren<SignalRListenerProps>> {

    static contextType = SignalRContext;
    override context: ContextType<typeof SignalRContext> = null;

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

    subscribe = (methodName: string, method: Callback) => {
        this.context?.on(methodName, method);
        console.info(`Subscibed to event '${methodName}'`);
    };

    unsubscribe = (methodName: string, method: Callback) => {
        this.context?.off(methodName, method);
        console.info(`Unsubscibed from event '${methodName}'`);
    };

    render() {
        return this.props.children ?? null;
    }
}

export function useSignalR(callbacks: Record<string, Callback>) {
    const hub = useContext(SignalRContext);

    const prevRef = useRef<Record<string, Callback>>();

    useEffect(() => {
        if (prevRef.current) {
            apply(prevRef.current, (methodName, method) => hub?.off(methodName, method));
        }

        apply(callbacks, (methodName, method) => hub?.on(methodName, method));

        prevRef.current = callbacks;

        return () => {
            if (prevRef.current) {
                apply(prevRef.current, (methodName, method) => hub?.off(methodName, method));
            }
        }
    }, [callbacks]);
}