import React from "react";

export default class LevelUpRow extends React.Component {
    render() {
        const { "data-context": { parents } = {}, navcontext: { navigateHandler } } = this.props;
        return (parents && parents.length > 0) ?
            <div data-id={parents[0].parentId} onDoubleClick={navigateHandler} >
                {this.props.children}
            </div> :
            null;
    }
}