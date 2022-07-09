import React from 'react';
import MatrixExport from "../matrixTools/MatrixExport.js"
import MatrixMath from '../matrixTools/MatrixMath.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';
import Table from "./Table.js"

import "./MatrixEditor.css";

class MatrixEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showActions: false,
            showExport: false, 
            showMath: false, 
            sparseVal: "0", 
            randomLow: 1, 
            randomHigh: 10,
            fillEmptyVal: 0
        };
    }

    render() {    
        return (
        <div className = "matrixEditor">
            <div id = "options" className = "options fixed-bottom">

                    {this.state.showActions ? 
                    <div>
                        <button className = "btn btn-success matrixButtons" onClick={this.transpose}>Transpose</button> <br />
                        <button className = "btn btn-success matrixButtons" onClick={this.mirrorRowsOntoColumns}>Mirror Rows Across Diagonal</button> <br />
                        <button className = "btn btn-success matrixButtons" onClick={this.mirrorColumnsOntoRows}>Mirror Columns Across Diagonal</button> <br />
                        
                        <button className = "btn btn-success matrixButtons" onClick={this.randomMatrix}>Random Matrix</button>
                        <ParameterTextInput id={"randomLow"} updateParameter = {this.updateParameter} defaultVal = {this.state.randomLow} width = {"30px"} />{" to "}
                        <ParameterTextInput id={"randomHigh"} updateParameter = {this.updateParameter} defaultVal = {this.state.randomHigh} width = {"30px"} />
                        <br/>

                        <button className = "btn btn-success matrixButtons" onClick={this.fillEmpty}>Fill Empty With</button>
                        <ParameterTextInput id={"fillEmptyVal"} updateParameter = {this.updateParameter} defaultVal = {this.state.fillEmptyVal} width = {"30px"} />
                        <br/>
                        
                    </div> : null}
                
                {this.state.showMath ?
                    <MatrixMath matrices = {this.props.matrices} matrix = {this.props.matrix} addMatrix = {this.props.addMatrix} sparseVal = {this.props.sparseVal} />
                    : null } 
                     
                {this.state.showExport ?
                    <MatrixExport matrix = {this.props.matrix} sparseVal = {this.props.sparseVal}/>
                    : null }   


                <div className="options-bottom">
                    <button className = "btn btn-success matrixButtons" onClick = {this.toggleActions}> {this.state.showActions ? "Hide Actions" : "Show Actions"}</button> 

                    <button className = "btn btn-secondary matrixButtons" onClick={this.toggleMath}>                
                        {this.state.showMath ? "Close Math Input" : "Perform Matrix Math"}
                    </button>
                    <button className = "btn btn-secondary matrixButtons" onClick={this.toggleExport}>
                        {this.state.showExport ? "Close Export" : "Export Matrix"}
                    </button>
                </div>

            </div>

            <table className = "table table-bordered" >
                <tbody> 
                    <Table 
                    matrix = {this.props.matrix} 
                    addCols = {this.addCols}
                    addRows = {this.addRows}
                    updateEntry = {this.updateEntry}
                    tryToDelete = {this.tryToDelete}
                    /> 
                </tbody>
            </table>
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
            this.setState({showExport: false}, () => {
                this.modifyBottomPadding();
            });
        else
            this.setState({showExport: true, showMath: false, showActions: false}, () => {
                this.modifyBottomPadding();
            });
    }
    toggleMath = () => {
        if (this.state.showMath)
            this.setState({showMath: false}, () => {
                this.modifyBottomPadding();
            });
        else
            this.setState({showMath: true, showExport: false, showActions: false}, () => {
                this.modifyBottomPadding();
            });
    }
    toggleActions = () => {
        if (this.state.showActions)
            this.setState({showActions: false}, () => {
                this.modifyBottomPadding();
            });
        else
            this.setState({showActions: true, showMath: false, showExport: false}, () => {
        });
    }


    componentDidMount() {
        window.addEventListener('resize', this.resize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    resize = () => {
        this.modifyBottomPadding();
    }

    modifyBottomPadding = () => {
        document.body.style.paddingBottom = document.getElementById("options").clientHeight + "px";
    }
    


    tryToDelete = (row, col) => {
        if (row !== 50 && col !== 50 && (row === this.props.matrix.length - 1 || col === this.props.matrix[0].length - 1)) 
            return null;
            
        var temp = this.props.matrix;
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        if (this.props.matrix.length > 2) {
            for (var i = 0; i < this.props.matrix[0].length; i++) {
                if (this.props.matrix[row][i] !== "") {
                    toDelete = false;
                    break;
                }
            }
            if (toDelete)
                temp.splice(row, 1);
        }
    
        //     col
        //{{1,1,0,1},
        // {1,1,0,1},
        // {1,1,0,1}}
        toDelete = true;
        if (this.props.matrix[0].length > 2) {
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
        }

        this.props.updateMatrix(temp, this.props.name); 
    
    }

    
    updateEntry = (i, j, val) => {
        if (i < 50 && j < 50) {
            var temp = this.props.matrix;
            
            if (this.props.mirror) {
                if (j >= this.props.matrix.length - 1) {
                    temp = this.addRows(j - this.props.matrix.length + 2, false)
                }
                
                if (i >= this.props.matrix[0].length - 1) {
                    temp = this.addCols(i - this.props.matrix[0].length + 2, false)
                }
                
                temp[j][i] = val;
            }

            temp[i][j] = val;
            this.props.updateMatrix(temp, this.props.name); 
        }
        else
            alert("Max matrix size reached!");
    }
    
    addCols = (numToAdd, update = true) => {
        var temp = this.props.matrix;

        if (temp[0].length + numToAdd > 51)
            numToAdd = 51 - temp[0].length;

        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < numToAdd; j++)
                temp[i].push("");
        }

        if (update)
            this.props.updateMatrix(temp, this.props.name); 

        return temp;
    }

    addRows = (numToAdd, update = true) => {
        var temp = this.props.matrix;

        if (temp.length + numToAdd > 51)
            numToAdd = 51 - temp.length;

        
        for (var i = 0; i < numToAdd; i++) {
            temp.push(new Array(temp[0].length).fill(""));
        }
        
        if (update)
            this.props.updateMatrix(temp, this.props.name); 

        return temp; 
    }

    mirrorRowsOntoColumns = () => {    
        this.setState({showActions: false});    
        if (this.props.matrix.length > this.props.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.props.matrix.length - this.props.matrix[0].length, false);
            
        }
        else /*if (this.props.matrix.length < this.props.matrix[0].length) */ {
            symmetric = this.addRows(this.props.matrix[0].length - this.props.matrix.length, false)
            
        }
   
        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[col][row] = symmetric[row][col];
            }
        }

        this.props.updateMatrix(symmetric, this.props.name); 
    }

    mirrorColumnsOntoRows = () => {
        this.setState({showActions: false});    
        
        if (this.props.matrix.length > this.props.matrix[0].length) { //more rows than cols {
            var symmetric = this.addCols(this.props.matrix.length - this.props.matrix[0].length, false);
            
        }
        else /*if (this.props.matrix.length < this.props.matrix[0].length) */ {
            symmetric = this.addRows(this.props.matrix[0].length - this.props.matrix.length, false);
            
        }

        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[row][col] = symmetric[col][row];
            }
        }
    
        this.props.updateMatrix(symmetric, this.props.name); 
    }

    transpose = () => {
        this.setState({showActions: false});    

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
        this.setState({showActions: false});    

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
        this.setState({showActions: false});    

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
