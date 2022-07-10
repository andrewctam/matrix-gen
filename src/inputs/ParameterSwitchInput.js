import React from 'react';

function ParameterSwitchInput(props) {
    
    function handleChange(e) {
        props.updateParameter(props.id, e.target.checked)
    }



    return  <div className = "form-check form-switch">
        <label className = "form-check-label" htmlFor={props.name + "Switch"}> {props.text}</label>
        <input className = "form-check-input" 
        onChange = {handleChange}
        checked = {props.isChecked} 
        type = "checkbox" defaultChecked={props.defaultVal} 
        id = {props.name + "Switch"} 
        />
    </div>  
    

    
}



export default ParameterSwitchInput;
