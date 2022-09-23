import React, {useState} from 'react';

import TextActionButton from './TextActionButton';
import TwoTextActionButton from './TwoTextActionButton';

import styles from "./MatrixActions.module.css"

function MatrixActions(props) {
    const [randomLow, setRandomLow] = useState("1");
    const [randomHigh, setRandomHigh] = useState("10");
    const [reshapeRows, setReshapeRows] = useState("");
    const [reshapeCols, setReshapeCols] = useState("");
    const [fillEmptyWithThis, setFillEmptyWithThis] = useState("0");
    const [fillAllWithThis, setFillAllWithThis] = useState("");
    const [fillDiagonalWithThis, setFillDiagonalWithThis] = useState("1");
    


    function updateParameter(parameterName, updated) {
        switch (parameterName) {
            case "Fill Empty With: ":
                setFillEmptyWithThis(updated);
                break; 
            case "Fill All With: ":
                setFillAllWithThis(updated);
                break; 
            case "Fill Diagonal With: ":
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


    return <div className = {styles.matrixActionsContainer}>

        <BasicActionButton 
            action = {() => {props.transpose(props.name)}}
            name = {"Transpose"}
        />
        <BasicActionButton 
            id = "rowsToCols"
            action={() => {props.mirrorRowsCols(props.name, true)}}
            name = {"Mirror Rows Across Diagonal"}
        />
        <BasicActionButton 
            id = "colsToRows"
            action={() => {props.mirrorRowsCols(props.name, false)}}
            name = {"Mirror Columns Across Diagonal"}
        />

        
        
        <TextActionButton 
            name = "Fill Empty With: "
            action = {() => {props.fillEmpty(props.name, fillEmptyWithThis)}}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillEmptyWithThis}
        />

        <TextActionButton 
            name = "Fill All With: "
            action = {() => {props.fillAll(props.name, fillAllWithThis)}}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillAllWithThis}
        />

        <TextActionButton 
            name = "Fill Diagonal With: "
            action = {() => {props.fillDiagonal(props.name, fillDiagonalWithThis)}}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillDiagonalWithThis}
        />

        <TwoTextActionButton 
            name = "Randomize Elements: "
            action = {() => {props.randomMatrix(props.name, parseInt(randomLow), parseInt(randomHigh))}}
            updateParameter = {updateParameter}
            id1 = {"randomLow"}
            id2 = {"randomHigh"}
            value1 = {randomLow}
            value2 = {randomHigh}
            separator = {" to "}
            width = {"40px"}
        />

        <TwoTextActionButton 
            name = "Reshape To: "
            action = {() => {props.reshapeMatrix(props.name, parseInt(reshapeRows), parseInt(reshapeCols))}}
            updateParameter = {updateParameter}
            id1 = {"reshapeRows"}
            id2 = {"reshapeCols"}
            value1 = {reshapeRows}
            value2 = {reshapeCols}
            separator = {" x "}
            width = {"40px"}
        />

    </div>
}

function BasicActionButton(props) {
    return  <button 
                className = "btn btn-primary" 
                onClick={props.action}
            >
            {props.name}
            </button>
}



export default MatrixActions;