import React, { useState, useRef } from 'react';
import ParameterBoxInput from '../inputs/ParameterBoxInput';
import ParameterTextInput from '../inputs/ParameterTextInput';
import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';
import MenuButton from '../buttons/MenuButton';
import TextActionButton from '../buttons/TextActionButton';
import MatrixSelector from './selectors/MatrixSelector';
import Toggle from '../buttons/Toggle';

import styles from "./Navigation.module.css";
import {cloneMatrix, createIdentity} from '../matrixFunctions';

const Navigation = (props) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [showTutorial, setShowTutorial] = useState(props.firstVisit);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [identitySize, setIdentitySize] = useState(3);

    const [showNavigation, setShowNavigation] = useState(true);
    const [showGeneralTools, setShowGeneralTools] = useState(true);
    const [showMatrixTools, setShowMatrixTools] = useState(true);

    const navigationRef = useRef(null);

    const [multiSelected, setMultiSelected] = useState([]);

    const updatePresetParameter = (parameterName, updated) => {
        switch (parameterName) {
            case "Identity Matrix ":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setIdentitySize(updated);
                break;

            default: break;
        }
    }

    if (props.showMerge) {
        var saving = `Logged in as ${props.username}. There is currently a storage conflict. Please see Save Matrices.`;
    } else if (props.username) {
        if (props.dataTooLarge) {
            if (props.saveToLocal) {
                saving = `Logged in as ${props.username}. Matrices are too large and new changes may not be saved to your account, but they will be saved to local storage.`;
            } else {
                saving = `Logged in as ${props.username}. WARNING: Matrices are too large and new changes may not be saved to your account. Please decrease matrices' size or enable saving to local storage. `;

            }
        } else if (props.saveToLocal)
            saving = `Logged in as ${props.username}. Matrices will be saved to your account and to your local browser's storage.`;
        else
            saving = `Logged in as ${props.username}. Matrices will be saved to your account.`;
    } else if (props.saveToLocal) {
        saving = `Matrices will be saved to your local browser's storage.`;
    } else {
        saving = "Matrices will not be saved if you refresh the page. If you want to save your matrices, click Save Matrices.";
    }


    return <div className = {styles.navigateBar}>
    <div className = {styles.topBar}>
        <p onClick={() => { setShowSaveMenu(!showSaveMenu) }} className={styles.savingInfo}>{saving}</p>
    </div>
    {showNavigation ? 
    <div ref = {navigationRef} className={"row " + styles.mainBar}>

        {showSaveMenu ?
            <SaveMatrices
                username={props.username}
                updateUserInfo={props.updateUserInfo}
                saveToLocal={props.saveToLocal}
                updateParameter={props.updateParameter}
                matrices={props.matrices}
                refreshTokens={props.refreshTokens}

                updateMatrices={props.updateMatrices}
                setSelection={props.setSelection}
                showMerge={props.showMerge}
                userMatrices={props.userMatrices}
                setShowMerge={props.setShowMerge}
                closeSaveMenu={() => {setShowSaveMenu(false)}}
            /> : null}

        {showTutorial ? <Tutorial closeTutorial={() => {setShowTutorial(false)}} /> : null}



        <div className={"col-sm-4 order-sm-1 " + styles.generalTools}>
           
            <button
                className = {"btn btn-secondary " + styles.toolToggle}
                onClick = {() => {setShowGeneralTools(!showGeneralTools)}}>
                {showGeneralTools ? "Hide General Tools" : "General Tools"}
            </button>


            {showGeneralTools ?
            <div id="selectors" className="list-group">
                <MenuButton
                    text={showSaveMenu ? "Hide Save Menu" : "Save Matrices"}
                    buttonStyle={"info"}
                    action={() => {
                        setShowSaveMenu(!showSaveMenu)
                    }}
                />

                <MenuButton
                    text={showTutorial ? "Hide Tutorial" : "Show Tutorial"}
                    buttonStyle={"info"}
                    action={() => { setShowTutorial(!showTutorial) }}
                />

                <MenuButton
                    text={showPresets ? "Hide Presets" : "Preset Matrices"}
                    buttonStyle={"primary"}
                    action={() => { setShowPresets(!showPresets) }}
                />

                <MenuButton
                    text={showSettings ? "Hide Settings" : "Settings"}
                    buttonStyle={"primary"}
                    action={() => { setShowSettings(!showSettings) }}
                />

            {showPresets ?
                <div className={styles.settingsMenu}>
                    <TextActionButton
                        name="Identity Matrix "
                        action={() => { 
                            const identity = createIdentity(parseInt(identitySize))
                            if (identity)
                                props.updateMatrix(props.name, identity)
                        }}
                        updateParameter={updatePresetParameter}
                        width={"40px"}
                        value={identitySize}
                    />
                </div> : null}


            {showSettings ?
                <div className={styles.settingsMenu}>
                    <ParameterBoxInput isChecked={props.mirror} name={"Mirror Inputs"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={!props.selectable} name={"Disable Selection"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={props.numbersOnly} name={"Numbers Only Input"} updateParameter={props.updateParameter} />
                    <ParameterBoxInput isChecked={props.darkModeTable} name={"Dark Mode Table"} updateParameter={props.updateParameter} />
                    {"Empty Element:"} <ParameterTextInput width={"50px"} text={props.sparseVal} id={"Empty Element"} updateParameter={props.updateParameter} />
                    <br />
                    {"Decimals To Round:"} <ParameterTextInput width={"50px"} text={props.rounding} id={"Decimals To Round"} updateParameter={props.updateParameter} placeholder = {props.rounding === "" ? "None" : ""}/>
                </div> : null}

            </div>: null}

        </div>


        <div className={"col-sm-4 order-sm-3 " + styles.matrixTools}>
            <button
                className = {"btn btn-secondary " + styles.toolToggle}
                onClick = {() => {setShowMatrixTools(!showMatrixTools)}}>
                {showMatrixTools ? "Hide Matrix Tools" : "Matrix Tools"}
            </button>

            { showMatrixTools ?
            <div id="selectors" className="list-group">
                <MenuButton
                    key="addButton"
                    text={"Create New Empty Matrix"}
                    buttonStyle={"secondary"}
                    action={() => {
                        var newName = props.updateMatrix(); //generates a new matrix and returns name
                        props.setSelection(newName);
                    }}
                />

                {props.selection !== "0" ?
                    <MenuButton
                        key="duplicateButton"
                        buttonStyle={"secondary"}
                        text={`Duplicate Matrix ${props.selection}`}
                        action={() => { props.updateMatrix(undefined, cloneMatrix(props.matrices[props.selection])) }} />
                    : null}

                {props.selection !== "0"?
                    <MenuButton
                        key="deleteButton"
                        buttonStyle={"danger"}
                        text={`Delete Matrix ${props.selection}`}
                        action={() => {
                           if (props.selection !== "0" && window.confirm(`Are you sure you want to delete ${props.selection}?`)) {
                                props.deleteMatrix(props.selection);
                                props.setSelection("0");
                            }
                        }} />
                    : null}

                {props.matrices && Object.keys(props.matrices).length > 0 ?
                    <MenuButton
                        buttonStyle={"danger"}
                        text={`Delete ${multiSelected.length > 0 ? "Selected (Pink)" : "All"} Matrices`}
                        action={() => {
                            if (props.deleteSelectedMatrices(multiSelected))
                                setMultiSelected([])
                        }}
                    />
                : null}

            </div> 
            : null}
                
        </div>


        <div className={"col-sm-4 order-sm-2 " + styles.selectors}>
            <MatrixSelector 
                matrices={props.matrices}
                userMatrices={props.userMatrices}
                name = {props.name}
                setSelection={props.setSelection}
                selection = {props.selection}
                updateMatrix={props.updateMatrix}
                renameMatrix={props.renameMatrix}
                showMerge = {props.showMerge}
                multiSelected = {multiSelected}
                setMultiSelected = {setMultiSelected}
            />
        </div>


        </div> : null}

        <Toggle show = {showNavigation} toggle = {() => {setShowNavigation(!showNavigation)}}/>

    </div>
}


export default Navigation;
