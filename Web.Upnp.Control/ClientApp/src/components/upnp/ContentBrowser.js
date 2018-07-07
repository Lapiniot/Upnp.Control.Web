import React from "react";
import DataView from "../DataView";
import { NavLink } from "react-router-dom"

function getKind(upnpClassName) {
    let index = upnpClassName.lastIndexOf(".");
    return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
}

class DIDLItem extends React.Component {

    displayName = DIDLItem.name;

    render() {
        const { "data-source": data, base, ...other } = this.props;
        return <div>
            <div>
                <NavLink to={`${base}/${data.id}`} className="h-100" {...other}>
                    <i className={`fas x-fa-w-3 ${this.getIconClass(data.class)}`} />
                    {data.title}</NavLink>
            </div>
            <div className="text-capitalize">{getKind(data.class)}</div>
        </div>;
    }

    getIconClass(className) {
        if (className.endsWith("musicTrack"))
            return "fa-file-audio";
        if (className.endsWith("videoItem"))
            return "fa-file-video";
        return "fa-folder";
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