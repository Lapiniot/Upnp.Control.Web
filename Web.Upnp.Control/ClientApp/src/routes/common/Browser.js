import React from "react";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import AlbumArtImage from "./AlbumArtImage";
import { DIDLUtils as utils } from "./BrowserCore";

export function BrowserView({ dataContext: { source: data } = {}, navContext: { navigateHandler, page, pageSize, urls } }) {
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
                {[data.result.map(({ id, container, class: cls, albumArts, title }, index) => {
                    return <div key={index} data-id={id} onDoubleClick={container && navigateHandler}>
                        <div>
                            <AlbumArtImage itemClass={cls} albumArts={albumArts} />
                            {title}
                        </div>
                        <div className="text-capitalize">{utils.getKind(cls)}</div>
                    </div>;
                })]}
            </div>
        </div>
        <Pagination count={data.result.length} total={data.total} baseUrl={urls.current} current={page} size={pageSize} />
    </div>;
}