import { type ThemeStorage } from "@components/ThemeProvider";
import settings from "@settings";
import { ExternalStoreBase } from "@services/ExternalStoreBase";

export default class SettingsThemeStorage extends ExternalStoreBase<UI.Theme> implements ThemeStorage {
    private static instance: SettingsThemeStorage;

    private constructor() {
        super();
        window.addEventListener("storage", this.storageEventListener);
    }

    private storageEventListener = ({ key }: StorageEvent) => {
        if (key === "global:theme") {
            this.notifyUpdated();
        }
    }

    public static getInstance() {
        if (!SettingsThemeStorage.instance) {
            SettingsThemeStorage.instance = new SettingsThemeStorage();
        }

        return SettingsThemeStorage.instance;
    }

    get = (): UI.Theme => settings.get("theme");

    set = (theme: UI.Theme): void => {
        settings.set("theme", theme);
        this.notifyUpdated();
    }

    getSnapshot = () => this.get();
}