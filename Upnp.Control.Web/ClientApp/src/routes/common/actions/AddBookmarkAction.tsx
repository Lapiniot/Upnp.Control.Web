import { useCallback, useEffect, useState } from "react";
import { deviceBookmarks as bookmarks } from "../../../services/BookmarkService";
import { BookmarkButton } from "../BookmarkButton";
import { UpnpDeviceTools as UDT } from "../UpnpDeviceTools";
import { DeviceActionProps } from "./Actions";

export function AddBookmarkAction({ device, category = "upnp", ...other }: DeviceActionProps) {
    const { udn, name, description, icons, type } = device ?? {};

    const [bookmarked, setBookmarked] = useState<boolean | undefined>(undefined);

    const toggleHandler = useCallback(async () => {
        if (!udn || !icons || !type) return;
        const key: [string, string] = [category, udn];
        if (!await bookmarks.contains(key)) {
            await bookmarks.add("DeviceBookmarkWidget", {
                device: udn, category, name, description,
                icon: UDT.getOptimalIcon(icons)?.url ?? `stack.svg#${UDT.getSpecialRoleIcon(type)}`
            });
            setBookmarked(true);
        }
        else {
            await bookmarks.remove(key);
            setBookmarked(false);
        }
    }, [udn, name, description, icons, type]);

    useEffect(() => {
        if (!udn) return;
        bookmarks.contains([category, udn]).then(v => setBookmarked(v))
    }, [category, udn]);

    return <BookmarkButton bookmarked={bookmarked} {...other} onClick={toggleHandler} />
}