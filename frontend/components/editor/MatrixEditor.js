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

        if (props.settings["Disable Selection"])
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
    }, [props.settings["Disable Selection"]]);


    const toStringUpdateMatrix = (name, matrix) => {
        for (let i = 0; i < matrix.length - 1; i++) {
            for (let j = 0; j < matrix[i].length - 1; j++) {
                if (props.settings["Decimals To Round"] !== "") {
                    matrix[i][j] = parseFloat(matrix[i][j].toFixed(props.settings["Decimals To Round"])).toString(); //round then remove trailing zeros
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

    const close = () => {
        props.toolDispatch({"type": "CLOSE"})
    }

    return (
        <div className={styles.matrixEditor} onMouseUp={() => { mouseDown.current = false }}>
            {props.toolActive["Matrix Actions"] ?
                <MatrixActions
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    close={close}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {props.toolActive["Matrix Math"] ?
                <MatrixMath
                    matrices={props.matrices}
                    matrix={props.matrix}
                    name={props.name}
                    toStringUpdateMatrix={toStringUpdateMatrix}
                    settings = {props.settings}
                    close={close}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {!props.settings["Disable Selection"] && props.toolActive["Selection"] ?
                <SelectionMenu
                    matrices={props.matrices}
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
                    boxSelectionStart={boxSelectionStart}
                    boxSelectionEnd={boxSelectionEnd}
                    editSelection={props.editSelection}
                    updateBoxesSelected={updateBoxesSelected}
                    close={close}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}

            {props.toolActive["Import From Text"] ?
                <TextImport
                    matrixDispatch={props.matrixDispatch}
                    matrices={props.matrices}
                    currentName={props.name}
                    close={close}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}

                />
                : null}

            {props.toolActive["Export Matrix"] ?
                <MatrixExport
                    matrix={props.matrix}
                    settings = {props.settings}
                    close={close}
                    floatingMenuRef={props.floatingMenuRef}
                    showFullInput={showFullInput}
                />
                : null}


            {!props.matrix ? null :
            (props.matrix.length <= 51 && props.matrix[0].length <= 51) ?
                <Table
                    settings = {props.settings}
                    name={props.name}
                    matrix={props.matrix}
                    matrixDispatch={props.matrixDispatch}
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
