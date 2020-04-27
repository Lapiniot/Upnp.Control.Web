import React from "react";
import { mergeClassNames as merge } from "../../components/Extensions";


function getIconClass(itemClass) {
    if (itemClass.endsWith("musicTrack"))
        return "fa-file-audio";
    if (itemClass.endsWith("videoItem"))
        return "fa-file-video";
    return "fa-folder";
}

export default ({ itemClass, albumArts, className }) => albumArts && albumArts.length > 0
    ? <img src={`/proxy/${albumArts[0]}`} className={merge`album-art ${className}`} alt="" />
    : <i className={merge`album-art ${className} fas ${getIconClass(itemClass)}`} />;