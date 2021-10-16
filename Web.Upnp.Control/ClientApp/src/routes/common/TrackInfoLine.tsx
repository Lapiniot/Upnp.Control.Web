import { HTMLAttributes } from "react";
import { DIDLItem } from "./Types";

type TrackInfoLineProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    item: DIDLItem;
};

export function TrackInfoLine({ item: { date, album, artists, creator }, className, ...other }: TrackInfoLineProps) {
    const artist = artists?.[0] ?? creator;
    return (album || artist || date) ? <small className={`${className ? `${className} ` : ""}text-truncate`} {...other}>
        {`${artist ?? ""}${date ? `${artist ? "\xA0\u2022\xA0" : ""}${date}` : ""}${album ? `${artist || date ? "\xA0\u2022\xA0" : ""}${album}` : ""}`}
    </small> : null;
}