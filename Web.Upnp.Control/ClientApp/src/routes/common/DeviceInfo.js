import React from "react";
import { NavLink } from "../../components/NavLink";

export default function ({ "data-source": { udn, type, maker, makerUrl, model, modelUrl, modelNumber } }) {
    return <div className="grid-form mb-2">
        <div>UDN</div>
        <div>{udn}</div>
        <div>Type</div>
        <div>{type}</div>
        <div>Maker</div>
        <div>{makerUrl ? <NavLink to={makerUrl}>{maker}</NavLink> : maker}</div>
        <div>Model</div>
        <div>{modelUrl ? <NavLink to={modelUrl}>{model}</NavLink> : model}</div>
        <div>Model #</div>
        <div>{modelNumber}</div>
    </div>;
}