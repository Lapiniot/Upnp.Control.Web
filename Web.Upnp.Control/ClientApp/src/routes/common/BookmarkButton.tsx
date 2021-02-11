import { ButtonHTMLAttributes, useCallback, useEffect, useState } from "react";
import { IBookmarkStore } from "../../components/BookmarkService";
import { DIDLItem } from "./Types";
import { KnownWidgets } from "./widgets/Widgets";

type BookmarkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    device: string;
    item: DIDLItem;
    store?: IBookmarkStore<[string, string], WidgetPropsType>;
};

type WidgetPropsType = {
    device: string;
    id: string;
    title: string;
    icon?: string;
};

export function useBookmarkButton(widgetName: KnownWidgets, storeInstance?: IBookmarkStore<[string, string], WidgetPropsType>) {
    return function ({ device, item, store = storeInstance, ...other }: BookmarkButtonProps) {
        const [bookmarked, setBookmarked] = useState<boolean | undefined>(undefined);
        const toggleHandler = useCallback(
            async () => {
                if (!store) return;
                const key: [string, string] = [device, item.id];
                if (!await store.contains(key)) {
                    await store.add(widgetName, { device, id: item.id, title: item.title, icon: item.albumArts?.[0] });
                    setBookmarked(true);
                }
                else {
                    await store.remove(key);
                    setBookmarked(false);
                }
            }, []);
        useEffect(() => { store?.contains([device, item.id]).then(v => setBookmarked(v)) }, []);

        return <BookmarkButton bookmarked={bookmarked} {...other} onClick={toggleHandler} />;
    }
}

export function BookmarkButton({ className, children, bookmarked, ...other }: ButtonHTMLAttributes<HTMLButtonElement> & { bookmarked?: boolean; }) {
    const title = bookmarked ? "Remove bookmark from the Home section" : "Add bookmark to the Home section";
    return <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`}
        disabled={bookmarked === undefined} title={title} {...other}>
        {children || <svg className="icon"><use href={bookmarked === true ? "#star-solid" : "#star"} /></svg>}
    </button>;
}