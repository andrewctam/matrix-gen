import React from "react";
import ParameterTextInput from "../../inputs/ParameterTextInput";
import styles from "./TextActionButton.module.css"

function TextActionButton(props) {
    return <div className = {styles.textActionButton}>
        <button 
            className = "btn btn-primary" 
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