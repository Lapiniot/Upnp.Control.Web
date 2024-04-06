import { FlagEditor } from "../../components/editors/FlagEditor";
import { PushNotificationType as PNType } from "../../services/WebApi";
import { usePushSubscription } from "../../hooks/PushSubscription";

export function PushNotificationsSection() {
    const { types, valid, loading, toggle, reset } = usePushSubscription();
    return <>
        {!valid ? <div className={`alert-warning sp-2 text-start${loading ? " text-tertiary" : ""}`}>
            Push notifications subscription state is invalid.
            Most likely crypto keys on the server have been changed since last subscription.
            <p className="mb-0">
                Try to <button className="btn align-baseline py-0" disabled={loading} onClick={reset}>Reset</button> subscription state and fix this problem.
            </p>
            <p className="mb-0">
                Alternatively, you may reset notifications permission option to the default value in the site settings of your browser and subscribe again.
            </p>
        </div> : null}
        <FlagEditor caption="Device discovery" className="sp-2" context={PNType.DeviceDiscovery}
            checked={!!(types & PNType.DeviceDiscovery)} disabled={!valid || loading} callback={toggle} />
        <FlagEditor caption="Playback state changes" className="sp-2" context={PNType.PlaybackStateChange}
            checked={!!(types & PNType.PlaybackStateChange)} disabled={!valid || loading} callback={toggle} />
    </>
}