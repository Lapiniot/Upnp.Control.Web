import { forwardRef, useMemo, useRef } from "react";
import { RouteLink } from "../../components/NavLink";
import NotificationsHostCore, { INotificationHost } from "../../components/NotificationsHost";
import { useSignalR } from "../../hooks/SignalR";
import AlbumArt from "./AlbumArt";
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
                        id: device.udn, title: `\u00AB${device.description}\u00BB now playing`, color: "success", delay: 10000,
                        message: <RouteLink to={`/renderers/${device.udn}`} className="text-decoration-none">
                            <div className="hstack">
                                <AlbumArt className="rounded-1 me-2 icon icon-3x" itemClass={state.current?.class} albumArts={state.current?.albumArts} hint="player" />
                                <span className="vstack overflow-hidden justify-content-center">
                                    <b className="text-truncate">&laquo;{current.title}&raquo;</b>
                                    <TrackInfoLine item={current} />
                                </span>
                            </div>
                        </RouteLink>
                    });
                    idRef.current = current.id;
                }
            }
        }
    }), [callback]);

    useSignalR(handlers);

    return <NotificationsHost ref={ntRef} />;
}