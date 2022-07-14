import React from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput';

import "./MatrixActions.css"

function MatrixActions(props) {
    return <div className = "matrixActions">
        <button className = "btn btn-success matrixButtons" onClick={props.transpose}>Transpose</button>
        <button className = "btn btn-success matrixButtons" onClick={props.mirrorRowsOntoColumns}>Mirror Rows Across Diagonal</button> 
        <button className = "btn btn-success matrixButtons" onClick={props.mirrorColumnsOntoRows}>Mirror Columns Across Diagonal</button>
        
        <div className = "inputButtonContainer">
            <button className = "btn btn-success matrixButtons" onClick={props.randomMatrix}> {"Randomize Matrix - Integers from: "}</button>
            <ParameterTextInput id={"randomLow"} updateParameter = {props.updateParameter} text = {props.randomLow} width = {"30px"} />{" to "}
            <ParameterTextInput id={"randomHigh"} updateParameter = {props.updateParameter} text = {props.randomHigh} width = {"30px"} />
        </div>

        <div className = "inputButtonContainer">
        <button className = "btn btn-success matrixButtons" onClick={props.fillEmpty}>{"Fill Empty With: "}</button>
        <ParameterTextInput id={"fillEmptyWithThis"} updateParameter = {props.updateParameter} text = {props.fillEmptyWithThis} width = {"30px"} />
        </div>

        <div className = "inputButtonContainer">
            <button className = "btn btn-success matrixButtons" onClick={props.reshapeMatrix}> {"Reshape To: "}</button>
            <ParameterTextInput id={"reshapeRows"} updateParameter = {props.updateParameter} text = {props.reshapeRows} width = {"30px"} />{" x "}
            <ParameterTextInput id={"reshapeCols"} updateParameter = {props.updateParameter} text = {props.reshapeCols} width = {"30px"} />
        </div>
    
    </div>
}
export default MatrixActions;