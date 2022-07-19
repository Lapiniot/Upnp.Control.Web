import {
    ButtonHTMLAttributes, Component, createRef, DialogHTMLAttributes,
    FormEvent, HTMLAttributes, MouseEvent, ReactNode, SyntheticEvent, useRef
} from "react";
import { useAutoFocus } from "./AutoFocusHook";

interface DialogEventProps {
    onOpen?(): void;
    onDismissed?(action: string, data: FormData | undefined): void;
}

interface DialogRenderProps {
    renderHeader?(): ReactNode;
    renderFooter?(): ReactNode;
    renderBody?(): ReactNode;
}

declare module "react" {
    interface NativeFormEvent extends Event {
        submitter: HTMLButtonElement | HTMLInputElement | null
    }

    interface FormEvent<T = Element> extends SyntheticEvent<T> {
        nativeEvent: NativeFormEvent
    }
}

export type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "onSubmit"> &
    DialogRenderProps & DialogEventProps & {
        immediate?: boolean,
        caption?: string
    }

type DialogButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string,
}

export default class Dialog extends Component<DialogProps>{
    dialogRef;
    formRef;
    observer: MutationObserver;

    constructor(props: DialogProps) {
        super(props);
        this.dialogRef = createRef<HTMLDialogElement>();
        this.formRef = createRef<HTMLFormElement>();
        this.observer = new MutationObserver(this.onMutation);
    }

    private onMutation = (mutations: MutationRecord[]) => {
        for (let i = 0; i < mutations.length; i++) {
            const { attributeName, target } = mutations[i];
            if (attributeName !== "open")
                continue;
            const dialog = target as HTMLDialogElement;
            if (dialog.hasAttribute("open"))
                this.onOpen();
            break;
        }
    }

    override componentDidMount() {
        const dialog = this.dialogRef.current!;
        this.observer.observe(dialog, { attributes: true });
        if (this.props.immediate)
            dialog.showModal();
    }

    override componentDidUpdate() {
        if (this.props.immediate)
            this.dialogRef.current?.showModal();
    }

    override componentWillUnmount() {
        this.observer.disconnect();
    }

    onOpen = async () => {
        const dialog = this.dialogRef.current!;
        document.body.classList.add("modal-open");
        await this.animationsFinished(dialog);
        dialog?.removeAttribute("inert");
        this.props.onOpen?.();
    }

    onClose = async (event: SyntheticEvent<HTMLDialogElement>) => {
        const { props: { onClose, onDismissed } } = this;
        const { currentTarget: dialog } = event;

        dialog.setAttribute("inert", "");
        await Promise.allSettled(dialog.getAnimations().map(a => a.finished));
        document.body.classList.remove("modal-open");

        onClose?.(event);
        if (!event.defaultPrevented) {
            if (!onDismissed) return;
            if (dialog.returnValue && this.formRef.current) {
                onDismissed(dialog.returnValue, new FormData(this.formRef.current));
            } else {
                onDismissed("", undefined);
            }
        }
    }

    private onClick = (event: MouseEvent<HTMLDialogElement>) => {
        this.props.onClick?.(event);
        if (!event.defaultPrevented) {
            const dialog = event.target as HTMLDialogElement;
            if (dialog.tagName === "DIALOG") {
                dialog.close();
            }
        }
    }

    private onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const { currentTarget: form, nativeEvent: { submitter } } = event;
        if (!submitter) return;
        if (submitter === document.activeElement || submitter !== form.elements[0]) {
            if (submitter.formNoValidate || !submitter.value || form.checkValidity()) return;
            form.classList.add("was-validated");
        }
        event.preventDefault();
    }

    private animationsFinished(element: HTMLElement) {
        return Promise.allSettled(element.getAnimations().map(a => a.finished));
    }

    render() {
        const { renderHeader, renderBody, renderFooter, onDismissed, onOpen,
            className, immediate, caption, children, ...other } = this.props;
        return <dialog ref={this.dialogRef} className={`dialog${className ? ` ${className}` : ""}`}
            {...other} onClose={this.onClose} onClick={this.onClick}>
            <form ref={this.formRef} method="dialog" noValidate onSubmit={this.onSubmit}>
                {renderHeader ? renderHeader() : <Dialog.Header><h5 className="dialog-title">{this.props.caption}</h5></Dialog.Header>}
                {renderBody ? renderBody() : <Dialog.Body>{this.props.children}</Dialog.Body>}
                {renderFooter ? renderFooter() : <Dialog.Footer>
                    <Dialog.Button className="text-secondary">Cancel</Dialog.Button>
                    <Dialog.Button className="text-primary" value="ok">OK</Dialog.Button>
                </Dialog.Footer>}
            </form>
        </dialog>
    }

    public static Header({ className, children, ...other }: HTMLAttributes<HTMLDivElement>) {
        return <header className={`dialog-header${className ? ` ${className}` : ""}`} {...other}>
            {children}
            <button className="btn-close" aria-label="Close" />
        </header>
    }

    public static Body({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
        return <article className={`dialog-body${className ? ` ${className}` : ""}`} {...other}></article>
    }

    public static Footer({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
        return <footer className={`dialog-footer${className ? ` ${className}` : ""}`} {...other}></footer>
    }

    public static Button({ className, icon, children, autoFocus, ...other }: DialogButtonProps) {
        const cls = `btn btn-plain text-uppercase p-2 py-1${className ? ` ${className}` : ""}`;
        const ref = useRef<HTMLButtonElement>(null);
        useAutoFocus(ref, autoFocus);
        return <button ref={ref} type="submit" className={cls} {...other}>
            {icon && <svg><use href={icon} /></svg>}{children}
        </button>
    }
}