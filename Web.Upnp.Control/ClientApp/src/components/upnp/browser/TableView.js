import React from "react";

export default class TableView extends React.Component {

    displayName = TableView.name;

    render() {
        const { "data-context": { parents } = {}, navigateHandler } = this.props;
        return <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
                   <div>
                       <div>
                           <div>Name</div>
                           <div>Kind</div>
                       </div>
                   </div>
                   <div>
                       {(parents && parents.length > 0) &&
                           <div data-id={parents[0].parentId} onDoubleClick={navigateHandler} >
                               <div>...</div>
                               <div>Parent</div>
                           </div>}
                       {this.props.children}
                   </div>
               </div>;
    }
}