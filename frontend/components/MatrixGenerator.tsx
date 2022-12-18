import { useReducer } from "react";
import FloatingMenu from "./selectors/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";
import { Matrices, Settings } from "./App";

interface MatrixGeneratorProps {
    matrices: Matrices
    matrix: string[][] | null
    matrixDispatch: React.Dispatch<any>
    selection: string
    setSelection: (str: string) => void
    updateMatrixSettings: () => void
    settings: Settings
    settingsDispatch: React.Dispatch<any>
    showMerge: boolean
    userMatrices: Matrices | null
    undo: () => void
    redo: () => void
    undoStack: Matrices[]
    redoStack: Matrices[]
    addAlert: (str: string, time: number, type?: string) => void
}

export interface Tools { 
    "Matrix Actions": boolean,
    "Export Matrix": boolean,
    "Matrix Math": boolean,
    "Import From Text": boolean,
    "Selection": boolean
}

type ToolsAction = {type: "TOGGLE", payload: {name: keyof Tools}} | {"type": "CLOSE"}

const MatrixGenerator = (props: MatrixGeneratorProps) => {
    const [toolActive, toolDispatch] = useReducer((state: Tools, action: ToolsAction) => {
        const disabled: Tools = { 
            "Matrix Actions": false,
            "Export Matrix": false,
            "Matrix Math": false,
            "Import From Text": false,
            "Selection": false
        } //only one can be active at a time

        switch (action.type) {
            case "TOGGLE":
                if (typeof action.payload.name !== "string" &&
                  !(action.payload.name === "Matrix Actions" || 
                    action.payload.name === "Export Matrix" || 
                    action.payload.name === "Matrix Math" || 
                    action.payload.name === "Import From Text" || 
                    action.payload.name === "Selection"
                ))
                    return state;
                    
                disabled[action.payload.name] = !state[action.payload.name];
                
                return disabled;
            case "CLOSE":
                return disabled;
            default:
                return state;
        }
    }, {
        "Matrix Actions": false,
        "Export Matrix": false,
        "Matrix Math": false,
        "Import From Text": false,
        "Selection": false
    });




    return (<>
        <FloatingMenu
            matrices={props.matrices}
            matrix={props.matrix}
            matrixDispatch={props.matrixDispatch}

            selection={props.selection}
            setSelection={props.setSelection}

            showMerge={props.showMerge}
            userMatrices = {props.userMatrices}

            settings={props.settings}
            settingsDispatch={props.settingsDispatch}

            undo={props.undo}
            redo={props.redo}
            canUndo={props.undoStack.length > 0}
            canRedo={props.redoStack.length > 0}

            toolActive={toolActive}
            toolDispatch={toolDispatch}

            addAlert={props.addAlert}
        />


        <MatrixEditor
            matrices={props.matrices}
            matrix={props.matrix}
            name={props.selection}

            matrixDispatch={props.matrixDispatch}
            settings={props.settings}

            undoStack = {props.undoStack}
            redoStack = {props.redoStack}
            toolActive={toolActive}
            toolDispatch={toolDispatch}

            addAlert = {props.addAlert}
        />

    </>)
}

export default MatrixGenerator;