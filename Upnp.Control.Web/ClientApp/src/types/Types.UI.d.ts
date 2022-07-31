declare namespace UI {
    type ThemeColors = "primary" | "secondary" | "success" | "info" | "warning" | "danger" | "light" | "dark"

    interface CategoryRouteParams { category: DeviceCategory }

    interface DeviceRouteParams extends CategoryRouteParams { device: string }

    interface ViewRouteParams extends DeviceRouteParams { id: string }

    interface BrowseRouteParams extends DeviceRouteParams { id?: string, p?: string, s?: string }

    interface PlaylistRouteParams extends DeviceRouteParams { id: string, p?: string, s?: string }
}