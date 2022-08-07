export namespace DIDLTools {
    export function getKind(upnpClassName: string) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    export function getDisplayName(upnpClassName: string) {
        const kind = getKind(upnpClassName);
        return kind.endsWith("Container") ? kind.substring(0, kind.length - 9) : kind;
    }

    export function getYear(date?: string) {
        return date ? new Date(date).getFullYear() : null;
    }

    export function getContentType(protocol: string) {
        return protocol.split(":")[2];
    }

    export function formatTime(timeStr = "--") {
        return timeStr.startsWith("00:") ? timeStr.substring(3) : timeStr;
    }

    export function formatSize(size: number | undefined) {
        if (typeof size !== "number")
            return "--";
        if (size < 1024)
            return `${size} bytes`;
        if (size < 1048576)
            return `${Math.round(size / 1024)} KB`;
        if (size < 1073741824)
            return `${Math.round(size / 1048576)} MB`;
        if (size < 1099511627776)
            return `${Math.round(size / 1073741824)} GB`;
        return "--";
    }

    export function formatSizeFull(size: number | undefined) {
        return typeof size !== "number" ? "--" : `${formatSize(size)} (${size} bytes)`;
    }

    export function formatMediaInfo(data?: Upnp.DIDL.Resource, separator = "\r") {
        if (!data)
            return null;
        let lines = [];
        if (data.proto)
            lines.push(getContentType(data.proto));
        if (data.resolution)
            lines.push(`Resolution: ${data.resolution}`);
        if (data.bitrate)
            lines.push(`Bitrate: ${formatBitrate(data.bitrate)}`);
        if (data.freq)
            lines.push(`Sample freq.: ${formatSampleFrequency(data.freq)}`);
        if (data.channels)
            lines.push(`Channels: ${formatChannels(data.channels)}`);
        return lines.join(separator);
    }

    export function formatBitrate(bitrate: number) {
        return `${Math.round(bitrate * 8 / 1000)} kbps`;
    }

    export function formatSampleFrequency(frequency: number) {
        return `${(frequency / 1000).toFixed(1)} kHz`;
    }

    export function formatChannels(channels: number) {
        switch (channels) {
            case 1: return "Mono";
            case 2: return "Stereo";
            case 4: return "Quadro";
            case 6: return "5.1 Surround";
            case 8: return "7.1 Surround";
            default: return channels;
        }
    }

    export function isContainer(item: Upnp.DIDL.Item) {
        return !!item.container;
    }

    export function isMediaItem(item: Upnp.DIDL.Item) {
        return !item.container;
    }

    export function isMusicTrack(item: Upnp.DIDL.Item) {
        return item.class.endsWith(".musicTrack");
    }
}