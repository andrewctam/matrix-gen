import React, {useEffect, useState, useRef} from "react";
import TextActionButton from "./TextActionButton";
import styles from "./SelectionMenu.module.css"


import {generateUniqueName, spliceMatrix, pasteMatrix} from "../../matrixFunctions";
import Toggle from "../../navigation/Toggle";
import useExpand from "./useExpand";

const SelectionMenu = (props) => {
    const [spliceName, setSpliceName] = useState("");
    const [pasteName, setPasteName] = useState("");

    const selectionMenu = useExpand(props.optionsBarRef);


    const updateName = (parameterName, updated) => {
        if (/^[A-Za-z_]*$/.test(updated)) // only update if chars are letters or underscores
            switch(parameterName) {
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
        props.setMatrix(props.name, editSelection(props.matrix, 
                                    e.target.value,
                                    props.boxesSelected["startX"], 
                                    props.boxesSelected["startY"], 
                                    props.boxesSelected["endX"], 
                                    props.boxesSelected["endY"]));
    

        e.target.value = "";
    }

    const handleKeyDown = (e) => {
        props.setMatrix(props.name, 
            editSelection(props.matrix, 
            8,
            props.boxesSelected["startX"], 
            props.boxesSelected["startY"], 
            props.boxesSelected["endX"], 
            props.boxesSelected["endY"]));
    }



    var generatedName = generateUniqueName(props.matrices);

    return <div ref = {selectionMenu} className = {styles.selectionSettingsContainer + " fixed-bottom" }>
        {props.boxesSelected["quadrant"] === -1 ? <div>No boxes selected: drag your mouse to select a submatrix.</div>
        : <div>
            <div>
                {"Selection Size: " + 
                (Math.abs(props.boxesSelected["startX"] - props.boxesSelected["endX"]) + 1)
                + " x " + 
                (Math.abs(props.boxesSelected["startY"] - props.boxesSelected["endY"]) + 1)} 
            </div>

            <div>{"Start: Row " + (props.boxesSelected["startX"] + " Column " + props.boxesSelected["startY"])}</div> 

            <div>{"End: Row " + (props.boxesSelected["endX"] + " Column " + props.boxesSelected["endY"])}</div>

            <input className = {styles.editSelectedInput}
                onChange = {handleChange} 
                onKeyDown = {handleKeyDown}
                placeholder="Type Here to Edit All Selected Boxes"/> <br />


            <TextActionButton 
                name = {"Save Selection as New Matrix: "}
                action = {() => {props.setMatrix(spliceName ? spliceName : generatedName, spliceMatrix(props.matrix, 
                                                                props.boxesSelected["startX"], 
                                                                props.boxesSelected["startY"], 
                                                                props.boxesSelected["endX"], 
                                                                props.boxesSelected["endY"],
                                                                spliceName))}
                }
                
                updateParameter = {updateName}
                width = {"75px"}
                value = {spliceName}
                placeholder = {generatedName}
            /> 

            <TextActionButton 
                name = {"Paste Another Matrix Into Selection: "}
                action = {() => {
                    const pasted = pasteMatrix(
                        props.matrices[props.name], //matrix to paste on
                        props.matrices[pasteName],  //matrix to copy from
                        props.boxesSelected["startX"], 
                        props.boxesSelected["startY"], 
                        props.boxesSelected["endX"], 
                        props.boxesSelected["endY"])

                    if (pasted)
                        props.setMatrix(props.name, pasted)
                }}
                    
                updateParameter = {updateName}
                width = {"75px"}
                value = {pasteName}
            /> <br />

        </div> }

        <Toggle toggle = {props.close} show = {!props.active}/>
        
    </div>
           
}

export default SelectionMenu;