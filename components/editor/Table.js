import React from 'react';
import Box from './Box.js'; 

import styles from "./Table.module.css"

function Table(props) {


    //add Row/Col/Both and update matrix[row][col]
    function addRow(row, col, updated) {
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows + 1, cols)

            var tempMatrix = props.addRowsAndCols(props.name, max - rows, max - cols, false);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = props.addRows(props.name, 1, false);
        }

        props.updateEntry(props.name, row, col, updated, tempMatrix);
    }

    function addCol(row, col, updated) {
        
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows, cols + 1)

            var tempMatrix = props.addRowsAndCols(props.name, max - rows, max - cols, false);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = props.addCols(props.name, 1, false);
        }

        props.updateEntry(props.name, row, col, updated, tempMatrix);
    }


    function addBoth(row, col, updated) {
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows + 1, cols + 1);

            var tempMatrix = props.addRowsAndCols(props.name, max - rows, max - cols, false);
            tempMatrix[col][row] = updated;

        } else {
            tempMatrix = props.addRowsAndCols(props.name, 1, 1, false);
        }

        props.updateEntry(props.name, row, col, updated, tempMatrix);
    }

    function keyDown(row, col, e) {
        if (e.keyCode === 16) { //shift
            if (props.matrix.length === (row + 1) && props.matrix[0].length === (col + 1))
                props.addRowsAndCols(props.name, 1, 1)
            else if (props.matrix.length === (row + 1))
                props.addRows(props.name, 1);
            else if (props.matrix[0].length === (col + 1))
                props.addCols(props.name, 1);
        } else if (e.keyCode === 8 && e.target.value === "") { //delete
           props.tryToDelete(props.name, row, col); 
        } else if (e.target.selectionStart === 0 && e.keyCode === 37)  { //Left
            if (col !== 0) {
                document.getElementById((row) + ":" + (col - 1)).focus();
                document.getElementById((row) + ":" + (col - 1)).selectionStart = 0;

            } 
            else if (row !== 0) {  //Wrap
                document.getElementById((row - 1) + ":" + (props.matrix[0].length - 1)).focus();
            }
        } 
        
        else if (e.target.selectionStart === e.target.value.length && e.keyCode === 39) { //Right
            //skip the last col if you aren't on the first row/
            /*
            if (props.col === props.cols - 2 && props.row !== 0 && props.row !== props.rows - 1) { 
                document.getElementById((props.row + 1) + ":0").focus();
                document.getElementById((props.row + 1) + ":0").selectionStart = 0;

            } 
            else */
            if (props.col !== props.matrix[0].length - 1) { 
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } 
            else if (row !== props.matrix.length - 1) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        }

        else if (e.keyCode === 40) { //Down
            /*
            if (props.row === props.rows - 2 && props.col !== 0 && props.col !== props.cols - 1) { //skip the last one if you aren't  on the first col
                document.getElementById("0:" + (props.col + 1)).focus();
            }
            else */
            if (row !== props.matrix.length - 1) {
                document.getElementById((row + 1) +  ":" + (col) ).focus();
            } 
            else if (col !== props.matrix[0].length - 1) { //Wrap
                document.getElementById("0:" + (col + 1)).focus();
            }

        } else if (e.keyCode === 38) { //Up
            if (row !== 0) {     
                document.getElementById(row - 1 + ":" + col).focus();
            } 
            else if (col !== 0) { //Wrap
                document.getElementById(props.matrix.length - 1 +  ":" + (col - 1)).focus();
            }
        }
    }

    function inSelection(x, y) {
        switch(props.boxesSelected["quadrant"]) {
            case -1:
                return false;

            case 1:
                return props.boxesSelected["startX"] <= x && x <= props.boxesSelected["endX"] &&
                       props.boxesSelected["startY"] <= y && y <= props.boxesSelected["endY"];
            case 2:
                return props.boxesSelected["endX"] <= x && x <= props.boxesSelected["startX"] &&
                       props.boxesSelected["startY"] <= y && y <= props.boxesSelected["endY"];
            case 3:
                return props.boxesSelected["endX"] <= x && x <= props.boxesSelected["startX"] &&
                       props.boxesSelected["endY"] <= y && y <= props.boxesSelected["startY"];
            case 4:
                return props.boxesSelected["startX"] <= x && x <= props.boxesSelected["endX"] &&
                       props.boxesSelected["endY"] <= y && y <= props.boxesSelected["startY"];

            default: return false;
        }
    }

    var cols = props.matrix[0].length;
    var rows = props.matrix.length;

    var tableRows = Array(rows).fill(Array(cols));
    var eachRow;

    var limitRows = Math.min(50, rows);
    var limitCols = Math.min(50, cols);

    
    for (var i = 0; i < limitRows; i++) {
        eachRow = Array(cols);

        for (var j = 0; j < limitCols; j++) {   
            eachRow[j] = <Box 
                        name = {props.name}
                        addRow = {addRow} 
                        addCol = {addCol}
                        addBoth = {addBoth}
                        updateEntry = {props.updateEntry}
                        
                        keyDown = {keyDown}
                        updateBoxesSelected = {props.updateBoxesSelected}

                        rows = {rows}
                        cols = {cols}
                        row = {i} 
                        col = {j}
                        val = {props.matrix[i][j]} 
                        key = {i + ";" + j}

                        boxSelected = {props.selectable ? inSelection(i, j) : false}
                        setMouseDown = {props.setMouseDown}
                        mouseDown = {props.mouseDown} 
                />
        }

        tableRows[i] = <tr key = {"row" + i} className = {styles.tableRow}> {eachRow} </tr>
    }

    return <table className = {"table table-bordered " + styles.matrixTable}>
        <tbody>{tableRows}</tbody>
    </table>

;
}

export default Table;