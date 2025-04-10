import {
    ButtonHTMLAttributes, Component, createRef, DialogHTMLAttributes,
    FormEvent, HTMLAttributes, MouseEvent, ReactNode, SyntheticEvent, useRef
} from "react";

interface DialogEventProps {
    onOpen?(): void;
    onDismissed?(action: string, data: FormData | undefined): void;
}

type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "onSubmit"> &
    DialogEventProps & {
        immediate?: boolean,
        icon?: string,
        caption?: ReactNode,
        actions?: ReactNode
    }

type DialogButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string,
}

interface NativeDialog {
    open: boolean;
    show(): void;
    showModal(): void;
    close(returnValue?: string): void;
}

export default class Dialog extends Component<DialogProps> implements NativeDialog {
    private dialogRef;
    private formRef;
    private observer: MutationObserver;
    private static closedBySupported = "closedBy" in document.createElement('dialog');

    constructor(props: DialogProps) {
        super(props);
        this.dialogRef = createRef<HTMLDialogElement>();
        this.formRef = createRef<HTMLFormElement>();
        this.observer = new MutationObserver(this.onMutation);
    }

    public static Button = Button;

    get open() { return this.dialogRef.current?.open ?? false }

    show = () => {
        this.dialogRef.current?.show();
    }

    showModal = () => {
        this.dialogRef.current?.showModal();
    }

    close = (returnValue?: string) => {
        this.dialogRef.current?.close(returnValue);
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
            this.showModal();
    }

    override componentDidUpdate() {
        if (this.props.immediate)
            this.showModal();
    }

    override componentWillUnmount() {
        this.observer.disconnect();
    }

    private onOpen = async () => {
        const dialog = this.dialogRef.current!;
        document.body.dataset["modalOpen"] = "1";
        await this.animationsFinished(dialog);
        dialog?.removeAttribute("inert");
        this.props.onOpen?.();
    }

    private onClose = async (event: SyntheticEvent<HTMLDialogElement>) => {
        const { props: { onClose, onDismissed } } = this;
        const { currentTarget: dialog } = event;

        dialog.setAttribute("inert", "");
        await Promise.allSettled(dialog.getAnimations().map(a => a.finished));
        delete document.body.dataset["modalOpen"];

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
        if (event.target === this.dialogRef.current) {
            this.close();
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
        const { caption, icon, children, actions, onDismissed, onOpen, onClick,
            className, immediate, ...other } = this.props;
        const extra = Dialog.closedBySupported
            ? { closedBy: "any", onClick }
            : { onClick: this.onClick };
        return <dialog role="dialog" ref={this.dialogRef} className={`dialog${className ? ` ${className}` : ""}`}
            {...other} {...extra} onClose={this.onClose}>
            <form ref={this.formRef} method="dialog" noValidate onSubmit={this.onSubmit}>
                <Header>{icon && <svg><use href={icon} /></svg>}<h5 className="dialog-title">{caption}</h5></Header>
                <Body>{children}</Body>
                <Actions>{actions ? actions : <>
                    <Button>Cancel</Button>
                    <Button value="ok">OK</Button>
                </>}
                </Actions>
            </form>
        </dialog>
    }
}

function Header({ className, children, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <header className={`dialog-header${className ? ` ${className}` : ""}`} {...other}>
        <button className="btn-close" aria-label="Close" />
        {children}
    </header>
}

function Body({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <article className={`dialog-body${className ? ` ${className}` : ""}`} {...other}></article>
}

function Actions({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
    return <footer className={`dialog-actions${className ? ` ${className}` : ""}`} {...other}></footer>
}

function Button({ className, icon, children, autoFocus, ...other }: DialogButtonProps) {
    const cls = `btn ${className ? ` ${className}` : ""}`;
    const ref = useRef<HTMLButtonElement>(null);
    return <button ref={ref} type="submit" className={cls} {...other}>
        {icon && <svg><use href={icon} /></svg>}{children}
    </button>
}