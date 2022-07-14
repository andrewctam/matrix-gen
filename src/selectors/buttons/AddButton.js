import React from 'react';

function AddButton(props) {
    function setMatrix() {
        props.setMatrix();   
    }


    return <button type="button" 
        className = {"list-group-item list-group-item-info selector-button"}
        onClick = {setMatrix}>
        Create New Empty Matrix
    </button>
    

    
}

export default AddButton;