import { useCallback, useEffect, useState } from "react";
import { deviceBookmarks as bookmarks } from "../../../components/BookmarkService";
import { BookmarkButton } from "../BookmarkButton";
import { UpnpDeviceTools as UDT } from "../UpnpDeviceTools";
import { DeviceActionProps } from "./Actions";

export function AddBookmarkAction({ device: { udn: device, name, description, icons, type }, category = "upnp", ...other }: DeviceActionProps) {
    const [bookmarked, setBookmarked] = useState<boolean | undefined>(undefined);
    const toggleHandler = useCallback(async () => {
        const key: [string, string] = [category, device];
        if (!await bookmarks.contains(key)) {
            await bookmarks.add("DeviceBookmarkWidget", {
                device, category, name, description,
                icon: UDT.getOptimalIcon(icons)?.url ?? UDT.getFallbackIcon(type)
            });
            setBookmarked(true);
        }
        else {
            await bookmarks.remove(key);
            setBookmarked(false);
        }
    }, []);
    useEffect(() => { bookmarks.contains([category, device]).then(v => setBookmarked(v)) }, []);

    return <BookmarkButton bookmarked={bookmarked} {...other} onClick={toggleHandler} />
}