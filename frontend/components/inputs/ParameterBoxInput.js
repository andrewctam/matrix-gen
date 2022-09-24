import React from 'react';
const ParameterBoxInput = (props) =>{
    
    const handleChange = (e) =>{
        props.updateParameter(props.name, e.target.checked)
    }



    return  <div className = "form-check-prepend">
                <label className = "form-check-label" htmlFor={props.name}> {props.name}</label>

                <input className = "form-check-input pull-right" 
                    onChange = {handleChange}
                    checked = {props.isChecked} 
                    type = "checkbox" 
                    id = {props.name} 
                />


            </div>  
    

    
}



export default ParameterBoxInput;
