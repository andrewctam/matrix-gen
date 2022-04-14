import React from 'react';
import ParameterSwitchInput from '../inputs/ParameterSwitchInput';
import ParameterTextInput from '../inputs/ParameterTextInput';
import SelectorButton from './SelectorButton';

class Selectors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {sort: true};
    }
    render() {

        var selectors = []
        for (var matrixName in this.props.matrices)
            selectors.push(<SelectorButton 
                name = {matrixName}
                key = {matrixName}
                updateSelection = {this.props.updateSelection}
                renameMatrix = {this.props.renameMatrix}
                resizeMatrix = {this.props.resizeMatrix}
                active = {this.props.selection === matrixName}
                matrices = {this.props.matrices}/>
        )

        if (this.state.sort) {
            var current, i, j;
            for (i = 1; i < selectors.length; i++) {
                current = selectors[i]
                if (current.props.name.toUpperCase() < selectors[i - 1].props.name.toUpperCase()) {
                    for (j = i - 1; j >= 0; j--) {
                        if (current.props.name < selectors[j].props.name)
                            selectors[j + 1] = selectors[j]
                        else
                            break;
                    }
                    selectors[j + 1] = current;
                }
            }
        }

        return  <div className = "row selectors selectors-box">
            <div className = "col-sm-4 info">
                <ul>
                    <li>Enter values in the matrix below. The last row and column (in red) are not part of the matrix. Typing in the these red boxes will add a new row or column.</li>
                    <li>Click on a matrix's name to rename it. Valid characters are uppercase and lowercase letters, and underscores.</li>
                    <li>Click on a matrix's dimensions to quickly resize it. The maximum size is 50 x 50.</li>
                </ul>   
            </div>
                <div className = "col-sm-4">
                    <div id = "selectors" className="list-group">
                        <AddButton key = " add " addMatrix = {this.props.addMatrix} />
                        <DuplicateButton key = " duplicate " 
                        copyMatrix = {this.props.copyMatrix}
                        selection = {this.props.selection}/>
                        <DeleteButton key = " delete " 
                        deleteMatrix = {this.props.deleteMatrix} 
                        updateSelection = {this.props.updateSelection}
                        selection = {this.props.selection}/>
                    </div>
                    <div id = "selectors" className="list-group">
                        {selectors}    
                    </div>


                </div>
            <div className = "col-sm-4">
                <ul>
                    <li><button className = "btn btn-warning" onClick={this.props.clearMatrices}>Clear Matrices</button></li>
                    {this.props.autoSave ? null : <li><button className = "btn btn-info" onClick={this.props.saveToLocalStorage}>Save Matrices to Local Storage</button></li>}
                    <li><ParameterSwitchInput defaultVal = {this.props.autoSave} id = {"autoSave"} name={"autoSave"} text = {"Autosave"} updateParameter={this.props.updateParameter}/></li>
                    <li><ParameterSwitchInput defaultVal = {this.props.mirror} id = {"mirror"} name={"mirror"} text = {"Mirror Inputs Along Diagonal"} updateParameter={this.props.updateParameter}/></li>
                    <li>Default empty element: &nbsp;
                    <ParameterTextInput width = {"30px"} defaultVal = {this.props.sparseVal} id={"sparse"} updateParameter={this.props.updateParameter}/> </li>
                </ul>   
            </div>
        </div>
    }


}


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

export default Selectors;
