import React, { createRef, HTMLProps, KeyboardEvent } from "react";
import { ProgressCSSProperties, ProgressProps } from "./Progress";

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getOffsetX(element: HTMLElement, clientX: number): number {
    return clientX - element.getBoundingClientRect().x;
}

export type SliderChangeHandler = (position: number) => any;

type SliderProps = Omit<HTMLProps<HTMLDivElement>, "onChange">
    & Omit<ProgressProps, "infinite">
    & {
        onChangeRequested?: SliderChangeHandler;
        onChange?: SliderChangeHandler;
        reportMode?: "immediate" | "release";
        step?: number;
    }

export default class Slider extends React.Component<SliderProps> {

    ref = createRef<HTMLDivElement>();
    updatePending: boolean = false;
    offset: number = 0;
    released: boolean | undefined;

    static defaultProps: Partial<SliderProps> = { reportMode: "release", value: 0, step: 0.05 };

    componentDidMount() {
        this.ref.current?.addEventListener("pointerdown", this.pointerDownHandler, true);
    }

    componentWillUnmount() {
        const element = this.ref.current;
        if (element) {
            element.removeEventListener("pointerdown", this.pointerDownHandler, true);
            element.removeEventListener("pointermove", this.pointerMoveHandler, true);
            element.removeEventListener("pointerup", this.pointerUpHandler, true);
        }
    }

    private pointerDownHandler = (event: PointerEvent) => {
        const { currentTarget, clientX, pointerId } = event;
        const element = currentTarget as HTMLElement;
        if (this.props.readOnly) return;
        event.preventDefault();
        element.setPointerCapture(pointerId);
        element.addEventListener("pointermove", this.pointerMoveHandler, true);
        element.addEventListener("pointerup", this.pointerUpHandler, true);
        window.requestAnimationFrame(() => {
            // Disable potentially running animation of slider progress 
            // which could interfere with manipulation
            element.style.setProperty("--slider-animation-duration", "0");
            element.style.setProperty("--slider-animation-name", "none");
        });
        // we cannot rely on event.offsetX value here before entering pointer capture mode, 
        // because it relates to the event.target!!! element and not to the event.currentTarget element,
        // these might be different at this phase
        this.scheduleUpdate(getOffsetX(element, clientX), false);
    }

    private pointerUpHandler = (event: PointerEvent) => {
        const { currentTarget, clientX, offsetX, pointerId } = event;
        const element = currentTarget as HTMLElement;
        event.preventDefault();
        element.releasePointerCapture(pointerId);
        element.removeEventListener("pointermove", this.pointerMoveHandler, true);
        element.removeEventListener("pointerup", this.pointerUpHandler, true);
        this.scheduleUpdate(offsetX ?? getOffsetX(element, clientX), true);
    }

    private pointerMoveHandler = (event: PointerEvent) => {
        const { currentTarget, clientX, offsetX } = event;
        const element = currentTarget as HTMLElement;
        event.preventDefault();
        this.scheduleUpdate(offsetX ?? getOffsetX(element, clientX));
    }

    private keyUpHandler = (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowLeft": break;
            case "ArrowRight": break;
        }
    }

    private scheduleUpdate = (offset: number, released?: boolean) => {
        this.offset = offset;
        this.released = released;

        if (this.updatePending)
            return;
        this.updatePending = true;

        window.requestAnimationFrame(this.update);
    }

    private update = () => {
        if (!this.updatePending) return;
        try {
            const element = this.ref.current;
            if (element) {
                const { onChange, onChangeRequested, reportMode, value = 0 } = this.props;
                const progress = clamp(this.offset / element.offsetWidth, 0.0, 1.0);

                // update UI state automaticaly without React's component state update only when
                // user provided onChangeRequested callback (if provided) returns value other than False 
                // (this basically means that user takes responsibility for state update 
                // and prevents our default behavior)
                if (onChangeRequested?.(progress) !== false) {
                    element.style.setProperty("--slider-progress", progress.toString());
                }

                // If provided onChange handler returns boolean value False, this means user
                // rejects proposed value, so reset UI state back to original props.value
                if ((reportMode === "immediate" || this.released)) {
                    const result = onChange?.(progress);
                    if (result === false) {
                        element.style.setProperty("--slider-progress", value.toString());
                    }
                }
            }
        } finally {
            this.updatePending = false;
        }
    }

    render() {
        const { className, value, reportMode: updateMode, style = {}, onChange, onChangeRequested, readOnly, ...other } = this.props;

        return <div tabIndex={0} {...other} role="button" ref={this.ref} className={`slider${className ? ` ${className}` : ""}`}
            style={{ ...style, "--slider-progress": value } as ProgressCSSProperties} onKeyUp={this.keyUpHandler}>
            <div className="slider-track"  >
                <div className="slider-indicator" />
                <div className="slider-thumb-overlay">
                    <div className="slider-thumb" />
                </div>
            </div>
        </div>;
    }
}