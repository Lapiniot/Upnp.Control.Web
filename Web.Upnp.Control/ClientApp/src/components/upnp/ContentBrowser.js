import React from "react";
import DataView from "../DataView";
import { NavLink } from "react-router-dom"

function getKind(upnpClassName) {
    let index = upnpClassName.lastIndexOf(".");
    return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
}

class AlbumArtImage extends React.Component {

    getIconClass(itemClass) {
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
            return <i className={`album-art-icon fas ${this.getIconClass(itemClass)}`} />
    }
}

class DIDLItem extends React.Component {

    displayName = DIDLItem.name;

    render() {
        const { "data-source": data, base, ...other } = this.props;
        return <div>
            <div>
                <NavLink to={`${base}/${data.id}`} className="h-100" {...other}>
                    <AlbumArtImage itemClass={data.class} albumArts={data.albumArts} />
                    {data.title}</NavLink>
            </div>
            <div className="text-capitalize">{getKind(data.class)}</div>
        </div>;
    }


}

class ContainerView extends React.Component {

    displayName = ContainerView.name;

    render() {
        return <div className="x-table x-table-sm x-table-hover x-table-striped x-table-head-light">
            <div>
                <div>
                    <div>Name</div>
                    <div>Kind</div>
                </div>
            </div>
            <div>{this.props.children}</div>
        </div>
    }
}

export default class ContentBrowser extends React.Component {
    render() {
        const { baseUrl, device, id } = this.props;
        return <DataView dataUri={`/api/browse/${device}/${id}`}
            selector={data => data.result}
            containerTemplate={ContainerView}
            itemTemplate={DIDLItem}
            itemProps={{ base: `${baseUrl}/${device}` }} />;
    }
}