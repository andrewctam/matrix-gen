import React from "react";
import ParameterTextInput from "../../inputs/ParameterTextInput";
import styles from "./TextActionButton.module.css"

const TwoTextActionButton = (props) => {
    return   <form className = {styles.textActionButton} onSubmit = {(e) => {e.preventDefault(); props.action()}}>
            <button
                className = "btn btn-primary"
                onClick={props.action}> 
                {props.name}
            </button>

            <ParameterTextInput 
                id={props.id1} 
                updateParameter = {props.updateParameter} 
                placeholder = {props.placeholder1}
                text = {props.value1} 
                width = {props.width} />

            {props.separator}

            <ParameterTextInput 
                id={props.id2} 
                updateParameter = {props.updateParameter} 
                text = {props.value2} 
                placeholder = {props.placeholder2}
                width = {props.width} />
        </form>


    
}

export default TwoTextActionButton;