import React, { useEffect, useState, useRef } from "react";
import TextActionButton from "./TextActionButton";
import styles from "./SelectionMenu.module.css"


import { generateUniqueName, spliceMatrix, pasteMatrix, editSelection } from "../../matrixFunctions";
import Toggle from "../../navigation/Toggle";
import useExpand from "./useExpand";

const SelectionMenu = (props) => {
    const [spliceName, setSpliceName] = useState("");
    const [pasteName, setPasteName] = useState("");

    const selectionMenu = useExpand(props.optionsBarRef);


    const updateName = (parameterName, updated) => {
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

    const handleChange = (e) => {
        props.updateMatrix(props.name, editSelection(props.matrix,
            e.target.value,
            props.boxSelectionStart["x"],
            props.boxSelectionStart["y"],
            props.boxSelectionEnd["x"],
            props.boxSelectionEnd["y"]));

        e.target.value = "";
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 8)
            props.updateMatrix(props.name, editSelection(props.matrix,
                8,
                props.boxSelectionStart["x"],
                props.boxSelectionStart["y"],
                props.boxSelectionEnd["x"],
                props.boxSelectionEnd["y"]));
    }



    var generatedName = generateUniqueName(props.matrices);
    const noBoxesSelected = props.boxSelectionStart["x"] === -1 &&
                            props.boxSelectionStart["y"] === -1 && 
                            props.boxSelectionEnd["x"] === -1 && 
                            props.boxSelectionEnd["y"] === -1;
    return <div ref={selectionMenu} className={styles.selectionSettingsContainer + " fixed-bottom"}>
        {noBoxesSelected ? <div>No boxes selected: drag your mouse to select a submatrix.</div>
            : <div>
                <div>
                    {"Selection Size: " +
                        (Math.abs(props.boxSelectionStart["x"] - props.boxSelectionEnd["x"]) + 1)
                        + " x " +
                        (Math.abs(props.boxSelectionStart["y"] - props.boxSelectionEnd["y"]) + 1)}
                </div>

                <div>{"Start: Row " + (props.boxSelectionStart["x"] + " Column " + props.boxSelectionStart["y"])}</div>

                <div>{"End: Row " + (props.boxSelectionEnd["x"] + " Column " + props.boxSelectionEnd["y"])}</div>

                <input className={styles.editSelectedInput}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type Here to Edit All Selected Boxes" /> <br />


                <TextActionButton
                    name={"Save Selection as New Matrix: "}
                    action={() => {
                        props.updateMatrix(spliceName ? spliceName : generatedName, spliceMatrix(props.matrix,
                            props.boxSelectionStart["x"],
                            props.boxSelectionStart["y"],
                            props.boxSelectionEnd["x"],
                            props.boxSelectionEnd["y"],
                            spliceName))
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
                            alert("Please enter a matrix name to paste.");
                            return;
                        } else if (!(pasteName in props.matrices)) {
                            alert("Matrix not found");
                            return;
                        }
                        const pasted = pasteMatrix(
                            props.matrices[props.name], //matrix to paste on
                            props.matrices[pasteName],  //matrix to copy from
                            props.boxSelectionStart["x"],
                            props.boxSelectionStart["y"],
                            props.boxSelectionEnd["x"],
                            props.boxSelectionEnd["y"])

                        if (pasted)
                            props.updateMatrix(props.name, pasted)
                    }}

                    updateParameter={updateName}
                    width={"75px"}
                    value={pasteName}
                /> <br />

            </div>}

        <Toggle toggle={props.close} show={!props.active} />

    </div>

}

export default SelectionMenu;