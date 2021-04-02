import { InputHTMLAttributes, SelectHTMLAttributes, useCallback, useEffect, useState } from "react";
import $s from "../common/Settings";
import PushSubService from "../../components/PushSubscriptionService";

function PageSizeSelect({ className, ...other }: SelectHTMLAttributes<HTMLSelectElement>) {
    const [size, setSize] = useState($s.get("pageSize"));

    const changedHandler = useCallback((event) => {
        const pageSize = parseInt(event.target.value);
        $s.set("pageSize", pageSize);
        setSize(pageSize);
    }, []);

    return <select className={`form-select form-select-sm w-auto${className ? ` ${className}` : ""}`}
        aria-label="Items per page" {...other} value={size} onChange={changedHandler}>
        {$s.get("pageSizes").map(s => <option key={s} value={s}>{s}</option>)}
    </select>
}

function NumberEditor({ className, callback, ...other }: InputHTMLAttributes<HTMLInputElement> & { callback: (value: number) => void }) {
    const changedHandler = useCallback(({ target: { value } }) => callback(parseInt(value)), [callback]);
    return <input {...other} type="number" onChange={changedHandler}
        className={`form-control form-control-sm w-auto${className ? ` ${className}` : ""}`} />;
}

type FlagEditorProps = InputHTMLAttributes<HTMLInputElement> &
{ callback: (value: boolean) => void | boolean | Promise<boolean> };

function FlagEditor({ className, callback, checked: checkedProp, disabled: disabledProp, ...other }: FlagEditorProps) {
    const [checked, setChecked] = useState(checkedProp);
    const [disabled, setDisabled] = useState(disabledProp);
    const changedHandler = useCallback(async ({ target: { checked } }) => {
        setDisabled(true);
        try {
            const value = callback(checked);
            if (typeof value === "boolean")
                setChecked(value);
            else if (value instanceof Promise)
                setChecked(await value);
            else
                setChecked(checked);
        }
        finally {
            setDisabled(false);
        }
    }, [callback]);
    return <div className="form-check form-switch">
        <input {...other} type="checkbox" checked={checked} disabled={disabled} onChange={changedHandler}
            className={`form-check-input${className ? ` ${className}` : ""}`} />
    </div>;
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

async function setUsePushes(usePushes: boolean) {
    if (usePushes) {
        if (await Notification.requestPermission() === "granted") {
            try {
                await PushSubService.unsubscribe();
            }
            finally {
                await PushSubService.subscribe();
                $s.set("usePushNotifications", true);
                return true;
            }
        }
    } else {
        await PushSubService.unsubscribe();
        $s.set("usePushNotifications", false);
    }

    return false;
}

export default () => {
    return <div className="overflow-auto">
        <div className="m-0 m-sm-3 d-flex flex-column w-md-50">
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <small>General</small>
                    <div className="d-grid grid-1fr-auto gap-2 mt-1 align-items-center">
                        <label htmlFor="page-size-select">Default page size</label>
                        <PageSizeSelect id="page-size-select" />
                        <label htmlFor="timeout-editor">Default request timeout (ms.)</label>
                        <NumberEditor id="timeout-editor" min="1000" max="30000" step="200" defaultValue={$s.get("timeout")} callback={setTimeout} />
                        <label htmlFor="scan-depth-editor">Container scan depth</label>
                        <NumberEditor id="scan-depth-editor" min="0" max="5" defaultValue={$s.get("containerScanDepth")} callback={setScanDepth} />
                        <label htmlFor="scan-timeout-editor">Container scan timeout (ms.)</label>
                        <NumberEditor id="scan-timeout-editor" min="1000" max="90000" step="200" defaultValue={$s.get("containerScanTimeout")} callback={setScanTimeout} />
                        <label htmlFor="use-proxy-editor">Use DLNA proxy</label>
                        <FlagEditor id="use-proxy-editor" className="ms-auto" checked={$s.get("useDlnaProxy")} callback={setUseProxy} />
                        {("serviceWorker" in navigator) && ("PushManager" in window) && <>
                            <label htmlFor="use-pushes-editor">Use push notifications</label>
                            <FlagEditor id="use-pushes-editor" className="ms-auto" checked={$s.get("usePushNotifications")} callback={setUsePushes} />
                        </>}
                    </div>
                </li>
                <li className="list-group-item">
                    <small>Tools</small>
                    <div className="d-flex flex-column flex-gapy-2 mt-1">
                        <div className="d-flex flex-column">
                            <a className="btn-link" href="api/swagger" target="_blank" rel="noopener noreferrer">Open SwaggerUI</a>
                            <small className="form-text">Offers a web-based UI that provides information about the service, using the generated OpenAPI specification</small>
                        </div>
                        <div className="d-flex flex-column">
                            <a className="btn-link" href="api/cert">Download Certificate</a>
                            <small className="form-text">You can obtain a copy of SSL certificate used by this site - this is especially useful if you need to add it manually to the trusted store on your device</small>
                        </div>
                        <div className="d-flex flex-column">
                            <a className="btn-link" href="api/health" rel="noopener noreferrer">Server Health</a>
                            <small className="form-text">Health checks are usually used with an external monitoring service or container orchestrator to check the status of an app</small>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
}