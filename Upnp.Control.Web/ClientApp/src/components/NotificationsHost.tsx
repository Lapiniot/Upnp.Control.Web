import React, { useMemo } from "react";
import { Portal } from "./Portal";
import { Snackbar } from "./Snackbar";

type Notification = { id: string; message: React.ReactNode } & (
    { autohide?: undefined; action: { text: string, handler: () => void } } |
    { autohide: number | true; action?: undefined } |
    { autohide?: undefined; action?: undefined })

export interface INotificationHost {
    push(notification: Notification): void
}

function initializer() { return { map: new Map<string, Notification>() } }

export default function (_: unknown, ref: React.Ref<INotificationHost>) {
    const [{ map }, setState] = React.useState(initializer);
    const { done, value } = map.entries().next();

    const handler = React.useCallback(({ dataset: { id: key } }: HTMLDivElement) => {
        setState(({ map }) => { map.delete(key!); return { map } })
    }, []);

    React.useImperativeHandle(ref, () => ({
        push(notification) {
            setState(({ map }) => { map.set(notification.id, notification); return { map }; })
        }
    }), []);

    const signal = useMemo(() => {
        if (done !== true) {
            const [_, { autohide, action }] = value;
            const delay = autohide === true ? 5000 : autohide === undefined ? !action?.text ? 5000 : -1 : autohide;
            if (delay > 0) {
                return AbortSignal.timeout(delay);
            }
        }
    }, [done, value]);

    return <Portal selector="#notifications-root">
        {done !== true ?
            value[1].action
                ? <Snackbar dismissSignal={undefined} data-id={value[0]} actionText={value[1].action.text} onAction={value[1].action.handler} onDismissed={handler}>{value[1].message}</Snackbar>
                : <Snackbar dismissSignal={signal} data-id={value[0]} actionText={undefined} onDismissed={handler}>{value[1].message}</Snackbar>
            : undefined}
    </Portal>
}