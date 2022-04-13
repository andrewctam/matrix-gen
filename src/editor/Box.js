import React from 'react';

class Box extends React.Component {
    render() {
        var lastRow = this.props.rows === this.props.row + 1;
        var lastCol = this.props.cols === this.props.col + 1;
       
        return <td>
            <input 
            autoComplete = "off" 
            id = {this.props.row + ":" + this.props.col} 
            value = {this.props.val} 
            tabIndex = {lastCol && this.props.row !== 0 ? -1 : ""} 
            onChange = {(lastRow && lastCol ? this.handleAddBoth :
                                    lastRow ? this.handleAddRow :
                                    lastCol ? this.handleAddCol :
                                              this.handleUpdate)} 
            onKeyDown = {this.handleKeyDown}
            />
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
    handleUpdate = (e) => {    
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);
    }
    handleKeyDown = (e) => {
        this.props.keyDown(this.props.row, this.props.col, e);
    }
        

}
export default Box;