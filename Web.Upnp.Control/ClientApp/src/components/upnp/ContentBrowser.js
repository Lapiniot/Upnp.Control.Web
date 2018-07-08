import React from "react";
import DataView from "../DataView";
import { withRouter, NavLink } from "react-router-dom";
import { QString } from "../Utils";

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
        const { "data-context": { result: { length } = [], total = 0 } = {}, baseUrl, page, size } = this.props;

        if (length === 0 || total === length) return null;

        let pageData = [];
        for (var i = 0; i < Math.ceil(total / size); i++) {
            pageData.push({ title: i + 1, url: `${baseUrl}?p=${i + 1}&s=${size}` });
        }

        const isFirst = page == 1;
        const isLast = page >= pageData.length;
        
        return <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center">
                <li className={`page-item${isFirst ? " disabled" : ""}`}>{!isFirst ?
                    <NavLink to={`${baseUrl}?p=${page - 1}&s=${size}`} className="page-link" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span><span className="sr-only">Previous</span>
                    </NavLink> :
                    <span className="page-link disabled" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </span>}
                </li>
                {[
                    pageData.map((e, index) => {
                        const isCurrent = index + 1 === page;

                        return <li key={index} className={`page-item${isCurrent ? " active" : ""}`}>
                            {isCurrent ?
                                <span className="page-link">{e.title}<span class="sr-only">(current)</span></span> :
                                <NavLink to={e.url} className="page-link">{e.title}</NavLink>}
                        </li>;
                    })
                ]}
                <li className={`page-item${isLast ? " disabled" : ""}`}>{!isLast ?
                    <NavLink to={`${baseUrl}?p=${page + 1}&s=${size}`} className="page-link" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span><span className="sr-only">Next</span>
                    </NavLink> :
                    <span className="page-link" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </span>}
                </li>
            </ul>
        </nav>;
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
                    <div data-id={parents[parents.length - 1].parentId} onDoubleClick={navigateHandler}>
                        <div>...</div>
                        <div>Parent</div>
                    </div>}
                {this.props.children}
            </div>
        </div>
    }
}

class Browser extends React.Component {

    navigateHandler = event => {
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
        const { device, id, baseUrl, match: { url }, location: { search: qstring } } = this.props;
        const { p: page = 1, s: size = 50 } = QString.parse(qstring);
        return <DataView dataUri={`/api/browse/${device}/${id}?withParents=true&take=${size}&skip=${(page - 1) * size}`}
            selector={data => data.result}
            headerTemplate={Breadcrumbs} headerProps={{ baseUrl: `${baseUrl}/${device}` }}
            containerTemplate={ContainerView} containerProps={{ navigateHandler: this.navigateHandler }}
            itemTemplate={DIDLItem} itemProps={{ onDoubleClick: this.navigateHandler }}
            footerTemplate={Pagination} footerProps={{ baseUrl: url, page: parseInt(page), size: parseInt(size) }} />;
    }
}

const ContentBrowser = withRouter(Browser);

export default ContentBrowser;