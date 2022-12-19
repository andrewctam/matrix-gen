import React from "react"

interface ParameterBoxInputProps {
    isChecked: boolean
    name: string
    updateParameter: (a: string, b: any) => void
}

const ParameterBoxInput = (props: ParameterBoxInputProps) =>{
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        props.updateParameter(props.name, (e.target as HTMLInputElement).checked)
    }

    return (<div className = "form-check-prepend">
                <label className = "form-check-label" htmlFor={props.name}> {props.name}</label>

                <input className = "form-check-input pull-right" 
                    onChange = {handleChange}
                    checked = {props.isChecked} 
                    type = "checkbox" 
                    id = {props.name} 
                />
            </div>)
    
}

export default ParameterBoxInput;
