import { BookmarkButton } from "@routes/common/BookmarkButton";
import { type BookmarkStore } from "@routes/common/BookmarkStore";
import { type KnownWidgets } from "@routes/common/widgets/Widgets";
import { type ButtonHTMLAttributes, type MouseEventHandler, useCallback, useEffect, useState } from "react";

type BookmarkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    device: string;
    deviceName: string;
    item: Upnp.DIDL.Item;
}

type WidgetPropsType = {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon?: string;
    itemClass?: string;
}

export function createBookmarkButton(widgetName: KnownWidgets,
    store: BookmarkStore<[string, string], WidgetPropsType>,
    icons?: [string, string]) {
    return function ToggleBookmarkButton({ device, deviceName, item, ...other }: BookmarkButtonProps) {
        const [bookmarked, setBookmarked] = useState<boolean | undefined>(undefined);

        const toggleHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(
            async (event) => {
                event.stopPropagation();
                if (!store) return;
                const key: [string, string] = [device, item.id];
                if (!await store.contains(key)) {
                    await store.add(widgetName, {
                        device, deviceName, id: item.id,
                        title: item.title, icon: item.albumArts?.[0],
                        itemClass: item.class
                    });
                    setBookmarked(true);
                }
                else {
                    await store.remove(key);
                    setBookmarked(false);
                }
            }, [device, deviceName, item]);

        useEffect(() => { store.contains([device, item.id]).then(value => setBookmarked(value)) }, [device, item.id]);

        return <BookmarkButton bookmarked={bookmarked} icons={icons} {...other} onClick={toggleHandler} />;
    }
}