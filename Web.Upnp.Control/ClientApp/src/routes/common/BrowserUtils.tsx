import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import withNavigation from "./Navigator";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $api, { BrowseFetch } from "../../components/WebApi";
import $config from "./Config";
import { DIDLResource } from "./Types";

export class DIDLUtils {
    static getKind(upnpClassName: string): string {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    static getDisplayName(upnpClassName: string): string {
        const kind = DIDLUtils.getKind(upnpClassName);
        if (kind.endsWith("Container"))
            return kind.substring(0, kind.length - 9);
        else
            return kind;
    }

    static formatTime(timeStr = "--"): string {
        return timeStr.startsWith("00:") ? timeStr.substring(3) : timeStr;
    }

    static formatSize(size: number): string {
        if (typeof size !== "number") return "--";
        if (size < 1024) return `${size} bytes`;
        if (size < 1048576) return `${Math.round(size / 1024)} KB`;
        if (size < 1073741824) return `${Math.round(size / 1048576)} MB`;
        if (size < 1099511627776) return `${Math.round(size / 1073741824)} GB`;
        return "--";
    }

    static formatMediaInfo(data: DIDLResource, separator = "\r"): string | null {
        if (!data) return null;
        let lines = [];
        if (data.proto) lines.push(data.proto.split(":")[2]);
        if (data.resolution) lines.push(`Resolution: ${data.resolution}`);
        if (data.bitrate) lines.push(`Bitrate: ${Math.round(data.bitrate / 1000)} kbps`);
        if (data.sampleFrequency) lines.push(`Sample freq.: ${data.sampleFrequency}`);
        if (data.nrAudioChannels) lines.push(`Channels: ${data.nrAudioChannels}`);
        return lines.join(separator);
    }
}

type FetchFunction = (device: string, id: string) => BrowseFetch;

export function fromBaseQuery(baseFetchQuery: FetchFunction) {
    return ({ device, id, p, s }: { device: string; id: string; p: string | number; s: string | number }) => {
        const size = typeof s === "number" ? s : parseInt(s) || $config.pageSize;
        const page = typeof p === "number" ? p : parseInt(p) || 1;
        const key = `${device}!${id ?? ""}!${p ?? ""}!${s ?? ""}`;
        return withMemoKey(baseFetchQuery(device, id).take(size).skip((page - 1) * size).fetch, key);
    }
}

const defaultQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id).withParents().withResource());

export function withBrowser(BrowserComponent: any, usePreloader = true, builder = defaultQueryBuilder) {
    return withNavigation(withDataFetch(BrowserComponent, builder, { template: LoadIndicatorOverlay, usePreloader }));
}