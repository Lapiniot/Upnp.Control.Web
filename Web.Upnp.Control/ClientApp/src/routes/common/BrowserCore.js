import React from "react";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import AlbumArtImage from "./AlbumArt";
import { DIDLUtils as utils } from "./BrowserUtils";
import $config from "./Config";

export default function (props) {
    const { dataContext: { source: { total = 0, parents = [], result: items = [] } = {} } = {}, match, navigate, p: page, s: size } = props;
    return <div>
        <Breadcrumb items={parents} {...match} />
        <div className="auto-table table-compact table-hover-link table-striped">
            <div className="bg-light">
                <div>
                    <div>Name</div>
                    <div className="cell-min">Kind</div>
                </div>
            </div>
            <div>
                {parents && parents.length > 0 &&
                    <div data-id={parents[0].parentId} onDoubleClick={navigate}>
                        <div>...</div>
                        <div>Parent</div>
                    </div>}
                {[items.map((e, index) => {
                    const { id, container, class: cls, albumArts, title, creator, album } = e;
                    return <div key={index} data-id={id} onDoubleClick={container ? navigate : undefined}>
                        <div className="d-flex align-items-center">
                            <AlbumArtImage itemClass={cls} albumArts={albumArts} className="mr-1" />
                            <div>
                                {title}
                                {creator && <small>&nbsp;&bull;&nbsp;{creator}</small>}
                                {album && <small>&nbsp;&bull;&nbsp;{album}</small>}
                            </div>
                        </div>
                        <div title={JSON.stringify(e, null, 2)} className="text-capitalize">{utils.getDisplayName(cls)}</div>
                    </div>;
                })]}
            </div>
        </div>
        <Pagination {...match} className="position-sticky sticky-bottom" count={items.length} total={total}
            current={parseInt(page) || 1} size={parseInt(size) || $config.pageSize} />
    </div >;
}