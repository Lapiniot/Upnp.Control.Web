import { HTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";
export function getIconByClass(itemClass: string) {
    if (itemClass.startsWith("object.container")) {
        if (itemClass.endsWith(".playlistContainer"))
            return "music"
        else
            return "folder";
    } else if (itemClass.includes(".audioItem"))
        return "music";
    else if (itemClass.includes(".videoItem"))
        return "film";
    else if (itemClass.includes(".imageItem"))
        return "image";
    else
        return "file";
}

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[] };

AlbumArt.defaultProps = { itemClass: "object.item" }

export default function AlbumArt({ itemClass, albumArts, className, ...other }: AlbumArtProps) {
    return albumArts?.length
        ? <img src={viaProxy(albumArts[0])} className={`album-art${className ? ` ${className}` : ""}`} alt="" {...other} />
        : <svg className={`album-art${className ? ` ${className}` : ""}`} {...other}>
            <use href={`icons.svg#s-${getIconByClass(itemClass)}`} />
        </svg>
}