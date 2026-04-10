import { BookmarkButton } from "@routes/common/BookmarkButton";
import { deviceBookmarks as bookmarks } from "@routes/common/IndexedDBBookmarkStore";
import { UpnpDeviceTools as UDT } from "@routes/common/UpnpDeviceTools";
import { type DeviceActionProps } from "@routes/common/actions/Actions";
import { useCallback, useEffect, useState } from "react";

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