import { useReducer } from "react";
import FloatingMenu from "./floatingmenu/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";
import { Matrices, MatricesAction, Settings, SettingsAction } from "../App";

interface MatrixGeneratorProps {
    matrices: Matrices
    matrix: string[][] | null
    matrixDispatch: React.Dispatch<MatricesAction>
    selection: string
    setSelection: (str: string) => void
    updateMatrixSettings: () => void
    settings: Settings
    settingsDispatch: React.Dispatch<SettingsAction>
    showMerge: boolean
    userMatrices: Matrices | null
    undo: () => void
    redo: () => void
    username: string
    undoStack: Matrices[]
    redoStack: Matrices[]
    addAlert: (str: string, time: number, type?: string) => void
}

export interface Tools { 
    "Actions": boolean,
    "Export": boolean,
    "Math": boolean,
    "Import": boolean,
    "Selection": boolean
}

export type ToolsAction = {type: "TOGGLE", payload: {name: keyof Tools}} | {"type": "CLOSE"}

const MatrixGenerator = (props: MatrixGeneratorProps) => {
    const [toolActive, toolDispatch] = useReducer((state: Tools, action: ToolsAction) => {
        const disabled: Tools = { 
            "Actions": false,
            "Export": false,
            "Math": false,
            "Import": false,
            "Selection": false
        } //only one can be active at a time

        switch (action.type) {
            case "TOGGLE":
                if (typeof action.payload.name !== "string" &&
                  !(action.payload.name === "Actions" || 
                    action.payload.name === "Export" || 
                    action.payload.name === "Math" || 
                    action.payload.name === "Import" || 
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
        "Actions": false,
        "Export": false,
        "Math": false,
        "Import": false,
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
            username = {props.username}

        />

    </>)
}

export default MatrixGenerator;