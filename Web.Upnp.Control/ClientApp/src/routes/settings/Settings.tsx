﻿import { FlagEditor } from "../../components/editors/FlagEditor";
import { NumberEditor } from "../../components/editors/NumberEditor";
import { OptionsEditor } from "../../components/editors/OptionsEditor";
import { NotificationType } from "../../components/WebApi";
import $s from "../common/Settings";
import { PushSubscriptionToggle } from "./PushSubscriptionToggle";

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

export default () => {
    return <div className="overflow-auto">
        <div className="vstack m-0 m-sm-3 w-md-50">
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <small>General</small>
                    <div className="d-grid grid-1fr-auto gap-3 mt-1 align-items-center">
                        <label htmlFor="page-size-select">Default page size</label>
                        <OptionsEditor id="page-size-select" options={$s.get("pageSizes")} value={$s.get("pageSize")} callback={setPageSize} />
                        <label htmlFor="timeout-editor">Default request timeout (ms.)</label>
                        <NumberEditor id="timeout-editor" min="1000" max="30000" step="200" value={$s.get("timeout")} callback={setTimeout} />
                        <label htmlFor="scan-depth-editor">Container scan depth</label>
                        <NumberEditor id="scan-depth-editor" min="0" max="5" value={$s.get("containerScanDepth")} callback={setScanDepth} />
                        <label htmlFor="scan-timeout-editor">Container scan timeout (ms.)</label>
                        <NumberEditor id="scan-timeout-editor" min="1000" max="90000" step="200" value={$s.get("containerScanTimeout")} callback={setScanTimeout} />
                        <label htmlFor="use-proxy-editor">Use DLNA proxy</label>
                        <FlagEditor id="use-proxy-editor" className="ms-auto" checked={$s.get("useDlnaProxy")} callback={setUseProxy} />
                    </div>
                </li>
                <li className="list-group-item">
                    <small>In-app notifications</small>
                    <div className="d-grid grid-1fr-auto gap-3 mt-1 align-items-center">
                        <label htmlFor="discovery-nt">Device discovery</label>
                        <FlagEditor id="discovery-nt" className="ms-auto" checked={$s.get("showDiscoveryNotifications")} callback={setShowDiscoveryNotifications} />
                    </div>
                </li>
                {("serviceWorker" in navigator) && ("PushManager" in window) && <>
                    <li className="list-group-item">
                        <small>Push notifications</small>
                        <div className="d-grid grid-1fr-auto gap-3 mt-1 align-items-center">
                            <label htmlFor="discovery-pushes-editor">Device discovery</label>
                            <PushSubscriptionToggle notificationType={NotificationType.DeviceDiscovery} id="discovery-pushes-editor" className="ms-auto" />
                            <label htmlFor="playback-pushes-editor">Playback state changes</label>
                            <PushSubscriptionToggle notificationType={NotificationType.PlaybackStateChange} id="playback-pushes-editor" className="ms-auto" />
                        </div>
                    </li>
                </>}
                <li className="list-group-item">
                    <small>Tools</small>
                    <div className="vstack mt-1 gap-2">
                        <div className="vstack">
                            <a className="btn-link" href="api/swagger" target="_blank" rel="noopener noreferrer">Open SwaggerUI</a>
                            <small className="form-text">Offers a web-based UI that provides information about the service, using the generated OpenAPI specification</small>
                        </div>
                        <div className="vstack">
                            <a className="btn-link" href="api/cert">Download Certificate</a>
                            <small className="form-text">You can obtain a copy of SSL certificate used by this site - this is especially useful if you need to add it manually to the trusted store on your device</small>
                        </div>
                        <div className="vstack">
                            <a className="btn-link" href="api/health" rel="noopener noreferrer">Server Health</a>
                            <small className="form-text">Health checks are usually used with an external monitoring service or container orchestrator to check the status of an app</small>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
}