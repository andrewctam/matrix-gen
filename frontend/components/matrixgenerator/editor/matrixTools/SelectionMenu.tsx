import React, { useState, useContext } from "react";

import styles from "./SelectionMenu.module.css"

import { generateUniqueName, spliceMatrix, pasteMatrix } from "../../../matrixFunctions";

import TextActionButton from '../../../buttons/TextActionButton'
import Toggle from '../../../buttons/Toggle';
import useExpand from '../../../../hooks/useExpand';
import { BoxSelection, BoxSelectionAction } from "../MatrixEditor";
import { updateMatrix } from "../../../../features/matrices-slice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/hooks";
import { AlertContext } from "../../../App";

interface SelectionMenuProps {
    close: () => void
    showFullInput: boolean
}

const SelectionMenu = (props: SelectionMenuProps) => {
    const {matrices, selection, boxSelection} = useAppSelector((state) => state.matricesData);
    const dispatch = useAppDispatch();

    const [spliceName, setSpliceName] = useState("");
    const [pasteName, setPasteName] = useState("");
    const addAlert = useContext(AlertContext);
    
    const selectionMenu = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const updateName = (parameterName: string, updated: string) => {
        if (/^[A-Za-z_]*$/.test(updated)) // only update if chars are letters or underscores
            switch (parameterName) {
                case "Save Selection as New Matrix: ":
                    setSpliceName(updated);
                    break;
                case "Paste Another Matrix Into Selection: ":
                    setPasteName(updated);
                    break;
                default: break;
            }
    }


    var generatedName = generateUniqueName(matrices);
    
    return <div className={styles.selectionSettingsContainer + " fixed-bottom"} style = {{"bottom": props.showFullInput ? "28px" : "0"}} ref = {selectionMenu}>
        {boxSelection === null ? <div>No boxes selected: drag your mouse to select a submatrix.</div>
            : <div>
                <div>
                    {"Selection Size: " +
                        (Math.abs(boxSelection.start.x - boxSelection.end.x) + 1)
                        + " x " +
                        (Math.abs(boxSelection.start.y - boxSelection.end.y) + 1)}
                </div>

                <div>{"Start: Row " + (boxSelection.start.x + " Column " + boxSelection.start.y)}</div>

                <div>{"End: Row " + (boxSelection.end.x + " Column " + boxSelection.end.y)}</div>

               

                <TextActionButton
                    name={"Save Selection as New Matrix: "}
                    action={() => {
                        if (!boxSelection) return;
                        const spliced = spliceMatrix(matrices[selection],
                            boxSelection.start.x,
                            boxSelection.start.y,
                            boxSelection.end.x,
                            boxSelection.end.y)

                        dispatch(updateMatrix( {"name" : spliceName ? spliceName : generatedName, "matrix" : spliced}));
                    }}

                    updateParameter={updateName}
                    width={"75px"}
                    value={spliceName}
                    placeholder={generatedName}
                />

                <TextActionButton
                    name={"Paste Another Matrix Into Selection: "}
                    action={() => {
                        if (pasteName === "") {
                            addAlert("Please enter a matrix name to paste.", 5000, "error");
                            return;
                        } else if (!(pasteName in matrices)) {
                            addAlert(`Matrix ${pasteName} not found`, 5000, "error");
                            return;
                        }

                        if (!boxSelection) 
                            return;
                        const pasted = pasteMatrix(
                            matrices[selection], //matrix to paste on
                            matrices[pasteName],  //matrix to copy from
                            boxSelection.start.x,
                            boxSelection.start.y,
                            boxSelection.end.x,
                            boxSelection.end.y)

                        if (pasted)
                            dispatch(updateMatrix( {"name" : selection, "matrix" : pasted}));
                        else
                            addAlert("Error: Selection dimensions and pasted matrix dimensions must match.", 5000, "error");

                    }}

                    updateParameter={updateName}
                    width={"75px"}
                    value={pasteName}
                /> <br />

            </div>}

        <Toggle toggle={props.close} show={false} />

    </div>

}

export default SelectionMenu;