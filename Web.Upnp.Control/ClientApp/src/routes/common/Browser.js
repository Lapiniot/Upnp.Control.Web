import React from "react";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import AlbumArtImage from "./AlbumArt";
import { DIDLUtils as utils } from "./BrowserCore";
import $config from "../common/Config";

export function BrowserView(props) {
    const { dataContext: { source: { total = 0, parents = [], result: items = [] } = {} } = {}, match, navigate, p: page, s: size } = props;
    return <div>
        <Breadcrumb items={parents} {...match} />
        <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
            <div>
                <div>
                    <div>Name</div>
                    <div className="x-table-cell-min">Kind</div>
                </div>
            </div>
            <div>
                {parents && parents.length > 0 &&
                    <div data-id={parents[0].parentId} onDoubleClick={navigate}>
                        <div>...</div>
                        <div>Parent</div>
                    </div>}
                {[items.map(({ id, container, class: cls, albumArts, title }, index) => {
                    return <div key={index} data-id={id} onDoubleClick={container ? navigate : undefined}>
                        <div>
                            <AlbumArtImage itemClass={cls} albumArts={albumArts} className="mr-1" />
                            {title}
                        </div>
                        <div className="text-capitalize">{utils.getDisplayName(cls)}</div>
                    </div>;
                })]}
            </div>
        </div>
        <Pagination {...match} className="position-sticky sticky-bottom" count={items.length} total={total}
            current={parseInt(page) || 1} size={parseInt(size) || $config.pageSize} />
    </div >;
}