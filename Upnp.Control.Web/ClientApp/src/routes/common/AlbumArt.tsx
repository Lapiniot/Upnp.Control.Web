import { HTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";

type ItemClassIcon = "folder" | "audio_file" | "video_file" | "insert_drive_file" | "insert_photo" | "album" | "queue_music" | "audiotrack" | "movie";

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
    "item.imageItem": "insert_photo",
    "item.imageItem.photo": "insert_photo"
}

const playerMap: IconMap = {
    ...classicMap,
    "container.playlistContainer": "album",
    "item.audioItem.musicTrack": "audiotrack",
    "item.videoItem.movie": "movie"
};

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[], hint?: "browser" | "player" };

AlbumArt.defaultProps = { itemClass: "object.item" }

export default function AlbumArt({ itemClass, albumArts, className, hint, ...other }: AlbumArtProps) {
    itemClass = itemClass.substring(7);
    const map = hint === "player" ? playerMap : classicMap;
    return albumArts?.length
        ? <img src={viaProxy(albumArts[0])} className={`album-art${className ? ` ${className}` : ""}`} alt="" {...other} />
        : <svg className={`album-art${className ? ` ${className}` : ""}`} {...other}>
            <use href={`symbols.svg#${map[itemClass] ?? (itemClass.startsWith("container") ? "folder" : "insert_drive_file")}`} />
        </svg>
}