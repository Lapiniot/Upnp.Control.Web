import React from "react";

export default ({ uniqueId, title, children }) =>
    <div className="spoiler">
        <button className="btn-light collapsed" aria-expanded="false" aria-controls={uniqueId}
                data-toggle="collapse" data-target={`#${uniqueId}`}>
            <i />{title}
        </button>
        <div className="collapse" id={uniqueId}>{children}</div>
    </div>;