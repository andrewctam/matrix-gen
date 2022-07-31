import React, {useState} from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput';

import "./MatrixActions.css"

function MatrixActions(props) {
    const [randomLow, setRandomLow] = useState("1");
    const [randomHigh, setRandomHigh] = useState("10");
    const [reshapeRows, setReshapeRows] = useState("");
    const [reshapeCols, setReshapeCols] = useState("");
    const [fillEmptyWithThis, setFillEmptyWithThis] = useState("0");
    const [fillAllWithThis, setFillAllWithThis] = useState("");
    const [fillDiagonalWithThis, setFillDiagonalWithThis] = useState("1");
    


    function updateParameter(i, updated) {
        switch (i) {
            case "fillEmptyWithThis":
                setFillEmptyWithThis(updated);
                break; 
            case "fillAllWithThis":
                setFillAllWithThis(updated);
                break; 
            case "fillDiagonalWithThis":
                setFillDiagonalWithThis(updated);
                break; 
            case "randomLow":
                if (/^-?[0-9 \s]*$/.test(updated)) 
                    setRandomLow(updated);
                break;
            case "randomHigh":
                if (/^-?[0-9 \s]*$/.test(updated)) 
                    setRandomHigh(updated);
                break; 
            case "reshapeRows":
                if (/^[0-9 \s]*$/.test(updated)) 
                    setReshapeRows(updated);
                break;
            case "reshapeCols":
                if (/^[0-9 \s]*$/.test(updated)) 
                    setReshapeCols(updated);
                break; 

                
            default: break;
  
        }
    
    }


    return <div className = "matrixActions">
        <button 
            className = "btn btn-success matrixButtons" 
            onClick={() => {props.transpose(props.name)}}>
            {"Transpose"}
        </button>
        
        <button 
            className = "btn btn-success matrixButtons"
            id = "rowsToCols"
            onClick={() => {props.mirrorRowsCols(props.name, true)}}>
            {"Mirror Rows Across Diagonal"}
        </button> 

        <button 
            className = "btn btn-success matrixButtons"
            id = "colsToRows"
            onClick={() => {props.mirrorRowsCols(props.name, false)}}>
            {"Mirror Columns Across Diagonal"}
        </button>
        
        

        <div className = "inputButtonContainer">
            <button 
                className = "btn btn-success matrixButtons" 
                onClick={() => {props.fillEmpty(props.name,fillEmptyWithThis)}}>
                {"Fill Empty With: "}
            </button>

            <ParameterTextInput 
                id={"fillEmptyWithThis"} 
                updateParameter = {updateParameter} 
                text = {fillEmptyWithThis} 
                width = {"40px"} />
        </div>

        <div className = "inputButtonContainer">
            <button 
                className = "btn btn-success matrixButtons" 
                onClick={() => {props.fillAll(props.name,fillAllWithThis)}}>
                {"Fill All With: "}
            </button>
            <ParameterTextInput 
                id={"fillAllWithThis"} 
                updateParameter = {updateParameter} 
                text = {fillAllWithThis} 
                width = {"40px"} />
        </div>

        <div className = "inputButtonContainer">
            <button 
                className = "btn btn-success matrixButtons" 
                onClick={() => {props.fillDiagonal(props.name,fillDiagonalWithThis)}}>
                {"Fill Diagonal With: "}
            </button>
            <ParameterTextInput 
                id={"fillDiagonalWithThis"} 
                updateParameter = {updateParameter} 
                text = {fillDiagonalWithThis} 
                width = {"40px"} />
        </div>



        <div className = "inputButtonContainer">
            <button
                className = "btn btn-success matrixButtons"
                onClick={() => {props.randomMatrix(props.name, parseInt(randomLow), parseInt(randomHigh))}}> 
                {"Randomize Elements: "}
            </button>
            <ParameterTextInput 
                id={"randomLow"} 
                updateParameter = {updateParameter} 
                text = {randomLow} 
                width = {"40px"} /> 
            {" to "}
            <ParameterTextInput 
                id={"randomHigh"} 
                updateParameter = {updateParameter} 
                text = {randomHigh} 
                width = {"40px"} />
        </div>

        <div className = "inputButtonContainer">
            <button 
                className = "btn btn-success matrixButtons" 
                onClick={() => {props.reshapeMatrix(props.name, parseInt(reshapeRows), parseInt(reshapeCols))}}> 
                {"Reshape To: "}
            </button>
            <ParameterTextInput 
                id={"reshapeRows"} 
                updateParameter = {updateParameter} 
                text = {reshapeRows} 
                width = {"40px"} />
            {" x "}
            <ParameterTextInput 
                id={"reshapeCols"} 
                updateParameter = {updateParameter} 
                text = {reshapeCols} 
                width = {"40px"} />
        </div>
    
    </div>
}
export default MatrixActions;