import React from 'react';


function DuplicateButton(props) {
    
    function copyMatrix() {
        props.copyMatrix(props.selection); 
    }

    return <button type="button" 
        className = {"list-group-item list-group-item-warning selector-button"}
        disabled = {props.selection === "0"}
        onClick = {copyMatrix}>
        Duplicate Matrix {props.selection !== "0" ? props.selection : ""}
    </button>

    

}

export default DuplicateButton;