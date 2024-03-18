import { HTMLAttributes } from "react";
import { viaProxy } from "../../services/Extensions";

type ItemClassIcon = "folder" | "audio_file" | "video_file" | "unknown_document" | "image" | "album" | "queue_music" | "music_note" | "movie";

type IconMap = {
    [K in string]: ItemClassIcon;
};

const classicMap: IconMap = {
    "container.storageFolder": "folder",
    "container.playlistContainer": "queue_music",
    "item.audioItem": "audio_file",
    "item.audioItem.musicTrack": "audio_file",
    "item.videoItem": "video_file",
    "item.videoItem.movie": "video_file",
    "item.imageItem": "image",
    "item.imageItem.photo": "image"
}

const playerMap: IconMap = {
    ...classicMap,
    "container.playlistContainer": "album",
    "item.audioItem.musicTrack": "music_note",
    "item.videoItem.movie": "movie"
};

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[], hint?: "browser" | "player" };

AlbumArt.defaultProps = { itemClass: "object.item" }

export default function AlbumArt({ itemClass, albumArts, className, hint, ...other }: AlbumArtProps) {
    itemClass = itemClass.substring(7);
    const map = hint === "player" ? playerMap : classicMap;
    return albumArts?.length
        ? <img src={viaProxy(albumArts[0])} loading="lazy" className={`album-art${className ? ` ${className}` : ""}`} alt="" {...other} />
        : <svg className={`album-art${className ? ` ${className}` : ""}`} {...other}>
            <use href={`symbols.svg#${map[itemClass] ?? (itemClass.startsWith("container") ? "folder" : "unknown_document")}`} />
        </svg>
}