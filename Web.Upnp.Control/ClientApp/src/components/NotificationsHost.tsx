import React, { ReactNode, useCallback, useImperativeHandle, useState } from "react";
import { ThemeColors } from "../routes/common/Types";
import { Portal } from "./Portal";
import { Toast } from "./Toast";

type Notification = {
    id: string;
    title: string;
    color?: ThemeColors;
    message: ReactNode;
    delay?: number;
};

export interface INotificationHost {
    push(notification: Notification): void
};

export default function (_: {}, ref: React.Ref<INotificationHost>) {
    const [state, setState] = useState({ notifications: new Map<string, Notification>() });

    const handler = useCallback(({ dataset: { id } }: HTMLDivElement) => {
        if (!id) return;
        setState(({ notifications }) => {
            notifications.delete(id);
            return { notifications };
        });
    }, [setState]);

    useImperativeHandle(ref, () => ({
        push: notification => {
            setState(({ notifications }) => {
                notifications.set(notification.id, notification);
                return { notifications };
            });
        }
    }), [setState]);

    return <Portal selector="#notifications-root">
        {Array.from(state.notifications).map(({ 0: k, 1: { title, color, delay, message } }) =>
            <Toast key={k} data-id={k} header={title} color={color} autohide={!!(delay && delay > 0)} delay={delay} onDismissed={handler}>{message}</Toast>)}
    </Portal>;
}