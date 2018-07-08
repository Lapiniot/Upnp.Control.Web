import React from "react";

export default class AlbumArtImage extends React.Component {
    
    static getIconClass(itemClass) {
        if (itemClass.endsWith("musicTrack"))
            return "fa-file-audio";
        if (itemClass.endsWith("videoItem"))
            return "fa-file-video";
        return "fa-folder";
    }
    
    render() {
        const { itemClass, albumArts } = this.props;
        if (albumArts && albumArts.length > 0)
            return <img src={`/api/proxy/${escape(albumArts[0])}`} className="album-art-icon" alt="" />;
        else
            return <i className={`album-art-icon fas ${AlbumArtImage.getIconClass(itemClass)}`} />;
    }
}