import React from 'react';
import ParameterTextInput from './ParameterTextInput.js';
import ParameterSwitchInput from './ParameterSwitchInput.js';

class MatrixEditor extends React.Component {    
    constructor(props) {
        super(props);
        this.state = {sparseVal: "0", start: "{", end: "}", delim: ",", latex: false, environment: "bmatrix"};
    }
    render() { 
        return <div className = "row export">
            <textarea readonly onClick = {this.handleFocus} className="output" value = {this.matrixToString(this.props.matrix)} />
            <div className = "col-sm-2">
                <ParameterSwitchInput defaultVal = {false} id={"latex"} text = {"LaTeX Format"} updateParameter={this.updateParameter}/>
            </div>
            
            <div className = "col-sm-10">

                {this.state.latex ?
                <p>Environment &nbsp;
                <ParameterTextInput defaultVal = {"bmatrix"} id={"environment"} updateParameter={this.updateParameter}/></p>
                :
                <div>
                <p>Open arrays with &nbsp;
                    <ParameterTextInput defaultVal = {"{"} id={"start"} updateParameter={this.updateParameter}/></p>
                <p>End arrays with &nbsp;
                    <ParameterTextInput defaultVal = {"}"} id={"end"} updateParameter={this.updateParameter}/></p>
                <p>Separate elements with &nbsp;
                    <ParameterTextInput defaultVal = {","} id={"delim"} updateParameter={this.updateParameter}/></p>
                </div>}
            </div>    
        </div>
    }
    handleFocus = (e) => {
        e.target.select();
    }
    
    matrixToString() {
        if (this.state.latex) {
            var result = "\\begin{" + this.state.environment + "}\n";
            for (var i = 0; i < this.props.matrix.length - 1; i++) {
                for (var j = 0; j < this.props.matrix[0].length - 1; j++) {
                    if (this.props.matrix[i][j] !== "")
                    result += this.props.matrix[i][j];
                    else
                        result += this.props.sparseVal;                    
                    if (j !== this.props.matrix[0].length - 2)
                        result += " & ";
                    else if (i !== this.props.matrix.length - 2)
                        result += " \\\\ \n";
                }
            }
            result += "\n\\end{" + this.state.environment + "}";

            return result; 
        }

        var start = this.state.start;
        var end = this.state.end;
        var delim = this.state.delim;
        var result = start.toString();

        for (var i = 0; i < this.props.matrix.length - 1; i++) {
            result += start;
            
            for (var j = 0; j < this.props.matrix[0].length - 1; j++) {
                if (this.props.matrix[i][j] !== "")
                    result += this.props.matrix[i][j];
                else
                    result += this.props.sparseVal;
                    
                if (j !== this.props.matrix[0].length - 2) {
                    result += delim;
                }
            }
            
            result += end;
            if (i !== this.props.matrix.length - 2) {
                result += delim;
            }
        }
        return result + end;

    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "environment":
                this.setState({environment: updated});  
                break;  
            case "start":
                this.setState({start: updated});  
                break;  
            case "end":
                this.setState({end: updated});  
                break;  
            case "delim":
                this.setState({delim: updated});  
                break;  
            case "latex":
                this.setState({latex: updated});  
                break; 
            default: break;
  
        }
    }
}




export default MatrixEditor;
