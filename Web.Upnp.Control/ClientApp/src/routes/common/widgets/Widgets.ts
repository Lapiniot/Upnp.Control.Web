import DeviceBookmarkWidget from "./DeviceBookmarkWidget";
import ItemBookmarkWidget from "./ItemBookmarkWidget";

const widgets = {
    "DeviceBookmarkWidget": DeviceBookmarkWidget,
    "ItemBookmarkWidget": ItemBookmarkWidget
}

export type KnownWidgets = keyof typeof widgets;

export { widgets as Widgets };