import { useState, useReducer } from "react";
import FloatingMenu from "./selectors/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";

const MatrixGenerator = (props) => {

    const [toolActive, toolDispatch] = useReducer((state, action) => {
        const disabled = {
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
            selection={props.selection}
            matrix={props.matrices[props.selection]}

            updateParameter={props.updateParameter}
            setSelection={props.setSelection}
            updateMatrices={props.updateMatrices}
            deleteSelectedMatrices={props.deleteSelectedMatrices}

            updateMatrixSettings={props.updateMatrixSettings}

            matrixDispatch={props.matrixDispatch}

            settings={props.settings}
            settingsDispatch={props.settingsDispatch}

            undo={props.undo}
            canUndo={props.canUndo}
            redo={props.redo}
            canRedo={props.canRedo}

            toolActive={toolActive}
            toolDispatch={toolDispatch}

        />


        <MatrixEditor
            matrices={props.matrices}
            matrix={props.matrix}
            name={props.selection}
            setSelection={props.setSelection}

            matrixDispatch={props.matrixDispatch}

            firstVisit={props.firstVisit}

            settings={props.settings}


            toolActive={toolActive}
            toolDispatch={toolDispatch}
        />

    </>)
}

export default MatrixGenerator;