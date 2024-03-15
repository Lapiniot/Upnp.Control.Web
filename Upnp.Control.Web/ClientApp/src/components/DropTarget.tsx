import React from "react";
import { DragEvent, HTMLAttributes } from "react";

type DropTargetProps = Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> & {
    acceptedTypes?: string[];
    onDropped: (files: Iterable<File>, target: HTMLElement) => boolean;
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

    private isAcceptable = (item: DataTransferItem | File) =>
        item instanceof DataTransferItem && item.kind === "file" &&
        (!this.props.acceptedTypes || this.props.acceptedTypes.includes(item.type)) ||
        item instanceof File && (!this.props.acceptedTypes || this.props.acceptedTypes.includes(item.type));

    private dropHandler = (e: DragEvent<HTMLDivElement>) => {
        try {
            const element = e.target as HTMLElement;
            const filtered = Array.from(e.dataTransfer.files).filter(this.isAcceptable);
            if (this.props.onDropped(filtered, element)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
        finally {
            this.reset();
        }
    }

    private dragEnterHandler = (e: DragEvent<HTMLDivElement>) => {
        if (++this.counter === 1) {
            const acceptable = Array.from(e.dataTransfer.items).some(this.isAcceptable);
            this.setState({ dragging: true, acceptable: acceptable });
        }

        e.dataTransfer.dropEffect = this.state.acceptable ? "copy" : "none";
        e.stopPropagation();
        e.preventDefault();
    }

    private dragOverHandler = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.dropEffect = this.state.acceptable ? "copy" : "none";
        e.stopPropagation();
        e.preventDefault();
    }

    private dragLeaveHandler = (e: DragEvent<HTMLDivElement>) => {
        if (--this.counter === 0) this.reset();
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const { children, acceptedTypes, onDropped, ...other } = this.props;
        const { dragging, acceptable } = this.state;
        const color = acceptable ? "primary" : "error";

        return <div {...other} onDragEnter={this.dragEnterHandler} onDragLeave={this.dragLeaveHandler}
            onDragOver={this.dragOverHandler} onDrop={this.dropHandler}>
            {children}
            {dragging && <div className={`d-flex pe-none border border-2 border-${color} backdrop-${color}`}>
                <div className={`d-flex flex-column flex-fill m-auto justify-content-center align-items-center text-bg-${color} rounded-1 p-3`}
                    style={{ maxWidth: "min(40ch,80%)" }}>
                    <svg className="icon icon-3x">
                        <use href={`symbols.svg#${acceptable ? "upload_file" : "block"}`} />
                    </svg>
                    <p className="fw-semibold m-0 text-center">{acceptable ? "Drop playlist files" : "Only playlist files (.m3u, .m3u8) are supported"}</p>
                </div>
            </div>}
        </div>
    }
}