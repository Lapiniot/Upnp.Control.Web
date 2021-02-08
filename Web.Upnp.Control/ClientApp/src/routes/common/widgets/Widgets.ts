import React from "react";
import { ComponentType, ReactNode } from "react";
import DeviceBookmark from "./DeviceBookmark";

const widgets: { [key: string]: ComponentType<any> } = {}

export class Widgets {
    static register(key: string, component: ComponentType<any>) {
        widgets[key] = component;
    }

    static get(key: string): ComponentType {
        return widgets[key];
    }

    static createElement(key: string, props: any): ReactNode {
        return React.createElement(Widgets.get(key), props);
    }
}

Widgets.register("DeviceBookmarkWidget", DeviceBookmark);