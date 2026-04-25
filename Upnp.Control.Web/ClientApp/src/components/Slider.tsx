import { useDebounce } from "@hooks/Debounce";
import { useValueTracking } from "@hooks/ValueTracking";
import { clamp } from "@services/Extensions";
import { SlideGestureRecognizer, type SlideParams } from "@services/gestures/SlideGestureRecognizer";
import { type CSSProperties, type HTMLProps, type KeyboardEvent, type Ref, useCallback, useEffect, useRef, useState } from "react";

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
    const { className, value: initialValue = 0, reportMode, style = {}, onChange,
        readOnly, step = 0.05, ref: externalRef, ...other } = props;
    const [value, setValue] = useState(initialValue);
    const [updatePending, setUpdatePending] = useState(false);
    const initialValueChanged = useValueTracking(initialValue);
    const pendingValueRef = useRef(value);
    const onChangeDebounced = useDebounce(onChange, 200);

    if (initialValueChanged) {
        setValue(initialValue);
    }

    useEffect(() => {
        if (updatePending && onChange) {
            return () => {
                onChange(pendingValueRef.current);
            }
        }
    }, [updatePending, onChange]);

    useEffect(() => {
        pendingValueRef.current = value;
        if (reportMode === "immediate" && onChangeDebounced) {
            onChangeDebounced(value);
        }
    }, [value, reportMode, onChangeDebounced]);

    const keyboardHandler = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowLeft": {
                e.preventDefault();
                if (e.type === "keydown") {
                    setUpdatePending(true);
                    setValue(current => clamp(0.0, current - step, 1.0));
                } else {
                    setUpdatePending(false)
                }

                break;
            }
            case "ArrowRight": {
                e.preventDefault();
                if (e.type === "keydown") {
                    setUpdatePending(true);
                    setValue(current => clamp(0.0, current + step, 1.0))
                } else {
                    setUpdatePending(false);
                }

                break;
            }
        }
    }, [step]);

    const refCallback = useCallback((element: HTMLDivElement) => {
        const cleanup = setExternalRef(externalRef, element);

        if (readOnly) {
            return cleanup;
        }

        let rect: DOMRect;
        const recognizer = new SlideGestureRecognizer((_, __, { phase, x }: SlideParams) => {
            if (phase === "start") {
                rect = element.getBoundingClientRect();
                setUpdatePending(true);
            }

            const value = clamp(0.0, ((x - rect.x) / rect.width), 1.0);
            setValue(value);

            if (phase === "end") {
                setUpdatePending(false);
            }
        });

        recognizer.bind(element);
        return () => {
            cleanup?.();
            recognizer.unbind();
        };
    }, [readOnly, externalRef]);

    return <div tabIndex={0} {...other} role="slider" ref={refCallback} data-value={value}
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

function setExternalRef<T>(ref: Ref<T> | undefined, element: T) {
    if (ref) {
        if (typeof ref === "function") {
            return ref(element);
        } else {
            ref.current = element;
            return () => {
                ref.current = null;
            }
        }
    }
}