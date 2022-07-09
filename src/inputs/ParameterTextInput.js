import React from 'react';

class ParameterTextInput extends React.Component {
    render() {
        return <input
            type= "text" 
            style = {{width: this.props.width}} 
            defaultValue = {this.props.defaultVal} 
            onChange = {this.handleChange}>
        </input>
    }

    handleChange = (e) => {
        this.props.updateParameter(this.props.id, e.target.value)
    }
}



export default ParameterTextInput;
