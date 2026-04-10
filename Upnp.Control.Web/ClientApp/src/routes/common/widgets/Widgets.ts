import DeviceBookmarkWidget from "@routes/common/widgets/DeviceBookmarkWidget";
import ItemBookmarkWidget from "@routes/common/widgets/ItemBookmarkWidget";
import PlaylistBookmarkWidget from "@routes/common/widgets/PlaylistBookmarkWidget";

const widgets = {
    "DeviceBookmarkWidget": DeviceBookmarkWidget,
    "ItemBookmarkWidget": ItemBookmarkWidget,
    "PlaylistBookmarkWidget": PlaylistBookmarkWidget
}

export type KnownWidgets = keyof typeof widgets;

export { widgets as Widgets };