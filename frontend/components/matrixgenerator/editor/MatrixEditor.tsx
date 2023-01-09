import React, { useEffect, useRef, useReducer } from 'react';
import styles from "./MatrixEditor.module.css"
import Table from "./table/Table"
import MatrixExport from "./matrixTools/MatrixExport"
import MatrixMath from './matrixTools/MatrixMath';
import MatrixActions from './matrixTools/MatrixActions';
import TextImport from './matrixTools/TextImport';
import SelectionMenu from './matrixTools/SelectionMenu';

import { cloneMatrix, updateMatrixEntry } from '../../matrixFunctions';
import { Tools, ToolsAction } from '../MatrixGenerator';
import { updateMatrix } from '../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';

interface MatrixEditorProps {
    toolActive: Tools
    toolDispatch: React.Dispatch<ToolsAction>
    addAlert: (str: string, time: number, type?: string) => void
    username: string
}

type Cell = {x: number, y: number}

export type BoxSelection = {start: Cell, end: Cell} | null

export type BoxSelectionAction =
    {"type": "CLEAR"} | 
    {"type": "SET_BOTH", payload: {start: Cell, end: Cell} } |
    {"type": "SET_START", payload: {start: Cell} } |
    {"type": "SET_END", payload: {end: Cell} }

const MatrixEditor = (props: MatrixEditorProps) => {
    const {matrices, selection, undoStack} = useAppSelector((state) => state.matricesData);
    const settings = useAppSelector((state) => state.settings);
    const matrixDispatch = useAppDispatch();

    const matrix = selection in matrices ? matrices[selection] : null
    const boxSelectionReducer = (state: BoxSelection, action: BoxSelectionAction) => {
        if (settings["Disable Selection"])
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
    }, [selection]);


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


    const showFullInput = boxSelection !== null && matrix !== null && document.activeElement !== null
                        && (document.activeElement.id === "fullInput"
                            || (document.activeElement.tagName === "INPUT" 
                                && /^[\d]+:[\d]+$/.test(document.activeElement.id))//num:num
                    )

    //for multi cell editing
    let lastValue = null;
    if (boxSelection && undoStack.length > 0 && selection in undoStack[undoStack.length - 1]
        && (boxSelection.start.x !== boxSelection.end.x || boxSelection.start.y !== boxSelection.end.y)) {
        lastValue = undoStack[undoStack.length - 1][selection] [boxSelection.start.x][boxSelection.start.y] 
    }        

    return (
        <div className={styles.matrixEditor} onMouseUp={() => { mouseDown.current = false }}>
            {matrix && props.toolActive["Actions"] ?
                <MatrixActions
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {matrix && props.toolActive["Math"] ?
                <MatrixMath
                    close={close}
                    showFullInput={showFullInput}
                    addAlert = {props.addAlert}/>
            : null}

            {matrix && !settings["Disable Selection"] && props.toolActive["Selection"] ?
                <SelectionMenu
                    boxSelection={boxSelection}
                    boxSelectionDispatch={boxSelectionDispatch}
        
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {props.toolActive["Import"] ?
                <TextImport
                    currentName={selection}
                    close={close}
                    showFullInput={showFullInput}

                    addAlert = {props.addAlert}/>
            : null}

            {matrix && props.toolActive["Export"] ?
                <MatrixExport
                    matrix={matrix}
                    close={close}
                    showFullInput={showFullInput}/>
            : null}


            {matrix ?
                (matrix.length <= 51 && matrix[0].length <= 51) ?
                    <Table
                        name={selection}
                        matrix={matrix}
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
                value={matrix ? matrix[boxSelection.start.x][boxSelection.start.y] : ""}
                
                id = {"fullInput"}
                onChange={(e) => {
                    if (matrix) {
                        const changed = updateMatrixEntry(
                            cloneMatrix(matrix), 
                            boxSelection.start.x, 
                            boxSelection.start.y, 
                            e.target.value, 
                            settings["Mirror Inputs"]);

                        matrixDispatch(updateMatrix({ "name": selection, "matrix": changed}));
                    }
                }} /> 
            : null}

            <p className = {styles.currentSelection}>
                {formatName(selection) + " " + formatSelection(boxSelection)}
            </p>

        </div>)

}

export default MatrixEditor;
