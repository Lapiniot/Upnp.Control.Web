import { useCallback, useEffect, useState } from "react";
import { deviceBookmarks as bookmarks } from "../../../services/BookmarkService";
import { BookmarkButton } from "../BookmarkButton";
import { UpnpDeviceTools as UDT } from "../UpnpDeviceTools";
import { DeviceActionProps } from "./Actions";

export function AddBookmarkAction({ device, category = "upnp", ...other }: DeviceActionProps) {
    const [bookmarked, setBookmarked] = useState<boolean | undefined>(undefined);

    const toggleHandler = useCallback(async () => {
        const { udn, name, description, icons, type } = device ?? {};
        if (!udn || !icons || !type || !name || !description) return;
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
    }, [category, device]);

    useEffect(() => {
        const udn = device?.udn;
        if (udn) {
            bookmarks.contains([category, udn]).then(value => setBookmarked(value))
        }
    }, [category, device]);

    return <BookmarkButton bookmarked={bookmarked} {...other} onClick={toggleHandler} />
}