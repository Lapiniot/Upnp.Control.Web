import React from "react";
import DataView from "../DataView";
import { withRouter, NavLink } from "react-router-dom"

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

class Breadcrumbs extends React.Component {
    render() {
        const { "data-context": { parents } = [], baseUrl } = this.props;
        return <nav aria-label="breadcrumb sticky-top">
            <ol className="breadcrumb rounded-0 my-0 p-1">
                {[parents.reverse().map((p, i) => {
                    let isCurrent = i === parents.length - 1;
                    let className = "breadcrumb-item" + (isCurrent ? " active" : "");
                    return <li key={i} className={className} aria-current={isCurrent ? "page" : null}>
                        {!isCurrent ? <NavLink to={`${baseUrl}/${p.id}`}>{p.title}</NavLink> : p.title}
                    </li>
                })]}
            </ol>
        </nav>;
    }
}

class Pagination extends React.Component {
    render() {
        return <div></div>;
    }
}

class DIDLItem extends React.Component {

    displayName = DIDLItem.name;

    render() {
        const { "data-source": data, base, ...other } = this.props;
        return <div data-id={data.id} {...other}>
            <div>
                <AlbumArtImage itemClass={data.class} albumArts={data.albumArts} />
                {data.title}
            </div>
            <div className="text-capitalize">{getKind(data.class)}</div>
        </div>;
    }
}


class ContainerView extends React.Component {

    displayName = ContainerView.name;

    render() {

        const { "data-context": { parents } = {}, navigateHandler } = this.props;

        return <div className="x-table x-table-sm x-table-hover x-table-striped x-table-head-light">
            <div>
                <div>
                    <div>Name</div>
                    <div>Kind</div>
                </div>
            </div>
            <div>
                {(parents && parents.length > 0) &&
                    <div onDoubleClick={() => navigateHandler(parents[parents.length - 1].parentId)}>
                        <div>...</div>
                        <div>Parent</div>
                    </div>}
                {this.props.children}
            </div>
        </div>
    }
}

class Browser extends React.Component {

    handleDoubleClick = event => {
        const id = event.currentTarget.dataset.id;
        this.navigateToItem(id);
    }

    navigateTo = (location) => this.props.history.push(location);

    navigateBack = () => this.props.history.goBack();

    navigateToItem = (id) => {
        if (id !== "-1")
            this.navigateTo(`${this.props.baseUrl}/${this.props.device}/${id}`);
        else
            this.navigateTo(this.props.baseUrl);
    }

    render() {
        const { device, id, baseUrl } = this.props;
        return <DataView dataUri={`/api/browse/${device}/${id}?withParents=true`}
            selector={data => data.result}
            headerTemplate={Breadcrumbs} headerProps={{ baseUrl: `${baseUrl}/${device}` }}
            containerTemplate={ContainerView} containerProps={{ navigateHandler: this.navigateToItem }}
            itemTemplate={DIDLItem} itemProps={{ onDoubleClick: this.handleDoubleClick }}
            footerTemplate={Pagination} />;
    }
}

const ContentBrowser = withRouter(Browser);

export default ContentBrowser;