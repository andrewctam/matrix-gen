import React from 'react';

class AddButton extends React.Component {
    render() {
        return <button type="button" 
            className = {"list-group-item list-group-item-info selector-button"}
            onClick = {this.addMatrix}>
            Create New Empty Matrix
        </button>
    }

    addMatrix = () => {
        this.props.addMatrix();   
    }
}

export default AddButton;