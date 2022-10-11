import React, { useEffect, useState, useRef, useCallback } from 'react';

import Table from "./Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';
import SelectionMenu from './matrixTools/SelectionMenu.js';

import styles from "./MatrixEditor.module.css"

import ActiveButton from './ActiveButton.js';
import BasicActionButton from './matrixTools/BasicActionButton.js';

import { cloneMatrix, updateEntry } from '../matrixFunctions.js';
const MatrixEditor = (props) => {
    const [boxSelectionStart, setBoxSelectionStart] = useState({
        "x": -1,
        "y": -1
    });

    const [boxSelectionEnd, setBoxSelectionEnd] = useState({
        "x": -1,
        "y": -1
    });


    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);

    const optionsBarRef = useRef(null)
    const mouseDown = useRef(false);
    useEffect(() => {
        updateBoxesSelected(-1, -1, -1, -1, true)
    }, [props.name]);

    const toggleShown = (e) => {
        setShowImport(false);
        setShowActions(false);
        setShowExport(false);
        setShowMath(false);
        setShowSelectionMenu(false);

        switch (e.target.id) {
            case "Matrix Actions":
                setShowActions(!showActions);
                break;
            case "Matrix Math":
                setShowMath(!showMath);
                break;
            case "Import Matrix From Text":
                setShowImport(!showImport);
                break;
            case "Export Matrix":
                setShowExport(!showExport);
                break;
            case "Selection Settings":
                setShowSelectionMenu(!showSelectionMenu);
                break;

            default: break;
        }
    }

    const updateBoxesSelected = useCallback((x1, y1, x2, y2, clear = false) => {
        if (clear) {
            setBoxSelectionEnd({ "x": -1, "y": -1});
            setBoxSelectionStart({ "x": -1, "y": -1});
            return;
        }

        if (!props.selectable)
            return;

        if (x1 !== -1 && y1 !== -1)
            setBoxSelectionStart({
                "x": x1,
                "y": y1
            });

        if (x2 !== -1 && y2 !== -1)
            setBoxSelectionEnd({
                "x": x2,
                "y": y2
            });
    }, [props.selectable]);



    const toStringUpdateMatrix = (name, matrix) => {
        for (let i = 0; i < matrix.length - 1; i++) {
            for (let j = 0; j < matrix[i].length - 1; j++) {
                if (props.rounding !== "") {
                    matrix[i][j] = parseFloat(matrix[i][j].toFixed(props.rounding)).toString(); //round then remove trailing zeros
                } else
                    matrix[i][j] = matrix[i][j].toString();
            }
        }
        props.updateMatrix(name, matrix);
    }

    const showFullInput = document.activeElement && 
                        document.activeElement.tagName === "INPUT" &&
                        boxSelectionStart.x !== -1 && boxSelectionStart.y !== -1 && 
                        (props.matrix[boxSelectionStart.x][boxSelectionStart.y].toString().length > 5 || document.activeElement.id === "fullInput")

    if (showFullInput)  {        
        const x = boxSelectionStart["x"];
        const y = boxSelectionStart["y"];
        

        var fullInput = 
            <input className = {"fixed-bottom " + styles.fullInput} 
                value = {props.matrix[x][y]}
                id = {"fullInput"}
                onChange = {(e) => {
                    var clone = cloneMatrix(props.matrix)
                    props.updateMatrix(props.name, updateEntry(clone, x, y, e.target.value));
                }}/>
    } else {
        fullInput = null
    }
    return (
        <div className={styles.matrixEditor} onMouseUp={() => { mouseDown.current = false }} style = {{"bottom": props.showFullInput ? "28px" : "0"}} >
            <div ref = {optionsBarRef} className={styles.optionsBar}>
                <ActiveButton
                    name="Matrix Actions"
                    active={showActions}
                    action={toggleShown}
                />

                <ActiveButton
                    name="Matrix Math"
                    active={showMath}
                    action={toggleShown}
                />
                {props.selectable ?
                    <ActiveButton
                        name="Selection Settings"
                        active={showSelectionMenu}
                        action={toggleShown}
                    /> : null}

                <ActiveButton
                    name="Export Matrix"
                    active={showExport}
                    action={toggleShown}
                />

                <ActiveButton
                    name="Import Matrix From Text"
                    active={showImport}
                    action={toggleShown}
                />

                <div className={styles.undoRedo}>
                    <BasicActionButton disabled = {!props.canUndo} name = "↺" action = {props.undo} />   
                    <BasicActionButton disabled = {!props.canRedo} name = "↻" action = {props.redo} />
                </div>
            </div>


            {showActions ?
                <MatrixActions
                    name={props.name}
                    matrix={props.matrix}
                    updateMatrix={props.updateMatrix}
                    close={() => { setShowActions(false)}}
                    active={showActions}
                    optionsBarRef = {optionsBarRef}
                    showFullInput = {showFullInput}

                />
                : null}

            {showMath ?
                <MatrixMath
                    matrices={props.matrices}
                    matrix={props.matrix}
                    name = {props.name}
                    toStringUpdateMatrix={toStringUpdateMatrix}
                    sparseVal={props.sparseVal}
                    close={() => { setShowMath(false)}}
                    active={showMath}
                    rounding = {props.rounding}
                    optionsBarRef = {optionsBarRef}
                    showFullInput = {showFullInput}
                />
                : null}

            {props.selectable && showSelectionMenu ?
                <SelectionMenu
                    matrices={props.matrices}
                    name={props.name}
                    matrix={props.matrix}
                    updateMatrix={props.updateMatrix}
                    boxSelectionStart={boxSelectionStart}
                    boxSelectionEnd={boxSelectionEnd}
                    editSelection={props.editSelection}
                    updateBoxesSelected={updateBoxesSelected}
                    close={() => { setShowSelectionMenu(false) }}
                    active={showSelectionMenu}
                    optionsBarRef = {optionsBarRef}
                    showFullInput = {showFullInput}
                /> : null
            }
            {showImport ?
                <TextImport
                    updateMatrix={props.updateMatrix}
                    matrices={props.matrices}
                    currentName={props.name}
                    close={() => { setShowImport(false) }}
                    active={showImport}
                    optionsBarRef = {optionsBarRef}
                    showFullInput = {showFullInput}

                />
                : null}

            {showExport ?
                <MatrixExport
                    matrix={props.matrix}
                    sparseVal={props.sparseVal}
                    close={() => { setShowExport(false) }}
                    active={showExport}
                    optionsBarRef = {optionsBarRef}
                    showFullInput = {showFullInput}
                />
                : null}


                
            {(props.matrix.length <= 51 && props.matrix[0].length <= 51) ?
                <Table
                    mirror={props.mirror}
                    numbersOnly={props.numbersOnly}
                    name={props.name}
                    matrix={props.matrix}
                    updateMatrix={props.updateMatrix}

                    selectable={props.selectable}
                    darkModeTable = {props.darkModeTable}

                    boxSelectionStart={boxSelectionStart}
                    boxSelectionEnd={boxSelectionEnd}
                    updateBoxesSelected={updateBoxesSelected}
                    
                    mouseDown={mouseDown}
                    editSelection={props.editSelection}
                    
                    firstVisit = {props.firstVisit}
                />
                : <div className={styles.bigMatrixInfo}>
                    Matrices larger than 50 x 50 are too big to be displayed<br />
                    Use Import Matrix From Text or Matrix Actions to edit the matrix<br />
                    Use Export Matrix to view the matrix
                </div>}

        {fullInput}

        </div>)

}

export default MatrixEditor;
