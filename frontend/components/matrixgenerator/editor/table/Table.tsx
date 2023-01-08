import styles from "./Table.module.css"
import React, { useCallback, useEffect, useState } from 'react';
import { editSelection } from '../../../matrixFunctions';
import Box from './Box';
import { Settings } from "../../../App";
import { BoxSelection, BoxSelectionAction } from "../MatrixEditor";
import { addCol, addRow, addRowAndCol, deleteRowCol, updateEntry, updateMatrix } from "../../../../features/matrices-slice";
import { useAppDispatch } from "../../../../hooks/hooks";

interface TableProps {
    settings: Settings
    name: string
    matrix: string[][]
    boxSelectionDispatch: React.Dispatch<BoxSelectionAction>
    boxSelection: BoxSelection
    mouseDown: React.MutableRefObject<boolean>
    lastValue: string | null
}

const Table = (props: TableProps) => {
    const matrixDispatch = useAppDispatch();

    const [showHelpers, setShowHelpers] = useState(false);

    useEffect(() => {
        if (window.innerWidth > 576 && localStorage.getItem("First Visit") === null) {
            setShowHelpers(true)
        }
    }, []);

    //add Row/Col/Both and update matrix[row][col]
    const addRowCol = useCallback((row: number, col: number, updated: string, type: "ADD_ROW" | "ADD_COL" | "ADD_ROW_AND_COL") => {
        setShowHelpers(false)

        props.boxSelectionDispatch({ //select this box
            type: "SET_BOTH", payload: {
                start: { x: row, y: col },
                end: { x: row, y: col }
            }
        });
        switch (type) {
            case "ADD_ROW":
                matrixDispatch(addRow({ "name": props.name, "row": row, "col": col, "updated": updated, "mirror": props.settings["Mirror Inputs"] }))
                break;
            case "ADD_COL":
                matrixDispatch(addCol({ "name": props.name, "row": row, "col": col, "updated": updated, "mirror": props.settings["Mirror Inputs"]}))
                break;
            case "ADD_ROW_AND_COL":
                matrixDispatch(addRowAndCol({ "name": props.name, "row": row, "col": col, "updated": updated, "mirror": props.settings["Mirror Inputs"]}))
                break;
        }

    }, [props.name]);

    const update = useCallback((row: number, col: number, updated: string) => {
        setShowHelpers(false)
        matrixDispatch(updateEntry({
            "name": props.name,
            "row": row,
            "col": col,
            "updated": updated,
            "mirror": props.settings["Mirror Inputs"]
        }))

    }, [props.name]);

    const backspaceSelection = (e: React.KeyboardEvent) => {
        if (e.key !== "Backspace" || props.settings["Disable Selection"])
            return
            

        if (props.boxSelection && ( //only delete if there is a selection larger than 1x1
            props.boxSelection.start.x !== props.boxSelection.end.x ||
            props.boxSelection.start.y !== props.boxSelection.end.y)) {

            e.preventDefault();

            let matrix = editSelection(props.matrix, 8,
                            props.boxSelection.start.x,
                            props.boxSelection.start.y,
                            props.boxSelection.end.x,
                            props.boxSelection.end.y)

            matrixDispatch(updateMatrix({"name": props.name, "matrix": matrix}))
        }
    }

    const keyDown = useCallback((row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const lastRow = row === props.matrix.length - 1
        const lastCol = col === props.matrix[0].length - 1

       
        //shift
        if (e.key === "Shift") {
            if (lastRow && lastCol) //add both
                matrixDispatch(addRowAndCol({
                    "name": props.name,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "mirror": props.settings["Mirror Inputs"]
                }))
            else if (lastRow) //add row
                matrixDispatch(addRow({
                    "name": props.name,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "pos": row,
                    "mirror": props.settings["Mirror Inputs"]
                }))
            else if (lastCol) //add col
                matrixDispatch(addCol({
                    "name": props.name,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "pos": col,
                    "mirror": props.settings["Mirror Inputs"]
                }))
        }

        //enter
        else if (e.key === "Enter") {
            e.preventDefault();
            if (lastRow && lastCol) { //add both if just on corner box
                matrixDispatch(addRowAndCol({
                    "name": props.name,
                    "row": row + 1,
                    "col": col + 1,
                    "updated": "",
                    "mirror": props.settings["Mirror Inputs"]
                }))
            } else if (lastCol) { //add row at this pos
                if (e.metaKey) {
                    matrixDispatch(addRow({
                        "name": props.name,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": row,
                        "mirror": props.settings["Mirror Inputs"]
                    }))

                    let newRowCell = document.getElementById((row + 1) + ":" + (col))
                    if (newRowCell)
                        newRowCell.focus();
                } else {
                    matrixDispatch(addRow({
                        "name": props.name,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": row + 1,
                        "mirror": props.settings["Mirror Inputs"]
                    }))
                }
            } else if (lastRow) { //add col at this pos
                if (e.metaKey) {
                    matrixDispatch(addCol({
                        "name": props.name,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": col,
                        "mirror": props.settings["Mirror Inputs"]
                    }))
                    let newColCell = document.getElementById((row) + ":" + (col + 1))
                    if (newColCell)
                    newColCell.focus();
                } else {
                    matrixDispatch(addCol({
                        "name": props.name,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": col + 1,
                        "mirror": props.settings["Mirror Inputs"]
                    }))
                }
            }
        }

        //backspace            
        else if (e.key === "Backspace") {
            if (lastRow && lastCol) {//delete both
                if (props.matrix.length === 2 && col > 1) {//2 rows, so delete columns
                    matrixDispatch(deleteRowCol({
                        "name": props.name,
                        "col": col - 1,
                    }))

                    let prevColCell = document.getElementById((row) + ":" + (col - 1))
                    if (prevColCell)
                        prevColCell.focus();
                } else if (props.matrix[0].length === 2 && row > 1) { //2 cols, so delete rows
                   
                    matrixDispatch(deleteRowCol({
                        "name": props.name,
                        "row": row - 1,
                    }))
                    let prevRowCell = document.getElementById((row - 1) + ":" + (col))
                    if (prevRowCell)
                        prevRowCell.focus();

                } else if (row > 1 && col > 1) { //delete both
                    matrixDispatch(deleteRowCol({
                        "name": props.name,
                        "row": row - 1,
                        "col": col - 1,
                    }))
                    let prevCell = document.getElementById((row - 1) + ":" + (col - 1))
                    if (prevCell)
                        prevCell.focus();
                }

            } else if (lastCol) {//last col
                if (e.metaKey) { //delete this row
                    if (props.matrix.length > 2)
                        matrixDispatch(deleteRowCol({
                            "name": props.name,
                            "row": row,
                        }))
                    if (row > 0) {
                        let prevRowCell = document.getElementById((row - 1) + ":" + (col))
                        if (prevRowCell)
                            prevRowCell.focus();
                    }
                } else { //delete last col
                    if (props.matrix[0].length > 2) {       
                        matrixDispatch(deleteRowCol({
                            "name": props.name,
                            "col": col - 1,
                        }))
                        let prevColCell = document.getElementById((row) + ":" + (col - 1))
                        if (prevColCell)
                            prevColCell.focus();
                    }
                }
            } else if (lastRow) { //last row
                if (e.metaKey) { //delete this col
                    if (props.matrix[0].length > 2)   
                        matrixDispatch(deleteRowCol({
                            "name": props.name,
                            "col": col,
                        }))

                    if (col > 0) {
                        let prevColCell = document.getElementById((row) + ":" + (col - 1))
                        if (prevColCell)
                            prevColCell .focus();
                    }
                } else { //delete last row
                    if (props.matrix.length > 2) {
                        matrixDispatch(deleteRowCol({
                            "name": props.name,
                            "row": row - 1,
                        }))

                        let prevRowCell = document.getElementById((row - 1) + ":" + (col))
                        if (prevRowCell) 
                            prevRowCell.focus();
                    }
                }
            } else {
                return; //don't prevent default
            }

            e.preventDefault();
        }

        //Left arrow
        else if ((e.target as HTMLInputElement).selectionStart === 0 && e.key === "ArrowLeft") {
            e.preventDefault();

            if (col !== 0) {
                let input = document.getElementById((row) + ":" + (col - 1)) as HTMLInputElement
                if (input) {
                    input.focus();
                    input.selectionStart = 0;
                }
            } else if (row !== 0) {  //Wrap
                let input = document.getElementById((row - 1) + ":" + (props.matrix[0].length - 1))
                if (input)
                    input.focus();
            }
        }

        //Right arrow
        else if ((e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length && e.key === "ArrowRight") {
            e.preventDefault();

            if (!lastCol) {
                let input = document.getElementById((row) + ":" + (col + 1)) as HTMLInputElement
                if (input) {
                    input.focus();
                    input.selectionStart = -1;
                }

            } else if (!lastRow) { //Wrap
                let input = document.getElementById((row + 1) + ":0")
                if (input)
                    input.focus();
            }
        }

        //Down arrow
        else if (e.key === "ArrowDown") {
            e.preventDefault();

            if (!lastRow) {
                let input = document.getElementById((row + 1) + ":" + (col))
                if (input)
                    input.focus();
            } else if (!lastCol) { //Wrap
                let input = document.getElementById("0:" + (col + 1))
                if (input)
                    input.focus();
            }
        }

        //Up arrow
        else if (e.key === "ArrowUp") {
            e.preventDefault();

            if (row !== 0) {
                let input = document.getElementById(row - 1 + ":" + col)
                if (input)
                    input.focus();
            } else if (col !== 0) { //Wrap
                let input = document.getElementById(props.matrix.length - 1 + ":" + (col - 1))
                if (input)
                    input.focus();
            }
        }
    }, [props.name, props.matrix.length, props.matrix[0].length]); //don't care about the matrix itself for this function. resizing will cause an entire rerender, but that is ok since it is less frequent

    useEffect(() => { //if the user changed a box and they have a selection, update the entire selection
        console.clear()
        console.log(props.lastValue)
        console.log(props.settings["Disable Selection"])
        console.log(props.boxSelection)
        if (props.boxSelection) {
            console.log(props.boxSelection.start.x !== props.boxSelection.end.x || props.boxSelection.start.y !== props.boxSelection.end.y)
            console.log(props.lastValue !== props.matrix[props.boxSelection.start.x][props.boxSelection.start.y])
        }
        if (props.lastValue !== null && !props.settings["Disable Selection"] && props.boxSelection &&
            (props.boxSelection.start.x !== props.boxSelection.end.x || props.boxSelection.start.y !== props.boxSelection.end.y) &&
            props.lastValue !== props.matrix[props.boxSelection.start.x][props.boxSelection.start.y]) {

            const preserveBox = props.matrix[props.boxSelection.start.x][props.boxSelection.start.y]

            const lenDiff = preserveBox.length - props.lastValue.length;

            if (lenDiff <= 0)
                return;

            let difference = "";
            for (let i = 0; i < preserveBox.length; i++) {
                if (preserveBox.charAt(i) !== props.lastValue.charAt(i)) {
                    difference = preserveBox.substring(i, i + lenDiff);
                    break;
                }
            }

            const edited = editSelection(props.matrix, difference, props.boxSelection.start.x,
                props.boxSelection.start.y,
                props.boxSelection.end.x,
                props.boxSelection.end.y)

            edited[props.boxSelection.start.x][props.boxSelection.start.y] = preserveBox;

            matrixDispatch(updateMatrix({ "name": props.name, "matrix": edited }))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lastValue, props.boxSelection, props.matrix, props.name, matrixDispatch])

    const inSelection = (x: number, y: number) => {
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
        <div className={"d-flex justify-content-center"}
            id="hide"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if ((e.target as HTMLDivElement).id === "hide") {
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