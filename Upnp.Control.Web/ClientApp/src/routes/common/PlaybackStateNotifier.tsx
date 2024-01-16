import { forwardRef, useMemo, useRef } from "react";
import NotificationsHostCore, { INotificationHost } from "../../components/NotificationsHost";
import { useSignalR } from "../../hooks/SignalR";
import { TrackInfoLine } from "./TrackInfoLine";

const NotificationsHost = forwardRef(NotificationsHostCore);
type PlaybackStateChangedCallback = (state: Upnp.AVState, vendor: Record<string, string>) => void | boolean;

export function PlaybackStateNotifier({ callback }: { callback?: PlaybackStateChangedCallback; }) {
    const ntRef = useRef<INotificationHost>(null);
    const idRef = useRef<string>();

    const handlers = useMemo(() => ({
        "AVTransportEvent": (_: string, { device, state, vendorProps = {} }: { device: Upnp.DeviceDescription, state: Upnp.AVState; vendorProps: Record<string, string> }) => {
            const { current, state: playbackState } = state;
            if (callback?.(state, vendorProps) !== false) {
                if (current && current.id !== idRef.current && playbackState === "PLAYING") {
                    ntRef.current?.push({
                        id: device.udn, title: `\u00AB${device.description}\u00BB now playing`, color: "success", delay: 5000,
                        message: <span className="vstack overflow-hidden justify-content-center">
                            <b className="text-truncate">&laquo;{current.title}&raquo;</b>
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