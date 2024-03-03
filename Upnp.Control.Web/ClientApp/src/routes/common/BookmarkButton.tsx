import { ButtonHTMLAttributes, MouseEventHandler, useCallback, useEffect, useState } from "react";
import { IBookmarkStore } from "../../services/BookmarkService";
import { KnownWidgets } from "./widgets/Widgets";

type BookmarkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    device: string;
    deviceName: string;
    item: Upnp.DIDL.Item;
};

type WidgetPropsType = {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon?: string;
    itemClass?: string;
};

export function createBookmarkButton(widgetName: KnownWidgets,
    store: IBookmarkStore<[string, string], WidgetPropsType>,
    icons?: [string, string]) {
    return function ({ device, deviceName, item, ...other }: BookmarkButtonProps) {
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

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    bookmarked?: boolean;
    icons?: [string, string];
};

const defaultIcons: [string, string] = ["symbols.svg#star_rate_fill1", "symbols.svg#star_rate"];

export function BookmarkButton({ className, children, bookmarked, icons = defaultIcons, ...other }: Props) {
    const title = bookmarked ? "Remove bookmark from the Home section" : "Add bookmark to the Home section";
    return <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`}
        disabled={bookmarked === undefined} title={title} {...other}>
        {children || <svg><use href={icons[bookmarked === true ? 0 : 1]} /></svg>}
    </button>;
}