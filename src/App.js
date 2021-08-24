import React from 'react';
import Row from './Row.js';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {matrix: [["", ""], ["", ""]], sparseVal: "0"}
    }
    render() {
        var matrixTable = this.state.matrix.map((x, i) => <Row  rows = {this.state.matrix.length} 
                                                                cols = {this.state.matrix[0].length}
                                                                tryToDelete = {this.tryToDelete}
                                                                addRows = {this.addRows} 
                                                                addCols = {this.addCols} 
                                                                updateEntry = {this.updateEntry}
                                                                boxes={x} row = {i} />)
        return (
        <div>
            <table className = "table table-bordered table-hover" >
                <tbody>
                    {matrixTable}
                </tbody>
            </table>
        <textarea readonly onClick = {this.handleFocus} className="output" value = {this.matrixToString(this.state.matrix)} />
        <p>Interpret empty elements (excluding red row and red column) as <ParameterInput defaultVal = {0} id={0} updateParameter={this.updateParameter}/></p>
        </div>)
    }

    handleFocus = (e) => {
        e.target.select();
    }

    tryToDelete = (row, col) => {
        if (row === this.state.matrix.length - 1|| col === this.state.matrix[0].length - 1) 
            return null;
            
        var temp = this.state.matrix;
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        console.log(col)
        for (var i = 0; i < this.state.matrix[0].length; i++) {
            if (this.state.matrix[row][i] !== "") {
                toDelete = false;
                break;
            }
                
        }
        if (toDelete)
            temp.splice(row, 1);


                
       //      col
        //{{1,1,0,1},
        // {1,1,0,1},
        // {1,1,0,1}}
        var toDelete = true;
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
        



        

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});        

    }

    
    updateEntry = (i, j, val) => {
        var temp = this.state.matrix;
        temp[i][j] = val;

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});        
    }
    
    addCols = (num) => {
        var temp = this.state.matrix;
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < num; j++)
                temp[i].push("")
        }

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});  
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

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});  
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case 0:
                this.setState({matrix: this.state.matrix, sparseVal: updated});  
                break;
                
            default: break;
  
        }
    }

    matrixToString() {
        var start = "{";
        var end = "}";
        var result = start.toString();

        for (var i = 0; i < this.state.matrix.length - 1; i++) {
            result += start;
            
            for (var j = 0; j < this.state.matrix[0].length - 1; j++) {
                if (this.state.matrix[i][j] !== "")
                    result += this.state.matrix[i][j];
                else
                    result += this.state.sparseVal;
                    
                if (j !== this.state.matrix[0].length - 2) {
                    result += ","
                }
            }
            
            result += end;
            if (i != this.state.matrix.length - 2) {
                result += ","
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
