import React from 'react';


function MenuButton(props) {

    return <button type="button" 
        className = {`list-group-item list-group-item-${props.buttonStyle} selector-button`}
        onClick = {props.action}>
        {props.text}
    </button>
    

    
}

export default MenuButton;