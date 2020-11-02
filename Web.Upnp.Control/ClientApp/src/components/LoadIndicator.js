import React from "react";

export default ({ children, ...others }) =>
    <div className="h-100 d-flex flex-fill justify-content-center align-items-center" {...others}>
        <div className="spinner-border mr-1 text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        {children}
    </div>;