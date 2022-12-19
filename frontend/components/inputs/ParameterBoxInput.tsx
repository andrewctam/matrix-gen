import React from "react"

interface ParameterBoxInputProps {
    isChecked: boolean
    name: string
    updateParameter: any
}

const ParameterBoxInput = (props: ParameterBoxInputProps) =>{
    
    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) =>{
        props.updateParameter(props.name, (e.target as HTMLInputElement).checked)
    }

    return (<div className = "form-check-prepend">
                <label className = "form-check-label" htmlFor={props.name}> {props.name}</label>

                <input className = "form-check-input pull-right" 
                    onInput = {handleInput}
                    checked = {props.isChecked} 
                    type = "checkbox" 
                    id = {props.name} 
                />
            </div>)
    
}

export default ParameterBoxInput;
