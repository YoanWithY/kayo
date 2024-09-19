export default class OutlinerPane extends HTMLElement {

    static createOutlinerPane() {
        const p = document.createElement("outliner-pane") as OutlinerPane;
        return p;
    }
}

export class OutlinerElement extends HTMLElement {

}