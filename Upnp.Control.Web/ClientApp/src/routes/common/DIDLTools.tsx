import { DIDLItem, DIDLResource } from "./Types";

export class DIDLTools {
    static getKind(upnpClassName: string): string {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    static getDisplayName(upnpClassName: string): string {
        const kind = DIDLTools.getKind(upnpClassName);
        if (kind.endsWith("Container"))
            return kind.substring(0, kind.length - 9);

        else
            return kind;
    }

    static getYear(date?: string): number | null {
        return date ? new Date(date).getFullYear() : null;
    }

    static getContentType(protocol: string): string {
        return protocol.split(":")[2];
    }

    static formatTime(timeStr = "--"): string {
        return timeStr.startsWith("00:") ? timeStr.substring(3) : timeStr;
    }

    static formatSize(size: number | undefined): string {
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

    static formatSizeFull(size: number | undefined): string {
        if (typeof size !== "number")
            return "--";
        return `${DIDLTools.formatSize(size)} (${size} bytes)`;
    }

    static formatMediaInfo(data?: DIDLResource, separator = "\r"): string | null {
        if (!data)
            return null;
        let lines = [];
        if (data.proto)
            lines.push(DIDLTools.getContentType(data.proto));
        if (data.resolution)
            lines.push(`Resolution: ${data.resolution}`);
        if (data.bitrate)
            lines.push(`Bitrate: ${DIDLTools.formatBitrate(data.bitrate)}`);
        if (data.freq)
            lines.push(`Sample freq.: ${DIDLTools.formatSampleFrequency(data.freq)}`);
        if (data.channels)
            lines.push(`Channels: ${DIDLTools.formatChannels(data.channels)}`);
        return lines.join(separator);
    }

    static formatBitrate(bitrate: number) {
        return `${Math.round(bitrate * 8 / 1000)} kbps`;
    }

    static formatSampleFrequency(frequency: number) {
        return `${(frequency / 1000).toFixed(1)} kHz`;
    }

    static formatChannels(channels: number) {
        switch (channels) {
            case 1: return "Mono";
            case 2: return "Stereo";
            case 4: return "Quadro";
            case 6: return "5.1 Surround";
            case 8: return "7.1 Surround";
            default: return channels;
        }
    }

    static isContainer(item: DIDLItem) {
        return item.container;
    }

    static isMediaItem(item: DIDLItem) {
        return !item.container;
    }

    static isMusicTrack(item: DIDLItem) {
        return item.class.endsWith(".musicTrack");
    }
}