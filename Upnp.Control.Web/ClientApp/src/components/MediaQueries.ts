export class MediaQueries {
    private static largeScreenQuery: MediaQueryList;
    private static pointerDeviceQuery: MediaQueryList;
    private static touchDeviceQuery: MediaQueryList;

    static screenWidth(minWidth: string): MediaQueryList {
        return matchMedia(`(min-width: ${minWidth})`);
    }

    static screenHeight(minHeight: string): MediaQueryList {
        return matchMedia(`(min-height: ${minHeight})`);
    }

    static get largeScreen() {
        return MediaQueries.largeScreenQuery ?? (MediaQueries.largeScreenQuery = MediaQueries.screenWidth("1024px"));
    }

    static get pointerDevice(): MediaQueryList {
        return MediaQueries.pointerDeviceQuery ?? (MediaQueries.pointerDeviceQuery = matchMedia("(hover: hover) and (pointer: fine)"));
    }

    static get touchDevice(): MediaQueryList {
        return MediaQueries.touchDeviceQuery ?? (MediaQueries.touchDeviceQuery = matchMedia("(any-pointer: coarse)"));
    }
}