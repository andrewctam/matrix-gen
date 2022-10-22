
import { useState } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../inputs/ParameterBoxInput.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';

import BasicActionButton from '../buttons/BasicActionButton';
import ActiveButton from '../buttons/ActiveButton';
import styles from "./FloatingMenu.module.css"

import { cloneMatrix } from '../matrixFunctions';
const   FloatingMenu = (props) => {

    const [showSelectors, setShowSelectors] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [multiSelected, setMultiSelected] = useState([]);

    return (<div className={styles.floatingMenu} ref={props.floatingMenuRef}>


        <div className={styles.bar}>
            <BasicActionButton
                name={"Matrices"} buttonStyle={showSelectors ? "info": "primary"}
                action={() => { setShowSelectors(!showSelectors); setShowSettings(false) }}
            />
            <BasicActionButton
                name={"Settings"} buttonStyle={showSettings ? "info": "primary"}
                action={() => { setShowSettings(!showSettings); setShowSelectors(false) }}
            />
            <div className={styles.undoRedo}>
                <BasicActionButton buttonStyle={"primary"} disabled={!props.canUndo} name="↺" action={props.undo} />
                <BasicActionButton buttonStyle={"primary"} disabled={!props.canRedo} name="↻" action={props.redo} />
            </div>

            {showSelectors ?
                <div className={styles.selectors}>
                    <MatrixSelector
                        matrices={props.matrices}
                        userMatrices={props.userMatrices}
                        name={props.selection}
                        setSelection={props.setSelection}
                        selection={props.selection}
                        updateMatrix={props.updateMatrix}
                        renameMatrix={props.renameMatrix}
                        showMerge={props.showMerge}
                        multiSelected={multiSelected}
                        setMultiSelected={setMultiSelected}
                    />

                    <div>
                        <BasicActionButton
                            key="addButton" name={"New Matrix"} buttonStyle={"success"}
                            action={() => {
                                props.updateMatrix(undefined, undefined, true); //generates a new matrix
                            }}
                        />

                        {props.selection !== "0" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"success"} name={`Duplicate ${props.selection}`}
                                action={() => { props.updateMatrix(undefined, cloneMatrix(props.matrices[props.selection])) }} />
                            : null}

                        {props.selection !== "0" ?
                            <BasicActionButton
                                key="deleteButton" buttonStyle={"danger"} name={`Delete ${props.selection}`}
                                action={() => {
                                    if (props.selection !== "0" && window.confirm(`Are you sure you want to delete ${props.selection}?`)) {
                                        props.deleteMatrix(props.selection);
                                        props.setSelection("0");
                                    }
                                }} />
                            : null}


                        <BasicActionButton
                            buttonStyle={"danger"} name={`Delete ${multiSelected.length > 0 ? "Selected" : "All"}`}
                            disabled={!(props.matrices && Object.keys(props.matrices).length) > 0}
                            action={() => {
                                if (props.deleteSelectedMatrices(multiSelected))
                                    setMultiSelected([])
                            }}
                        />
                    </div>
                </div> : null}




            {showSettings ?
                <div className={styles.settingsMenu}>
                    <ParameterBoxInput isChecked={props.mirror} name={"Mirror Inputs"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={!props.selectable} name={"Disable Selection"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={props.numbersOnly} name={"Numbers Only Input"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={props.darkModeTable} name={"Dark Mode Table"} updateParameter={props.updateParameter} />
                    <div>{"Empty Element: "} <ParameterTextInput width={"30px"} text={props.sparseVal} id={"Empty Element"} updateParameter={props.updateParameter} /></div>
                    <div>{"Decimals To Round: "} <ParameterTextInput width={"30px"} text={props.rounding} id={"Decimals To Round"} updateParameter={props.updateParameter} placeholder={props.rounding === "" ? "None" : ""} /></div>

                </div>
                : null}




        </div>
        <div className={styles.bar}>


            {props.selection in props.matrices ?
            <>
            <ActiveButton name="Matrix Actions" active={props.showActions} action={props.toggleShown} />

            <ActiveButton name="Matrix Math" active={props.showMath} action={props.toggleShown} />

            {props.selectable ?
                <ActiveButton name="Selection Settings" active={props.showSelectionMenu} action={props.toggleShown} />
                : null}

            <ActiveButton name="Export Matrix" active={props.showExport} action={props.toggleShown} />
            </>: null}
            <ActiveButton name="Import Matrix From Text" active={props.showImport} action={props.toggleShown}/>



        </div>

    </div>)
}

export default FloatingMenu