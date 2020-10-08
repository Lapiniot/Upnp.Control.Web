import React from "react";

export default class extends React.Component {

    clickHandler = e => {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const position = (e.clientX - rect.left) / element.clientWidth;
        if (this.props.onChangeRequested) {
            this.props.onChangeRequested(position);
        }
    };

    render() {
        const { progress, style = {}, onChangeRequested, ...other } = this.props;
        style.width = `${(progress * 100).toFixed(2)}%`;

        return <div onClick={this.clickHandler} role="button" {...other}>
            <div className="slider">
                <div className="slider-line" style={style} />
                <div className="slider-ticker" />
            </div>
        </div>;
    }
}