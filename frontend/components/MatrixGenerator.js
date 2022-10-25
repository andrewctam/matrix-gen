import { useReducer } from "react";
import FloatingMenu from "./selectors/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";

const MatrixGenerator = (props) => {

    const [toolActive, toolDispatch] = useReducer((state, action) => {
        const disabled = { //only one can be active at a time
            "Matrix Actions": false,
            "Export Matrix": false,
            "Matrix Math": false,
            "Import From Text": false,
            "Selection": false
        }

        switch (action.type) {
            case "TOGGLE":
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

            deleteSelectedMatrices={props.deleteSelectedMatrices}

            settings={props.settings}
            settingsDispatch={props.settingsDispatch}

            undo={props.undo}
            redo={props.redo}
            canUndo={props.undoStack.length > 0}
            canRedo={props.redoStack.length > 0}

            toolActive={toolActive}
            toolDispatch={toolDispatch}
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
        />

    </>)
}

export default MatrixGenerator;