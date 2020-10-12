import React from "react";

export default function ({ "data-source": { udn, type, maker, model, modelNumber } }) {
    return <div className="grid-form mb-2">
        <div>UDN</div>
        <div>{udn}</div>
        <div>Type</div>
        <div>{type}</div>
        <div>Maker</div>
        <div>{maker}</div>
        <div>Model</div>
        <div>{model}</div>
        <div>Model #</div>
        <div>{modelNumber}</div>
    </div>;
}