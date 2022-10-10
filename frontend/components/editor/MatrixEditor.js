import React, { useEffect, useState, useRef } from 'react';

import Table from "./Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';
import SelectionMenu from './matrixTools/SelectionMenu.js';

import styles from "./MatrixEditor.module.css"

import ActiveButton from './ActiveButton.js';
import BasicActionButton from './matrixTools/BasicActionButton.js';

const MatrixEditor = (props) => {
    const [boxesSelected, setBoxesSelected] = useState({
        "startX": -1,
        'startY': -1,
        "endX": -1,
        "endY": -1,
        "quadrant": -1
    });
    const [mouseDown, setMouseDown] = useState(false);


    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);

    const optionsBarRef = useRef(null)
    useEffect(() => {
        setBoxesSelected({
            "startX": -1,
            'startY': -1,
            "endX": -1,
            "endY": -1,
            "quadrant": -1
        })
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

    const updateBoxesSelected = (x1, y1, x2, y2, clear = false) => {
        if (clear) {
            setBoxesSelected({
                "startX": -1,
                'startY': -1,
                "endX": -1,
                "endY": -1,
                "quadrant": -1
            });
            return;
        }

        if (!props.selectable)
            return;

        if (x1 === -1)
            x1 = boxesSelected["startX"];
        if (y1 === -1)
            y1 = boxesSelected["startY"];
        if (x2 === -1)
            x2 = boxesSelected["endX"];
        if (y2 === -1)
            y2 = boxesSelected["endY"];



        if (x1 <= x2) { //treat start as the origin
            if (y1 <= y2)
                var quadrant = 1;
            else
                quadrant = 4;
        } else if (y1 <= y2) { // x1 > x2
            quadrant = 2;
        } else
            quadrant = 3;

        setBoxesSelected({
            "startX": x1,
            'startY': y1,
            "endX": x2,
            "endY": y2,
            "quadrant": quadrant
        });
    }



    return (
        <div className={styles.matrixEditor} onMouseUp={() => { setMouseDown(false) }} >
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

                />
                : null}

            {showMath ?
                <MatrixMath
                    matrices={props.matrices}
                    matrix={props.matrix}
                    name = {props.name}
                    updateMatrix={props.updateMatrix}
                    sparseVal={props.sparseVal}
                    close={() => { setShowMath(false) }}
                    active={showMath}
                    rounding = {props.rounding}
                    optionsBarRef = {optionsBarRef}

                />
                : null}

            {props.selectable && showSelectionMenu ?
                <SelectionMenu
                    matrices={props.matrices}
                    name={props.name}
                    matrix={props.matrix}
                    updateMatrix={props.updateMatrix}
                    boxesSelected={boxesSelected}
                    editSelection={props.editSelection}
                    updateBoxesSelected={updateBoxesSelected}
                    close={() => { setShowSelectionMenu(false) }}
                    active={showSelectionMenu}
                    optionsBarRef = {optionsBarRef}



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

                />
                : null}

            {showExport ?
                <MatrixExport
                    matrix={props.matrix}
                    sparseVal={props.sparseVal}
                    close={() => { setShowExport(false) }}
                    active={showExport}
                    optionsBarRef = {optionsBarRef}

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

                    boxesSelected={boxesSelected}
                    updateBoxesSelected={updateBoxesSelected}
                    mouseDown={mouseDown}
                    setMouseDown={setMouseDown}
                    editSelection={props.editSelection}
                    
                    firstVisit = {props.firstVisit}
                />
                : <div className={styles.bigMatrixInfo}>
                    Matrices larger than 50 x 50 are too big to be displayed<br />
                    Use Import Matrix From Text or Matrix Actions to edit the matrix<br />
                    Use Export Matrix to view the matrix
                </div>}




        </div>)

}

export default MatrixEditor;
