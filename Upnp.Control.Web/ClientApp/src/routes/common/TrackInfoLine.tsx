import { HTMLAttributes } from "react";
import { formatTrackInfoLine } from "../../components/Extensions";

type TrackInfoLineProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    item: Upnp.DIDL.Item;
};

export function TrackInfoLine({ item: { date, album, artists, creator }, className, ...other }: TrackInfoLineProps) {
    const artist = artists?.[0] ?? creator;
    return (album || artist || date) ? <small className={`${className ? `${className} ` : ""}text-truncate`} {...other}>
        {formatTrackInfoLine(artist, album, date)}
    </small> : null
}