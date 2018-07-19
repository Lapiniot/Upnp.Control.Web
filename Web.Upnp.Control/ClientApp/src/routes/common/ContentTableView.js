import React from "react";

export default class ContentTableView extends React.Component {

    displayName = ContentTableView.name;

    render() {
        const { headerTemplate: Header, injectStart: InjectStartRows, injectEnd: InjectEndRows } = this.props;
        return <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
            <div>
                <div>
                    <Header {...this.props} />
                </div>
            </div>
            <div>
                {InjectStartRows && <InjectStartRows {...this.props} />}
                {this.props.children}
                {InjectEndRows && <InjectEndRows {...this.props} />}
            </div>
        </div>;
    }
}