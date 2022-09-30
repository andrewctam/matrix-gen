import React, {useState, useEffect, useRef} from 'react';

import TextActionButton from './TextActionButton';
import TwoTextActionButton from './TwoTextActionButton';

import styles from "./MatrixActions.module.css"

import {transpose, mirrorRowsCols, fillEmpty, fillAll, fillDiagonal, randomMatrix, reshapeMatrix} from '../../matrixFunctions';
import Toggle from '../../navigation/Toggle';
import useExpand from './useExpand';

const MatrixActions = (props) => {
    const [randomLow, setRandomLow] = useState("1");
    const [randomHigh, setRandomHigh] = useState("10");
    const [reshapeRows, setReshapeRows] = useState("");
    const [reshapeCols, setReshapeCols] = useState("");
    const [fillEmptyWithThis, setFillEmptyWithThis] = useState("0");
    const [fillAllWithThis, setFillAllWithThis] = useState("");
    const [fillDiagonalWithThis, setFillDiagonalWithThis] = useState("1");
    

    const matrixActions = useExpand(props.optionsBarRef);



    const updateParameter = (parameterName, updated) => {
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


    return <div ref = {matrixActions} className = {"fixed-bottom " + styles.matrixActionsContainer}>
        <BasicActionButton 
            action = {() => {
                props.setMatrix(props.name, transpose(props.matrix))
            }}
            name = {"Transpose"}
        />
        <BasicActionButton 
            action={() => {
                props.setMatrix(props.name, mirrorRowsCols(props.matrix, true))
            }}
            name = {"Mirror Rows Across Diagonal"}
        />
        <BasicActionButton 
            action={() => {
                props.setMatrix(props.name, mirrorRowsCols(props.matrix, false)) //false means cols to rows
            }}
            name = {"Mirror Columns Across Diagonal"}
        />

        
        
        <TextActionButton 
            name = "Fill Empty With: "
            action = {() => {
                props.setMatrix(props.name, fillEmpty(props.matrix, fillEmptyWithThis))
            }}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillEmptyWithThis}
        />

        <TextActionButton 
            name = "Fill All With: "
            action = {() => {
                props.setMatrix(props.name, fillAll(props.matrix, fillAllWithThis))
            }}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillAllWithThis}
        />

        <TextActionButton 
            name = "Fill Diagonal With: "
            action = {() => {
                props.setMatrix(props.name, fillDiagonal(props.matrix, fillDiagonalWithThis))
            }}
            updateParameter = {updateParameter}
            width = {"40px"}
            value = {fillDiagonalWithThis}
        />

        <TwoTextActionButton 
            name = "Randomize Elements: "
            action = {() => {
                props.setMatrix(props.name, randomMatrix(props.matrix, parseInt(randomLow), parseInt(randomHigh)))
            }}
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
            action = {() => {
                const reshaped = reshapeMatrix(props.matrix, parseInt(reshapeRows), parseInt(reshapeCols))
                if (reshaped)
                    props.setMatrix(props.name, reshaped)
            }}
            updateParameter = {updateParameter}
            id1 = {"reshapeRows"}
            id2 = {"reshapeCols"}
            value1 = {reshapeRows}
            value2 = {reshapeCols}
            separator = {" x "}
            width = {"40px"}
        />

        <Toggle toggle = {props.close} show = {!props.active} />

    </div>
}

const BasicActionButton = (props) => {
    return  <button 
                className = "btn btn-primary" 
                onClick={props.action}
            >
            {props.name}
            </button>
}



export default MatrixActions;