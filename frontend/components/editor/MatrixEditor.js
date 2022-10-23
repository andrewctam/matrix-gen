import React, { useEffect, useState, useRef, useCallback } from 'react';

import styles from "./MatrixEditor.module.css"

import Table from "./table/Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';
import SelectionMenu from './matrixTools/SelectionMenu.js';

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


    const mouseDown = useRef(false);

    useEffect(() => {
        updateBoxesSelected(-1, -1, -1, -1, true)
    }, [props.name]);

    const updateBoxesSelected = useCallback((x1, y1, x2, y2, clear = false) => {
        if (clear) {
            setBoxSelectionEnd({ "x": -1, "y": -1 });
            setBoxSelectionStart({ "x": -1, "y": -1 });
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
        props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: {"name": name, "matrix": matrix, "switch": true} });
    }

    const showFullInput = process.browser && (document.activeElement && document.activeElement.id === "fullInput" || (
        document.activeElement.tagName === "INPUT" &&
        /^[\d]+:[\d]+$/.test(document.activeElement.id) && //num:num
        boxSelectionStart.x !== -1 && boxSelectionStart.y !== -1
    ))

    if (showFullInput && props.matrix) {
        const x = boxSelectionStart["x"];
        const y = boxSelectionStart["y"];
        console.log(props.matrices)
        var fullInput =
            <input className={"fixed-bottom " + styles.fullInput}
                value={props.matrix[x][y]}
                placeholder={`Row ${x} Column ${y}`}
                id={"fullInput"}
                onChange={(e) => {
                    const changed = updateEntry(cloneMatrix(props.matrix), x, y, e.target.value);
                    props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: {"name": props.name, "matrix": changed, "switch": false }});
                }} />
    } else {
        fullInput = null
    }


    return (
        <div className={styles.matrixEditor} onMouseUp={() => { mouseDown.current = false }}>
            {props.showActions ?
                <MatrixActions
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    close={() => { props.setShowActions(false) }}
                    active={props.showActions}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {props.showMath ?
                <MatrixMath
                    matrices={props.matrices}
                    matrix={props.matrix}
                    name={props.name}
                    toStringUpdateMatrix={toStringUpdateMatrix}
                    sparseVal={props.sparseVal}
                    close={() => { props.setShowMath(false) }}
                    active={props.showMath}
                    rounding={props.rounding}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {props.selectable && props.showSelectionMenu ?
                <SelectionMenu
                    matrices={props.matrices}
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    boxSelectionStart={boxSelectionStart}
                    boxSelectionEnd={boxSelectionEnd}
                    editSelection={props.editSelection}
                    updateBoxesSelected={updateBoxesSelected}
                    close={() => { props.setShowSelectionMenu(false) }}
                    active={props.showSelectionMenu}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {props.showImport ?
                <TextImport
                    matrixDispatch={props.matrixDispatch}
                    matrices={props.matrices}
                    currentName={props.name}
                    close={() => { props.setShowImport(false) }}
                    active={props.showImport}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}

                />
                : null}

            {props.showExport ?
                <MatrixExport
                    matrix={props.matrix}
                    sparseVal={props.sparseVal}
                    close={() => { props.setShowExport(false) }}
                    active={props.showExport}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}


            {!props.matrix ? null :
            (props.matrix.length <= 51 && props.matrix[0].length <= 51) ?
                <Table
                    mirror={props.mirror}
                    numbersOnly={props.numbersOnly}
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    selectable={props.selectable}
                    darkModeTable={props.darkModeTable}
                    boxSelectionStart={boxSelectionStart}
                    boxSelectionEnd={boxSelectionEnd}
                    updateBoxesSelected={updateBoxesSelected}
                    mouseDown={mouseDown}
                    editSelection={props.editSelection}
                    firstVisit={props.firstVisit}
                />
                : <div className={styles.bigMatrixInfo}>
                    Matrices larger than 50 x 50 are too big to be displayed<br />
                    Use Import From Text or Matrix Actions to edit the matrix<br />
                    Use Export Matrix to view the matrix
                </div>}

            {fullInput}

        </div>)

}

export default MatrixEditor;
