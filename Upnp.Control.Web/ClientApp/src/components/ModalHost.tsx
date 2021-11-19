import React, { ReactElement, ReactNode } from "react";
import { ModalProps } from "./Modal";
import { Portal } from "./Portal";

export default class ModalHost extends React.Component<{}, { modal?: ReactNode }> {

    state = { modal: undefined };

    public show(modal: ReactElement<ModalProps>) {
        const onDismissed = modal.props.onDismissed;

        this.setState({
            modal: React.cloneElement(modal, {
                ...this.props, ...modal.props,
                immediate: true,
                onDismissed: (e: Event) => {
                    try {
                        onDismissed?.(e);
                    }
                    finally {
                        this.setState({ modal: undefined });
                    }
                }
            })
        });
    }

    render() {
        return <Portal selector="#modal-root">{this.state.modal}</Portal>;
    }
}