import React from 'react';


class DuplicateButton extends React.Component {
    render() {
        return <button type="button" 
            className = {"list-group-item list-group-item-warning selector-button"}
            disabled = {this.props.selection === "0"}
            onClick = {this.copyMatrix}>
            Duplicate Matrix {this.props.selection !== "0" ? this.props.selection : ""}
        </button>
    }

    copyMatrix = () => {
        this.props.copyMatrix(this.props.selection); 
    }
}

export default DuplicateButton;