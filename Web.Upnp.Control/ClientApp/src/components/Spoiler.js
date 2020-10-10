import React from "react";
import "bootstrap/js/src/collapse";

export default ({ uniqueId, title, children }) =>
    <div className="spoiler">
        <button type="button" className="btn btn-block btn-light collapsed"
            data-toggle="collapse" data-target={`#${uniqueId}`}
            aria-controls={uniqueId} aria-expanded="false">
            <i className="fa-fw" />{title}
        </button>
        <div className="collapse" id={uniqueId}>{children}</div>
    </div>;