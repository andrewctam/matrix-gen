import React, { useState } from 'react';

import Table from "./Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';

import "./MatrixEditor.css";

function MatrixEditor(props) {
    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [randomLow, setRandomLow] = useState(1);
    const [randomHigh, setRandomHigh] = useState(10);
    const [reshapeRows, setReshapeRows] = useState(0);
    const [reshapeCols, setReshapeCols] = useState(0);
    const [fillEmptyWithThis, setFillEmptyWithThis] = useState("0");


    function updateParameter(i, updated) {
        switch (i) {
            case "fillEmptyWithThis":
                setFillEmptyWithThis(updated);
                break; 
            case "randomLow":
                var parsed = parseInt(updated);
                if (parsed === NaN)
                    parsed = 0;
                setRandomLow(parsed);
                break;
            case "randomHigh":
                var parsed = parseInt(updated);
                if (parsed === NaN)
                    parsed = 0;
                setRandomHigh(parsed);
                break; 
            case "reshapeRows":
                var parsed = parseInt(updated);
                if (parsed === NaN)
                    parsed = 0;
                setReshapeRows(parsed);
                break;
            case "reshapeCols":
                var parsed = parseInt(updated);
                if (parsed === NaN)
                    parsed = 0;
                setReshapeCols(parsed);
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
            setShowImport(false);

        }
    }
    function toggleMath() {
        if (showMath)
            setShowMath(false);
        else  {
            setShowMath(true);
            setShowExport(false);
            setShowActions(false);
            setShowImport(false);

        }
    }

    function toggleActions() {
        if (showActions)
            setShowActions(false);
        else  {
            setShowActions(true);
            setShowExport(false);
            setShowImport(false);
            setShowMath(false);
        }
    
    }

    function toggleImport() {
        if (showImport)
            setShowImport(false);
        else  {
            setShowImport(true);
            setShowActions(false);
            setShowExport(false);
            setShowMath(false);
        }
    
    }



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

        props.setMatrix(tempMatrix, props.name); 
    
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
            props.setMatrix(tempMatrix, props.name); 
        } else
            alert("Max matrix size 50 x 50 reached!");
    }
    
    function addCols(numToAdd, update = true) {
        //copy matrix
        var tempMatrix = [...props.matrix];

        //mas 50 cols
        if (tempMatrix[0].length + numToAdd > 51)
            numToAdd = 51 - tempMatrix[0].length;

        for (var i = 0; i < tempMatrix.length; i++) {
            for (var j = 0; j < numToAdd; j++)
                //Add ""s to each row
                tempMatrix[i].push("");
        }

        if (update)
            props.setMatrix(tempMatrix, props.name); 

        return tempMatrix;
    }

    function addRows(numToAdd, update = true) {
        var tempMatrix = [...props.matrix];

        //max 50 rows
        if (tempMatrix.length + numToAdd > 51)
            numToAdd = 51 - tempMatrix.length;

        for (var i = 0; i < numToAdd; i++) {
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));
        }
        
        if (update)
            props.setMatrix(tempMatrix, props.name); 


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
        
        for (i = 0; i < rowsToAdd; i++)
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));


        if (update)
            props.setMatrix(tempMatrix, props.name); 



        return tempMatrix; 
    }


    
    function mirrorRowsOntoColumns() { 
        setShowActions(false);

        if (props.matrix.length > props.matrix[0].length) { //more rows than cols 
            var symmetric = addCols(props.matrix.length - props.matrix[0].length, false);
            
        } else if (props.matrix.length < props.matrix[0].length) {
            symmetric = addRows(props.matrix[0].length - props.matrix.length, false)  
        } //else rows == cols

   
        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[col][row] = symmetric[row][col];
            }
        }

        props.setMatrix(symmetric, props.name); 
    }

    function mirrorColumnsOntoRows() {
        setShowActions(false);
        
        if (props.matrix.length > props.matrix[0].length) { //more rows than cols
            var symmetric = addCols(props.matrix.length - props.matrix[0].length, false);
            
        } else if (props.matrix.length < props.matrix[0].length) {
            symmetric = addRows(props.matrix[0].length - props.matrix.length, false);
            
        } //else rows == cols

        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                symmetric[row][col] = symmetric[col][row];
            }
        }
    
        props.setMatrix(symmetric, props.name); 
    }

    function transpose() {
        setShowActions(false);

        var transposed = Array(props.matrix[0].length).fill([]);
        
        for (var i = 0; i < transposed.length; i++) {
            var arr = Array(props.matrix.length).fill(0)
            for (var j = 0; j < arr.length; j++)
                arr[j] = props.matrix[j][i];
            transposed[i] = arr;       
        }

        props.setMatrix(transposed, props.name); 
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
            
            props.setMatrix(tempMatrix, props.name);
        }
        else {
            alert("Invalid range")
        }
        

    }


    function reshapeMatrix() {
        var currentMatrix = props.matrix;
        const numElements = (currentMatrix.length - 1) * (currentMatrix[0].length - 1);
        
        var rowCount = reshapeRows;
        var colCount = reshapeCols;

        if (rowCount === NaN && colCount === NaN) {
            alert("Enter rows and columns to reshape");
        } else if (rowCount !== NaN) {
            if (numElements % rowCount !== 0) {
                alert("Invalid number of rows");
                return;
            }
            
            colCount = numElements / rowCount;
        } else if (colCount !== NaN) {
            if (numElements % colCount !== 0) {
                alert("Invalid number of columns");
                return;
            }
            
            rowCount = numElements / colCount;
        } else {
            if (numElements !== colCount * rowCount) {
                alert("Invalid dimensions for matrix")
                return;
            }
        }


        var reshaped = Array(rowCount + 1).fill().map(()=>Array(colCount + 1).fill(""))

        var reshapedI = 0;
        var reshapedJ = 0;


        for (var i = 0; i < currentMatrix.length - 1; i++)
            for (var j = 0; j < currentMatrix[0].length - 1; j++) {
                reshaped[reshapedI][reshapedJ] = currentMatrix[i][j];

                if (reshapedJ >= reshaped[0].length - 2) {
                    reshapedJ = 0;
                    reshapedI++;
                } else {
                    reshapedJ++;
                }
            }

        props.setMatrix(reshaped, props.name);

    }

    function fillEmpty() {
        setShowActions(false);

        var tempMatrix = [...props.matrix];
       
        for (var i = 0; i < tempMatrix.length - 1; i++)
            for (var j = 0; j < tempMatrix[0].length - 1; j++) {
                if (tempMatrix[i][j] === "")
                    tempMatrix[i][j] = fillEmptyWithThis;
            }
        
        props.setMatrix(tempMatrix, props.name);
    }




    return (
    <div className = "matrixEditor">
        <div id = "options" className = "options">
            <div className = "options-bar">
                <button id = "toggleActions" className = {"btn matrixButtons " + (showActions ? "btn-info" : "btn-secondary" )}  onClick = {toggleActions}> {showActions ? "Hide Actions" : "Show Actions"}</button> 

                <button id = "toggleMath" className = {"btn matrixButtons " + (showMath ? "btn-info" : "btn-secondary" )} onClick={toggleMath}>                
                    {showMath ? "Close Math Input" : "Perform Matrix Math"}
                </button>
                
                <button id = "toggleImport" className = {"btn matrixButtons " + (showImport ? "btn-info" : "btn-secondary" )} onClick={toggleImport}>
                    {showImport ? "Close Import" : "Import Matrix From Text"}
                </button>
                <button id = "toggleExport" className = {"btn matrixButtons " + (showExport ? "btn-info" : "btn-secondary" )} onClick={toggleExport}>
                    {showExport ? "Close Export" : "Export Matrix"}
                </button>

            </div>


            {showActions ? 
                <MatrixActions 
                    transpose = {transpose}
                    mirrorRowsOntoColumns = {mirrorRowsOntoColumns}
                    mirrorColumnsOntoRows = {mirrorColumnsOntoRows}
                    updateParameter = {updateParameter}
                    fillEmpty = {fillEmpty}
                    fillEmptyWithThis = {fillEmptyWithThis}
                    randomMatrix = {randomMatrix}
                    reshapeMatrix = {reshapeMatrix}
                    randomHigh = {randomHigh}
                    randomLow = {randomLow} 
                    reshapeRows = {reshapeRows}
                    reshapeCols = {reshapeCols}/>
            : null}
            
            {showMath ?
                <MatrixMath 
                    matrices = {props.matrices}
                    matrix = {props.matrix}
                    setMatrix = {props.setMatrix}
                    sparseVal = {props.sparseVal}/>
            : null } 
                    
            {showExport ?
                <MatrixExport 
                    matrix = {props.matrix}
                    sparseVal = {props.sparseVal}/>
            : null }   

            {showImport ? 
                <TextImport
                    generateUniqueName = {props.generateUniqueName}
                    setMatrix = {props.setMatrix}
                    currentName = {props.name}/> 
            : null}


            

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
