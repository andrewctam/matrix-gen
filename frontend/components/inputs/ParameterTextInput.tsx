import React from 'react';

interface ParameterTextInputProps {
    id: string
    width: string
    placeholder?: string
    text: string
    updateParameter: (a: string, b: any) => void

}
const ParameterTextInput = (props: ParameterTextInputProps) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>{
        props.updateParameter(props.id, (e.target as HTMLInputElement).value);
    }

    return <input
        type = "text" 
        style = {{width: props.width}} 
        value = {props.text} 
        placeholder = {props.placeholder}
        onChange = {handleInput}>
    </input>

    
}

export default ParameterTextInput;