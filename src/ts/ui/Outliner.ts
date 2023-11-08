import Scene from "../project/Scene";

export default class OutlinerPane extends HTMLElement {
    scene!: Scene;
    ul!: HTMLUListElement;

    static createOutlinerPane(data: { scene: Scene }) {
        const p = document.createElement("outliner-pane") as OutlinerPane;
        p.scene = data.scene;
        const ul = document.createElement("ul");
        ul.setAttribute("class", "outliner-ul");
        p.appendChild(ul);

        return p;
    }
}

export class OutlinerElement extends HTMLElement {

}