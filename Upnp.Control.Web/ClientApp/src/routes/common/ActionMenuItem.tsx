import Menu from "@components/Menu";

export default function renderActionMenuItem(id: string, action: string, name: string) {
    return <Menu.Item key={`${action}.${id}`} action={`${action}.${id}`} data-udn={id}>&laquo;{name}&raquo;</Menu.Item>;
}