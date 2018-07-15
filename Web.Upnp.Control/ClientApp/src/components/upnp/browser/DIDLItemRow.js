import React from "react";
import AlbumArtImage from "./AlbumArtImage";

export default class DIDLItemRow extends React.Component {

    displayName = DIDLItemRow.name;

    render() {
        const { "data-source": { id }, navcontext: { navigateHandler } } = this.props;
        return <div data-id={id} onDoubleClick={navigateHandler}>
            {this.props.children}
        </div>;
    }
}

export class DefaultCells extends React.Component {

    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }

    render() {
        const { "data-source": { class: itemClass, albumArts, title } } = this.props;
        return (<React.Fragment>
            <div>
                <AlbumArtImage itemClass={itemClass} albumArts={albumArts} />
                {title}
            </div>
            <div className="text-capitalize">{DefaultCells.getKind(itemClass)}</div>
        </React.Fragment>);
    }
}