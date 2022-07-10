import React from 'react';

function DeleteButton(props) {
    function deleteMatrix() {
        if (window.confirm("Are you sure you want to delete " + props.selection + "?")) {
            props.deleteMatrix(props.selection); 
            props.updateSelection("0");
        }
    }

    return <button type="button" 
            className = {"list-group-item list-group-item-danger selector-button"}
            disabled = {props.selection === "0"}
            onClick = {deleteMatrix}>
            Delete Matrix {props.selection !== "0" ? props.selection : ""}
        </button>
    

    

    
}

export default DeleteButton;