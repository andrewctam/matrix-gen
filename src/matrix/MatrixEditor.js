import React from 'react';
import Row from './table/Row.js';
import ParameterTextInput from './inputs/ParameterTextInput.js';
import ParameterSwitchInput from './inputs/ParameterSwitchInput.js';
import MatrixExport from "./MatrixExport.js"

class MatrixEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {mirror: false, showExport: false, sparseVal: "0"}
    }
    
    render() {
        var matrixTable = this.props.matrix.map((x, i) => 
        <Row rows = {this.props.matrix.length} 
            cols = {this.props.matrix[0].length}
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
            <ParameterTextInput width = {"30px"} defaultVal = {"0"} id={"sparse"} updateParameter={this.updateParameter}/></p>
            
            <ParameterSwitchInput defaultVal = {false} id={"mirror"} text = {"Mirror along Diagonal"} updateParameter={this.updateParameter}/>
            
            <button className = "btn btn-secondary" onClick={this.handleClick}>{this.state.showExport ? "Close" : "Export Matrix"}</button>
            
            {this.state.showExport ?
                <MatrixExport matrix = {this.props.matrix} sparseVal = {this.state.sparseVal} />
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
        if (row === this.props.matrix.length - 1 || col === this.props.matrix[0].length - 1) 
            return null;
            
        var temp = this.props.matrix;
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        for (var i = 0; i < this.props.matrix[0].length; i++) {
            if (this.props.matrix[row][i] !== "") {
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
        for (i = 0; i < this.props.matrix.length; i++) {
            if (this.props.matrix[i][col] !== "") {
                toDelete = false;
                break;
            }
        }

        if (toDelete) {
            for (i = 0; i < temp.length; i++) {
                temp[i].splice(col, 1); //delete cols
            } 
        }

        this.props.updateMatrix(temp); 
    
    }

    
    updateEntry = (i, j, val) => {
        var temp = this.props.matrix;
        temp[i][j] = val;
        this.props.updateMatrix(temp); 
    }
    
    addCols = (num) => {
        var temp = this.props.matrix;
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < num; j++)
                temp[i].push("")
        }

        this.props.updateMatrix(temp); 
        return temp;
    }

    addRows = (num) => {
        var temp = this.props.matrix;
        for (var i = 0; i < num; i++) {
            temp.push(new Array(temp[0].length).fill(""));
        }
        this.props.updateMatrix(temp); 
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
        if (this.props.matrix.length > this.props.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.props.matrix.length - this.props.matrix[0].length);
            for (var row = 0; row < symmetric.length; row++) {
                for (var col = row; col < symmetric.length; col++) {
                    symmetric[row][col] = symmetric[col][row];
                }
            }
        }
        else /*if (this.props.matrix.length < this.props.matrix[0].length) */ {
            symmetric = this.addRows(this.props.matrix[0].length - this.props.matrix.length)
            for (row = 0; row < symmetric.length; row++) {
                for (col = row; col < symmetric.length; col++) {
                    symmetric[col][row] = symmetric[row][col];
                }
            }
        }
         
        this.props.updateMatrix(symmetric); 
    }
}




export default MatrixEditor;
