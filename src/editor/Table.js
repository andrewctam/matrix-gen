import React from 'react';
import Box from './Box.js';

import "./Table.css";

function Table(props) {
    function addRow(row, col, updated) {
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows + 1, cols)

            var tempMatrix = props.addRowsAndCols(max - rows, max - cols, false);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = props.addRows(1, false);
        }

        props.updateEntry(row, col, updated, tempMatrix);
    }

    function addCol(row, col, updated) {
        
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows, cols + 1)

            var tempMatrix = props.addRowsAndCols(max - rows, max - cols, false);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = props.addCols(1, false);
        }

        props.updateEntry(row, col, updated, tempMatrix);
    }


    function addBoth(row, col, updated) {
        if (props.mirror) {
            var cols = props.matrix[0].length;
            var rows = props.matrix.length
            var max = Math.max(rows + 1, cols + 1);

            var tempMatrix = props.addRowsAndCols(max - rows, max - cols, false);
            tempMatrix[col][row] = updated;

        } else {
            tempMatrix = props.addRowsAndCols(1, 1, false);
        }

        props.updateEntry(row, col, updated, tempMatrix);
    }

    function keyDown(row, col, e) {
        if (e.keyCode === 16) { //shift
            if (props.matrix.length === (row + 1))
                props.addRows(1);
            if (props.matrix[0].length === (col + 1))
                props.addCols(1);
            }

        if (e.keyCode === 8 && e.target.value === "") { //delete
           props.tryToDelete(row, col); 
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
                        addRow = {addRow} 
                        addCol = {addCol}
                        addBoth = {addBoth}
                        keyDown = {keyDown}
                        updateEntry = {props.updateEntry}

                        rows = {rows}
                        cols = {cols}
                        row = {i} 
                        col = {j}
                        val = {props.matrix[i][j]} 
                        key = {i + ";" + j}
                />
        }

        tableRows[i] = <tr key = {"row" + i}>{eachRow}</tr>
    }

    return <table className = "table table-bordered" >
        <tbody>{tableRows}</tbody>
    </table>

;
}

export default Table;