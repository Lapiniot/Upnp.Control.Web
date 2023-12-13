import { HTMLAttributes, useEffect, useState } from "react";
import WebApi, { ApplicationInfo } from "../../services/WebApi";

export function AppInfo({ className, ...other }: HTMLAttributes<HTMLElement>) {
    const [appInfo, setAppInfo] = useState<ApplicationInfo>();
    useEffect(() => { WebApi.getAppInfo().then(setAppInfo); }, []);

    if (!appInfo)
        return null;

    const { build: { date, version }, hostName } = appInfo;
    return <p className={`text-white-50 text-center cursor-default${className ? ` ${className}` : ""}`} {...other}
        title={date ? `Build from ${new Date(date).toUTCString()}` : undefined}>
        {hostName}<br />v{version}
    </p>;
}