import { useReducer } from "react";
import FloatingMenu from "./floatingmenu/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";

interface MatrixGeneratorProps {
    updateMatrixSettings: () => void
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
            toolActive={toolActive}
            toolDispatch={toolDispatch}
            addAlert={props.addAlert}
        />


        <MatrixEditor
            toolActive={toolActive}
            toolDispatch={toolDispatch}
            addAlert = {props.addAlert}
        />

    </>)
}

export default MatrixGenerator;