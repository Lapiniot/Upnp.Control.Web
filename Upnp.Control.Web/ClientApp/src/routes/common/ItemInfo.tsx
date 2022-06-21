import { DIDLItem, DIDLResource } from "./Types";
import AlbumArt from "./AlbumArt";
import { DIDLTools as DT } from "./DIDLTools";

function asis(value: any): string {
    return value;
}

function join(value: string[]): string {
    return value.join(", ");
}

function url(title?: string) {
    return (value: string) => <a href={value}>{title ?? value}</a>;
}

type AttributeDescriptor<T> = [name: keyof T, title: string, converter: (value: any, item?: T) => any];

const attributes: [key: string, title: string, formatters: AttributeDescriptor<DIDLItem>[]][] = [
    ["general", "General", [
        ["title", "Title", asis],
        ["class", "Kind", DT.getDisplayName],
        ["id", "Id", asis],
        ["storageMedium", "Storage", asis],
        ["storageUsed", "Storage Used", DT.formatSize],
        ["storageTotal", "Storage Total", DT.formatSize],
        ["storageFree", "Storage Free", DT.formatSize]
    ]],
    ["metadata", "Metadata", [
        ["creator", "Creator", asis],
        ["artists", "Artists", join],
        ["authors", "Authors", join],
        ["directors", "Directors", join],
        ["producers", "Producers", join],
        ["actors", "Actors", join],
        ["publishers", "Publishers", join],
        ["album", "Album", asis],
        ["date", "Year", DT.getYear],
        ["genre", "Genre", asis],
        ["genres", "Genres", join],
        ["track", "Track", asis],
        ["description", "Description", asis],
        ["lyricsUrl", "Lyrics", url("View Lyrics")],
        ["discographyUrl", "Discography", url("View Artist Discography")]
    ]]
];

const resAttributes: [key: string, title: string, formatters: AttributeDescriptor<DIDLResource>[]][] = [
    ["res-general", "Media Info", [
        ["url", "Media Url", url()],
        ["proto", "Type", DT.getContentType],
        ["size", "Size", DT.formatSizeFull],
        ["duration", "Duration", DT.formatTime],
        ["bitrate", "Bitrate", DT.formatBitrate],
        ["freq", "Sample Freq.", DT.formatSampleFrequency],
        ["channels", "Channels", DT.formatChannels],
        ["bits", "Bits/sample", asis],
        ["resolution", "Resolution", asis],
        ["depth", "Color Depth", asis],
        ["infoUri", "Info Url", url()],
        ["protection", "Protection", asis]
    ]]
];

function renderGroup<T>(item: T, key: string, title: string, formatters: AttributeDescriptor<T>[]) {
    const children = formatters.map(({ 0: key, 1: title, 2: converter }) => {
        const value = item[key];
        return value ? [
            <span key={`lbl-${String(key)}`} className="grid-form-label text-end">{title}</span>,
            <span key={`txt-${String(key)}`} className="grid-form-text text-wrap">{converter(value, item)}</span>
        ] : undefined;
    }).filter(item => item);
    return children.length > 0 ? [<div key={`hdr-${key}`} className="col-2 hstack">
        <hr className="flex-grow-1" />
        <small className="mx-2">{title}</small>
        <hr className="flex-grow-1" />
    </div>, ...children] : undefined;
}

export function ItemInfo({ item }: { item: DIDLItem; }) {
    return <>
        <AlbumArt itemClass={item.class} albumArts={item.albumArts} className="mx-auto mb-3 album-art-xxl" />
        <div className="d-grid grid-auto-1fr gy-1 gx-2">
            {attributes.map(({ 0: key, 1: title, 2: formatters }) => renderGroup(item, key, title, formatters)).flat()}
            {item.res && resAttributes.map(({ 0: key, 1: title, 2: formatters }) => renderGroup(item.res as DIDLResource, key, title, formatters)).flat()}
        </div>
    </>;
}