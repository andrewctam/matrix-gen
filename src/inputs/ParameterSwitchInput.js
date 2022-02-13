import React from 'react';

class ParameterSwitchInput extends React.Component {
    render() {
        return  <div className="form-check form-switch">
        <label className="form-check-label" htmlFor={this.props.htmlId}> {this.props.text} </label>
        <input className="form-check-input" onChange = {this.handleChange} type="checkbox" defaultChecked={this.props.defaultVal} id={this.props.id} />
        </div>  
    }

    handleChange = (e) => {
        this.props.updateParameter(this.props.id, e.target.checked)
    }
}



export default ParameterSwitchInput;
