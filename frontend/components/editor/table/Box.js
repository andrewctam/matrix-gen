import React, {memo} from 'react';
import styles from "./Box.module.css"
const Box = (props) => {
    const handleMouseDown = () => {
        //set the start of the selection
        if (props.rows !== props.row + 1 && props.cols !== props.col + 1) {
            props.mouseDown.current = true
        }
    }
    const handleFocus = (e) => {
        if (props.rows !== props.row + 1 && props.cols !== props.col + 1) {
            //select this one box
            props.updateBoxesSelected(props.row, props.col, props.row, props.col);
        } else {
            //no selection for the last row/col
            props.updateBoxesSelected(-1, -1, -1, -1, true);
        }
    }

    const handleMouseEnter = (e) => {
        //if mouse is enters and is down (i.e. dragging) set this to the end of the selection
        if (props.mouseDown.current && props.rows !== props.row + 1 && props.cols !== props.col + 1)
            props.updateBoxesSelected(-1, -1, props.row, props.col);
    }

    const lastRow = props.rows === props.row + 1;
    const lastCol = props.cols === props.col + 1;
    //max matrix size if 50x50.
    //if the matrix has a 50 dimension, it is not the last row/col since its 49 with a length of 51.
     
    //default style for the light mode box
    var boxStyle = {
        "backgroundColor": "rgb(231, 223, 223)",
        "height": "50px",
        "width": "50px"
    }

    var textColor = "black";

    //assign special styles
    if (props.darkModeTable) {
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
            type={props.numbersOnly ? "number" : "text"}
            step={props.numbersOnly ? "any" : ""}
            pattern={props.numbersOnly ? "[0-9.-]*" : null}
            autoComplete="off"
            id={props.row + ":" + props.col}
            value={props.val}
            style = {{"color": textColor}} 
            tabIndex={props.row !== 0 && !lastRow && lastCol ? -1 : ""}
            onChange={(lastRow && lastCol ? (e) => { props.addBoth(props.row, props.col, e.target.value) } :
                                  lastRow ? (e) => { props.addRow(props.row, props.col, e.target.value) }  :
                                  lastCol ? (e) => { props.addCol(props.row, props.col, e.target.value) }  :
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