import { HTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";

type ItemClassIcon = "folder" | "audio_file" | "video_file" | "insert_drive_file" | "insert_photo" | "album" | "queue_music" | "audiotrack" | "movie";

function getIconClassic(itemClass: string): ItemClassIcon {
    if (itemClass.startsWith("object.container")) {
        if (itemClass.endsWith(".playlistContainer"))
            return "queue_music"
        else
            return "folder";
    } else if (itemClass.includes(".audioItem"))
        return "audio_file";
    else if (itemClass.includes(".videoItem"))
        return "video_file";
    else if (itemClass.includes(".imageItem"))
        return "insert_photo";
    else
        return "insert_drive_file";
}

function getIconPlayer(itemClass: string): ItemClassIcon {
    if (itemClass.startsWith("object.container")) {
        if (itemClass.endsWith(".playlistContainer"))
            return "album"
        else
            return "folder";
    } else if (itemClass.includes(".audioItem"))
        return "audiotrack";
    else if (itemClass.includes(".videoItem"))
        return "movie";
    else if (itemClass.includes(".imageItem"))
        return "insert_photo";
    else
        return "insert_drive_file";
}

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[], hint?: "browser" | "player" };

AlbumArt.defaultProps = { itemClass: "object.item" }

export default function AlbumArt({ itemClass, albumArts, className, hint, ...other }: AlbumArtProps) {
    const getIcon = hint === "player" ? getIconPlayer : getIconClassic;
    return albumArts?.length
        ? <img src={viaProxy(albumArts[0])} className={`album-art${className ? ` ${className}` : ""}`} alt="" {...other} />
        : <svg className={`album-art${className ? ` ${className}` : ""}`} {...other}>
            <use href={`symbols.svg#${getIcon(itemClass)}`} />
        </svg>
}