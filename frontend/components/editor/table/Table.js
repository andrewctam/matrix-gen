import styles from "./Table.module.css"
import { useCallback, useState } from 'react';

import Box from './Box.js'; 

import { addRows, addCols, addRowsAndCols, updateEntry, deleteRowCol, cloneMatrix, editSelection} from '../../matrixFunctions.js';

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
            clone[col][row] = updated;
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
            clone[col][row] = updated;

        } else {
            clone = addRowsAndCols(clone, 1, 1);
        }
        props.updateBoxesSelected(row, col, row, col);
        props.updateMatrix(props.name, updateEntry(clone, row, col, updated));
        setShowHelpers(false)

    }, [props.matrix, props.mirror, props.name, props.updateMatrix])

    const update = useCallback((row, col, updated) => {
        setShowHelpers(false)

        if (props.selectable && (props.boxSelectionStart["x"] !== props.boxSelectionEnd["x"]) || (props.boxSelectionStart["y"] !== props.boxSelectionEnd["y"])) {
            if (updated.length < props.matrix[row][col].length)
                return;
            
            let difference = "";
            for (let i = 0; i < updated.length; i++) {
                if (updated.charAt(i) !== props.matrix[row][col].charAt(i)) {
                    difference += updated.charAt(i);
                } else if (difference !== "")
                    break; //stop once we have found the first difference
            }
            props.updateMatrix(props.name, editSelection(props.matrix, difference, props.boxSelectionStart["x"], props.boxSelectionStart["y"], props.boxSelectionEnd["x"], props.boxSelectionEnd["y"]));            
        } else {
            var clone = cloneMatrix(props.matrix)
            props.updateMatrix(props.name, updateEntry(clone, row, col, updated, props.mirror));
        }
        
    }, [props.matrix, props.mirror, props.name, props.updateMatrix, props.selectable, props.boxSelectionStart, props.boxSelectionEnd])

    const keyDown = useCallback((row, col, e) => {
        if (e.keyCode === 16) { //shift
            if (props.matrix.length === (row + 1) && props.matrix[0].length === (col + 1)) //add both
                props.updateMatrix(props.name, addRowsAndCols(props.matrix, 1, 1))
            else if (props.matrix.length === (row + 1)) //add row
                props.updateMatrix(props.name, addRows(props.matrix, 1))
            else if (props.matrix[0].length === (col + 1)) //add col
                props.updateMatrix(props.name, addCols(props.matrix, 1))

        } else if (e.keyCode === 8) { //delete
            
            e.preventDefault();
            console.log(props.boxSelectionStart)
            console.log(props.boxSelectionEnd)
            if (props.selectable && (
                props.boxSelectionStart["x"] !== props.boxSelectionEnd["x"] || 
                props.boxSelectionStart["y"] !== props.boxSelectionEnd["y"])) { 

                props.updateMatrix(props.name, editSelection(props.matrix, 8, props.boxSelectionStart["x"], props.boxSelectionStart["y"], props.boxSelectionEnd["x"], props.boxSelectionEnd["y"]));            
                return;
            }

            let result = null
            if (row === props.matrix.length - 1 && col === props.matrix[0].length - 1) {//delete both
                    if (props.matrix.length === 2 && col > 1) {//2 rows, so delete columns
                        result = deleteRowCol(props.matrix, -1, col - 1)
                        document.getElementById((row) + ":" + (col - 1)).focus();
                    } else if (props.matrix[0].length === 2 && row > 1) { //2 cols, so delete rows
                        result = deleteRowCol(props.matrix, row - 1, -1)
                        document.getElementById((row - 1) + ":" + (col)).focus();

                    } else if (row > 1 && col > 1) {  
                        result = deleteRowCol(props.matrix, row - 1, col - 1)
                        document.getElementById((row - 1) + ":" + (col - 1)).focus();
                    }
                
            } else if (col === props.matrix[0].length - 1) {//last col
                if (e.metaKey) { //delete this row
                    if (props.matrix.length > 2)
                        result = deleteRowCol(props.matrix, row, -1)
                    if (row > 0)
                        document.getElementById((row - 1) + ":" + (col)).focus();
                } else { //delete last col
                    if (props.matrix[0].length > 2) {
                        result = deleteRowCol(props.matrix, -1, col - 1)
                        document.getElementById((row) + ":" + (col - 1)).focus();
                    }
                }
            } else if (row === props.matrix.length - 1) { //last row
                if (e.metaKey) { //delete this col
                    if (props.matrix[0].length > 2)
                        result = deleteRowCol(props.matrix, -1, col)
                    if (col > 0)
                        document.getElementById((row) + ":" + (col - 1)).focus();
                } else { //delete last row
                    if (props.matrix.length > 2) {
                        result = deleteRowCol(props.matrix, row - 1, -1)
                        document.getElementById((row - 1) + ":" + (col)).focus();
                    }
                }
            }

            if (result)
                props.updateMatrix(props.name, result); 

        } else if (e.keyCode === 13) {//enter
            e.preventDefault();
            if (props.matrix.length === (row + 1) && props.matrix[0].length === (col + 1)) { //add both if just on corner box
                props.updateMatrix(props.name, addRowsAndCols(props.matrix, 1, 1))
            } else if (col === props.matrix[0].length - 1) { //add row at this pos
                if (e.metaKey) {
                    props.updateMatrix(props.name, addRows(props.matrix, 1, row - 1))
                } else {
                    props.updateMatrix(props.name, addRows(props.matrix, 1, row + 1))
                }
            } else if (row === props.matrix.length - 1) { //add col at this pos
                if (e.metaKey) {
                    props.updateMatrix(props.name, addCols(props.matrix, 1, col - 1))
                } else {
                    props.updateMatrix(props.name, addCols(props.matrix, 1, col + 1))
                }
            }
        } else if (e.target.selectionStart === 0 && e.keyCode === 37)  { //Left
            e.preventDefault();

            if (col !== 0) {
                document.getElementById((row) + ":" + (col - 1)).focus();
                document.getElementById((row) + ":" + (col - 1)).selectionStart = 0;

            } 
            else if (row !== 0) {  //Wrap
                document.getElementById((row - 1) + ":" + (props.matrix[0].length - 1)).focus();
            }
        } else if (e.target.selectionStart === e.target.value.length && e.keyCode === 39) { //Right
            e.preventDefault();

            if (col !== props.matrix[0].length - 1) { 
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } else if (row !== props.matrix.length - 1) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        } else if (e.keyCode === 40) { //Down
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
    }, [props.matrix, props.name, props.updateMatrix, props.boxSelectionStart, props.boxSelectionEnd, props.updateBoxSelectionStart, props.updateBoxSelectionEnd])


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