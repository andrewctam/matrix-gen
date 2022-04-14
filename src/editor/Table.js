import React from 'react';
import Box from './Box.js';

class Table extends React.Component {

    render() {
        var cols = this.props.matrix[0].length;
        var rows = this.props.matrix.length;

        return this.props.matrix.map( (x, i) =>
            <tr key = {"row" + i}>
            {
                x.map( (y, j) => (
                <Box 
                    addRow = {this.addRow} 
                    addCol = {this.addCol}
                    addBoth = {this.addBoth}
                    keyDown = {this.keyDown}
                    updateEntry = {this.props.updateEntry}

                    rows = {rows}
                    cols = {cols}
                    row = {i} 
                    col = {j}
                    val = {this.props.matrix[i][j]} 
                    key = {i + ";" + j}
                />))
            }
            </tr>);
    }

    addRow = (row, col, updated) => {
        var cols = this.props.matrix[0].length;
        var rows = this.props.matrix.length
        
        if (this.props.mirror) {
            var max = Math.max(cols, rows)
            this.props.addCols(max - cols);        
            this.props.addRows(max - rows);
            this.props.updateEntry(col, row, updated);
        }
        else {
            this.props.addRows(1);
        }

        if (row !== -1)
            this.props.updateEntry(row, col, updated);
    }

    addCol = (row, col, updated) => {
        var cols = this.props.matrix[0].length;
        var rows = this.props.matrix.length

        if (this.props.mirror) {
            var max = Math.max(cols + 1, rows)
            this.props.addCols(max - cols);        
            this.props.addRows(max - rows);
            this.props.updateEntry(col, row, updated);
        } else {
            this.props.addCols(1);
        }

        this.props.updateEntry(row, col, updated);
    }

    addBoth = (row, col, updated) => {
        var cols = this.props.matrix[0].length;
        var rows = this.props.matrix.length

        if (this.props.mirror) {
            var max = Math.max(cols + 1, rows + 1)
            this.props.addCols(max - cols);        
            this.props.addRows(max - rows);
            this.props.updateEntry(col, row, updated);
        } else {
            this.props.addCols(1);
            this.props.addRows(1);
        }
        this.props.updateEntry(row, col, updated);
    }


    keyDown = (row, col, e) => {
        if (e.keyCode === 16) {
            if (this.props.matrix.length === (row + 1))
                this.props.addRows(1);
            if (this.props.matrix[0].length === (col + 1))
                this.props.addCols(1);
            }

        if (e.keyCode === 8 && e.target.value === "") {
           this.props.tryToDelete(row, col); 
        } else if (e.target.selectionStart === 0 && e.keyCode === 37)  { //Left
            if (col !== 0) {
                document.getElementById((row) + ":" + (col - 1)).focus();
                document.getElementById((row) + ":" + (col - 1)).selectionStart = 0;

            } 
            else if (row !== 0) {  //Wrap
                document.getElementById((row - 1) + ":" + (this.props.matrix[0].length - 1)).focus();
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
            if (this.props.col !== this.props.matrix[0].length - 1) { 
                document.getElementById((row) + ":" + (col + 1)).focus();
                document.getElementById((row) + ":" + (col + 1)).selectionStart = -1;

            } 
            else if (row !== this.props.matrix.length - 1) { //Wrap
                document.getElementById((row + 1) + ":0").focus();
            }
        }

        else if (e.keyCode === 40) { //Down
            /*
            if (this.props.row === this.props.rows - 2 && this.props.col !== 0 && this.props.col !== this.props.cols - 1) { //skip the last one if you aren't  on the first col
                document.getElementById("0:" + (this.props.col + 1)).focus();
            }
            else */
            if (row !== this.props.matrix.length - 1) {
                document.getElementById((row + 1) +  ":" + (col) ).focus();
            } 
            else if (col !== this.props.matrix[0].length - 1) { //Wrap
                document.getElementById("0:" + (col + 1)).focus();
            }

        } else if (e.keyCode === 38) { //Up
            if (row !== 0) {     
                document.getElementById(row - 1 + ":" + col).focus();
            } 
            else if (col !== 0) { //Wrap
                document.getElementById(this.props.matrix.length - 1 +  ":" + (col - 1)).focus();
            }
        }
    }


}

export default Table;