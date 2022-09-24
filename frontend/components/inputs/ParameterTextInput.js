import React from 'react';

const ParameterTextInput = (props) =>{
    const handleChange = (e) =>{
        props.updateParameter(props.id, e.target.value);
    }

    return <input
        type= "text" 
        style = {{width: props.width}} 
        value = {props.text} 
        placeholder = {props.placeholder}
        onChange = {handleChange}>
    </input>

    
}

export default ParameterTextInput;