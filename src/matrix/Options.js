import React from 'react';
import Row from './table/Row.js';
import MatrixExport from "./MatrixExport.js"
import MatrixMath from './MatrixMath.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';

class MatrixEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptions: false,
            showExport: false, 
            showMath: false, 
            sparseVal: "0", 
            randomLow: 1, 
            randomHigh: 10,
            fillEmptyVal: 0
        };
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
            mirror = {this.props.mirror}/>)
            
        
        return (
        <div className = "matrixEditor">
            <button className = "btn btn-primary matrixButtons" onClick={() => {this.setState({showOptions: !this.state.showOptions})}}>{this.state.showOptions ? "Hide Options" : "Show Options"}</button> <br />
            {this.state.showOptions ? 
            <div>
                <button className = "btn btn-secondary matrixButtons" onClick={this.transpose}>Transpose</button> <br />
                <button className = "btn btn-secondary matrixButtons" onClick={this.mirrorRowsOntoColumns}>Mirror Rows Across Diagonal</button> <br />
                <button className = "btn btn-secondary matrixButtons" onClick={this.mirrorColumnsOntoRows}>Mirror Columns Across Diagonal</button> <br />
                
                <button className = "btn btn-secondary matrixButtons" onClick={this.randomMatrix}>Random Matrix</button>
                <ParameterTextInput id={"randomLow"} updateParameter = {this.updateParameter} defaultVal = {1} width = {"30px"} />{" to "}
                <ParameterTextInput id={"randomHigh"} updateParameter = {this.updateParameter} defaultVal = {10} width = {"30px"} />
                <br />

                <button className = "btn btn-secondary matrixButtons" onClick={this.fillEmpty}>Fill Empty With</button>
                <ParameterTextInput id={"fillEmptyVal"} updateParameter = {this.updateParameter} defaultVal = {0} width = {"30px"} />
                <br/>
                
            </div> : null}

            <button className = "btn btn-secondary matrixButtons" onClick={this.toggleMath}>                
                {this.state.showMath ? "Close Math Input" : "Perform Matrix Math"}
            </button>
            <button className = "btn btn-secondary matrixButtons" onClick={this.toggleExport}>
                {this.state.showExport ? "Close Export" : "Export Matrix"}
            </button>
            
            {this.state.showExport ?
                <MatrixExport matrix = {this.props.matrix} sparseVal = {this.props.sparseVal} />
                : null }   

            {this.state.showMath ?
                <MatrixMath matrices = {this.props.matrices} matrix = {this.props.matrix} addMatrix = {this.props.addMatrix} sparseVal = {this.props.sparseVal} />
                : null }  

            </div>)
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "randomLow":
                this.setState({randomLow: parseInt(updated)})
                break;
            case "randomHigh":
                this.setState({randomHigh: parseInt(updated)});  
                break; 
            case "fillEmptyVal":
                this.setState({fillEmptyVal: updated});  
                break; 
                
            default: break;
  
        }
    
    }


    toggleExport = () => {
        if (this.state.showExport)
            this.setState({showExport: false});
        else
            this.setState({showExport: true});
    }
    toggleMath = () => {
        if (this.state.showMath)
            this.setState({showMath: false});
        else
            this.setState({showMath: true});
    }


    mirrorRowsOntoColumns = () => {        
        if (this.props.matrix.length > this.props.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.props.matrix.length - this.props.matrix[0].length);
            
        }
        else /*if (this.props.matrix.length < this.props.matrix[0].length) */ {
            symmetric = this.addRows(this.props.matrix[0].length - this.props.matrix.length)
            
        }
   
        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[col][row] = symmetric[row][col];
            }
        }

        this.props.updateMatrix(symmetric, this.props.name); 
    }

    mirrorColumnsOntoRows = () => {        
        if (this.props.matrix.length > this.props.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.props.matrix.length - this.props.matrix[0].length);
            
        }
        else /*if (this.props.matrix.length < this.props.matrix[0].length) */ {
            symmetric = this.addRows(this.props.matrix[0].length - this.props.matrix.length);
            
        }

        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[row][col] = symmetric[col][row];
            }
        }
    
        this.props.updateMatrix(symmetric, this.props.name); 
    }

    transpose = () => {
        var transposed = Array(this.props.matrix[0].length).fill(0);
        for (var i = 0; i < transposed.length; i++) {
            var arr = Array(this.props.matrix.length).fill(0)
            for (var j = 0; j < arr.length; j++)
                arr[j] = this.props.matrix[j][i];
            transposed[i] = arr;       
        }

        this.props.updateMatrix(transposed, this.props.name); 
    }       


    randomMatrix = () => {
        var temp = this.props.matrix;
        var low = this.state.randomLow
        var high = this.state.randomHigh
        if (low <= high) {
            for (var i = 0; i < temp.length - 1; i++)
                for (var j = 0; j < temp[0].length - 1; j++)
                    temp[i][j] = Math.floor(Math.random() * (high - low)) + low;
            
            this.props.updateMatrix(temp, this.props.name);
        }
        else {
            alert("Invalid range")
        }
        

    }

    fillEmpty = () => {
        var temp = this.props.matrix;
       
        for (var i = 0; i < temp.length - 1; i++)
            for (var j = 0; j < temp[0].length - 1; j++) {
                if (temp[i][j] === "")
                    temp[i][j] = this.state.fillEmptyVal;
            }
        
        this.props.updateMatrix(temp, this.props.name);
    }

    
    
}



export default MatrixEditor;
