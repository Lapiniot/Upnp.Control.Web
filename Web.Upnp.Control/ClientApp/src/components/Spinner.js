import React from "react";

export default class Spinner extends React.Component {
    render() {
        const { tag, ...other } = this.props;
        const Tag = tag || 'h5';
        return <Tag {...other}><p class="fa fa-fw fa-spinner fa-spin" />{this.props.children}</Tag>
    }
}