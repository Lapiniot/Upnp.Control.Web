import { createPopper, Instance, OptionsGeneric, StrictModifiers } from "@popperjs/core/lib/popper";

export abstract class PopupPlacementStrategy {
    public abstract update(popup: HTMLElement, anchor: HTMLElement): Promise<void> | void;
    public abstract toggle(visibility: boolean): Promise<void> | void;
    public abstract destroy(): void;
}

export class PopperStrategy extends PopupPlacementStrategy {
    private static defaults: Partial<OptionsGeneric<StrictModifiers>> = {
        placement: "auto",
        modifiers: [{ name: "offset", options: { offset: [0, 5] } }]
    }

    private instance: Instance | null = null;

    constructor(public options: Partial<OptionsGeneric<StrictModifiers>> = {}) {
        super();
        options = { ...PopperStrategy.defaults, ...options };
    }

    public override async update(popup: HTMLElement, anchor: HTMLElement): Promise<void> {
        if (this.instance?.state.elements.popper !== popup || this.instance.state.elements.reference !== anchor) {
            this.instance?.destroy();
            this.instance = createPopper(anchor, popup, this.options);
        } else {
            await this.instance.setOptions(this.options);
        }
    }

    public override async toggle(visibility: boolean) {
        await this.instance?.setOptions((options) => ({
            ...options,
            modifiers: [...options.modifiers!.filter(m => m.name !== "eventListeners"), { name: "eventListeners", enabled: visibility }]
        }));
    }

    public override destroy(): void {
        this.instance?.destroy();
    }
}

export class FixedStrategy extends PopupPlacementStrategy {
    public override update() {
    }

    public override destroy() {
    }

    public override toggle() {
    }
}