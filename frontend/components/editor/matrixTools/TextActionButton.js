import React from "react";
import ParameterTextInput from "../../inputs/ParameterTextInput";
import styles from "./TextActionButton.module.css"

const TextActionButton = (props) => {
    return <form className = {styles.textActionButton} onSubmit = {(e) => {e.preventDefault(); props.action();}}>
        <button 
            className = "btn btn-primary" 
            onClick = {(e) => {e.preventDefault(); props.action()}}>
            {props.name}
        </button>

        <ParameterTextInput 
            id = {props.name} 
            updateParameter = {props.updateParameter} 
            text = {props.value} 
            width = {props.width} 
            placeholder = {props.placeholder}
        />
    </form>
}

export default TextActionButton;