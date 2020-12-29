import React from "react";
import { DragEvent, HTMLAttributes } from "react";
import { Indicator } from "./LoadIndicator";

type DropTargetProps = Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> & {
    acceptedTypes?: string[];
    onDrop: (files: Iterable<File>, target: HTMLElement) => boolean;
};

type DropTargetState = {
    dragging: boolean;
    acceptable: boolean;
};

export class DropTarget extends React.Component<DropTargetProps, DropTargetState> {

    state = { dragging: false, acceptable: false };
    counter = 0;

    private reset() {
        this.counter = 0;
        this.setState({ dragging: false, acceptable: false });
    }

    isAcceptable = (item: DataTransferItem | File) =>
        item instanceof DataTransferItem && item.kind === "file" && (!this.props.acceptedTypes || this.props.acceptedTypes.includes(item.type)) ||
        item instanceof File && (!this.props.acceptedTypes || this.props.acceptedTypes.includes(item.type));

    #drop = (e: DragEvent<HTMLDivElement>) => {
        try {
            const element = e.target as HTMLElement;
            const filtered = Array.from(e.dataTransfer.files).filter(this.isAcceptable);
            if (this.props.onDrop(filtered, element)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
        finally {
            this.reset();
        }
    }

    #enter = (e: DragEvent<HTMLDivElement>) => {
        if (++this.counter === 1) {
            const acceptable = Array.from(e.dataTransfer.items).some(this.isAcceptable);
            this.setState({ dragging: true, acceptable: acceptable });
        }

        e.dataTransfer.dropEffect = this.state.acceptable ? "copy" : "none";
        e.stopPropagation();
        e.preventDefault();
    }

    #over = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.dropEffect = this.state.acceptable ? "copy" : "none";
        e.stopPropagation();
        e.preventDefault();
    }

    #leave = (e: DragEvent<HTMLDivElement>) => {
        if (--this.counter === 0) this.reset();
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const { children, acceptedTypes, onDrop, ...other } = this.props;
        const { dragging, acceptable } = this.state;
        const color = acceptable ? "primary" : "secondary";

        return <div {...other} onDragEnter={this.#enter} onDragLeave={this.#leave} onDragOver={this.#over} onDrop={this.#drop}>
            {dragging && <div className={`backdrop text-center border border-2 border-${color} backdrop-${color}`}>
                <Indicator className={`vp-center flex-column text-${acceptable ? "white" : "white-50"}`}>
                    <i className={`fa fa-${acceptable ? "upload" : "poo"} fa-3x`} />
                    <p className="text-bolder">{acceptable ? "Drop playlist files here" : "Only playlist files (.m3u, .m3u8) are supported"}</p>
                </Indicator>
            </div>}
            {children}
        </div>;
    }
}