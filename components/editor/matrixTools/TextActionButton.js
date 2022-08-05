import React from "react";
import ParameterTextInput from "../../inputs/ParameterTextInput";

function TextActionButton(props) {
    return <div className = "textActionButton">
        <button 
            className = "btn btn-primary matrixButtons" 
            onClick = {props.action}>
            {props.name}
        </button>

        <ParameterTextInput 
            id = {props.name} 
            updateParameter = {props.updateParameter} 
            text = {props.value} 
            width = {props.width} 
            placeholder = {props.placeholder}
        />
    </div>
}

export default TextActionButton;