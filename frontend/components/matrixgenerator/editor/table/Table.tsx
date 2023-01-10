import styles from "./Table.module.css"
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { editSelection } from '../../../matrixFunctions';
import Box from './Box';
import { addCol, addRow, addRowAndCol, deleteRowCol, setBoxSelection, updateEntry, updateMatrix } from "../../../../features/matrices-slice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/hooks";

interface TableProps {
    selection: string
    matrix: string[][]
    backspaceSelection: (e: React.KeyboardEvent) => void
}

const Table = (props: TableProps) => {
    const {boxSelection} = useAppSelector(state => state.matricesData);
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);

    const [showHelpers, setShowHelpers] = useState(false);
    const mouseDown = useRef<boolean>(false);

    useEffect(() => {
        if (window.innerWidth > 576 && localStorage.getItem("First Visit") === null) {
            setShowHelpers(true)
        }
    }, []);

    //add Row/Col/Both and update matrix[row][col]
    const addRowCol = useCallback((row: number, col: number, updated: string, type: "ADD_ROW" | "ADD_COL" | "ADD_ROW_AND_COL") => {
        setShowHelpers(false)

        dispatch(setBoxSelection({
            start: { x: row, y: col },
            end: { x: row, y: col }
        }))
       
        switch (type) {
            case "ADD_ROW":
                dispatch(addRow({ "name": props.selection, "row": row, "col": col, "updated": updated, "mirror": settings["Mirror Inputs"] }))
                break;
            case "ADD_COL":
                dispatch(addCol({ "name": props.selection, "row": row, "col": col, "updated": updated, "mirror": settings["Mirror Inputs"]}))
                break;
            case "ADD_ROW_AND_COL":
                dispatch(addRowAndCol({ "name": props.selection, "row": row, "col": col, "updated": updated, "mirror": settings["Mirror Inputs"]}))
                break;
        }

    }, [props.selection, settings["Mirror Inputs"]]);

    const update = useCallback((row: number, col: number, updated: string) => {
        setShowHelpers(false)
        console.log("1")
        dispatch(updateEntry({
            "name": props.selection,
            "row": row,
            "col": col,
            "updated": updated,
            "mirror": settings["Mirror Inputs"]
        }))

    }, [props.selection, settings["Mirror Inputs"]]);

    

    const keyDown = useCallback((row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const lastRow = row === props.matrix.length - 1
        const lastCol = col === props.matrix[0].length - 1

       
        //shift
        if (e.key === "Shift") {
            if (lastRow && lastCol) //add both
                dispatch(addRowAndCol({
                    "name": props.selection,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "mirror": settings["Mirror Inputs"]
                }))
            else if (lastRow) //add row
                dispatch(addRow({
                    "name": props.selection,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "pos": row,
                    "mirror": settings["Mirror Inputs"]
                }))
            else if (lastCol) //add col
                dispatch(addCol({
                    "name": props.selection,
                    "row": row,
                    "col": col,
                    "updated": "",
                    "pos": col,
                    "mirror": settings["Mirror Inputs"]
                }))
        }

        //enter
        else if (e.key === "Enter") {
            e.preventDefault();
            if (lastRow && lastCol) { //add both if just on corner box
                dispatch(addRowAndCol({
                    "name": props.selection,
                    "row": row + 1,
                    "col": col + 1,
                    "updated": "",
                    "mirror": settings["Mirror Inputs"]
                }))
            } else if (lastCol) { //add row at this pos
                if (e.metaKey) {
                    dispatch(addRow({
                        "name": props.selection,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": row,
                        "mirror": settings["Mirror Inputs"]
                    }))

                    let newRowCell = document.getElementById((row + 1) + ":" + (col))
                    if (newRowCell)
                        newRowCell.focus();
                } else {
                    dispatch(addRow({
                        "name": props.selection,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": row + 1,
                        "mirror": settings["Mirror Inputs"]
                    }))
                }
            } else if (lastRow) { //add col at this pos
                if (e.metaKey) {
                    dispatch(addCol({
                        "name": props.selection,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": col,
                        "mirror": settings["Mirror Inputs"]
                    }))
                    let newColCell = document.getElementById((row) + ":" + (col + 1))
                    if (newColCell)
                    newColCell.focus();
                } else {
                    dispatch(addCol({
                        "name": props.selection,
                        "row": row,
                        "col": col,
                        "updated": "",
                        "pos": col + 1,
                        "mirror": settings["Mirror Inputs"]
                    }))
                }
            }
        }

        //backspace            
        else if (e.key === "Backspace") {
            if (lastRow && lastCol) {//delete both
                if (props.matrix.length === 2 && col > 1) {//2 rows, so delete columns
                    dispatch(deleteRowCol({
                        "name": props.selection,
                        "col": col - 1,
                    }))

                    let prevColCell = document.getElementById((row) + ":" + (col - 1))
                    if (prevColCell)
                        prevColCell.focus();
                } else if (props.matrix[0].length === 2 && row > 1) { //2 cols, so delete rows
                   
                    dispatch(deleteRowCol({
                        "name": props.selection,
                        "row": row - 1,
                    }))
                    let prevRowCell = document.getElementById((row - 1) + ":" + (col))
                    if (prevRowCell)
                        prevRowCell.focus();

                } else if (row > 1 && col > 1) { //delete both
                    dispatch(deleteRowCol({
                        "name": props.selection,
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
                        dispatch(deleteRowCol({
                            "name": props.selection,
                            "row": row,
                        }))
                    if (row > 0) {
                        let prevRowCell = document.getElementById((row - 1) + ":" + (col))
                        if (prevRowCell)
                            prevRowCell.focus();
                    }
                } else { //delete last col
                    if (props.matrix[0].length > 2) {       
                        dispatch(deleteRowCol({
                            "name": props.selection,
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
                        dispatch(deleteRowCol({
                            "name": props.selection,
                            "col": col,
                        }))

                    if (col > 0) {
                        let prevColCell = document.getElementById((row) + ":" + (col - 1))
                        if (prevColCell)
                            prevColCell .focus();
                    }
                } else { //delete last row
                    if (props.matrix.length > 2) {
                        dispatch(deleteRowCol({
                            "name": props.selection,
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
    }, [props.selection, props.matrix.length, props.matrix[0].length, settings["Mirror Inputs"]]); //don't care about the matrix itself for this function. resizing will cause an entire rerender, but that is ok since it is less frequent



    const inBoxSelection = (x: number, y: number) => {
        if (boxSelection === null)
            return false;
        let x1 = boxSelection.start.x
        let y1 = boxSelection.start.y
        let x2 = boxSelection.end.x
        let y2 = boxSelection.end.y

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
                addRowCol={addRowCol}
                update={update}
                keyDown={keyDown}

                rows={props.matrix.length}
                cols={props.matrix[0].length}
                row={i}
                col={j}
                val={props.matrix[i][j]}
                key={i + ";" + j}

                boxSelected={!settings["Disable Selection"] ? inBoxSelection(i, j) : false}
                mouseDown={mouseDown}
            />
        }

        tableRows[i] = <tr key={"row" + i} className={styles.tableRow}>{eachRow}</tr>
    }

    return (
        <div className={"d-flex justify-content-center"} id="hide" onKeyDown={props.backspaceSelection} onMouseUp={() => { mouseDown.current = false }}>

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