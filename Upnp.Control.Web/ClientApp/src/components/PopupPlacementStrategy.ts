import { createPopper, Instance, OptionsGeneric, StrictModifiers } from "@popperjs/core/lib/popper";

export abstract class PopupPlacementStrategy {
    public abstract update(popup: HTMLElement, anchor: HTMLElement, options?: Partial<OptionsGeneric<StrictModifiers>>): Promise<void> | void;
    public abstract toggle(visibility: boolean): Promise<void> | void;
    public abstract destroy(): void;
}

export class PopperStrategy extends PopupPlacementStrategy {
    instance: Instance | null = null;

    public override async update(popup: HTMLElement, anchor: HTMLElement, options: Partial<OptionsGeneric<StrictModifiers>>): Promise<void> {
        if (this.instance?.state.elements.popper !== popup || this.instance.state.elements.reference !== anchor) {
            this.instance?.destroy();
            this.instance = createPopper<StrictModifiers>(anchor, popup, options);
        } else {
            await this.instance.setOptions(options);
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