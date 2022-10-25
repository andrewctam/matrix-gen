import styles from "./Table.module.css"
import { useCallback, useEffect, useState } from 'react';

import Box from './Box.js';

import { editSelection } from '../../matrixFunctions.js';

const Table = (props) => {
    const [showHelpers, setShowHelpers] = useState(false);

    useEffect(() => {
        if (window.innerWidth > 576 && localStorage.getItem("First Visit") === null) {
            setShowHelpers(true)
        }
    }, []);

    //add Row/Col/Both and update matrix[row][col]
    const addRowCol = useCallback((row, col, updated, type) => {
        setShowHelpers(false)

        props.boxSelectionDispatch({ //select this box
            type: "SET_BOTH", payload: {
                start: { x: row, y: col },
                end: { x: row, y: col }
            }
        });

        props.matrixDispatch({ "type": type, payload: { "name": props.name, "row": row, "col": col, "updated": updated } })
    }, [props.name]);

    const update = useCallback((row, col, updated) => {
        setShowHelpers(false)
        props.matrixDispatch({ "type": "UPDATE_ENTRY", payload: { "name": props.name, "row": row, "col": col, "updated": updated } });

    }, [props.name]);

    const backspaceSelection = (e) => {
        if (e.keyCode !== 8 || !props.settings["Disable Selection"])
            return

        if (props.boxSelection && ( //only delete if there is a selection larger than 1x1
            props.boxSelection.start.x !== props.boxSelection.end.x ||
            props.boxSelection.start.y !== props.boxSelection.end.y)) {

            e.preventDefault();

            props.matrixDispatch({
                "type": "UPDATE_MATRIX", payload: {
                    "name": props.name, "matrix":
                        editSelection(props.matrix, 8,
                            props.boxSelection.start.x,
                            props.boxSelection.start.y,
                            props.boxSelection.end.x,
                            props.boxSelection.end.y)
                }
            });
        }
    }

    const keyDown = useCallback((row, col, e) => {
        const lastRow = row === props.matrix.length - 1
        const lastCol = col === props.matrix[0].length - 1

        //shift
        if (e.keyCode === 16) { 
            if (lastRow && lastCol) //add both
                addBoth(row, col, "");
            else if (lastRow) //add row
                addRow(row, col, "");
            else if (lastCol) //add col
                addCol(row, col, "");

        }

        //enter
        else if (e.keyCode === 13) {
            e.preventDefault();
            if (lastRow && lastCol) { //add both if just on corner box
                addBoth(row + 1, col + 1, "");
            } else if (lastCol) { //add row at this pos
                if (e.metaKey) {
                    props.matrixDispatch({ "type": "ADD_ROW", payload: { "name": props.name, "row": row, "col": col, "updated": "", "pos": row } })
                    document.getElementById((row + 1) + ":" + (col)).focus();
                } else {
                    props.matrixDispatch({ "type": "ADD_ROW", payload: { "name": props.name, "row": row, "col": col, "updated": "", "pos": row + 1} })
                }
            } else if (lastRow) { //add col at this pos
                if (e.metaKey) {
                    props.matrixDispatch({ "type": "ADD_COL", payload: { "name": props.name, "row": row, "col": col, "updated": "", "pos": col } })
                    document.getElementById((row) + ":" + (col + 1)).focus();
                } else {
                    props.matrixDispatch({ "type": "ADD_COL", payload: { "name": props.name, "row": row, "col": col, "updated": "", "pos": col + 1} })
                }
            }
        }

        //backspace            
        else if (e.keyCode === 8) { 
            if (lastRow && lastCol) {//delete both
                if (props.matrix.length === 2 && col > 1) {//2 rows, so delete columns
                    props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "col": col - 1 } })

                    document.getElementById((row) + ":" + (col - 1)).focus();
                } else if (props.matrix[0].length === 2 && row > 1) { //2 cols, so delete rows
                    props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "row": row - 1 } })
                    document.getElementById((row - 1) + ":" + (col)).focus();

                } else if (row > 1 && col > 1) { //delete both
                    props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "row": row - 1, "col": col - 1 } })
                    document.getElementById((row - 1) + ":" + (col - 1)).focus();
                }

            } else if (lastCol) {//last col
                if (e.metaKey) { //delete this row
                    if (props.matrix.length > 2)
                        props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "row": row } })
                    if (row > 0)
                        document.getElementById((row - 1) + ":" + (col)).focus();
                } else { //delete last col
                    if (props.matrix[0].length > 2) {
                        props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "col": col - 1 } })
                        document.getElementById((row) + ":" + (col - 1)).focus();
                    }
                }
            } else if (lastRow) { //last row
                if (e.metaKey) { //delete this col
                    if (props.matrix[0].length > 2)
                        props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "col": col } })
                    if (col > 0)
                        document.getElementById((row) + ":" + (col - 1)).focus();
                } else { //delete last row
                    if (props.matrix.length > 2) {
                        props.matrixDispatch({ "type": "DELETE_ROW_COL", payload: { "name": props.name, "row": row - 1 } })
                        document.getElementById((row - 1) + ":" + (col)).focus();
                    }
                }
            } else {
                return; //don't prevent default
            }

            e.preventDefault();
        }

        //Left arrow
        else if (e.target.selectionStart === 0 && e.keyCode === 37) { 
            e.preventDefault();

            if (col !== 0) {
                document.getElementById((row) + ":" + (col - 1)).focus();
                document.getElementById((row) + ":" + (col - 1)).selectionStart = 0;
            } else if (row !== 0) {  //Wrap
                document.getElementById((row - 1) + ":" + (props.matrix[0].length - 1)).focus();
            }
        }

        //Right arrow
        else if (e.target.selectionStart === e.target.value.length && e.keyCode === 39) { 
            e.preventDefault();

            if (!lastCol) {
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } else if (!lastRow) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        }

        //Down arrow
        else if (e.keyCode === 40) { 
            e.preventDefault();

            if (!lastRow) {
                document.getElementById((row + 1) + ":" + (col)).focus();
            } else if (!lastCol) { //Wrap
                document.getElementById("0:" + (col + 1)).focus();
            }
        }

        //Up arrow
        else if (e.keyCode === 38) { 
            e.preventDefault();

            if (row !== 0) {
                document.getElementById(row - 1 + ":" + col).focus();
            } else if (col !== 0) { //Wrap
                document.getElementById(props.matrix.length - 1 + ":" + (col - 1)).focus();
            }
        }
    }, [props.name, props.matrix.length, props.matrix[0].length]); //don't care about the matrix itself for this function. resizing will cause an entire rerender, but that is ok since it is infrequent

    useEffect(() => { //if the user changed a box and they have a selection, update the entire selection
        if (props.lastValue !== null && !props.settings["Disable Selection"] && props.boxSelection &&
            (props.boxSelection.start.x !== props.boxSelection.end.x || props.boxSelection.start.y !== props.boxSelection.end.y) &&
            props.lastValue !== props.matrix[props.boxSelection.start.x][props.boxSelection.start.y]) {

            const updated = props.matrix[props.boxSelection.start.x][props.boxSelection.start.y]

            const lenDiff = updated.length - props.lastValue.length;

            if (lenDiff <= 0)
                return;

            let difference = "";
            for (let i = 0; i < updated.length; i++) {
                if (updated.charAt(i) !== props.lastValue.charAt(i)) {
                    difference = updated.substring(i, i + lenDiff);
                    break;
                }
            }

            const edited = editSelection(props.matrix, difference, props.boxSelection.start.x,
                props.boxSelection.start.y,
                props.boxSelection.end.x,
                props.boxSelection.end.y)

            edited[props.boxSelection.start.x][props.boxSelection.start.y] = updated;


            props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: { "name": props.name, "matrix": edited } });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lastValue, props.boxSelection, props.matrix, props.name, props.matrixDispatch])

    const inSelection = (x, y) => {
        if (props.boxSelection === null)
            return false;
        let x1 = props.boxSelection.start.x
        let y1 = props.boxSelection.start.y
        let x2 = props.boxSelection.end.x
        let y2 = props.boxSelection.end.y

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
                name={props.name}
                settings={props.settings}

                addRowCol={addRowCol}
                update={update}
                keyDown={keyDown}

                boxSelectionDispatch={props.boxSelectionDispatch}

                rows={props.matrix.length}
                cols={props.matrix[0].length}
                row={i}
                col={j}
                val={props.matrix[i][j]}
                key={i + ";" + j}

                boxSelected={!props.settings["Disable Selection"] ? inSelection(i, j) : false}
                mouseDown={props.mouseDown}
            />
        }

        tableRows[i] = <tr key={"row" + i} className={styles.tableRow}>{eachRow}</tr>
    }

    return (
        <div className={"d-flex justify-content-center"} id="hide"
            onClick={(e) => {
                if (e.target.id === "hide") {
                    props.boxSelectionDispatch({ "type": "CLEAR" });
                }
            }}
            onKeyDown={backspaceSelection}>

            {showHelpers ?
                <div className={"d-flex justify-content-end " + styles.helperLeft}>
                    <div className={styles.helperTextLeft + " d-flex"}>
                        <div>Type in a white box to update an entry</div>
                        <div className={styles.arrowLeft}>&#8594;</div>
                    </div>
                </div> : null}


            <div className={"d-flex " + styles.tableContainer}>
                <table className={"table " + styles.matrixTable}>
                    <tbody>{tableRows}</tbody>
                </table>
            </div>

            {showHelpers ?
                <div className={"d-flex " + styles.helperRight}>
                    <div className={styles.helperTextRight + " d-flex"}>
                        <div className={styles.arrowRight}> &#8592;</div>
                        <div>Type in a red box to add a row or column</div>
                    </div>
                </div> : null}

        </div>
    )
}

export default Table;