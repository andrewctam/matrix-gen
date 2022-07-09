import React from 'react';
import ParameterSwitchInput from '../inputs/ParameterSwitchInput';
import ParameterTextInput from '../inputs/ParameterTextInput';

import SelectorButton from './buttons/SelectorButton';
import AddButton from './buttons/AddButton';
import DeleteButton from './buttons/DeleteButton';
import DuplicateButton from './buttons/DuplicateButton';

class Selectors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {sort: true};
    }
    render() {

        var selectors = []
        
        for (var matrixName in this.props.matrices) 
            selectors.push(
            <SelectorButton 
                name = {matrixName}
                key = {matrixName}
                updateSelection = {this.props.updateSelection}
                renameMatrix = {this.props.renameMatrix}
                resizeMatrix = {this.props.resizeMatrix}
                active = {this.props.selection === matrixName}
                matrices = {this.props.matrices}/>
            )

            if (this.state.sort) {
                selectors.sort( (selector1, selector2)  => {
                    return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
                });
    
                console.log(selectors);
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
                        <AddButton 
                            key = " add " 
                            addMatrix = {this.props.addMatrix} />
                        <DuplicateButton 
                            key = " duplicate " 
                            copyMatrix = {this.props.copyMatrix}
                            selection = {this.props.selection}/>
                        <DeleteButton 
                            key = " delete " 
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


export default Selectors;
