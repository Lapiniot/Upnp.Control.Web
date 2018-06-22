import React from "react";

export default class Spinner extends React.Component {

    displayName = Spinner.name;

    render() {
        const { tag, ...other } = this.props;
        const Tag = tag || "h5";
        return <Tag {...other}>
                   <p className="fa fa-w2 fa-spinner fa-spin"/>{this.props.children}
               </Tag>;
    }
}