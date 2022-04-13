import React from 'react';

class Box extends React.Component {
    render() {
        var lastRow = this.props.rows === this.props.row + 1;
        var lastCol = this.props.cols === this.props.col + 1;
       
        return <td>
            <input 
            tabIndex = {lastCol && this.props.row !== 0 ? -1 : ""} 
            autoComplete = "off" 
            key = {this.props.row + ":" + this.props.col} 
            id = {this.props.row + ":" + this.props.col} 
            onKeyDown = {this.handleKeyDown}
            onChange = {(lastRow && lastCol ? this.handleAddBoth :
                                    lastRow ? this.handleAddRow :
                                    lastCol ? this.handleAddCol :
                                              this.handleChange)} 

            value = {this.props.val} />
        </td>;

    }

    handleAddRow = (e) => {
        this.props.addRow(this.props.row, this.props.col, e.target.value)
    }
    handleAddCol = (e) => {
        this.props.addCol(this.props.row, this.props.col, e.target.value)
    }
    handleAddBoth = (e) => {
        this.props.addBoth(this.props.row, this.props.col, e.target.value)
    }

    handleChange = (e) => {    
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);
    }
    
    handleKeyDown = (e) => {
        if (e.keyCode === 16) {
            if (this.props.rows === (this.props.row + 1))
                this.props.addRows(1);
            if (this.props.cols === (this.props.col + 1))
                this.props.addCols(1)
            }

        if (e.keyCode === 8 && e.target.value === "") {
           this.props.tryToDelete(this.props.row, this.props.col); 
        }
        else if (e.target.selectionStart === 0 && e.keyCode === 37)  { //Left
            if (this.props.col !== 0) {
                document.getElementById((this.props.row) + ":" + (this.props.col - 1)).focus();
                document.getElementById((this.props.row) + ":" + (this.props.col - 1)).selectionStart = 0;

            } 
            else if (this.props.row !== 0) {  //Wrap
                document.getElementById((this.props.row - 1) + ":" + (this.props.cols - 1)).focus();
            }
        } 
        
        else if (e.target.selectionStart === e.target.value.length && e.keyCode === 39) { //Right
            //skip the last col if you aren't on the first row/
            /*
            if (this.props.col === this.props.cols - 2 && this.props.row !== 0 && this.props.row !== this.props.rows - 1) { 
                document.getElementById((this.props.row + 1) + ":0").focus();
                document.getElementById((this.props.row + 1) + ":0").selectionStart = 0;

            } 
            else */
            if (this.props.col !== this.props.cols - 1) { 
                document.getElementById((this.props.row) + ":" + (this.props.col + 1)).focus();
                document.getElementById((this.props.row) + ":" + (this.props.col + 1)).selectionStart = -1;

            } 
            else if (this.props.row !== this.props.rows - 1) { //Wrap
                document.getElementById((this.props.row + 1) + ":0").focus();
            }
        }

        else if (e.keyCode === 40) { //Down
            /*
            if (this.props.row === this.props.rows - 2 && this.props.col !== 0 && this.props.col !== this.props.cols - 1) { //skip the last one if you aren't  on the first col
                document.getElementById("0:" + (this.props.col + 1)).focus();
            }
            else */
            if (this.props.row !== this.props.rows - 1) {
                document.getElementById((this.props.row + 1) +  ":" + (this.props.col) ).focus();
            } 
            else if (this.props.col !== this.props.cols - 1) { //Wrap
                document.getElementById("0:" + (this.props.col + 1)).focus();
            }

        } else if (e.keyCode === 38) { //Up
            if (this.props.row !== 0) {     
                document.getElementById(this.props.row - 1 + ":" + this.props.col).focus();
            } 
            else if (this.props.col !== 0) { //Wrap
                document.getElementById(this.props.rows - 1 +  ":" + (this.props.col - 1)).focus();
            }
        }
    }
        

}
export default Box;