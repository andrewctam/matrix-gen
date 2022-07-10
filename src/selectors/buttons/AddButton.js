import React from 'react';

function AddButton(props) {
    function addMatrix() {
        props.addMatrix();   
    }


    return <button type="button" 
        className = {"list-group-item list-group-item-info selector-button"}
        onClick = {addMatrix}>
        Create New Empty Matrix
    </button>
    

    
}

export default AddButton;