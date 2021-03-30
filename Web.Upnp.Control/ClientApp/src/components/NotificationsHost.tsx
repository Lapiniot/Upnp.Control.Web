import React, { ReactNode } from "react";
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

export default class NotificationsHost extends React.Component<{}> {

    state = { notifications: new Map<string, Notification>() };
    onDissmissed = ({ dataset: { id } }: HTMLDivElement) => {
        if (id) {
            this.state.notifications.delete(id);
            this.forceUpdate();
        }
    }

    public show(notification: Notification) {
        this.state.notifications.set(notification.id, notification);
        this.forceUpdate();
    }

    render() {
        return <Portal selector="#notifications-root">
            {Array.from(this.state.notifications).map(({ 0: k, 1: { title, color, delay, message } }) =>
                <Toast key={k} data-id={k} header={title} color={color} autohide={!!(delay && delay > 0)} delay={delay} onDismissed={this.onDissmissed}>{message}</Toast>)}
        </Portal>;
    }
}