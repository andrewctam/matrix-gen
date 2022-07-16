import React from 'react';

function Box(props) {
    function handleAddRow(e) {
        props.addRow(props.row, props.col, e.target.value);
    }
    function handleAddCol(e) {
        props.addCol(props.row, props.col, e.target.value);
    }
    function handleAddBoth(e) {
        props.addBoth(props.row, props.col, e.target.value);
    }
    function handleUpdate(e) { 
        props.updateEntry(props.name, props.row, props.col, e.target.value);
    }
    function handleKeyDown(e) {
        props.keyDown(props.row, props.col, e);
    }

    var lastRow = props.rows === props.row + 1;
    var lastCol = props.cols === props.col + 1;
   
    //if one of the rows or cols is the max size (50),
    //force that last row/col to be a white background
    //instead of a red background since there isn't a 51st box
    var lastRowIn50 = props.row === 49 && props.rows === 51;
    var lastColIn50 = props.col === 49 && props.cols === 51;

    if ((lastRowIn50 && lastColIn50) ||                //bottom right corner of 50 x 50
        (lastRowIn50 && props.col < props.cols - 1) || //bottom row of 50 x m (excluding right most col)
        (lastColIn50 && props.row < props.rows - 1)) { //right most col of n x 50 (excluding last row)
        var forceLastFiftyStyle =  { 
            "background-color": "rgb(196, 185, 185)",
            "max-width": "50px",
            "width": "50px",
            "max-height": "50px",
            "height": "50px" 
        }
    } else
        forceLastFiftyStyle = null;


    return <td style = {forceLastFiftyStyle}>
        <input 
            autoComplete = "off" 
            id = {props.row + ":" + props.col} 
            value = {props.val} 
            tabIndex = {props.row !== 0 && lastCol ? -1 : ""} 
            onChange = {(lastRow && lastCol ? handleAddBoth :
                                    lastRow ? handleAddRow :
                                    lastCol ? handleAddCol :
                                            handleUpdate)} 
            onKeyDown = {handleKeyDown}     
        />
    </td>;
}

export default Box;