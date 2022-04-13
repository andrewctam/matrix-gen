import React from 'react';
import Box from './table/Box.js';

class Table extends React.Component {

    render() {
        var cols = this.props.matrix[0].length;
        var rows = this.props.matrix.length;

        return this.props.matrix.map( (x, i) =>
            <tr>
            {
                x.map( (y, j) => (
                <Box 
                    addRow = {this.addRow} 
                    addCol = {this.addCol}
                    addBoth = {this.addBoth}

                    updateEntry = {this.props.updateEntry} 
                    rows = {rows}
                    cols = {cols}
                    val = {this.props.matrix[i][j]} 
                    row = {i} 
                    col = {j}
                    key = {i + ":" + j}
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


}

export default Table;