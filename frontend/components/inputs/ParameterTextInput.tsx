import React from 'react';

interface ParameterTextInputProps {
    id: string
    width: number
    placeholder: string
    text: string
    updateParameter: (str1: string, str2: string) => void
}
const ParameterTextInput = (props: ParameterTextInputProps) => {
    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) =>{
        props.updateParameter(props.id, (e.target as HTMLInputElement).value);
    }

    return <input
        type = "text" 
        style = {{width: props.width}} 
        value = {props.text} 
        placeholder = {props.placeholder}
        onInput = {handleInput}>
    </input>

    
}

export default ParameterTextInput;