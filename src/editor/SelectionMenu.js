import React, {useState} from "react";
import "./SelectionMenu.css"

function SelectionMenu(props) {
    const [spliceName, setSpliceName] = useState("");
    const [pasteName, setPasteName] = useState("");

    function updateName(e) {
        var updated = e.target.value;

        if (/^[A-Za-z_]*$/.test(updated))
            switch(e.target.id) {
                case "splice":
                    setSpliceName(updated);
                    break;
                case "paste":
                    setPasteName(updated);
                    break;
                default: break;
            }
    }

    var name = props.generateUniqueName();

    return <div className = "selectionSettings fixed-bottom">
            <div>
                {"Selection Size: " + 
                (Math.abs(props.boxesSelected["startX"] - props.boxesSelected["endX"]) + 1)
                + " x " + 
                (Math.abs(props.boxesSelected["startY"] - props.boxesSelected["endY"]) + 1)} 
            </div>

            <div>
                {"Start: Row " + 
                (props.boxesSelected["startX"] + " Column " + props.boxesSelected["startY"])}
            
            </div>

            <div>
                {"End: Row " + 
                (props.boxesSelected["endX"] + " Column " + props.boxesSelected["endY"])}
            
            </div>


            <div className = "buttonTextInput selectionButton">

                <button 
                    className = {"btn matrixButtons btn-primary"} 
                    onClick = {() => {
                        props.spliceMatrix(props.name, 
                                            props.boxesSelected["startX"], 
                                            props.boxesSelected["startY"], 
                                            props.boxesSelected["endX"], 
                                            props.boxesSelected["endY"],
                                            spliceName)}}> 
                    {"Save Selection as New Matrix: "}
                </button> 
                
                
                <input 
                    id = "splice"
                    onChange = {updateName}
                    value = {spliceName}
                    placeholder = {name} />
                
            </div>
                <br />

            <div className = "buttonTextInput selectionButton">
                <button 
                    className = {"btn matrixButtons btn-primary"} 
                    onClick = {() => {
                        props.pasteMatrix(props.name, pasteName, 
                                        props.boxesSelected["startX"], 
                                        props.boxesSelected["startY"], 
                                        props.boxesSelected["endX"], 
                                        props.boxesSelected["endY"])}}> 
                    {"Paste Another Matrix Into Selection: "}
                </button> 
                
                
                <input 
                    id = "paste"
                    onChange = {updateName}
                    value = {pasteName} />
            </div>


    </div>
}

export default SelectionMenu;