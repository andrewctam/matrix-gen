import { useEffect, useState } from "react";
import TopMenu from "./floatingmenu/TopMenu";
import MatrixEditor from "./editor/MatrixEditor";
import { useAppDispatch } from "../../hooks/hooks";
import { redo, undo } from "../../features/matrices-slice";
import useSaving from "../../hooks/useSaving";


export const enum ActiveTool {
    Actions, Export, Math, Import, Selection, None
}


const MatrixGenerator = () => {
    const dispatch = useAppDispatch();
    const [activeTool, setActiveTool] = useState<ActiveTool>(ActiveTool.None);

    const doneLoading = useSaving();

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
            activeTool={activeTool}
            setActiveTool = {setActiveTool}
        />

        { doneLoading ?
        <MatrixEditor
            activeTool={activeTool}
            setActiveTool = {setActiveTool}
        /> : null }

    </>)
}

export default MatrixGenerator;