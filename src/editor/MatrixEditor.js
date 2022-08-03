import React, { useEffect, useState } from 'react';

import Table from "./Table.js"

import MatrixExport from "./matrixTools/MatrixExport.js"
import MatrixMath from './matrixTools/MatrixMath.js';
import MatrixActions from './matrixTools/MatrixActions.js';
import TextImport from './matrixTools/TextImport.js';
import SelectionMenu from './SelectionMenu.js';

import "./MatrixEditor.css";

function MatrixEditor(props) {
    const [boxesSelected, setBoxesSelected] = useState({
        "startX" : -1,
        'startY' : -1,
        "endX" : -1,
        "endY" : -1,
        "quadrant": 1
    });
    const [mouseDown, setMouseDown] = useState(false);

    
    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {setBoxesSelected({
        "startX" : -1,
        'startY' : -1,
        "endX" : -1,
        "endY" : -1,
        "quadrant": 1
    })}, [props.name]);

    function toggleShown(e) {
        setShowImport(false);
        setShowActions(false);
        setShowExport(false);
        setShowMath(false);

        switch (e.target.id) {
            case "toggleActions":
                setShowActions(!showActions);
                break;
            case "toggleMath":
                setShowMath(!showMath);
                break;
            case "toggleImport":
                setShowImport(!showImport);
                break;
            case "toggleExport":
                setShowExport(!showExport);
                break;

            default: break;
        }
    }

    function updateBoxesSelected(x1, y1, x2, y2) {
        if (!props.selectable) 
            return; 
            
        if (x1 === -1 || y1 === -1) {
            x1 = boxesSelected["startX"];
            y1 = boxesSelected["startY"];
        }

        else if (x2 === -1 || y2 === -1) {
            x2 = boxesSelected["endX"];
            y2 = boxesSelected["endY"];
        }
        
        
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


    var showTable = (props.matrix.length <= 51 && props.matrix[0].length <= 51);
    console.log("renger")
    return (
    <div className = "matrixEditor" onMouseUp = {() => {if (mouseDown) setMouseDown(false)}} >
        <div id = "options" className = "options" >
            <div className = "options-bar">

                <button id = "toggleActions" 
                    className = {"btn matrixButtons " + (showActions ? "btn-info" : "btn-secondary")} 
                    onClick = {toggleShown}> 
                    {showActions ? "Close" : "Matrix Actions"}
                </button> 

                <button id = "toggleMath" 
                    className = {"btn matrixButtons " + (showMath ? "btn-info" : "btn-secondary")}
                    onClick={toggleShown}>                
                    {showMath ? "Close" : "Matrix Math"}
                </button>
                
                <button id = "toggleImport" 
                    className = {"btn matrixButtons " + (showImport ? "btn-info" : "btn-secondary")}
                    onClick={toggleShown}>
                    {showImport ? "Close" : "Import Matrix From Text"}
                </button>

                <button id = "toggleExport" 
                    className = {"btn matrixButtons " + (showExport ? "btn-info" : "btn-secondary")} 
                    onClick={toggleShown}>
                    {showExport ? "Close" : "Export Matrix"}
                </button>

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

            
        </div>


        {showTable ? 
            <Table                 
                mirror = {props.mirror}
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
            /> 
            : <div className = "bigMatrixInfo">
                Matrices larger than 50 x 50 are too big to be displayed<br/>
                Use Import Matrix From Text or Matrix Actions to edit the matrix<br/>
                Use Export Matrix to view the matrix
            </div>}

            { props.selectable && (boxesSelected["startX"] !== boxesSelected["endX"] || boxesSelected["startY"] !== boxesSelected["endY"]) ? 
               <SelectionMenu 
                    boxesSelected = {boxesSelected} 
                    generateUniqueName = {props.generateUniqueName}
                    editSelection = {props.editSelection}
                    spliceMatrix = {props.spliceMatrix}
                    pasteMatrix = {props.pasteMatrix}
                    name = {props.name}
                   
                    
               />: null
            }

    </div>)

}



export default MatrixEditor;
