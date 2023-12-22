export class MediaQueries {
    private static largeScreenQuery: MediaQueryList;
    private static smallScreenQuery: MediaQueryList;
    private static pointerDeviceQuery: MediaQueryList;
    private static touchDeviceQuery: MediaQueryList;
    private static prefersDarkSchemeQuery: MediaQueryList;

    static minWidth(width: string) {
        return matchMedia(`(min-width: ${width})`);
    }

    static minHeight(height: string) {
        return matchMedia(`(min-height: ${height})`);
    }

    static maxWidth(width: string) {
        return matchMedia(`(max-width: ${width})`);
    }

    static maxHeight(height: string) {
        return matchMedia(`(max-height: ${height})`);
    }

    static prefersColorScheme(scheme: "light" | "dark") {
        return matchMedia(`(prefers-color-scheme: ${scheme})`);
    }

    static get largeScreen() {
        return MediaQueries.largeScreenQuery ?? (MediaQueries.largeScreenQuery = MediaQueries.minWidth("1024px"));
    }

    static get smallScreen() {
        return MediaQueries.smallScreenQuery ?? (MediaQueries.smallScreenQuery = MediaQueries.maxWidth("575.98px"));
    }

    static get pointerDevice() {
        return MediaQueries.pointerDeviceQuery ?? (MediaQueries.pointerDeviceQuery = matchMedia("(hover: hover) and (pointer: fine)"));
    }

    static get touchDevice() {
        return MediaQueries.touchDeviceQuery ?? (MediaQueries.touchDeviceQuery = matchMedia("(any-pointer: coarse)"));
    }

    static get prefersDarkScheme() {
        return MediaQueries.prefersDarkSchemeQuery ?? (MediaQueries.prefersDarkSchemeQuery = matchMedia("(prefers-color-scheme: dark)"));
    }
}