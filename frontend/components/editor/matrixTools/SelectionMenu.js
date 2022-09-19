import React, {useState} from "react";
import TextActionButton from "./TextActionButton";
import styles from "./SelectionMenu.module.css"

function SelectionMenu(props) {
    const [spliceName, setSpliceName] = useState("");
    const [pasteName, setPasteName] = useState("");

    function updateName(parameterName, updated) {
        if (/^[A-Za-z_]*$/.test(updated))
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
    
    function handleChange(e) {
        props.editSelection(props.name, 
                            e.target.value,
                            props.boxesSelected["startX"], 
                            props.boxesSelected["startY"], 
                            props.boxesSelected["endX"], 
                            props.boxesSelected["endY"]);

        e.target.value = "";
    }

    function handleKeyDown(e) {
        if (e.keyCode === 8) {
            props.editSelection(props.name, 
                8,
                props.boxesSelected["startX"], 
                props.boxesSelected["startY"], 
                props.boxesSelected["endX"], 
                props.boxesSelected["endY"],
                );
        }
    }



    var generatedName = props.generateUniqueName();

    return <div className = {styles.selectionSettingsContainer}>
        {props.boxesSelected["quadrant"] === -1 ? <div>No Boxes Selected</div>
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
                action = {() => {props.spliceMatrix(props.name, 
                                                    props.boxesSelected["startX"], 
                                                    props.boxesSelected["startY"], 
                                                    props.boxesSelected["endX"], 
                                                    props.boxesSelected["endY"],
                                                    spliceName)}
                }
                
                updateParameter = {updateName}
                width = {"75px"}
                value = {spliceName}
                placeholder = {generatedName}
            /> 

            <TextActionButton 
                name = {"Paste Another Matrix Into Selection: "}
                action = {() => {props.pasteMatrix(props.name, pasteName, 
                    props.boxesSelected["startX"], 
                    props.boxesSelected["startY"], 
                    props.boxesSelected["endX"], 
                    props.boxesSelected["endY"])}
                }
                    
                updateParameter = {updateName}
                width = {"75px"}
                value = {pasteName}
            /> <br />

        </div> }
        
    </div>
           
}

export default SelectionMenu;