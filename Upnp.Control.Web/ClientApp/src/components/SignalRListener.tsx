import React, { ContextType, PropsWithChildren, useContext, useEffect, useRef } from "react";
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

export default class SignalRListener extends React.PureComponent<PropsWithChildren<SignalRListenerProps>> {

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

export function useSignalR(callbacks: IMessageCallbackSet) {
    const hub = useContext(SignalRContext);

    const prevRef = useRef<IMessageCallbackSet>();

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