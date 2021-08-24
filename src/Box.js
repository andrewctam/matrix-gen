import React from 'react';

class Box extends React.Component {
    render() {
        if (this.props.cols === (this.props.col + 1) && this.props.rows === (this.props.row + 1))
            return <td><input key = {this.props.row + ":" + this.props.col} id = {this.props.row + ":" + this.props.col} onKeyDown = {this.handleKeyDown}
            onChange = {this.handleAddBoth} value={this.props.num} /></td>



        if (this.props.cols === (this.props.col + 1))
            return <td><input key = {this.props.row + ":" + this.props.col} id = {this.props.row + ":" + this.props.col} onKeyDown = {this.handleKeyDown}
            onChange = {this.handleAddCol} value={this.props.num} /></td>




        if (this.props.rows === (this.props.row + 1))
            return <td><input key = {this.props.row + ":" + this.props.col} id = {this.props.row + ":" + this.props.col} onKeyDown = {this.handleKeyDown}
            onChange = {this.handleAddRow} value={this.props.num} /></td>




        else
            return <td><input key = {this.props.row + ":" + this.props.col} id = {this.props.row + ":" + this.props.col} onKeyDown = {this.handleKeyDown}
            onChange = {this.handleChange} value={this.props.num} /></td>


    }

    handleChange = (e) => {
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);
    }

    handleAddRow = (e) => {
        this.props.addRows(1);
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);

    }

    handleAddCol = (e) => {
        this.props.addCols(1);
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);

    }

    handleAddBoth = (e) => {
        this.props.addCols(1);
        this.props.addRows(1);
        this.props.updateEntry(this.props.row, this.props.col, e.target.value);

    }
    



    handleKeyDown = (e) => {
        if (e.keyCode === 8 && e.target.value === "") {
           this.props.tryToDelete(this.props.row, this.props.col); 
        }
        else if (e.keyCode === 37 && this.props.col !== 0) { //left
            document.getElementById((this.props.row)+ ":" + (this.props.col - 1) ).focus();

        } else if (e.keyCode === 39 && this.props.col !== this.props.cols - 1) { //right
            document.getElementById((this.props.row)+ ":" + (this.props.col + 1) ).focus();

        } else if (e.keyCode === 40 && this.props.row !== this.props.rows - 1) { //down
            document.getElementById((this.props.row + 1)+ ":" + (this.props.col) ).focus();

        } else if (e.keyCode === 38 && this.props.row !== 0) { //up
            document.getElementById((this.props.row - 1)+ ":" + (this.props.col) ).focus();

        }
        
    }

}
export default Box;