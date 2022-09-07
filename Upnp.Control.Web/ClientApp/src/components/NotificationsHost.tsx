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

function initializer() { return { map: new Map<string, Notification>() } }

export default function (_: unknown, ref: React.Ref<INotificationHost>) {
    const [{ map }, setState] = React.useState(initializer);

    const handler = React.useCallback(({ dataset: { id: key } }: HTMLDivElement) => {
        setState(({ map }) => { map.delete(key!); return { map } })
    }, []);

    React.useImperativeHandle(ref, () => ({
        push(notification) {
            setState(({ map }) => { map.set(notification.id, notification); return { map }; })
        }
    }), []);

    return <Portal selector="#notifications-root">
        {Array.from(map).map(({ 0: k, 1: { title, color, delay, message } }) =>
            <Toast key={k} data-id={k} header={title} color={color} autohide={!!(delay && delay > 0)} delay={delay} onDismissed={handler}>{message}</Toast>)}
    </Portal>
}