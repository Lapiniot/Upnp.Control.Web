import { CSSProperties, HTMLProps, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSlideGesture } from "../hooks/Gestures";
import { SlideParams } from "../services/gestures/SlideGestureRecognizer";
import { useDebounce } from "../hooks/Debounce";
import { clamp } from "../services/Extensions";

type SliderChangeHandler = (position: number) => boolean | void;

type SpaceToggleValue = "initial" | " ";

type CustomProps = {
    "update-pending"?: SpaceToggleValue,
    "animation-running"?: SpaceToggleValue,
    "animation-name"?: string,
    "animation-duration"?: string
}

interface SliderProps extends Omit<HTMLProps<HTMLDivElement>, "value" | "onChange" | "style"> {
    value?: number;
    reportMode?: "immediate" | "release";
    step?: number;
    onChange?: SliderChangeHandler;
    style?: CSSProperties & { [K in keyof CustomProps as `--bs-slider-${K}`]: CustomProps[K] };
}

export default function Slider(props: SliderProps) {
    const { className, value: initial = 0, reportMode, style = {}, onChange, readOnly, step = 0.05, ...other } = props;
    const [value, setValue] = useState(initial);
    const [updatePending, setUpdatePending] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const crRef = useRef<DOMRect>(null);
    const valueRef = useRef(value);
    const onChangeDebounced = useDebounce(onChange, 200);

    useEffect(() => setValue(initial), [initial]);

    useEffect(() => {
        if (updatePending && onChange) {
            return () => { onChange(valueRef.current); }
        }
    }, [updatePending, onChange]);

    useEffect(() => {
        valueRef.current = value;
        if (reportMode === "immediate" && onChangeDebounced) {
            onChangeDebounced(value);
        }
    }, [value, reportMode, onChangeDebounced]);

    const slideGestureCallback = useCallback((_target: unknown, _gesture: unknown, { phase, x }: SlideParams) => {
        if (readOnly) return;
        const element = elementRef.current!;

        if (phase === "start") {
            crRef.current = element.getBoundingClientRect();
            setUpdatePending(true);
        }

        const cr = crRef.current!;
        const value = clamp(0.0, ((x - cr.x) / cr.width), 1.0);
        setValue(value);

        if (phase === "end") {
            setUpdatePending(false);
        }
    }, [readOnly]);

    const keyboardHandler = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowLeft": {
                e.preventDefault();
                if (e.type === "keydown") {
                    setValue(current => clamp(0.0, current - step, 1.0));
                    setUpdatePending(true);
                } else {
                    setUpdatePending(false)
                }
                break;
            }
            case "ArrowRight": {
                e.preventDefault();
                if (e.type === "keydown") {
                    setValue(current => clamp(0.0, current + step, 1.0))
                    setUpdatePending(true);
                } else {
                    setUpdatePending(false);
                }
                break;
            }
        }
    }, [step]);

    useSlideGesture(elementRef, slideGestureCallback);

    return <div tabIndex={0} {...other} role="slider" ref={elementRef} data-value={value}
        onKeyDown={keyboardHandler} onKeyUp={keyboardHandler}
        className={`slider${className ? ` ${className}` : ""}`}
        style={{
            ...style,
            "--bs-slider-value": value,
            "--bs-slider-update-pending": updatePending ? "initial" : " "
        } as CSSProperties}>
        <div className="slider-track" />
        <div className="slider-thumb" />
    </div>
}