﻿import React from "react";
import Spoiler from "../../components/Spoiler";

export default function({ "data-source": data, "data-row-id": rowId }) {
    return <Spoiler title="Supported services" uniqueId={`card-${rowId}-s`}>
               <ul className="list-group list-group-flush">
                   {[data.map(({ url, usn }, i) => <li key={i} className="list-group-item"><a href={url} className="card-link">{usn}</a></li>)]}
               </ul>
           </Spoiler>;
}