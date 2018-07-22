import React from "react";

export default class DeviceList extends React.Component {

    displayName = DeviceList.name;

    render() {
        const { dataContext: { source: data }, itemTemplate: Item } = this.props;
        return <div className="d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4 py-3 px-3">
            {[data.map((item, index) => {
                return <Item key={index} data-source={item} data-row-id={index} />;
            })]}
        </div>;
    }
}