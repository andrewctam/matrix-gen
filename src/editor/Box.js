import React from 'react';

class Box extends React.Component {
    render() {
        var lastRow = this.props.rows === this.props.row + 1;
        var lastCol = this.props.cols === this.props.col + 1;
       
        //if one of the rows or cols is the max size (50),
        //force that last row/col to be a white background
        //instead of a red background since there isn't a 51st box
        var lastRowIn50 = this.props.row === 49 && this.props.rows === 51;
        var lastColIn50 = this.props.col === 49 && this.props.cols === 51;

        if ((lastRowIn50 && lastColIn50) ||                          //bottom right corner of 50 x 50
            (lastRowIn50 && this.props.col < this.props.cols - 1) || //bottom row of 50 x m (excluding right most col)
            (lastColIn50 && this.props.row < this.props.rows - 1)) { //right most col of n x 50 (excluding last row)
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
            id = {this.props.row + ":" + this.props.col} 
            value = {this.props.val} 
            tabIndex = {this.props.row !== 0 && lastCol ? -1 : ""} 
            onChange = {(lastRow && lastCol ? this.handleAddBoth :
                                    lastRow ? this.handleAddRow :
                                    lastCol ? this.handleAddCol :
                                              this.handleUpdate)} 
            onKeyDown = {this.handleKeyDown}     
            />
        </td>;

    }

    handleAddRow = (e) => {
        this.props.addRow(this.props.row, this.props.col, e.target.value);
    }
    handleAddCol = (e) => {
        this.props.addCol(this.props.row, this.props.col, e.target.value);
    }
    handleAddBoth = (e) => {
        this.props.addBoth(this.props.row, this.props.col, e.target.value);
    }
    handleUpdate = (e) => {    
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);
    }
    handleKeyDown = (e) => {
        this.props.keyDown(this.props.row, this.props.col, e);
    }
        

}
export default Box;