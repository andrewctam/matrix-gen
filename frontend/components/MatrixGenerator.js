import { useState } from "react";
import FloatingMenu from "./selectors/FloatingMenu";
import MatrixEditor from "./editor/MatrixEditor";

const MatrixGenerator = (props) => {

    const [showActions, setShowActions] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showMath, setShowMath] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);

    
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

            updateMatrix={props.updateMatrix}
            deleteMatrix={props.deleteMatrix}
            renameMatrix={props.renameMatrix}
            toggleShown={toggleShown}

            mirror={props.mirror}
            sparseVal={props.sparseVal}
            numbersOnly={props.numbersOnly}
            selectable={props.selectable}
            rounding={props.rounding}


            undo={props.undo}
            canUndo={props.canUndo}
            redo={props.redo}
            canRedo={props.canRedo}

            showActions={showActions}
            setShowActions={setShowActions}
            showExport={showExport}
            setShowExport={setShowExport}
            showMath={showMath}
            setShowMath={setShowMath}
            showImport={showImport}
            setShowImport={setShowImport}
            showSelectionMenu={showSelectionMenu}
            setShowSelectionMenu={setShowSelectionMenu}
            
        />


        <MatrixEditor
            matrices={props.matrices}
            matrix={props.selection in props.matrices ? props.matrices[props.selection] : null}
            name={props.selection}
            setSelection={props.setSelection}

            deleteMatrix={props.deleteMatrix}
            renameMatrix={props.renameMatrix}

            updateParameter={props.updateParameter}
            mirror={props.mirror}
            sparseVal={props.sparseVal}
            numbersOnly={props.numbersOnly}
            selectable={props.selectable}

            updateMatrix={props.updateMatrix}

            firstVisit={props.firstVisit}
            rounding={props.rounding}

            darkModeTable={props.darkModeTable}


            showActions={showActions}
            setShowActions={setShowActions}
            showExport={showExport}
            setShowExport={setShowExport}
            showMath={showMath}
            setShowMath={setShowMath}
            showImport={showImport}
            setShowImport={setShowImport}
            showSelectionMenu={showSelectionMenu}
            setShowSelectionMenu={setShowSelectionMenu}



        />

    </>)
}

export default MatrixGenerator;