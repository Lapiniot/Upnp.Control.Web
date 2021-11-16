import { HTMLAttributes } from "react";
import { formatTrackInfoLine } from "../../components/Extensions";
import { DIDLItem } from "./Types";

type TrackInfoLineProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    item: DIDLItem;
};

export function TrackInfoLine({ item: { date, album, artists, creator }, className, ...other }: TrackInfoLineProps) {
    const artist = artists?.[0] ?? creator;
    return (album || artist || date) ? <small className={`${className ? `${className} ` : ""}text-truncate`} {...other}>
        {formatTrackInfoLine(artist, album, date)}
    </small> : null;
}