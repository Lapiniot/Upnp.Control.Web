import React from "react";

export default ({ children, ...others }) =>
    <div className="h-100 d-flex flex-fill justify-content-center align-items-center" {...others}>
        <div className="spinner-border mr-1" role="status">
            <span className="sr-only">Loading...</span>
        </div>
        {children}
    </div>;