import React from "react";
import { NavLink } from "react-router-dom";

export default class Pagination extends React.Component {
    render() {
        const { "data-context": { result: { length } = [], total = 0 } = {}, baseUrl, page, size } = this.props;
        if (length === 0 || total === length)
            return null;
        let pageData = [];
        for (var i = 0; i < Math.ceil(total / size); i++) {
            pageData.push({ title: i + 1, url: `${baseUrl}?p=${i + 1}&s=${size}` });
        }
        const isFirst = page == 1;
        const isLast = page >= pageData.length;
        return <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center">
                <li className={`page-item${isFirst ? " disabled" : ""}`}>{!isFirst ?
                    <NavLink to={`${baseUrl}?p=${page - 1}&s=${size}`} className="page-link" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span><span className="sr-only">Previous</span>
                    </NavLink> :
                    <span className="page-link disabled" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </span>}
                </li>
                {[
                    pageData.map((e, index) => {
                        const isCurrent = index + 1 === page;
                        return <li key={index} className={`page-item${isCurrent ? " active" : ""}`}>
                            {isCurrent ?
                                <span className="page-link">{e.title}<span class="sr-only">(current)</span></span> :
                                <NavLink to={e.url} className="page-link">{e.title}</NavLink>}
                        </li>;
                    })
                ]}
                <li className={`page-item${isLast ? " disabled" : ""}`}>{!isLast ?
                    <NavLink to={`${baseUrl}?p=${page + 1}&s=${size}`} className="page-link" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span><span className="sr-only">Next</span>
                    </NavLink> :
                    <span className="page-link" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </span>}
                </li>
            </ul>
        </nav>;
    }
}