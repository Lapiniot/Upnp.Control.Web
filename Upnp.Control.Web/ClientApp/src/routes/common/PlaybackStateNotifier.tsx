import { useMemo, useRef } from "react";
import NotificationsHost, { INotificationHost } from "../../components/NotificationsHost";
import { useSignalR } from "../../hooks/SignalR";
import { TrackInfoLine } from "./TrackInfoLine";

type PlaybackStateChangedCallback = (state: Upnp.AVState, vendor: Record<string, string>) => void | boolean;

export function PlaybackStateNotifier({ callback }: { callback?: PlaybackStateChangedCallback; }) {
    const ntRef = useRef<INotificationHost>(null);
    const idRef = useRef<string>(null);

    const handlers = useMemo(() => ({
        "AVTransportEvent": (_: string, { device, state, vendorProps = {} }: { device: Upnp.DeviceDescription, state: Upnp.AVState; vendorProps: Record<string, string> }) => {
            const { current, state: playbackState } = state;
            if (callback?.(state, vendorProps) !== false) {
                if (current && current.id !== idRef.current && playbackState === "PLAYING") {
                    ntRef.current?.push({
                        id: device.udn,
                        autohide: 10000,
                        message: <span className="vstack overflow-hidden justify-content-center">
                            <span>&laquo;{device.name}&raquo; now playing:</span>
                            <span className="text-truncate">{current.title}</span>
                            <TrackInfoLine item={current} />
                        </span>
                    });
                    idRef.current = current.id;
                }
            }
        }
    }), [callback]);

    useSignalR(handlers);

    return <NotificationsHost ref={ntRef} />;
}