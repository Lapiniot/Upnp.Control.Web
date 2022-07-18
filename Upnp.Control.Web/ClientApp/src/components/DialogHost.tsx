import { cloneElement, Component, ReactElement, ReactNode } from "react";
import { DialogProps } from "./Dialog";
import { Portal } from "./Portal";

export default class DialogHost extends Component<{}, { dialog?: ReactNode }> {

    state = { dialog: undefined };

    public show(dialog: ReactElement<DialogProps>) {
        const onDismissed = dialog.props.onDismissed;

        this.setState({
            dialog: cloneElement(dialog, {
                ...this.props, ...dialog.props,
                immediate: true,
                onDismissed: (action: string, data: FormData | undefined) => {
                    try {
                        onDismissed?.(action, data);
                    }
                    finally {
                        this.setState({ dialog: undefined });
                    }
                }
            })
        });
    }

    render() {
        return <Portal selector="#modal-root">{this.state.dialog}</Portal>;
    }
}