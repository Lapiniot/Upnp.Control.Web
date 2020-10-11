import React from "react";

export default ({ dataContext: { source: data }, itemTemplate: Item }) =>
    <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
        {[data.map((item, index) => <Item key={index} data-source={item} data-row-id={index} />)]}
    </div>;