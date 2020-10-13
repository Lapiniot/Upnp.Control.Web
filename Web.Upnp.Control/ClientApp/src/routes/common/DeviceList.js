import React from "react";

export default ({ dataContext: { source: data }, itemTemplate: Item }) =>
    <>
        <i data-fa-symbol="upnp-renderer" className="fas fa-tv" />
        <i data-fa-symbol="upnp-server" className="fas fa-server" />
        <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
            {[data.map((item, index) => <Item key={index} data-source={item} data-row-id={index} />)]}
        </div>
    </>;