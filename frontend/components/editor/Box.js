import React from 'react';
import styles from "./Box.module.css"
const Box = (props) => {


    const handleMouseDown = () => {
        //set the start of the selection
        if (props.rows !== props.row + 1 && props.cols !== props.col + 1) {
            props.setMouseDown(true)
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
        if (props.mouseDown && props.rows !== props.row + 1 && props.cols !== props.col + 1)
            props.updateBoxesSelected(-1, -1, props.row, props.col);
    }

    const lastRow = props.rows === props.row + 1;
    const lastCol = props.cols === props.col + 1;
   
    //if one of the rows or cols is the max size (50),
    //force that last row/col to be a white background
    //instead of a red background since there isn't a 51st box
    const lastRowIn50 = props.row === 49 && props.rows === 51;
    const lastColIn50 = props.col === 49 && props.cols === 51;

    if (props.boxSelected && (!lastRow || lastRowIn50) && (!lastCol || lastColIn50))
        var specialStyle =  { 
            "backgroundColor": "rgb(183, 212, 216)",
            "maxWidth": "50px",
            "width": "50px",
            "maxHeight": "50px",
            "height": "50px" 
        }  
    else if ((lastRowIn50 && lastColIn50) ||                //bottom right corner of 50 x 50
            (lastRowIn50 && props.col < props.cols - 1) || //bottom row of 50 x m (excluding right most col)
            (lastColIn50 && props.row < props.rows - 1)) { //right most col of n x 50 (excluding last row)
            specialStyle =  { 
            "backgroundColor": "rgb(196, 185, 185)",
            "maxWidth": "50px",
            "width": "50px",
            "maxHeight": "50px",
            "height": "50px" 
        }
    } else
        specialStyle = null;


    return <td className = {styles.box} style = {specialStyle} >
        <input 
            type = {props.numbersOnly ? "number" : "text"}
            pattern = {props.numbersOnly ? "[0-9]*" : null}
            autoComplete = "off" 
            id = {props.row + ":" + props.col} 
            value = {props.val} 
            tabIndex = {props.row !== 0 && lastCol ? -1 : ""} 
            onChange = {(lastRow && lastCol ? (e) => {props.addBoth(props.row, props.col, e.target.value)} :
                                    lastRow ? (e) => {props.addRow(props.row, props.col, e.target.value)} :
                                    lastCol ? (e) => {props.addCol(props.row, props.col, e.target.value)} :
                                              (e) => {props.update(props.row, props.col, e.target.value)}
                        )} 

            onKeyDown = {(e) => {props.keyDown(props.row, props.col, e)}}
            onFocus = {handleFocus}
            onMouseEnter = {handleMouseEnter}
            onMouseDown = {handleMouseDown}
            onMouseUp = {() => {props.setMouseDown(false)}}
        />
    </td>;
}

export default Box;