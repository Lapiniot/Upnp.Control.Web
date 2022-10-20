import AlbumArt from "./AlbumArt";
import {
    formatBitrate, formatChannels, formatSampleFrequency, formatSize, formatSizeFull,
    formatTime, getContentType, getDisplayName, getYear
} from "./DIDLTools";

function join(value: string[]) {
    return value.join(", ");
}

function link(title?: string) {
    return (value: string) => <a href={value}>{title ?? value}</a>;
}

type AttributeDescriptor<T extends {}> = [name: keyof T & string, title: string, converter?: (value: any) => string | number | JSX.Element];
type AttributeGroup<T extends {}> = [name: string, title: string, attributes: AttributeDescriptor<T>[]];

const attributes: AttributeGroup<Upnp.DIDL.Item>[] = [
    ["gen", "General", [
        ["title", "Title"],
        ["class", "Kind", getDisplayName],
        ["id", "Id"],
        ["storageMedium", "Storage"],
        ["storageUsed", "Storage Used", formatSize],
        ["storageTotal", "Storage Total", formatSize],
        ["storageFree", "Storage Free", formatSize]]],
    ["mt", "Metadata", [
        ["creator", "Creator"],
        ["artists", "Artists", join],
        ["authors", "Authors", join],
        ["directors", "Directors", join],
        ["producers", "Producers", join],
        ["actors", "Actors", join],
        ["publishers", "Publishers", join],
        ["album", "Album"],
        ["date", "Year", getYear],
        ["genre", "Genre"],
        ["genres", "Genres", join],
        ["track", "Track"],
        ["description", "Description"],
        ["lyricsUrl", "Lyrics", link("View Lyrics")],
        ["discographyUrl", "Discography", link("View Artist Discography")]]]];

const resAttributes: AttributeGroup<Upnp.DIDL.Resource>[] = [
    ["res", "Media Info", [
        ["url", "Media Url", link()],
        ["proto", "Type", getContentType],
        ["size", "Size", formatSizeFull],
        ["duration", "Duration", formatTime],
        ["bitrate", "Bitrate", formatBitrate],
        ["freq", "Sample Freq.", formatSampleFrequency],
        ["channels", "Channels", formatChannels],
        ["bits", "Bits/sample"],
        ["resolution", "Resolution"],
        ["depth", "Color Depth"],
        ["infoUri", "Info Url", link()],
        ["protection", "Protection"]]]];

function render<T extends {}>(item: T, groups: AttributeGroup<T>[]) {
    return groups.flatMap(({ 0: groupName, 1: groupTitle, 2: attributes }) => {
        const attrs = attributes.flatMap(({ 0: name, 1: title, 2: converter }) => {
            const value = item[name] as any;
            return value ? [
                <span key={`l-${name}}`} className="grid-form-label text-end">{title}</span>,
                <span key={`t-${name}`} className="grid-form-text text-wrap">{converter?.(value) ?? value}</span>
            ] : [];
        });

        return attrs.length ? [<div key={`h-${groupName}`} className="col-2 hstack">
            <hr className="flex-grow-1" />
            <small className="mx-2">{groupTitle}</small>
            <hr className="flex-grow-1" />
        </div>, ...attrs] : []
    })
}

export function ItemInfo({ item }: { item: Upnp.DIDL.Item }) {
    return <>
        <AlbumArt itemClass={item.class} albumArts={item.albumArts} className="mx-auto mb-3 icon-8x rounded-1" />
        <div className="d-grid grid-auto-1fr gy-1 gx-2">
            {render(item, attributes)}
            {item.res && render(item.res, resAttributes)}
        </div>
    </>
}