import React, { useEffect, useState } from 'react';

import Table from "./Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';
import SelectionMenu from './matrixTools/SelectionMenu.js';

import styles from "./MatrixEditor.module.css"

const MatrixEditor = (props) => {
    const [boxesSelected, setBoxesSelected] = useState({
        "startX" : -1,
        'startY' : -1,
        "endX" : -1,
        "endY" : -1,
        "quadrant": -1
    });
    const [mouseDown, setMouseDown] = useState(false);

    
    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);

    useEffect(() => {setBoxesSelected({
        "startX" : -1,
        'startY' : -1,
        "endX" : -1,
        "endY" : -1,
        "quadrant": -1
    })}, [props.name]);

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
                "startX" : -1,
                'startY' : -1,
                "endX" : -1,
                "endY" : -1,
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
            "startX" : x1,
            'startY' : y1,
            "endX" : x2,
            "endY" : y2,
            "quadrant" : quadrant
        });
    }



    return (
    <div className = {styles.matrixEditor} onMouseUp = {() => {if (mouseDown) setMouseDown(false)}} >
        <div className = {styles.optionsBar + " " + ((showActions || showMath || showSelectionMenu || showExport || showImport) ? styles.flatBottom : "")}>
            <ToggleButton 
                name = "Matrix Actions" 
                active = {showActions}
                action = {toggleShown}
            />
            
            <ToggleButton 
                name = "Matrix Math" 
                active = {showMath}
                action = {toggleShown}
            />
            {props.selectable ? 
            <ToggleButton 
                name = "Selection Settings" 
                active = {showSelectionMenu}
                action = {toggleShown}
            /> : null}

            <ToggleButton 
                name = "Export Matrix" 
                active = {showExport}
                action = {toggleShown}
            />

            <ToggleButton 
                name = "Import Matrix From Text" 
                active = {showImport}
                action = {toggleShown}
            />
        </div>


        {showActions ? 
            <MatrixActions 
                name = {props.name}
                transpose = {props.transpose}
                mirrorRowsCols = {props.mirrorRowsCols}
                fillEmpty = {props.fillEmpty}
                fillAll = {props.fillAll}
                fillDiagonal = {props.fillDiagonal}
                randomMatrix = {props.randomMatrix}
                reshapeMatrix = {props.reshapeMatrix}/>
        : null}
        
        {showMath ?
            <MatrixMath 
                matrices = {props.matrices}
                matrix = {props.matrix}
                setMatrix = {props.setMatrix}
                sparseVal = {props.sparseVal}/>
        : null } 

        { props.selectable && showSelectionMenu  ? 
            <SelectionMenu 
                boxesSelected = {boxesSelected} 
                generateUniqueName = {props.generateUniqueName}
                editSelection = {props.editSelection}
                spliceMatrix = {props.spliceMatrix}
                pasteMatrix = {props.pasteMatrix}
                name = {props.name}
                updateBoxesSelected = {updateBoxesSelected}
                
            />: null
        }



        {showImport ? 
            <TextImport
                generateUniqueName = {props.generateUniqueName}
                setMatrix = {props.setMatrix}
                currentName = {props.name}/> 
        : null}

        {showExport ?
            <MatrixExport 
                matrix = {props.matrix}
                sparseVal = {props.sparseVal}/>
        : null }   

        


    {(props.matrix.length <= 51 && props.matrix[0].length <= 51) ? 
        <Table                 
            mirror = {props.mirror}
            numbersOnly = {props.numbersOnly}
            name = {props.name}
            matrix = {props.matrix} 
            addCols = {props.addCols}
            addRows = {props.addRows}
            addRowsAndCols = {props.addRowsAndCols}
            updateEntry = {props.updateEntry}
            tryToDelete = {props.tryToDelete}
            selectable = {props.selectable}

            boxesSelected = {boxesSelected}
            updateBoxesSelected = {updateBoxesSelected}
            mouseDown = {mouseDown}
            setMouseDown = {setMouseDown}
            editSelection = {props.editSelection}
        /> 
        : <div className = {styles.bigMatrixInfo}>
            Matrices larger than 50 x 50 are too big to be displayed<br/>
            Use Import Matrix From Text or Matrix Actions to edit the matrix<br/>
            Use Export Matrix to view the matrix
        </div>}

            

    </div>)

}

const ToggleButton = (props) => {
    return <button id = {props.name} 
            className = {"btn " + (props.active ? "btn-info" : "btn-secondary")} 
            onClick = {props.action}>
            {props.name}
        </button>

}

export default MatrixEditor;
