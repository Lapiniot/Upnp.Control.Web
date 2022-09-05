import React from "react";
import { Portal } from "./Portal";
import { Toast } from "./Toast";

interface Notification {
    id: string,
    title: string,
    color?: UI.ThemeColors,
    message: React.ReactNode,
    delay?: number
}

export interface INotificationHost {
    push(notification: Notification): void
}

function initializer() {
    return new Map<string, Notification>()
}

export default function (_: unknown, ref: React.Ref<INotificationHost>) {
    const [state, setState] = React.useState(initializer);

    const handler = React.useCallback(({ dataset: { id: key } }: HTMLDivElement) => {
        setState(state => { state.delete(key!); return state })
    }, []);

    React.useImperativeHandle(ref, () => ({
        push(notification) {
            setState(state => { state.set(notification.id, notification); return state; })
        }
    }), []);

    return <Portal selector="#notifications-root">
        {Array.from(state).map(({ 0: k, 1: { title, color, delay, message } }) =>
            <Toast key={k} data-id={k} header={title} color={color} autohide={!!(delay && delay > 0)} delay={delay} onDismissed={handler}>{message}</Toast>)}
    </Portal>
}