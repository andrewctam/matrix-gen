import React from "react";
import ParameterTextInput from "../../inputs/ParameterTextInput";
function TwoTextActionButton(props) {
    return   <div className = "textActionButton">
            <button
                className = "btn btn-primary matrixButtons"
                onClick={props.action}> 
                {props.name}
            </button>

            <ParameterTextInput 
                id={props.id1} 
                updateParameter = {props.updateParameter} 
                text = {props.value1} 
                width = {props.width} />

            {props.separator}

            <ParameterTextInput 
                id={props.id2} 
                updateParameter = {props.updateParameter} 
                text = {props.value2} 
                width = {props.width} />
        </div>


    
}

export default TwoTextActionButton;