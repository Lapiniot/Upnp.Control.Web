import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import NotificationsHost, { INotificationHost } from "../../components/NotificationsHost";
import { useSignalR } from "../../hooks/SignalR";

type DiscoveryCallback = (type: string, device: Upnp.Device) => void | boolean
type DiscoveryMessage = { type: NotificationType, device: Upnp.Device }

export function DeviceDiscoveryNotifier({ callback }: { callback?: DiscoveryCallback }) {
    const ref = useRef<INotificationHost>(null);
    const navigate = useNavigate();

    const handlers = useMemo(() => ({
        "SsdpDiscoveryEvent": (device: string, msg: DiscoveryMessage) => {
            const { device: { description, udn }, type } = msg;
            if (callback?.(type, msg.device) !== false) {
                ref.current?.push(type === "appeared" ? {
                    id: device, action: { text: "View", handler() { navigate(`/upnp/${udn}`); } },
                    message: `\xAB${description}\xBB has appeared on the network`
                } : {
                    id: device, autohide: 10000,
                    message: `\xAB${description}\xBB has disappeared from the network`
                });
            }
        }
    }), [callback, navigate]);

    useSignalR(handlers);

    return <NotificationsHost ref={ref} />
}