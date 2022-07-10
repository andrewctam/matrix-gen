import React from 'react';
import ParameterTextInput from '../inputs/ParameterTextInput.js';
import ParameterSwitchInput from '../inputs/ParameterSwitchInput.js';
import "./MatrixExport.css";

class MatrixEditor extends React.Component {    
    constructor(props) {
        super(props);
        this.state = {start: "{", end: "}", delim: ",", latex: false, environment: "bmatrix", custom: false, exportOption: "{},"};
    }

    render() { 
        return <div className = "row export">
            <textarea readOnly = {true} onClick = {this.handleFocus} className="exportOutput" value = {this.matrixToString(this.props.matrix)} />
            <div className = "col-sm-2">
                <ParameterSwitchInput isChecked = {false} id={"latex"} text = {"LaTeX Format"} updateParameter={this.updateExportParameter}/>
            </div>
            
            <div className = "col-sm-10">
                {this.state.latex ?
                <p>Environment &nbsp;
                <ParameterTextInput width = {"100px"} text = {"bmatrix"} id={"environment"} updateParameter={this.updateExportParameter}/></p>
                :

                <div className ="row">
                <div className = "col-sm-6">
                    <ul>
                        Export Setting
                        <li><button id = "{}," 
                        onClick = {this.usePreset} 
                        className = {this.state.exportOption === "{}," ? "btn btn-info" : "btn btn-secondary"}>
                        {"Curly Braces and Comma { } ,"}
                        </button></li>

                        <li><button id = "[]," 
                        onClick = {this.usePreset} 
                        className = {this.state.exportOption === "[]," ? "btn btn-info" : "btn btn-secondary"}>
                        {"Square Braces and Comma [ ] ,"}
                        </button></li>

                        <li><button id = "()," 
                        onClick = {this.usePreset} 
                        className = {this.state.exportOption === "()," ? "btn btn-info" : "btn btn-secondary"}>
                        {"Parentheses and Comma ( ) ,"}
                        </button></li>

                        <li><button 
                        onClick = {this.toggleCustom} 
                        className = {this.state.exportOption === "custom" ? "btn btn-info" : "btn btn-secondary"}>
                        {"Custom"}
                        </button></li>
                    </ul> 
                </div>

                {this.state.custom ?
                <div className = "col-sm-6">
                    <p>Open arrays with &nbsp;
                        <ParameterTextInput text = {""} width = {"20px"} id={"start"} updateParameter={this.updateExportParameter}/></p>
                    <p>End arrays with &nbsp;
                        <ParameterTextInput text = {""} width = {"20px"} id={"end"} updateParameter={this.updateExportParameter}/></p>
                    <p>Separate elements with &nbsp;
                        <ParameterTextInput text = {""} width = {"20px"} id={"delim"} updateParameter={this.updateExportParameter}/></p>
                </div>: null}
                
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
                    if (this.props.matrix[i][j] === "") {
                        result += this.props.sparseVal;        
                    } else {
                        result += this.props.matrix[i][j];
                    }            

                    if (j !== this.props.matrix[0].length - 2) {
                        result += " & ";
                    } else if (i !== this.props.matrix.length - 2) {
                        result += " \\\\ \n";
                    }
                }
            }

            return result + "\n\\end{" + this.state.environment + "}"; 
        }

        var start = this.state.start;
        var end = this.state.end;
        var delim = this.state.delim;
        result = start.toString();

        for (i = 0; i < this.props.matrix.length - 1; i++) {
            result += start;
            
            for (j = 0; j < this.props.matrix[0].length - 1; j++) {
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

    updateExportParameter = (i, updated) => {
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
            case "custom":
                this.setState({custom: updated});  
                break; 
            default: break;
  
        }
    }


    usePreset = (e) => {
        this.toggleCustom(false);
        var updated = e.target.id;
        switch (updated) {
            case "{},":
                this.setState({
                    start: "{",
                    end: "}",
                    delim: ",",
                    exportOption: "{},"
                });  
                break;  
            case "[],":
                this.setState({
                    start: "[",
                    end: "]",
                    delim: ",",
                    exportOption: "[],"
                });  
                break;
            case "(),":
                this.setState({
                    start: "(",
                    end: ")",
                    delim: ",",
                    exportOption: "(),"
                });  
            break;
            default: break;
  
        }
    }

    toggleCustom = (option = true) => {
        this.updateExportParameter("custom", option);
        this.setState({exportOption: "custom"})
    }    
}

export default MatrixEditor;
