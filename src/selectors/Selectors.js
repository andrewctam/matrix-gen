import React, {useState} from 'react'; 
import ParameterSwitchInput from '../inputs/ParameterSwitchInput';
import ParameterTextInput from '../inputs/ParameterTextInput';

import SelectorButton from './buttons/SelectorButton';
import AddButton from './buttons/AddButton';
import DeleteButton from './buttons/DeleteButton';
import DuplicateButton from './buttons/DuplicateButton';

import "./Selectors.css"
function Selectors(props) {
    // eslint-disable-next-line
    const [sort, setSort] = useState(true); 

    var selectors = []
    for (var matrixName in props.matrices) 
        selectors.push(
        <SelectorButton 
            name = {matrixName}
            key = {matrixName}
            updateMatrixSelection = {props.updateMatrixSelection}
            renameMatrix = {props.renameMatrix}
            resizeMatrix = {props.resizeMatrix}
            active = {props.selection === matrixName}
            matrices = {props.matrices}/>
        )

        if (sort) {
            selectors.sort( (selector1, selector2)  => {
                return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
            });
        }
    

    return  <div className = "row selectors selectors-box">
        <div className = "col-sm-4 info">
            <ul>
                <li>Enter values in the matrix below. The last row and column (in pink) are not part of the matrix. Typing in the these red boxes will add a new row or column.</li>
                <li>Click on a matrix's name to rename it. Valid characters are uppercase and lowercase letters, and underscores.</li>
                <li>Click on a matrix's dimensions to quickly resize it. The maximum size is 50 x 50.</li>
            </ul>   
        </div>
            <div className = "col-sm-4">
                <div id = "selectors" className="list-group">
                    <AddButton 
                        key = " add " 
                        addMatrix = {props.addMatrix} />
                    <DuplicateButton 
                        key = " duplicate " 
                        copyMatrix = {props.copyMatrix}
                        selection = {props.selection}/>
                    <DeleteButton 
                        key = " delete " 
                        deleteMatrix = {props.deleteMatrix} 
                        updateSelection = {props.updateSelection}
                        selection = {props.selection}/>
                </div>
                <div id = "selectors" className="list-group">
                    {selectors}    
                </div>


            </div>
        <div className = "col-sm-4">
            <ul>
                <li><button className = "btn btn-warning" onClick={props.deleteAllMatrices}>Delete All Matrices</button></li>
                {props.autoSave ? null : <li><button className = "btn btn-info" onClick={props.saveToLocalStorage}>Save Matrices to Local Storage</button></li>}
                <li><ParameterSwitchInput isChecked = {props.autoSave} id = {"autoSave"} name={"autoSave"} text = {"Autosave"} updateParameter={props.updateParameter}/></li>
                <li><ParameterSwitchInput isChecked = {props.mirror} id = {"mirror"} name={"mirror"} text = {"Mirror Inputs Along Diagonal"} updateParameter={props.updateParameter}/></li>
                <li>Default empty element: &nbsp;
                <ParameterTextInput width = {"30px"} text = {props.sparseVal} id={"sparse"} updateParameter={props.updateParameter}/> </li>
            </ul>   
        </div>
    </div>



}


export default Selectors;
