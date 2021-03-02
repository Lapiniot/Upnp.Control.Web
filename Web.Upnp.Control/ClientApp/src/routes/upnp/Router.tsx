import { RouteComponentProps } from "react-router";
import DeviceRouter from "../common/DeviceRouter";
import { CategoryRouteParams } from "../common/Types";

export default (props: RouteComponentProps<CategoryRouteParams>) => <DeviceRouter {...props} />