import React from 'react';
import Row from './Row.js';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {matrix: [["", ""], ["", ""]], sparseVal: "0", start: "{", end: "}", delim: ",", latex: false}
    }
    
    render() {
        var matrixTable = this.state.matrix.map((x, i) => 
        <Row rows = {this.state.matrix.length} 
            cols = {this.state.matrix[0].length}
            tryToDelete = {this.tryToDelete}
            addRows = {this.addRows} 
            addCols = {this.addCols} 
            updateEntry = {this.updateEntry}
            boxes={x} 
            row = {i} />)

        return (
        <div>
            Easily generate matricies for programming or LaTeX. Start entering your matrix below and the resulting 2D array will appear below the matrix. The pink row and column are ignored from the matrix, and typing in one of them will create a new row or column. Use the arrow keys or Tab to quickly navigate the matrix.
            <table className = "table table-bordered table-hover" >
                <tbody>
                    {matrixTable}
                </tbody>
            </table>

            <textarea readonly onClick = {this.handleFocus} className="output" value = {this.matrixToString(this.state.matrix)} />
            <p>Interpret empty elements (excluding pink row and pink column) as &nbsp;
                 <ParameterInput defaultVal = {"0"} id={"sparse"} updateParameter={this.updateParameter}/></p>
            <div class="form-check form-switch">
                <input class="form-check-input" onChange = {() => {this.setState({latex: !this.state.latex})}} type="checkbox" value="" id="latexToggle" />
                <label class="form-check-label" for="latexToggle">Format as LaTeX matrix</label>
            </div>
            {!this.state.latex ?
            <div>
            <p>Open arrays with &nbsp;
                 <ParameterInput defaultVal = {"{"} id={"start"} updateParameter={this.updateParameter}/></p>
            <p>End arrays with &nbsp;
                 <ParameterInput defaultVal = {"}"} id={"end"} updateParameter={this.updateParameter}/></p>
            <p>Separate elements with &nbsp;
                 <ParameterInput defaultVal = {","} id={"delim"} updateParameter={this.updateParameter}/></p>
            </div>
            : null}

            
        </div>)
    }

    handleFocus = (e) => {
        e.target.select();
    }

    tryToDelete = (row, col) => {
        if (row === this.state.matrix.length - 1 || col === this.state.matrix[0].length - 1) 
            return null;
            
        var temp = this.state.matrix;
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        for (var i = 0; i < this.state.matrix[0].length; i++) {
            if (this.state.matrix[row][i] !== "") {
                toDelete = false;
                break;
            }
        }
        if (toDelete)
            temp.splice(row, 1);
    
        //     col
        //{{1,1,0,1},
        // {1,1,0,1},
        // {1,1,0,1}}
        toDelete = true;
        for (var i = 0; i < this.state.matrix.length; i++) {
            if (this.state.matrix[i][col] !== ""){
                toDelete = false;
                break;
            }
        }

        if (toDelete)
            for (var i = 0; i < temp.length; i++) {
                temp[i].splice(col, 1); //delete cols
            } 
    

        this.setState({matrix: temp});        
    }

    
    updateEntry = (i, j, val) => {
        var temp = this.state.matrix;
        temp[i][j] = val;

        this.setState({matrix: temp});        
    }
    
    addCols = (num) => {
        var temp = this.state.matrix;
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < num; j++)
                temp[i].push("")
        }

        this.setState({matrix: temp});  
    }

    addRows = (num) => {
        var emptyRow = [];
        for (var i = 0; i < this.state.matrix[0].length; i++) {
            emptyRow.push("");
        }

        var temp = this.state.matrix;
        for (var i = 0; i < num; i++) {
            temp.push(emptyRow)
        }

        this.setState({matrix: temp});  
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "sparse":
                this.setState({sparseVal: updated});  
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
            default: break;
  
        }
    }

    matrixToString() {
        if (this.state.latex) {
            var latex = "";
            for (var i = 0; i < this.state.matrix.length - 1; i++) {
                for (var j = 0; j < this.state.matrix[0].length - 1; j++) {
                    if (this.state.matrix[i][j] !== "")
                        latex += this.state.matrix[i][j];
                    else
                        latex += this.state.sparseVal;                    
                    if (j !== this.state.matrix[0].length - 2)
                        latex += " & ";
                    else if (i !== this.state.matrix.length - 2)
                        latex += " \\\\ \n";
                }
            }
            return latex; 
        }

        var start = this.state.start;
        var end = this.state.end;
        var delim = this.state.delim;
        var result = start.toString();

        for (var i = 0; i < this.state.matrix.length - 1; i++) {
            result += start;
            
            for (var j = 0; j < this.state.matrix[0].length - 1; j++) {
                if (this.state.matrix[i][j] !== "")
                    result += this.state.matrix[i][j];
                else
                    result += this.state.sparseVal;
                    
                if (j !== this.state.matrix[0].length - 2) {
                    result += delim;
                }
            }
            
            result += end;
            if (i !== this.state.matrix.length - 2) {
                result += delim;
            }
        }
        return result + end;

    }
}

class ParameterInput extends React.Component {
    render() {
        return <input type="text" defaultValue = {this.props.defaultVal} onChange = {this.handleChange}></input>
    }

    handleChange = (e) => {
        this.props.updateParameter(this.props.id, e.target.value)
    }
}

export default App;
