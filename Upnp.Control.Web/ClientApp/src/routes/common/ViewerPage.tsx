import { useParams } from "react-router-dom";
import { MediaViewer, withViewerDataFetch } from "./MediaViewer";
import { ViewRouteParams } from "./Types";

const Viewer = withViewerDataFetch(MediaViewer);

export default function () {
    const params = useParams() as ViewRouteParams;
    return <Viewer {...params} />;
}