import React from 'react';

function ParameterTextInput(props) {
    function handleChange(e) {
        props.updateParameter(props.id, e.target.value);
    }


    return <input
        type= "text" 
        style = {{width: props.width}} 
        value = {props.text} 
        checked = {props.isChecked}
        placeholder = {props.placeholder}
        onChange = {handleChange}>
    </input>

    
}

export default ParameterTextInput;