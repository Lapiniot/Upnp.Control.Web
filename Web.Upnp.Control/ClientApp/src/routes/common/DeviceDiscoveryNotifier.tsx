import { forwardRef, useMemo, useRef } from "react";
import NotificationsHostCore, { INotificationHost } from "../../components/NotificationsHost";
import { SignalRListener } from "../../components/SignalR";
import { DiscoveryMessage, UpnpDevice } from "./Types";

const NotificationsHost = forwardRef(NotificationsHostCore);

type DiscoveryCallback = (type: string, device: UpnpDevice) => void | boolean;

export function DeviceDiscoveryNotifier({ callback }: { callback?: DiscoveryCallback }) {
    const ref = useRef<INotificationHost>(null);

    const handlers = useMemo(() => ({
        "SsdpDiscoveryEvent": (device: string, msg: DiscoveryMessage) => {
            const { device: { name, description }, type } = msg;
            if (callback?.(type, msg.device) !== false) {
                ref.current?.push({
                    id: device, title: name, color: type === "appeared" ? "success" : "warning", delay: 120000,
                    message: <>
                        <b>&laquo;{description}&raquo;</b> has {type === "appeared" ? "appeared on" : "disappeared from"} the network
                    </>
                });
            }
        }
    }), [callback]);

    return <>
        <SignalRListener callbacks={handlers} />
        <NotificationsHost ref={ref} />
    </>;
}