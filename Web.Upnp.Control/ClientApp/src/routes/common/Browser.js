import React from "react";
import { withRouter } from "react-router-dom";
import { withDataFetch } from "../../components/Extensions";
import { withNavigationContext } from "./Navigator";
import LoadIndicator from "../../components/LoadIndicator";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import AlbumArtImage from "./AlbumArtImage";

class Browser extends React.Component {
    render() {
        const { dataContext: data = {}, navContext: { navigateHandler, page, pageSize, urls } } = this.props;
        return <div>
                   <Breadcrumb dataContext={data.parents} baseUrl={urls.root} />
                   <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
                       <div>
                           <div>
                               <div>Name</div>
                               <div className="x-table-cell-min">Kind</div>
                           </div>
                       </div>
                       <div>
                           <div data-id={data.parents[0].parentId} onDoubleClick={navigateHandler}>
                               <div>...</div>
                               <div>Parent</div>
                           </div>
                           {[data.result.map((e, index) => {
                               return <div key={index} data-id={e.id} onDoubleClick={navigateHandler}>
                                          <div>
                                              <AlbumArtImage itemClass={e.class} albumArts={e.albumArts} />
                                              {e.title}
                                          </div>
                                          <div className="text-capitalize">{DIDLUtils.getKind(e.class)}</div>
                                      </div>;
                           })]}
                       </div>
                   </div>
                   <Pagination count={data.result.length} total={data.total} baseUrl={urls.current} current={page} size={pageSize} />
               </div>;
    }
}

export const RoutedBrowser = withRouter(
    withNavigationContext(
        withDataFetch(Browser,
            { template: LoadIndicator },
            ({ device, id, navContext: { pageSize, page } }) => {
                return `/api/browse/${device}/${id}?withParents=true&take=${pageSize}&skip=${(page - 1) * pageSize}`;
            })));

export function renderWithDeviceProps(Component, props) {
    return function({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...props} />;
    };
}

export class DIDLUtils {
    static getKind(upnpClassName) {
        const index = upnpClassName.lastIndexOf(".");
        return index > 0 ? upnpClassName.substring(index + 1) : upnpClassName;
    }
}