import React from 'react';
import Box from './Box.js'; 

import styles from "./Table.module.css"

import { addRows, addCols, addRowsAndCols, updateEntry, tryToDelete} from '../matrixFunctions.js';
const Table = (props) => {
    //add Row/Col/Both and update matrix[row][col]
    const addRow = (row, col, updated) => {
        if (props.mirror) {
            const cols = props.matrix[0].length;
            const rows = props.matrix.length
            const max = Math.max(rows + 1, cols)

            var tempMatrix = addRowsAndCols(props.matrix, max - rows, max - cols);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = addRows(props.matrix, 1);
        }

        props.setMatrix(props.name, updateEntry(tempMatrix, row, col, updated));
    }

    const addCol = (row, col, updated) => {
        
        if (props.mirror) {
            const cols = props.matrix[0].length;
            const rows = props.matrix.length
            const max = Math.max(rows, cols + 1)

            var tempMatrix = addRowsAndCols(props.matrix, max - rows, max - cols);
            tempMatrix[col][row] = updated;
        } else {
            tempMatrix = addCols(props.matrix, 1);
        }

        props.setMatrix(props.name, updateEntry(tempMatrix, row, col, updated));
    }


    const addBoth = (row, col, updated) => {
        if (props.mirror) {
            const cols = props.matrix[0].length;
            const rows = props.matrix.length
            const max = Math.max(rows + 1, cols + 1);

            var tempMatrix = addRowsAndCols(props.matrix, max - rows, max - cols);
            tempMatrix[col][row] = updated;

        } else {
            tempMatrix = addRowsAndCols(props.matrix, 1, 1);
        }

        props.setMatrix(props.name, updateEntry(tempMatrix, row, col, updated));
    }

    const update = (row, col, updated) => {
        props.setMatrix(props.name, updateEntry(props.matrix, row, col, updated));
    }

    const keyDown = (row, col, e) => {
        if (e.keyCode === 16) { //shift
            if (props.matrix.length === (row + 1) && props.matrix[0].length === (col + 1)) //add botj
                props.setMatrix(props.name, addRowsAndCols(props.matrix, 1, 1))
            else if (props.matrix.length === (row + 1)) //add row
                props.setMatrix(props.name, addRows(props.matrix, 1))
            else if (props.matrix[0].length === (col + 1)) //add col
                props.setMatrix(props.name, addCols(props.matrix, 1))

        } else if (e.keyCode === 8 && e.target.value === "") { //delete
            const result = tryToDelete(props.matrix, row, col)

            if (result)
                props.setMatrix(props.name, ); 

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
            if (props.col !== props.matrix[0].length - 1) { 
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } 
            else if (row !== props.matrix.length - 1) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        }

        else if (e.keyCode === 40) { //Down

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

    const inSelection = (x, y) => {
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

    const cols = props.matrix[0].length;
    const rows = props.matrix.length;

    const tableRows = Array(rows).fill(Array(cols));

    
    for (let i = 0; i < rows; i++) {
        const eachRow = Array(cols);

        for (let j = 0; j < cols; j++) {   
            eachRow[j] = <Box 
                        name = {props.name}
                        numbersOnly = {props.numbersOnly}
                        addRow = {addRow} 
                        addCol = {addCol}
                        addBoth = {addBoth}
                        update = {update}
                        
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

        tableRows[i] = <tr key = {"row" + i} className = {styles.tableRow}>{eachRow}</tr>
    }

    return <table className = {"table table-bordered " + styles.matrixTable}>
        <tbody>{tableRows}</tbody>
    </table>

;
}

export default Table;