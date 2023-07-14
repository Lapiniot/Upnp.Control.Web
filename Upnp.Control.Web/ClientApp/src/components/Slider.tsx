import React, { HTMLProps, KeyboardEvent } from "react";
import { SlideGestureRecognizer, SlideParams } from "./gestures/SlideGestureRecognizer";
import { ProgressCSSProperties, ProgressProps } from "./Progress";

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
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
    updatePending: boolean = false;
    slideGestureRecognizer: SlideGestureRecognizer<HTMLDivElement>;
    static defaultProps: Partial<SliderProps> = { reportMode: "release", value: 0, step: 0.01 };
    increment: number = 0;
    element: HTMLDivElement | null = null;

    constructor(props: SliderProps | Readonly<SliderProps>) {
        super(props);
        this.slideGestureRecognizer = new SlideGestureRecognizer(this.slideGestureHandler);
    }

    get progress() {
        const value = this.element?.style.getPropertyValue("--slider-progress");
        return value ? parseFloat(value) : 0.0;
    }

    set progress(value: number) {
        this.element?.style.setProperty("--slider-progress", value.toString());
    }

    private refCallback = (element: HTMLDivElement) => {
        if (element) {
            this.element = element;
            this.slideGestureRecognizer.bind(element);
        } else {
            this.element = null;
            this.slideGestureRecognizer.unbind();
        }
    }

    private slideGestureHandler = (target: HTMLDivElement, _: "slide", { phase, x }: SlideParams) => {
        if (this.props.readOnly) return;

        if (phase === "start") {
            // Disable potentially running animation of slider progress 
            // which could interfere with manipulation
            target.style.setProperty("--slider-animation-duration", "0");
            target.style.setProperty("--slider-animation-name", "none");
            target.dataset.manipulated = "1";
        } else if (phase === "end") {
            target.dataset.manipulated = undefined;
        }

        this.tryUpdateProgress(clamp(x / target.offsetWidth, 0.0, 1.0), phase === "end");
    }

    private keyUpHandler = (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                this.increment = -(this.props.step ?? 0.05);
                this.scheduleUpdate();
                break;
            case "ArrowRight":
                e.preventDefault();
                this.increment = this.props.step ?? 0.05;
                this.scheduleUpdate();
                break;
        }
    }

    private scheduleUpdate = () => {
        if (this.updatePending)
            return;
        this.updatePending = true;

        requestAnimationFrame(this.update);
    }

    private update = () => {
        if (!this.updatePending) return;
        try {
            this.tryUpdateProgress(clamp(this.progress + this.increment, 0.0, 1.0), true);
        } finally {
            this.increment = 0;
            this.updatePending = false;
        }
    }

    private tryUpdateProgress(progress: number, released: boolean) {
        const { onChange, onChangeRequested, reportMode, value: propsValue = 0 } = this.props;

        // update UI state automaticaly without React's component state update only when
        // user provided onChangeRequested callback (if provided) returns value other than False 
        // (this basically means that user takes responsibility for state update 
        // and prevents our default behavior)
        if (onChangeRequested?.(progress) !== false) {
            this.progress = progress;
        }

        // If provided onChange handler returns boolean value False, this means user
        // rejects proposed value, so reset UI state back to original props.value
        if ((reportMode === "immediate" || released)) {
            const result = onChange?.(progress);
            if (result === false) {
                this.progress = propsValue;
            }
        }
    }

    render() {
        const { className, value, reportMode: updateMode, style = {}, onChange, onChangeRequested, readOnly, ...other } = this.props;

        return <div tabIndex={0} {...other} role="button" ref={this.refCallback} className={`slider${className ? ` ${className}` : ""}`}
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