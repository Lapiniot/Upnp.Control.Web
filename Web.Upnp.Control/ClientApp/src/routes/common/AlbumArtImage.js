import React from "react";

function getIconClass(itemClass) {
    if (itemClass.endsWith("musicTrack"))
        return "fa-file-audio";
    if (itemClass.endsWith("videoItem"))
        return "fa-file-video";
    return "fa-folder";
}

export default ({ itemClass, albumArts }) => albumArts && albumArts.length > 0
    ? <img src={`/api/proxy/${escape(albumArts[0])}`} className="album-art-icon" alt="" />
    : <i className={`album-art-icon fas ${getIconClass(itemClass)}`} />;
