import React, { HTMLAttributes } from "react";
import { mergeClassNames as merge } from "../../components/Extensions";

function getIconByClass(itemClass: string) {
    if (itemClass.endsWith("musicTrack"))
        return "s-file-audio";
    if (itemClass.endsWith("videoItem"))
        return "s-file-video";
    return "s-folder";
}

type AlbumArtProps = HTMLAttributes<any> & { itemClass: string, albumArts: string[] };

export default ({ itemClass, albumArts, className, ...other }: AlbumArtProps) => {
    const cls = merge`album-art ${className}`;
    return albumArts && albumArts.length > 0
        ? <img src={`/proxy/${albumArts[0]}`} className={cls} alt="" {...other} />
        : <svg className={cls} {...other}>
            <use href={`icons.svg#${getIconByClass(itemClass)}`} />
        </svg>
}