import React, { useEffect, useRef, useReducer } from 'react';
import styles from "./MatrixEditor.module.css"
import Table from "./table/Table"
import MatrixExport from "./matrixTools/MatrixExport"
import MatrixMath from './matrixTools/MatrixMath';
import MatrixActions from './matrixTools/MatrixActions';
import TextImport from './matrixTools/TextImport';
import SelectionMenu from './matrixTools/SelectionMenu';

import { cloneMatrix, updateEntry } from '../../matrixFunctions';
import { Matrices, Settings } from '../../App';
import { Tools } from '../MatrixGenerator';

interface MatrixEditorProps {
    matrices: Matrices
    name: string
    matrix: string[][] | null
    settings: Settings
    matrixDispatch: React.Dispatch<any>
    undoStack: Matrices[]
    redoStack: Matrices[]
    toolActive: Tools
    toolDispatch: React.Dispatch<any>
    addAlert: (str: string, time: number, type?: string) => void
}

type Cell = {x: number, y: number}

export type BoxSelection = {start: Cell, end: Cell} | null

type BoxSelectionAction =
    {"type": "CLEAR"} | 
    {"type": "SET_BOTH" | "SET_START" | "SET_END", payload: {start: Cell, end: Cell} }

const MatrixEditor = (props: MatrixEditorProps) => {
    const boxSelectionReducer = (state: BoxSelection, action: BoxSelectionAction) => {
        if (props.settings["Disable Selection"])
            return null;

        switch (action.type) {
            case "CLEAR":
                return null;
    
            case "SET_START":
                if (!state) 
                    return null;
                return {
                    start: action.payload.start,
                    end: state.end,
                }
            
            case "SET_END":
                if (!state) 
                    return null;
                return {
                    start: state.start,
                    end: action.payload.end,
                }

            case "SET_BOTH":
                return {
                    start: action.payload.start,
                    end: action.payload.end,
                }
       }
    }

    const [boxSelection, boxSelectionDispatch] = useReducer(boxSelectionReducer, null);
    const mouseDown = useRef<boolean>(false);

    useEffect(() => {
        boxSelectionDispatch({type: "CLEAR"});
    }, [props.name]);

    
    const toStringUpdateMatrix = (name: string | undefined, matrix: number[][]) => {
        let stringMatrix = new Array(matrix.length).fill([]).map(() => new Array(matrix[0].length).fill(""));

        //takes a number[][] and converts each element to a string and updates it in matrices
        for (let i = 0; i < matrix.length - 1; i++) {
            for (let j = 0; j < matrix[i].length - 1; j++) {
                if (parseInt(props.settings["Decimals To Round"]) > 0) {
                    let rounded = matrix[i][j].toFixed(parseInt(props.settings["Decimals To Round"]))
                    stringMatrix[i][j] = (+rounded).toString(); //remove trailing zeros 
                } else
                    stringMatrix[i][j] = matrix[i][j].toString();
            }
        }
        props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: {"name": name, "matrix": stringMatrix, "switch": true} });
    }

    const close = () => {
        props.toolDispatch({"type": "CLOSE"})
    }

    const formatName = (str: string) => {
        if (str.length > 5)
            return str.substring(0, 5) + "..."
        else
            return str;
    }

    const formatSelection = (boxSelection: BoxSelection) => {
        if (!boxSelection)
            return "";

        if (boxSelection.start.x !== boxSelection.end.x || boxSelection.start.y !== boxSelection?.end.y)
            return `${boxSelection.start.x}:${boxSelection.start.y} to ${boxSelection.end.x}:${boxSelection.end.y}`
        else
            return (`${boxSelection.start.x}:${boxSelection.start.y}`)
    }


    const showFullInput = boxSelection !== null && props.matrix !== null && document.activeElement !== null
                        && (document.activeElement.id === "fullInput"
                            || (document.activeElement.tagName === "INPUT" 
                                && /^[\d]+:[\d]+$/.test(document.activeElement.id))//num:num
                    )

    //for multi cell editing
    let lastValue = null;
    if (boxSelection && props.undoStack.length > 0 && props.name in props.undoStack[props.undoStack.length - 1]
        && (boxSelection.start.x !== boxSelection.end.x || boxSelection.start.y !== boxSelection.end.y)) {
        lastValue = props.undoStack[props.undoStack.length - 1][props.name] [boxSelection.start.x][boxSelection.start.y] 
    }        

    return (
        <div className={styles.matrixEditor} onMouseUp={() => { mouseDown.current = false }}>
            {props.matrix && props.toolActive["Actions"] ?
                <MatrixActions
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {props.matrix && props.toolActive["Math"] ?
                <MatrixMath
                    matrices={props.matrices}
                    matrix={props.matrix}
                    name={props.name}
                    toStringUpdateMatrix={toStringUpdateMatrix}
                    settings = {props.settings}
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {props.matrix && !props.settings["Disable Selection"] && props.toolActive["Selection"] ?
                <SelectionMenu
                    matrices={props.matrices}
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    boxSelection={boxSelection}
                    boxSelectionDispatch={boxSelectionDispatch}
        
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {props.toolActive["Import"] ?
                <TextImport
                    matrixDispatch={props.matrixDispatch}
                    matrices={props.matrices}
                    currentName={props.name}
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {props.matrix && props.toolActive["Export"] ?
                <MatrixExport
                    matrix={props.matrix}
                    settings = {props.settings}
                    close={close}
                    showFullInput={showFullInput}/>
            : null}


            {props.matrix ?
                (props.matrix.length <= 51 && props.matrix[0].length <= 51) ?
                    <Table
                        settings = {props.settings}
                        name={props.name}
                        matrix={props.matrix}
                        matrixDispatch={props.matrixDispatch}
                        boxSelection = {boxSelection}
                        boxSelectionDispatch = {boxSelectionDispatch}
                        mouseDown={mouseDown}
                        lastValue={lastValue}
                    />
                    : <div className={styles.bigMatrixInfo}>
                        Matrices larger than 50 x 50 are too big to be displayed<br />
                        Use Import or Matrix Actions to edit the matrix<br />
                        Use Export to view the matrix
                    </div> 
            : null}

            {showFullInput ? 
                <input className={"fixed-bottom " + styles.fullInput}
                value={props.matrix ? props.matrix[boxSelection.start.x][boxSelection.start.y] : ""}
                
                id = {"fullInput"}
                onChange={(e) => {
                    if (props.matrix) {
                        const changed = updateEntry(
                            cloneMatrix(props.matrix), 
                            boxSelection.start.x, 
                            boxSelection.start.y, 
                            e.target.value, 
                            props.settings["Mirror Inputs"]);

                        props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: {"name": props.name, "matrix": changed, "switch": false }});
                    }
                }} /> 
            : null}

            <p className = {styles.currentSelection}>
                {formatName(props.name) + " " + formatSelection(boxSelection)}
            </p>

        </div>)

}

export default MatrixEditor;
