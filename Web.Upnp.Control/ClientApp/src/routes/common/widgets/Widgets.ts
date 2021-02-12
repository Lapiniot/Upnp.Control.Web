import DeviceBookmarkWidget from "./DeviceBookmarkWidget";
import ItemBookmarkWidget from "./ItemBookmarkWidget";
import PlaylistBookmarkWidget from "./PlaylistBookmarkWidget";

const widgets = {
    "DeviceBookmarkWidget": DeviceBookmarkWidget,
    "ItemBookmarkWidget": ItemBookmarkWidget,
    "PlaylistBookmarkWidget": PlaylistBookmarkWidget
}

export type KnownWidgets = keyof typeof widgets;

export { widgets as Widgets };