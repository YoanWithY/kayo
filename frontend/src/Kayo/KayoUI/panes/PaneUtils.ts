import { DropDownItem } from "../../../UI-Lib/Components/DropDown/DropDownItem";
import { SelectBox } from "../../../UI-Lib/Components/SelectBox/SelectBox";
import { SplitablePane } from "../../../UI-Lib/SplitPane/SplitablePane/SplitablePane";
import { WindowUIBuilder } from "../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../KayoAPI/KayoAPI";

export function createPaneSelectBox(windowUIBuilder: WindowUIBuilder<KayoAPI>, pane: SplitablePane<KayoAPI>, text: string) {
    const selectBox = windowUIBuilder.build<SelectBox<KayoAPI, any>>({ domClassName: "select-box", displayText: text });
    if (!selectBox)
        return undefined;

    for (const entry of windowUIBuilder.IOAPI.ui.paneTypes) {
        const dropDownItemConfig = { domClassName: "drop-down-item", dropDown: selectBox.dropDown, displayText: entry.displayText };
        const dropDownItem = windowUIBuilder.build<DropDownItem<KayoAPI>>(dropDownItemConfig);
        if (!dropDownItem) {
            console.error("Could not create DropDownItem from", dropDownItemConfig);
            continue;
        }
        dropDownItem.onAction = () => {
            pane.setContent(windowUIBuilder, { domClassName: entry.domClassName });
        };
        selectBox.dropDown.addDropDownItem(dropDownItem);
    }

    return selectBox;
}