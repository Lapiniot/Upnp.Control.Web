import React from 'react'

export default class Icon extends React.Component {
    render() {
        const { glyph, class: cls, ...other } = this.props;
        return <i className={'fa fa-fw fa-' + glyph + (cls ? ' ' + cls : '')} {...other} />
    }
}