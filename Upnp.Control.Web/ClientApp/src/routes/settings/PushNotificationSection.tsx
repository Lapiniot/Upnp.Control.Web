import { FlagEditor } from "../../components/editors/FlagEditor";
import { PushNotificationType as PNType } from "../../components/WebApi";
import { usePushSubscription } from "../../components/PushSubscription";

export function PushNotificationsSection() {
    const { types, valid, loading, toggle, reset } = usePushSubscription();
    return <>
        {!valid ? <div className={`alert-warning col-2 text-start${loading ? " text-body-tertiary" : ""}`}>
            Push notifications subscription state is invalid.
            Most likely crypto keys on the server have been changed since last subscription.
            <p className="mb-0">
                Try to <button className="btn btn-outline-danger align-baseline py-0" disabled={loading} onClick={reset}>Reset</button> subscription state and fix this problem.
            </p>
            <p className="mb-0">
                Alternatively, you may reset notifications permission option to the default value in the site settings of your browser and subscribe again.
            </p>
        </div> : null}
        <label htmlFor="discovery-pushes-editor">Device discovery</label>
        <FlagEditor id="discovery-pushes-editor" state={PNType.DeviceDiscovery}
            checked={!!(types & PNType.DeviceDiscovery)} disabled={!valid || loading} callback={toggle} />
        <label htmlFor="playback-pushes-editor">Playback state changes</label>
        <FlagEditor id="playback-pushes-editor" state={PNType.PlaybackStateChange}
            checked={!!(types & PNType.PlaybackStateChange)} disabled={!valid || loading} callback={toggle} />
    </>
}