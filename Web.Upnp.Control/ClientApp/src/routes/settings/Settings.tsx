export default () => <div className="m-0 m-sm-3 d-flex flex-column">
    <ul className="list-group list-group-flush">
        <li className="list-group-item">
            <small className="mb-3">General</small>
            <ul className="list-unstyled">
            </ul>
        </li>
        <li className="list-group-item">
            <small>Tools</small>
            <ul className="list-unstyled mt-1 d-flex flex-column flex-gapy-2">
                <li className="d-flex flex-column">
                    <a className="btn-link" href="api/swagger" target="_blank" rel="noopener noreferrer">Open SwaggerUI</a>
                    <small className="text-muted">Offers a web-based UI that provides information about the service, using the generated OpenAPI specification</small>
                </li>
                <li className="d-flex flex-column">
                    <a className="btn-link" href="api/cert">Download Certificate</a>
                    <small className="text-muted">You can obtain a copy of SSL certificate used by this site - this is especially useful if you need to add it manually to the trusted store on your device</small>
                </li>
                <li className="d-flex flex-column">
                    <a className="btn-link" href="api/health">Server Health</a>
                    <small className="text-muted">Health checks are usually used with an external monitoring service or container orchestrator to check the status of an app</small>
                </li>
            </ul>
        </li>
    </ul>
</div>;