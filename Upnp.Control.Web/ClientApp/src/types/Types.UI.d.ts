declare namespace UI {
    type Theme = "light" | "dark" | "auto";

    type ThemeColors = "primary" | "secondary" | "tertiary" | "error"

    interface CategoryRouteParams { category: DeviceCategory }

    interface DeviceRouteParams extends CategoryRouteParams { device: string }

    interface ViewRouteParams extends DeviceRouteParams { id: string }

    interface BrowseRouteParams extends DeviceRouteParams { id?: string, p?: string, s?: string }

    interface PlaylistRouteParams extends DeviceRouteParams { id: string, p?: string, s?: string }
}