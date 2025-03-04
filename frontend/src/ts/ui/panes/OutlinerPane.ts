import { PageContext } from "../../PageContext";
import BasicPane from "./BasicPane";

export default class OutlinerPane extends BasicPane {

    public static createUIElement(win: Window, pageContext: PageContext, obj: any): OutlinerPane {
        return super.createUIElement(win, pageContext, obj);
    }

    public static getDomClass() {
        return "outliner-pane"
    }

    public static getName() {
        return "Outliner";
    }
}

export class OutlinerElement extends HTMLElement {

}