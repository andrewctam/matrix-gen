import React, {memo} from 'react';
import { clearBoxSelection, setBoxSelection, setBoxSelectionEnd } from '../../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';

import styles from "./Box.module.css"

interface BoxProps {
    addRowCol: (row: number, col: number, updated: string, type: "ADD_ROW" | "ADD_COL" | "ADD_ROW_AND_COL") => void
    update: (row: number, col: number, updated: string) => void
    keyDown: (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => void
    rows: number
    cols: number
    row: number
    col: number
    val: string
    key: string
    boxSelected: boolean
    mouseDown: React.MutableRefObject<boolean>

}
const Box = (props: BoxProps) => {
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch()
    const handleMouseDown = () => {
        //set the start of the selection
        if (props.rows !== props.row + 1 && props.cols !== props.col + 1) {
            props.mouseDown.current = true
            dispatch(setBoxSelection({
                start: {x: props.row, y: props.col}, 
                end: {x: props.row, y: props.col}
            }));
        }

    }
    const handleFocus = () => {
        if (props.rows !== props.row + 1 && props.cols !== props.col + 1) {
            //select this one box
            dispatch(setBoxSelection({
                start: {x: props.row, y: props.col}, 
                end: {x: props.row, y: props.col}
            }));
        } else {
            //no selection for the last row/col
            dispatch(clearBoxSelection());
        }
    }

    const handleMouseEnter = () => {
        //if mouse is enters and is down (i.e. dragging) set this to the end of the selection
        if (props.mouseDown.current && props.rows !== props.row + 1 && props.cols !== props.col + 1)
            dispatch(setBoxSelectionEnd({x: props.row, y: props.col}));
    }

    const lastRow = props.rows === props.row + 1;
    const lastCol = props.cols === props.col + 1;
    //max matrix size if 50x50.
    //if the matrix has a 50 dimension, it is not the last row/col since its 49 with a length of 51.
     
    //default style for the light mode box
    var boxStyle = {
        "backgroundColor": "rgb(231, 223, 223)",
        "height": "50px",
        "width": "50px",
    }

    var textColor = "black";

    //assign special styles
    if (settings["Dark Mode Table"]) {
        textColor = "white";
        
        if (props.boxSelected && !lastRow && !lastCol) {
            boxStyle["backgroundColor"] = "rgba(183, 212, 216, 0.4)"
        } else if (lastCol || lastRow) {
            boxStyle["backgroundColor"] = "rgba(230, 185, 185, 0.1)"

            if (lastCol)
                boxStyle["width"] = "25px"
            
            if (lastRow)
                boxStyle["height"] = "25px"
        } else {
            boxStyle["backgroundColor"] = "rgba(255, 255, 255, 0.1)"
        }
    } else {
        if (props.boxSelected && !lastRow && !lastCol) {
            boxStyle["backgroundColor"] = "rgb(184, 212, 216)"
        } else if (lastCol || lastRow) {
            boxStyle["backgroundColor"] = "rgb(187, 146, 146)"

            if (lastRow)
                boxStyle["height"] = "25px"
            if (lastCol)
                boxStyle["width"] = "25px"
        } 
    }


    return <td className={styles.box} style = {boxStyle}>
        <input
            placeholder={!lastRow && !lastCol ? settings["Empty Element"] : ""}
            type={settings["Numbers Only Input"] ? "number" : "text"}
            step={settings["Numbers Only Input"] ? "any" : ""}
            pattern={settings["Numbers Only Input"] ? "[0-9.-]*" : undefined}
            autoComplete="off"
            id={props.row + ":" + props.col}
            value={props.val}
            style = {{"color": textColor}} 
            tabIndex={props.row !== 0 && !lastRow && lastCol ? -1 : undefined}
            onChange={(lastRow && lastCol ? (e) => { props.addRowCol(props.row, props.col, e.target.value, "ADD_ROW_AND_COL") } :
                                  lastRow ? (e) => { props.addRowCol(props.row, props.col, e.target.value, "ADD_ROW") }  :
                                  lastCol ? (e) => { props.addRowCol(props.row, props.col, e.target.value, "ADD_COL") }  :
                                            (e) => { props.update(props.row, props.col, e.target.value) }
            )}

            onKeyDown={(e) => { props.keyDown(props.row, props.col, e) }}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onMouseDown={handleMouseDown}
            onMouseUp={() => { props.mouseDown.current = false}}
        />
    </td>;
}

export default memo(Box);