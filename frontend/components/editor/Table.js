import styles from "./Table.module.css"
import { useCallback, useState } from 'react';

import Box from './Box.js'; 

import { addRows, addCols, addRowsAndCols, updateEntry, tryToDelete, cloneMatrix} from '../matrixFunctions.js';

const Table = (props) => {
    const [showHelpers, setShowHelpers] = useState(window.innerWidth > 576 && props.firstVisit);

    //add Row/Col/Both and update matrix[row][col]
    const addRow = useCallback((row, col, updated) => {
        var clone = cloneMatrix(props.matrix);
        if (props.mirror) {
            const cols = clone[0].length;
            const rows = clone.length
            const max = Math.max(rows + 1, cols)

            clone = addRowsAndCols(clone, max - rows, max - cols);
            clone[col][row] = updated;
        } else {
            clone = addRows(clone, 1);
        }
        props.updateBoxesSelected(row, col, row, col);
        props.updateMatrix(props.name, updateEntry(clone, row, col, updated));
        setShowHelpers(false)

    }, [props.matrix, props.mirror, props.name, props.updateMatrix]);

    const addCol = useCallback((row, col, updated) => {
        var clone = cloneMatrix(props.matrix);
        if (props.mirror) {
            const cols = clone[0].length;
            const rows = clone.length
            const max = Math.max(rows, cols + 1)

            clone = addRowsAndCols(clone, max - rows, max - cols);
            tempMatrix[col][row] = updated;
        } else {
            clone = addCols(clone, 1);
        }
        props.updateBoxesSelected(row, col, row, col);
        props.updateMatrix(props.name, updateEntry(clone, row, col, updated));
        setShowHelpers(false)
    }, [props.matrix, props.mirror, props.name, props.updateMatrix])


    const addBoth = useCallback((row, col, updated) => {
        var clone = cloneMatrix(props.matrix)

        if (props.mirror) {
            const cols = clone[0].length;
            const rows = clone.length
            const max = Math.max(rows + 1, cols + 1);

            clone = addRowsAndCols(clone, max - rows, max - cols);
            tempMatrix[col][row] = updated;

        } else {
            clone = addRowsAndCols(clone, 1, 1);
        }
        props.updateBoxesSelected(row, col, row, col);
        props.updateMatrix(props.name, updateEntry(clone, row, col, updated));
        setShowHelpers(false)

    }, [props.matrix, props.mirror, props.name, props.updateMatrix])

    const update = useCallback((row, col, updated) => {
        var clone = cloneMatrix(props.matrix)
        props.updateMatrix(props.name, updateEntry(clone, row, col, updated));
        setShowHelpers(false)
    }, [props.matrix, props.name, props.updateMatrix])

    const keyDown = useCallback((row, col, e) => {
        if (e.keyCode === 16) { //shift
            if (props.matrix.length === (row + 1) && props.matrix[0].length === (col + 1)) //add botj
                props.updateMatrix(props.name, addRowsAndCols(props.matrix, 1, 1))
            else if (props.matrix.length === (row + 1)) //add row
                props.updateMatrix(props.name, addRows(props.matrix, 1))
            else if (props.matrix[0].length === (col + 1)) //add col
                props.updateMatrix(props.name, addCols(props.matrix, 1))

        } else if (e.keyCode === 8 && e.target.value === "") { //delete
            const result = tryToDelete(props.matrix, row, col)

            if (result)
                props.updateMatrix(props.name, result); 

        } else if (e.target.selectionStart === 0 && e.keyCode === 37)  { //Left
            e.preventDefault();

            if (col !== 0) {
                document.getElementById((row) + ":" + (col - 1)).focus();
                document.getElementById((row) + ":" + (col - 1)).selectionStart = 0;

            } 
            else if (row !== 0) {  //Wrap
                document.getElementById((row - 1) + ":" + (props.matrix[0].length - 1)).focus();
            }
        } 
        
        else if (e.target.selectionStart === e.target.value.length && e.keyCode === 39) { //Right
            e.preventDefault();

            if (col !== props.matrix[0].length - 1) { 
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } else if (row !== props.matrix.length - 1) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        }

        else if (e.keyCode === 40) { //Down
            e.preventDefault();

            if (row !== props.matrix.length - 1) {
                document.getElementById((row + 1) +  ":" + (col) ).focus();
            } 
            else if (col !== props.matrix[0].length - 1) { //Wrap
                document.getElementById("0:" + (col + 1)).focus();
            }

        } else if (e.keyCode === 38) { //Up
            e.preventDefault();

            if (row !== 0) {     
                document.getElementById(row - 1 + ":" + col).focus();
            } 
            else if (col !== 0) { //Wrap
                document.getElementById(props.matrix.length - 1 +  ":" + (col - 1)).focus();
            }
        }

        
    }, [props.matrix, props.name, props.updateMatrix])


    const inSelection = (x, y) => {       
        let x1 = props.boxSelectionStart["x"]
        let y1 = props.boxSelectionStart["y"]
        let x2 = props.boxSelectionEnd["x"]
        let y2 = props.boxSelectionEnd["y"]

        let minX = Math.min(x1, x2)
        let maxX = Math.max(x1, x2)
        let minY = Math.min(y1, y2)
        let maxY = Math.max(y1, y2)

        return (minX <= x && x <= maxX &&
                minY <= y && y <= maxY)
    }

    const cols = Math.min(50, props.matrix[0].length);
    const rows = Math.min(50, props.matrix.length);

    const tableRows = Array(rows).fill(Array(cols));
    
    for (let i = 0; i < rows; i++) {
        const eachRow = Array(cols);

        for (let j = 0; j < cols; j++) {   
            eachRow[j] = <Box 
                        name = {props.name}
                        numbersOnly = {props.numbersOnly}
                        darkModeTable = {props.darkModeTable}

                        addRow = {addRow} 
                        addCol = {addCol}
                        addBoth = {addBoth}
                        update = {update}
                        keyDown = {keyDown}
                        updateBoxesSelected = {props.updateBoxesSelected}

                        rows = {props.matrix.length}
                        cols = {props.matrix[0].length}
                        row = {i} 
                        col = {j}
                        val = {props.matrix[i][j]} 
                        key = {i + ";" + j}

                        boxSelected = {props.selectable ? inSelection(i, j) : false}
                        mouseDown = {props.mouseDown} 
                />
        }

        tableRows[i] = <tr key = {"row" + i} className = {styles.tableRow}>{eachRow}</tr>
    }

    return (
        <div className = {"d-flex justify-content-center" } id = "hide" onClick = {(e) => {
            if (e.target.id === "hide") {
                props.updateBoxesSelected(-1, -1, -1, -1, true);
            } 
        }}>

            {showHelpers ? 
            <div className = {"d-flex justify-content-end " + styles.helperLeft}>
                <div className = {styles.helperTextLeft + " d-flex"}>
                    <div>Type in a white box to update an entry</div>
                    <div className = {styles.arrowLeft}>&#8594;</div>
                </div>
            </div> : null}

            
            <div className = {"d-flex " + styles.tableContainer}>
                <table className = {"table " + styles.matrixTable}>
                    <tbody>{tableRows}</tbody>
                </table> 
            </div>

            {showHelpers ? 
            <div className = {"d-flex " + styles.helperRight}>
                    <div className = {styles.helperTextRight + " d-flex"}>
                        <div className = {styles.arrowRight}> &#8592;</div>
                    <div>Type in a red box to add a row or column</div>
                </div>
            </div> : null}

        </div>
    )
}

export default Table;