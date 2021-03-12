import { HTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";

function getIconByClass(itemClass: string) {
    if (itemClass.includes(".container"))
        return "s-folder";
    else if (itemClass.includes(".audioItem"))
        return "s-file-audio";
    else if (itemClass.includes(".videoItem"))
        return "s-file-video";
    else if (itemClass.includes(".imageItem"))
        return "s-file-image";
    else
        return "s-file";
}

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[] };

export default ({ itemClass, albumArts, className, ...other }: AlbumArtProps) => {
    const cls = `album-art${className ? ` ${className}` : ""}`;
    return albumArts && albumArts.length > 0
        ? <img src={viaProxy(albumArts[0])} className={cls} alt="" {...other} />
        : <svg className={cls} {...other}>
            <use href={`icons.svg#${getIconByClass(itemClass)}`} />
        </svg>
}