import { forwardRef, useMemo, useRef } from "react";
import NotificationsHostCore, { INotificationHost } from "../../components/NotificationsHost";
import { useSignalR } from "../../components/SignalRListener";
import { TrackInfoLine } from "./TrackInfoLine";
import { AVState, DeviceDescription, PropertyBag } from "./Types";

const NotificationsHost = forwardRef(NotificationsHostCore);
type PlaybackStateChangedCallback = (state: AVState, vendor: PropertyBag) => void | boolean;

export function PlaybackStateNotifier({ callback, device }: { device: string; callback?: PlaybackStateChangedCallback; }) {
    const ntRef = useRef<INotificationHost>(null);
    const idRef = useRef<string>();

    const handlers = useMemo(() => ({
        "AVTransportEvent": (target: string, { device: deviceDesc, state, vendorProps = {} }: { device: DeviceDescription, state: AVState; vendorProps: PropertyBag; }) => {
            if (device !== target) return;
            const { current, state: playbackState } = state;
            if (callback?.(state, vendorProps) !== false) {
                if (current && current.id !== idRef.current && playbackState === "PLAYING") {
                    ntRef.current?.push({
                        id: device, title: `\u00AB${deviceDesc.description}\u00BB now playing`, color: "success", delay: 5000,
                        message: <span className="vstack overflow-hidden justify-content-center">
                            <b className="text-truncate">&laquo;{current.title}&raquo;</b>
                            <TrackInfoLine item={current} />
                        </span>
                    });
                    idRef.current = current.id;
                }
            }
        }
    }), [device]);

    useSignalR(handlers);

    return <NotificationsHost ref={ntRef} />;
}