import { useEffect, useReducer } from "react";
import TopMenu from "./floatingmenu/TopMenu";
import MatrixEditor from "./editor/MatrixEditor";
import { useAppDispatch } from "../../hooks/hooks";
import { redo, undo } from "../../features/matrices-slice";


export interface Tools { 
    "Actions": boolean,
    "Export": boolean,
    "Math": boolean,
    "Import": boolean,
    "Selection": boolean
}

export type ToolsAction = {type: "TOGGLE", payload: {name: keyof Tools}} | {"type": "CLOSE"}

const MatrixGenerator = () => {
    const dispatch = useAppDispatch();
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


    useEffect(() => {
        const handleUndoRedo = (e: KeyboardEvent) => {
            if (e.metaKey && (!document.activeElement || document.activeElement.tagName !== "INPUT")) {
                if (e.key === "z") {
                    dispatch(undo());
                } else if (e.key === "y") {
                    dispatch(redo());
                }
            }
        }

        window.addEventListener('keydown', handleUndoRedo)

        return () => removeEventListener('keydown', handleUndoRedo)
    }, [])




    return (<>
        <TopMenu
            toolActive={toolActive}
            toolDispatch={toolDispatch}
        />


        <MatrixEditor
            toolActive={toolActive}
            toolDispatch={toolDispatch}
        />

    </>)
}

export default MatrixGenerator;