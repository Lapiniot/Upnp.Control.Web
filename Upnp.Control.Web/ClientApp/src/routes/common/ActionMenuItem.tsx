import { MenuItem } from "@components/Menu";

export default function renderActionMenuItem(id: string, action: string, name: string) {
    return <MenuItem key={`${action}.${id}`} action={`${action}.${id}`} data-udn={id}>&laquo;{name}&raquo;</MenuItem>;
}