import { HTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";

function getIconByClass(itemClass: string) {
    if (itemClass.includes(".container"))
        return "folder";
    else if (itemClass.includes(".audioItem"))
        return "music";
    else if (itemClass.includes(".videoItem"))
        return "film";
    else if (itemClass.includes(".imageItem"))
        return "image";
    else
        return "file";
}

type AlbumArtProps = HTMLAttributes<HTMLOrSVGElement> & { itemClass: string, albumArts?: string[], dim?: boolean };

export default ({ itemClass, albumArts, className, dim, ...other }: AlbumArtProps) => {
    const src = albumArts?.length ? viaProxy(albumArts[0]) : `icons.svg#${getIconByClass(itemClass)}${dim ? "-d" : ""}`;
    return <img src={src} className={`album-art${className ? ` ${className}` : ""}`} alt="" {...other} style={{ objectFit: "initial" }} />;
}