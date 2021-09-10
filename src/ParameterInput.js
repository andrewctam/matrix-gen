import React from 'react';

class ParameterInput extends React.Component {
    render() {
        return <input type="text" defaultValue = {this.props.defaultVal} onChange = {this.handleChange}></input>
    }

    handleChange = (e) => {
        this.props.updateParameter(this.props.id, e.target.value)
    }
}

export default ParameterInput;
