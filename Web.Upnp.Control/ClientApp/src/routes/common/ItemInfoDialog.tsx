import { DIDLItem, DIDLResource } from "./Types";
import Modal, { ModalProps } from "../../components/Modal";
import { DIDLUtils } from "./BrowserUtils";
import AlbumArt from "./AlbumArt";
import { useCallback } from "react";

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
        ["class", "Kind", DIDLUtils.getDisplayName],
        ["id", "Id", asis],
        ["storageMedium", "Storage", asis],
        ["storageUsed", "Storage Used", DIDLUtils.formatSize],
        ["storageTotal", "Storage Total", DIDLUtils.formatSize],
        ["storageFree", "Storage Free", DIDLUtils.formatSize]
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
        ["date", "Year", DIDLUtils.getYear],
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
        ["proto", "Type", DIDLUtils.getContentType],
        ["size", "Size", DIDLUtils.formatSizeFull],
        ["duration", "Duration", DIDLUtils.formatTime],
        ["bitrate", "Bitrate", DIDLUtils.formatBitrate],
        ["freq", "Sample Freq.", DIDLUtils.formatSampleFrequency],
        ["channels", "Channels", DIDLUtils.formatChannels],
        ["bits", "Bits/sample", asis],
        ["resolution", "Resolution", asis],
        ["depth", "Color Depth", asis],
        ["infoUri", "Info Url", url()],
        ["protection", "Protection", asis]
    ]]
];

export default function ItemInfoDialog({ item, ...other }: ModalProps & { item: DIDLItem; }) {
    const clickHandler = useCallback(() => navigator.permissions
        .query({ name: "clipboard-write" })
        .then(result => {
            if (result.state === "granted" || result.state === "prompt")
                navigator.clipboard.writeText(item.res?.url as string);
        }), []);

    return <Modal title={item.title} {...other} className="modal-fullscreen-sm-down modal-dialog-scrollable">
        <Modal.Body className="d-flex flex-column">
            <AlbumArt itemClass={item.class} albumArts={item.albumArts} className="mx-auto mb-3 album-art-xxl" />
            <div className="d-grid grid-auto-1fr gapy-1 gapx-2">
                {attributes.map(({ 0: key, 1: title, 2: formatters }) => renderGroup(item, key, title, formatters)).flat()}
                {item.res && resAttributes.map(({ 0: key, 1: title, 2: formatters }) => renderGroup(item.res as DIDLResource, key, title, formatters)).flat()}
            </div>
        </Modal.Body>
        <Modal.Footer>
            {DIDLUtils.isMediaItem(item) && window.isSecureContext ? <Modal.Button className="me-auto" onClick={clickHandler}>Copy media url</Modal.Button> : undefined}
            <Modal.Button className="confirm" dismiss>Ok</Modal.Button>
        </Modal.Footer>
    </Modal>;
}

function renderGroup<T>(item: T, key: string, title: string, formatters: AttributeDescriptor<T>[]) {
    const children = formatters.map(({ 0: key, 1: title, 2: converter }) => {
        const value = item[key];
        return value ? [
            <span key={`lbl-${key}`} className="grid-form-label">{title}</span>,
            <span key={`txt-${key}`} className="grid-form-text text-wrap">{converter(value, item)}</span>
        ] : undefined;
    }).filter(item => item);
    return children.length > 0 ? [<div key={`hdr-${key}`} className="col-span-2 d-flex align-items-center">
        <hr className="flex-grow-1" />
        <small className="mx-2">{title}</small>
        <hr className="flex-grow-1" />
    </div>, ...children] : undefined;
}
