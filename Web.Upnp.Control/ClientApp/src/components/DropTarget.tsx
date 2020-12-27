import React from "react";
import { DragEvent, HTMLAttributes } from "react";
import { DropTargetIndicator } from "./LoadIndicator";

type DropTargetProps = Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> & {
    acceptedTypes?: string[];
    onDrop: (files: FileList, target: HTMLElement) => boolean;
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

    #drop = (e: DragEvent<HTMLDivElement>) => {
        try {
            const element = e.target as HTMLElement;
            if (this.props.onDrop(e.dataTransfer.files, element)) {
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
            const acceptable = Array.from(e.dataTransfer.items).some(i => i.kind === "file" && (!this.props.acceptedTypes || this.props.acceptedTypes.includes(i.type)));
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
        const { children, ...other } = this.props;
        const { dragging, acceptable } = this.state;
        const color = acceptable ? "primary" : "secondary";

        return <div {...other} onDragEnter={this.#enter} onDragLeave={this.#leave} onDragOver={this.#over} onDrop={this.#drop}>
            {dragging && <div className={`backdrop text-center border border-3 border-${color} backdrop-${color}`}>
                <DropTargetIndicator className={`vp-center flex-column text-${acceptable ? "white" : "white-50"}`}>
                    {acceptable
                        ? <p className="text-bolder">Drop playlist files here</p>
                        : <p className="text-bolder">Only playlist files (.m3u, .m3u8) are supported</p>
                    }
                </DropTargetIndicator>
            </div>}
            {children}
        </div>;
    }
}