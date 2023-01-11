import React, { useEffect, useState, useContext } from 'react';
import styles from "./MatrixEditor.module.css"
import Table from "./table/Table"
import MatrixExport from "./matrixTools/MatrixExport"
import MatrixMath from './matrixTools/MatrixMath';
import MatrixActions from './matrixTools/MatrixActions';
import TextImport from './matrixTools/TextImport';
import SelectionMenu from './matrixTools/SelectionMenu';

import { pasteMatrix, spliceMatrix } from '../../matrixFunctions';
import { backspaceBoxSelection, BoxSelection, clearBoxSelection, updateEntry, updateMatrix } from '../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { AlertContext } from '../../App';
import { ActiveTool } from '../MatrixGenerator';

interface MatrixEditorProps {
    activeTool: ActiveTool
    setActiveTool: (tool: ActiveTool) => void
}

const MatrixEditor = (props: MatrixEditorProps) => {
    const {matrices, selection, boxSelection} = useAppSelector((state) => state.matricesData);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();

    const addAlert = useContext(AlertContext)

    const [selectionClipboard, setSelectionClipboard] = useState<string[][] | null>(null);
    
    const matrix = selection in matrices ? matrices[selection] : null


    useEffect(() => {
        if (boxSelection) {
            dispatch(clearBoxSelection())
        }
    }, [selection]);

    useEffect(() => {
        if (!boxSelection)
            return;


        //verify box selection if the matrix/boxSelection changes
        if (matrix) {
            const xLen = matrix.length
            const yLen = matrix[0].length
            if (boxSelection.start.x > xLen || boxSelection.end.x > xLen || boxSelection.start.y > yLen || boxSelection.end.y > yLen) {
                dispatch(clearBoxSelection())
            }
        } else if (boxSelection) {
            dispatch(clearBoxSelection())
        }

    }, [matrix, boxSelection])

    useEffect(() => {
        if (!boxSelection)
            return;
        
        const handleClipboard = (e: KeyboardEvent) => {
            if (e.metaKey && (!document.activeElement || document.activeElement.tagName !== "INPUT"))
                if (e.key === "c") {
                    setSelectionClipboard(
                        spliceMatrix(matrices[selection],
                            boxSelection.start.x,
                            boxSelection.start.y,
                            boxSelection.end.x,
                            boxSelection.end.y))
                    
                        addAlert("Copied selection to clipboard", 1000)

                } else if (e.key === "v") {
                    if (!selectionClipboard)
                        return;

                    let boxSelectionX = Math.abs(boxSelection.start.x - boxSelection.end.x) + 1
                    let boxSelectionY = Math.abs(boxSelection.start.y - boxSelection.end.y) + 1

                    if (boxSelectionY !== selectionClipboard[0].length - 1 || boxSelectionX !== selectionClipboard.length - 1) {
                        addAlert(`Invalid selection to paste clipboard. Clipboard matrix is ${selectionClipboard[0].length - 1} x ${selectionClipboard.length - 1}`, 1000, "error");
                        return
                    }

                    const pasted = pasteMatrix(
                        matrices[selection],  //matrix to copy from
                        selectionClipboard, //matrix to paste on
                        boxSelection.start.x,
                        boxSelection.start.y,
                        boxSelection.end.x,
                        boxSelection.end.y)

                    if (pasted) {
                        dispatch(updateMatrix( {"name" : selection, "matrix" : pasted}));
                        addAlert("Pasted clipboard", 1000)
                    }
                }
            }

        window.addEventListener('keydown', handleClipboard)

        return () => removeEventListener('keydown', handleClipboard)

    }, [selection, selectionClipboard, setSelectionClipboard, boxSelection])


    const close = () => {
        props.setActiveTool(ActiveTool.None)
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


    

    const backspaceSelection = (e: React.KeyboardEvent) => {
        if (!matrix || e.key !== "Backspace" || settings["Disable Selection"])
            return
        
        const input = e.target as HTMLInputElement
        //if backspace is clicked on an empty box, we want to remove one character from all boxes selected
        if (input.value === "" || (input.selectionStart === 0 && input.selectionEnd === 0)) {
            e.preventDefault()
            e.stopPropagation();
            dispatch(backspaceBoxSelection());
        }
    }

    const showFullInput = boxSelection !== null && matrix !== null && document.activeElement !== null
                        && (document.activeElement.id === "fullInput"
                            || (document.activeElement.tagName === "INPUT" 
                                && /^[\d]+:[\d]+$/.test(document.activeElement.id))//num:num
                    )
    return (
        <div className={styles.matrixEditor}>
            {matrix && props.activeTool === ActiveTool.Actions ?
                <MatrixActions
                    close={close}
                    showFullInput={showFullInput}
                />
            : null}

            {matrix && props.activeTool === ActiveTool.Math ?
                <MatrixMath
                    close={close}
                    showFullInput={showFullInput}
                />
            : null}

            {matrix && !settings["Disable Selection"] && props.activeTool === ActiveTool.Selection ?
                <SelectionMenu
                    close={close}
                    showFullInput={showFullInput}

                    />
            : null}

            {props.activeTool === ActiveTool.Import ?
                <TextImport
                    close={close}
                    showFullInput={showFullInput}

                />
            : null}

            {matrix && props.activeTool === ActiveTool.Export ?
                <MatrixExport
                    matrix={matrix}
                    close={close}
                    showFullInput={showFullInput}/>
            : null}


            {matrix ?
                (matrix.length <= 51 && matrix[0].length <= 51) ?
                    <Table
                        matrix={matrix}
                        selection = {selection}
                        backspaceSelection = {backspaceSelection}
                    />
                    : 
                    <div className={styles.bigMatrixInfo}>
                        Matrices larger than 50 x 50 are too big to be displayed<br />
                        Use Import or Actions to edit the matrix<br />
                        Use Export to view the matrix
                    </div> 
            : null}

            {showFullInput ? 
                <input className={"fixed-bottom " + styles.fullInput}
                value={matrix ? matrix[boxSelection.start.x][boxSelection.start.y] : ""}
                id = {"fullInput"}
                onChange={(e) => {
                    e.stopPropagation()
                    dispatch(updateEntry({
                        "name": selection, 
                        "row": boxSelection.start.x,
                        "col": boxSelection.start.y,
                        "updated": (e.target as HTMLInputElement).value,
                        "mirror": settings["Mirror Inputs"]
                    }));
                }} 
                onKeyDown = {(e) => backspaceSelection(e)}
                /> 

            : null}

            {selection !== "" ?
            <p className = {styles.currentSelection}>
                {formatName(selection) + " " + formatSelection(boxSelection)}
            </p> 
            :  
            <div className={styles.bigMatrixInfo}>
                No Matrix Selected
            </div> 
            }

        </div>)

}

export default MatrixEditor;
