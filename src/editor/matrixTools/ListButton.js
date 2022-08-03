import React from "react";

function ListButton(props) {
    return  <li><button 
        id = {props.name}
        onClick = {props.action} 
        className = {props.active ? "btn btn-info" : "btn btn-secondary"}>
        {props.name}
    </button>
</li>
}

export default ListButton;