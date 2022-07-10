import React, { useState } from 'react';
import MatrixExport from "../matrixTools/MatrixExport.js"
import MatrixMath from '../matrixTools/MatrixMath.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';
import Table from "./Table.js"

import "./MatrixEditor.css";

function MatrixEditor(props) {
    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [randomLow, setRandomLow] = useState(1);
    const [randomHigh, setRandomHigh] = useState(10);
    const [fillEmptyVal, setFillEmptyVal] = useState(0);


    function updateParameter(i, updated) {
        switch (i) {
            case "randomLow":
                setRandomLow(parseInt(updated));
                break;
            case "randomHigh":
                setRandomHigh(parseInt(updated));
                break; 
            case "fillEmptyVal":
                setFillEmptyVal(updated);
                break; 
                
            default: break;
  
        }
    
    }


    function toggleExport() {
        if (showExport) 
            setShowExport(false);
        else  {
            setShowExport(true);
            setShowMath(false);
            setShowActions(false);

        }
    }
    function toggleMath() {
        if (showMath)
            setShowMath(false);
        else  {
            setShowMath(true);
            setShowExport(false);
            setShowActions(false);
        }
    }

    function toggleActions() {
        if (showActions)
            setShowActions(false);
        else  {
            setShowActions(true);
            setShowExport(false);
            setShowMath(false);
        }
    
    }

    /*
    function componentDidMount{
        window.addEventListener('resize', resize);
    }
    function componentWillUnmount{
        window.removeEventListener('resize', resize);
    }

    function resize() {
        modifyBottomPadding();
    }

    function modifyBottomPadding() {
        document.body.style.paddingBottom = document.getElementById("options").clientHeight + "px";
    }*/
    


    function tryToDelete(row, col) {
        //Can not delete the red row/column
        if (row === props.matrix.length - 1 || col === props.matrix[0].length - 1) 
            return null;
            
        var tempMatrix = [...props.matrix];
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        if (props.matrix.length > 2) {
            for (var i = 0; i < props.matrix[0].length; i++) {
                if (props.matrix[row][i] !== "") {
                    toDelete = false;
                    break;
                }
            }
            if (toDelete)
                tempMatrix.splice(row, 1);
        }
    
        //     col
        //{{1,1,0,1},
        // {1,1,0,1},
        // {1,1,0,1}}
        toDelete = true;
        if (props.matrix[0].length > 2) {
            for (i = 0; i < props.matrix.length; i++) {
                if (props.matrix[i][col] !== "") {
                    toDelete = false;
                    break;
                }
            }

            if (toDelete) {
                for (i = 0; i < tempMatrix.length; i++) {
                    tempMatrix[i].splice(col, 1); //delete cols
                } 
            }
        }

        props.updateMatrix(tempMatrix, props.name); 
    
    }

    
    function updateEntry(i, j, val, tempMatrix = [...props.matrix]) {
        if (i < 50 && j < 50) {
            
            if (props.mirror) {
                //add enough rows in order to update the correct  j, i
                if (j >= props.matrix.length - 1) {
                    tempMatrix = addRows(j - props.matrix.length + 2, false)
                }
                
                //add enough cols in order to update the correct  j, i
                if (i >= props.matrix[0].length - 1) {
                    tempMatrix = addCols(i - props.matrix[0].length + 2, false)
                }
                
                tempMatrix[j][i] = val;
            }

            tempMatrix[i][j] = val;
            props.updateMatrix(tempMatrix, props.name); 
        } else
            alert("Max matrix size reached!");
    }
    
    function addCols(numToAdd, update = true) {
        var tempMatrix = [...props.matrix];

        if (tempMatrix[0].length + numToAdd > 51)
            numToAdd = 51 - tempMatrix[0].length;

        for (var i = 0; i < tempMatrix.length; i++) {
            for (var j = 0; j < numToAdd; j++)
                tempMatrix[i].push("");
        }

        if (update)
            props.updateMatrix(tempMatrix, props.name); 

        return tempMatrix;
    }

    function addRows(numToAdd, update = true) {
        var tempMatrix = [...props.matrix];

        if (tempMatrix.length + numToAdd > 51)
            numToAdd = 51 - tempMatrix.length;

        
        for (var i = 0; i < numToAdd; i++) {
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));
        }
        
        if (update)
            props.updateMatrix(tempMatrix, props.name); 


        return tempMatrix; 
    }

    function addRowsAndCols(rowsToAdd, colsToAdd, update = true) {
        var tempMatrix = [...props.matrix];

        if (tempMatrix.length + rowsToAdd > 51)
            rowsToAdd = 51 - tempMatrix.length;

        if (tempMatrix[0].length + colsToAdd > 51)
            colsToAdd = 51 - tempMatrix[0].length;

        
        for (var i = 0; i < tempMatrix.length; i++) {
            for (var j = 0; j < colsToAdd; j++)
                tempMatrix[i].push("");
        }
        
        for (var i = 0; i < rowsToAdd; i++)
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));

        console.log("added");
        console.log(tempMatrix);

        if (update)
            props.updateMatrix(tempMatrix, props.name); 

       

        return tempMatrix; 
    }


    
    function mirrorRowsOntoColumns() { 
        setShowActions(false);
        if (props.matrix.length > props.matrix[0].length) { //more rows than cols {
            var symmetric = addCols(props.matrix.length - props.matrix[0].length, false);
            
        }
        else /*if (props.matrix.length < props.matrix[0].length) */ {
            symmetric = addRows(props.matrix[0].length - props.matrix.length, false)
            
        }
   
        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[col][row] = symmetric[row][col];
            }
        }

        props.updateMatrix(symmetric, props.name); 
    }

    function mirrorColumnsOntoRows() {
        setShowActions(false);
        
        if (props.matrix.length > props.matrix[0].length) { //more rows than cols {
            var symmetric = addCols(props.matrix.length - props.matrix[0].length, false);
            
        }
        else /*if (props.matrix.length < props.matrix[0].length) */ {
            symmetric = addRows(props.matrix[0].length - props.matrix.length, false);
            
        }

        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[row][col] = symmetric[col][row];
            }
        }
    
        props.updateMatrix(symmetric, props.name); 
    }

    function transpose() {
        setShowActions(false);

        var transposed = Array(props.matrix[0].length).fill(0);
        for (var i = 0; i < transposed.length; i++) {
            var arr = Array(props.matrix.length).fill(0)
            for (var j = 0; j < arr.length; j++)
                arr[j] = props.matrix[j][i];
            transposed[i] = arr;       
        }

        props.updateMatrix(transposed, props.name); 
    }       


    function randomMatrix() {
        setShowActions(false);

        var low = randomLow;
        var high = randomHigh;
        
        if (low <= high) {
            var tempMatrix = [...props.matrix];
            
            for (var i = 0; i < tempMatrix.length - 1; i++)
                for (var j = 0; j < tempMatrix[0].length - 1; j++)
                    tempMatrix[i][j] = Math.floor(Math.random() * (high - low)) + low;
            
            props.updateMatrix(tempMatrix, props.name);
        }
        else {
            alert("Invalid range")
        }
        

    }

    function fillEmpty() {
        setShowActions(false);

        var tempMatrix = [...props.matrix];
       
        for (var i = 0; i < tempMatrix.length - 1; i++)
            for (var j = 0; j < tempMatrix[0].length - 1; j++) {
                if (tempMatrix[i][j] === "")
                    tempMatrix[i][j] = fillEmptyVal;
            }
        
        props.updateMatrix(tempMatrix, props.name);
    }




    return (
    <div className = "matrixEditor">
        <div id = "options" className = "options">
            <div>
                <button className = "btn btn-success matrixButtons" onClick = {toggleActions}> {showActions ? "Hide Actions" : "Show Actions"}</button> 

                <button className = "btn btn-secondary matrixButtons" onClick={toggleMath}>                
                    {showMath ? "Close Math Input" : "Perform Matrix Math"}
                </button>
                <button className = "btn btn-secondary matrixButtons" onClick={toggleExport}>
                    {showExport ? "Close Export" : "Export Matrix"}
                </button>
            </div>


            {showActions ? 
            <div>
                <button className = "btn btn-success matrixButtons" onClick={transpose}>Transpose</button> <br />
                <button className = "btn btn-success matrixButtons" onClick={mirrorRowsOntoColumns}>Mirror Rows Across Diagonal</button> <br />
                <button className = "btn btn-success matrixButtons" onClick={mirrorColumnsOntoRows}>Mirror Columns Across Diagonal</button> <br />
                
                <button className = "btn btn-success matrixButtons" onClick={randomMatrix}>Random Matrix</button>
                <ParameterTextInput id={"randomLow"} updateParameter = {updateParameter} text = {randomLow} width = {"30px"} />{" to "}
                <ParameterTextInput id={"randomHigh"} updateParameter = {updateParameter} defaultexttVal = {randomHigh} width = {"30px"} />
                <br/>

                <button className = "btn btn-success matrixButtons" onClick={fillEmpty}>Fill Empty With</button>
                <ParameterTextInput id={"fillEmptyVal"} updateParameter = {updateParameter} text = {fillEmptyVal} width = {"30px"} />
                <br/>
                
            </div> : null}
            
            {showMath ?
                <MatrixMath matrices = {props.matrices} matrix = {props.matrix} addMatrix = {props.addMatrix} sparseVal = {props.sparseVal} />
                : null } 
                    
            {showExport ?
                <MatrixExport matrix = {props.matrix} sparseVal = {props.sparseVal}/>
                : null }   


            

        </div>


        <Table 
            mirror = {props.mirror}
            matrix = {props.matrix} 
            addCols = {addCols}
            addRows = {addRows}
            addRowsAndCols = {addRowsAndCols}
            updateEntry = {updateEntry}
            tryToDelete = {tryToDelete}
        /> 

        </div>)

}



export default MatrixEditor;
