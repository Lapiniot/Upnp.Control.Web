import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import withNavigation from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import $api from "../../components/WebApi";
import $config from "./Config";

export class DIDLUtils {
    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    static getDisplayName(upnpClassName) {
        const kind = DIDLUtils.getKind(upnpClassName);
        if (kind.endsWith("Container"))
            return kind.substring(0, kind.length - 9);
        else
            return kind;
    }

    static formatTime(timeStr = "--") {
        return timeStr.startsWith("00:") ? timeStr.substring(3) : timeStr;
    }

    static formatSize(size) {
        if (typeof size !== "number") return "--";
        if (size < 1024) return `${size} bytes`;
        if (size < 1048576) return `${Math.round(size / 1024)} KB`;
        if (size < 1073741824) return `${Math.round(size / 1048576)} MB`;
        if (size < 1099511627776) return `${Math.round(size / 1073741824)} GB`;
        return "--";
    }

    static formatMediaInfo(data, separator = "\r") {
        if (typeof data !== "object") return;
        let lines = [];
        if (data.proto) lines.push(data.proto.split(":")[2]);
        if (data.resolution) lines.push(`Resolution: ${data.resolution}`);
        if (data.bitrate) lines.push(`Bitrate: ${Math.round(data.bitrate / 1000)} kbps`);
        if (data.sampleFrequency) lines.push(`Sample freq.: ${data.sampleFrequency}`);
        if (data.nrAudioChannels) lines.push(`Channels: ${data.nrAudioChannels}`);
        return lines.join(separator);
    }
}

export function fromBaseQuery(baseFetchQuery) {
    return ({ device, id, p, s }) => {
        const size = parseInt(s) || $config.pageSize;
        const page = parseInt(p) || 1;
        const key = `${device}!${id ?? ""}!${p ?? ""}!${s ?? ""}`;
        return withMemoKey(baseFetchQuery(device, id).take(size).skip((page - 1) * size).fetch, key);
    }
}

const defaultQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id).withParents().withResource());

export function withBrowser(BrowserComponent, usePreloader = true, builder = defaultQueryBuilder) {
    return withNavigation(withDataFetch(BrowserComponent, builder, { template: LoadIndicator, usePreloader }));
}