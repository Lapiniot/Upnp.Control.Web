import { FlagEditor } from "../../components/editors/FlagEditor";
import { NumberEditor } from "../../components/editors/NumberEditor";
import { OptionsEditor } from "../../components/editors/OptionsEditor";
import $s from "../common/Settings";
import { PushNotificationsSection } from "./PushNotificationSection";

function setPageSize(value: string) {
    const pageSize = parseInt(value);
    if (pageSize > 0) $s.set("pageSize", pageSize);
}

function setTimeout(timeout: number) {
    $s.set("timeout", timeout);
}

function setScanTimeout(timeout: number) {
    $s.set("containerScanTimeout", timeout);
}

function setScanDepth(depth: number) {
    $s.set("containerScanDepth", depth);
}

function setUseProxy(useProxy: boolean) {
    $s.set("useDlnaProxy", useProxy);
}

function setShowDiscoveryNotifications(value: boolean) {
    $s.set("showDiscoveryNotifications", value);
}

function setShowPlaybackNotifications(value: boolean) {
    $s.set("showPlaybackNotifications", value);
}

export default () => {
    return <div className="overflow-auto">
        <ul className="list-group list-group-flush m-sm-3 w-md-50 no-font-boost">
            <li className="list-group-item">
                <small>General</small>
                <div className="d-grid grid-1fr-auto g-3 mt-2 align-items-center">
                    <label htmlFor="page-size-select">Default page size</label>
                    <OptionsEditor id="page-size-select" options={$s.get("pageSizes")} value={$s.get("pageSize")} callback={setPageSize} />
                    <label htmlFor="timeout-editor">Default request timeout (ms.)</label>
                    <NumberEditor id="timeout-editor" min="1000" max="30000" step="200" value={$s.get("timeout")} callback={setTimeout} />
                    <label htmlFor="scan-depth-editor">Container scan depth</label>
                    <NumberEditor id="scan-depth-editor" min="0" max="5" value={$s.get("containerScanDepth")} callback={setScanDepth} />
                    <label htmlFor="scan-timeout-editor">Container scan timeout (ms.)</label>
                    <NumberEditor id="scan-timeout-editor" min="1000" max="90000" step="200" value={$s.get("containerScanTimeout")} callback={setScanTimeout} />
                    <label htmlFor="use-proxy-editor">Use DLNA proxy</label>
                    <FlagEditor className="ms-auto" id="use-proxy-editor" checked={$s.get("useDlnaProxy")} callback={setUseProxy} />
                </div>
            </li>
            <li className="list-group-item">
                <small>In-app notifications</small>
                <div className="d-grid grid-1fr-auto g-3 mt-2 align-items-center">
                    <label htmlFor="discovery-nt">Device discovery</label>
                    <FlagEditor id="discovery-nt" checked={$s.get("showDiscoveryNotifications")} callback={setShowDiscoveryNotifications} />
                    <label htmlFor="playback-nt">Playback state changes</label>
                    <FlagEditor id="playback-nt" checked={$s.get("showPlaybackNotifications")} callback={setShowPlaybackNotifications} />
                </div>
            </li>
            {("serviceWorker" in navigator) && ("PushManager" in window) && <>
                <li className="list-group-item">
                    <small>Push notifications</small>
                    <div className="d-grid grid-1fr-auto g-3 mt-2 align-items-center">
                        <PushNotificationsSection />
                    </div>
                </li>
            </>}
            <li className="list-group-item">
                <small>Tools</small>
                <div className="vstack mt-2">
                    <a href="api/swagger" target="_blank" rel="noopener noreferrer">Open SwaggerUI</a>
                    <small className="form-text">Offers a web-based UI that provides information about the service, using the generated OpenAPI specification</small>
                    <a className="mt-1" href="api/cert">Download Certificate(s)</a>
                    <small className="form-text">You can obtain a copy of SSL certificate used by this site - this is especially useful if you need to add it manually to the trusted store on your device</small>
                    <a className="mt-1" href="api/health" rel="noopener noreferrer">Server Health</a>
                    <small className="form-text">Health checks are usually used with an external monitoring service or container orchestrator to check the status of an app</small>
                </div>
            </li>
        </ul>
    </div>
}