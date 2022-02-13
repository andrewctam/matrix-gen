import React from 'react';
import Row from './Row.js';
import ParameterTextInput from './ParameterTextInput.js';
import ParameterSwitchInput from './ParameterSwitchInput.js';
import ExportMatrix from "./ExportMatrix.js"
class MatrixEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {matrix: [["", ""], ["", ""]], mirror: false, showExport: false, sparseVal: "0"}
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
            row = {i} 
            key = {"row" + i}
            mirror = {this.state.mirror}/>)
            
        return (
        <div className = "matrixEditor">
            <h1>Enter your matrix below. The pink row and column will be ignored from the output matrix, and typing in one of them will create a new row or column.</h1>
            <table className = "table table-bordered table-hover" >
                <tbody> {matrixTable} </tbody>
            </table>
            <p>Interpret empty elements (excluding pink row and pink column) as &nbsp;
            <ParameterTextInput defaultVal = {"0"} id={"sparse"} updateParameter={this.updateParameter}/></p>
            
            <ParameterSwitchInput defaultVal = {false} id={"mirror"} text = {"Mirror along Diagonal"} updateParameter={this.updateParameter}/>
            
            <button className = "btn btn-secondary" onClick={this.handleClick}>{this.state.showExport ? "Hide" : "Export Matrix"}</button>
            
            {this.state.showExport ?
                <ExportMatrix matrix = {this.state.matrix} sparseVal = {this.state.sparseVal} />
            : null }   
        </div>)
    }



    handleClick = (e) => {
        if (this.state.showExport)
            this.setState({showExport: false});
        else
            this.setState({showExport: true});
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
        for (i = 0; i < this.state.matrix.length; i++) {
            if (this.state.matrix[i][col] !== "") {
                toDelete = false;
                break;
            }
        }

        if (toDelete) {
            for (i = 0; i < temp.length; i++) {
                temp[i].splice(col, 1); //delete cols
            } 
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
        return temp;
    }

    addRows = (num) => {
        var temp = this.state.matrix;
        for (var i = 0; i < num; i++) {
            temp.push(new Array(temp[0].length).fill(""))
        }
        this.setState({matrix: temp}); 
        return temp; 
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "sparse":
                this.setState({sparseVal: updated})
                break;
            case "mirror":
                this.setState({mirror: updated});  
                if (updated)
                    this.mirrorEntires();
                break; 
                
            default: break;
  
        }
    }

    mirrorEntires = () => {
        if (this.state.matrix.length > this.state.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.state.matrix.length - this.state.matrix[0].length);
            for (var row = 0; row < symmetric.length; row++) {
                for (var col = row; col < symmetric.length; col++) {
                    symmetric[row][col] = symmetric[col][row];
                }
            }
        }
        else /*if (this.state.matrix.length < this.state.matrix[0].length) */ {
            symmetric = this.addRows(this.state.matrix[0].length - this.state.matrix.length)
            for (row = 0; row < symmetric.length; row++) {
                for (col = row; col < symmetric.length; col++) {
                    symmetric[col][row] = symmetric[row][col];
                }
            }
        }
         
        this.setState({matrix: symmetric});
    }
}




export default MatrixEditor;
