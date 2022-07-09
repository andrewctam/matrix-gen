import React from 'react';

class DeleteButton extends React.Component {
    render() {
        return <button type="button" 
            className = {"list-group-item list-group-item-danger selector-button"}
            disabled = {this.props.selection === "0"}
            onClick = {this.deleteMatrix}>
            Delete Matrix {this.props.selection !== "0" ? this.props.selection : ""}
        </button>
    }

    deleteMatrix = () => {
        if (window.confirm("Are you sure you want to delete " + this.props.selection + "?")) {
            this.props.deleteMatrix(this.props.selection); 
            this.props.updateSelection("0");
        }
    }

    
}

export default DeleteButton;