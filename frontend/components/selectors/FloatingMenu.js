
import { useState } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../inputs/ParameterBoxInput.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';

import BasicActionButton from '../buttons/BasicActionButton';
import styles from "./FloatingMenu.module.css"

import { cloneMatrix } from '../matrixFunctions';
const FloatingMenu = (props) => {

    const [showSelectors, setShowSelectors] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [multiSelected, setMultiSelected] = useState([]);

    return (<div className={styles.floatingMenu}>
        <div className={styles.matrices}>
            <div className={styles.toggleSelectors} onClick={() => { setShowSelectors(!showSelectors) }}
                style={showSelectors ? { borderTopLeftRadius: "0px", borderTopRightRadius: "0px" } : null}>
                Matrices
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

                    <div className={styles.buttons}>
                        <BasicActionButton
                            key="addButton" name={"New Matrix"} buttonStyle={"primary"}
                            action={() => {
                                props.updateMatrix(undefined, undefined, true); //generates a new matrix
                            }}
                        />

                        {props.selection !== "0" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"primary"} name={`Duplicate ${props.selection}`}
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


        </div>

        <div className={styles.settings}>
            <div onClick={() => { setShowSettings(!showSettings) }} className={styles.toggleSettings}
                style={showSettings ? { borderTopLeftRadius: "0px", borderTopRightRadius: "0px" } : null}>
                Settings
            </div>
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

    </div>)
}

export default FloatingMenu