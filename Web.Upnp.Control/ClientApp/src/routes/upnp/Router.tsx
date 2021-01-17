import { RouteComponentProps } from "react-router";
import DeviceRouter from "../common/DeviceRouter";

export default (props: RouteComponentProps<{ category: string }>) => <DeviceRouter {...props} />