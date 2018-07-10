import React from "react";
import AlbumArtImage from "./AlbumArtImage";

export default class DIDLItem extends React.Component {

    displayName = DIDLItem.name;

    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    render() {
        const { "data-source": data, navigateHandler } = this.props;
        return <div data-id={data.id} onDoubleClick={navigateHandler}>
            <div>
                <AlbumArtImage itemClass={data.class} albumArts={data.albumArts} />
                {data.title}
            </div>
            <div className="text-capitalize">{DIDLItem.getKind(data.class)}</div>
        </div>;
    }
}