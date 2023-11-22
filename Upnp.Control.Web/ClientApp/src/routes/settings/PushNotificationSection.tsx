import { useCallback, useEffect, useState } from "react";
import { FlagEditor } from "../../components/editors/FlagEditor";
import { PushNotificationType as PNType } from "../../components/WebApi";
import PushSubService from "../../components/PushSubscriptionService";

export function PushNotificationsSection() {
    const [disabled, setDisabled] = useState(false);
    const [state, setState] = useState(PNType.None);

    const toggle = useCallback((subscribe: boolean, type: PNType) => {
        setDisabled(true);
        (subscribe ?
            Notification.requestPermission().then(permission => {
                if (permission === "granted")
                    return PushSubService.subscribe(type);
            }) :
            PushSubService.unsubscribe(type))
            .finally(() => setDisabled(false));
    }, []);

    useEffect(() => { PushSubService.state().then(type => setState(type)); }, []);

    return <>
        <label htmlFor="discovery-pushes-editor">Device discovery</label>
        <FlagEditor id="discovery-pushes-editor" state={PNType.DeviceDiscovery} checked={!!(state & PNType.DeviceDiscovery)} disabled={disabled} callback={toggle} />
        <label htmlFor="playback-pushes-editor">Playback state changes</label>
        <FlagEditor id="playback-pushes-editor" state={PNType.PlaybackStateChange} checked={!!(state & PNType.PlaybackStateChange)} disabled={disabled} callback={toggle} />
    </>;
}