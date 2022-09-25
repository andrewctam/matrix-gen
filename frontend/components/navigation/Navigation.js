import React, { useState, useEffect, useRef } from 'react';
import ParameterBoxInput from '../inputs/ParameterBoxInput';
import ParameterTextInput from '../inputs/ParameterTextInput';

import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';
import SelectorButton from './buttons/SelectorButton';
import MenuButton from './buttons/MenuButton';
import TextActionButton from "../editor/matrixTools/TextActionButton"
import styles from "./Navigation.module.css";

const Navigation = (props) => {
    const [selectors, setSelectors] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");

    const [showSettings, setShowSettings] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [identitySize, setIdentitySize] = useState(3);

    const [showGeneralTools, setShowGeneralTools] = useState(true);
    const [showMatrixTools, setShowMatrixTools] = useState(true);

    const navigationRef = useRef(null);
    useEffect(() => {
        if (window.localStorage.getItem("First Visit") === null) {
            setShowTutorial(true);
            window.localStorage.setItem("First Visit", "0");
        }
    }, [])

    useEffect(() => {

        const sizeFilters = [];
        const split = searchSize.split("x");
        if (searchSize !== "") {
            for (let i = 0; i < split.length; i++) {
                const temp = parseInt(split[i])
                if (!isNaN(temp))
                    sizeFilters.push(temp)
            }
        }

        if (props.showMerge) {
            var intersection = Object.keys(props.matrices).filter(x => props.userMatrices.hasOwnProperty(x));
        }

        const tempSelectors = []
        for (const matrixName in props.matrices) {
            if ((searchName === "" || matrixName.startsWith(searchName)) &&
                (searchSize === "" || verifySize(matrixName, sizeFilters)))
                tempSelectors.push(
                    <SelectorButton
                        name={matrixName}
                        key={matrixName}
                        setSelection={props.setSelection}
                        renameMatrix={props.renameMatrix}
                        resizeMatrix={props.resizeMatrix}
                        active={props.selection === matrixName}
                        matrices={props.matrices}

                        intersectionMerge={props.showMerge && intersection.includes(matrixName)}
                    />
                )
        }


        if (tempSelectors.length === 0)
            if (props.matrices)
                tempSelectors.push(<div key="noMatrices" className={styles.noMatrices}>{"No Matrices Found"}</div>);
            else
                tempSelectors.sort((selector1, selector2) => {
                    return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
                });

        setSelectors(tempSelectors);
        // eslint-disable-next-line
    }, [props.matrices, props.selection, searchName, searchSize]);

    const updatePresetParameter = (parameterName, updated) => {
        switch (parameterName) {
            case "Identity Matrix ":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setIdentitySize(updated);
                break;

            default: break;
        }
    }
    const updateSearchName = (e) => {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated))
            setSearchName(updated);
    }

    const updateSearchSize = (e) => {
        const updated = e.target.value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) //only allow digits and one instance of "x"
            setSearchSize(updated);
    }


    const verifySize = (name, sizeFilters) => {
        const matrix = props.matrices[name];
        const rows = matrix.length - 1;
        const cols = matrix[0].length - 1;

        if (sizeFilters.length === 1) //only a number entered
            return rows === sizeFilters[0] || cols === sizeFilters[0]
        else //n x m entered
            return rows === sizeFilters[0] && cols === sizeFilters[1];

    }

    const closeTutorial = () => {
        setShowTutorial(false);
    }

    const closeSaveMenu = () => {
        setShowSaveMenu(false);
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


    return <div ref = {navigationRef} className={"row " + styles.navigateBar}>
        <p onClick={() => { setShowSaveMenu(!showSaveMenu) }} className={styles.savingInfo}>{saving}</p>

        {showSaveMenu ?
            <SaveMatrices
                username={props.username}
                updateUserInfo={props.updateUserInfo}
                saveToLocal={props.saveToLocal}
                updateParameter={props.updateParameter}
                matrices={props.matrices}
                refreshTokens={props.refreshTokens}

                setMatrices={props.setMatrices}
                setSelection={props.setSelection}
                showMerge={props.showMerge}
                userMatrices={props.userMatrices}
                setShowMerge={props.setShowMerge}
                closeSaveMenu={closeSaveMenu}
            /> : null}

        {showTutorial ? <Tutorial closeTutorial={closeTutorial} /> : null}



        <div className={"col-sm-4 " + styles.info}>
           
            <button
                className = {"btn btn-primary " + styles.toolToggle}
                onClick = {() => {setShowGeneralTools(!showGeneralTools)}}>
                {showGeneralTools ? "Hide General Tools" : "General Tools"}
            </button>


            {showGeneralTools ?
            <div id="selectors" className="list-group">


                <MenuButton
                    text={showSaveMenu ? "Close Save Menu" : "Save Matrices"}
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
                        action={() => { props.createIdentity(parseInt(identitySize)) }}
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
                    {"Empty Element:"} <ParameterTextInput width={"30px"} text={props.sparseVal} id={"Empty Element"} updateParameter={props.updateParameter} />
                </div> : null}

            </div>: null}



        </div>


        <div className="col-sm-4">
            <input className={styles.nameSearchBar} onChange={updateSearchName} value={searchName} placeholder='Search by Name'></input>
            <input className={styles.sizeSearchBar} onChange={updateSearchSize} value={searchSize} placeholder='Search by Size'></input>

            <div id="selectors" className={"list-group " + styles.matrixSelectorContainer}> {selectors} </div>
        </div>


        <div className={"col-sm-4 " + styles.info}>
            <button
                className = {"btn btn-primary " + styles.toolToggle}
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
                        var newName = props.setMatrix();
                        props.setSelection(newName);
                    }}
                />

                {props.selection !== "0" ?
                    <MenuButton
                        key="duplicateButton"
                        buttonStyle={"secondary"}
                        text={`Duplicate Matrix ${props.selection}`}
                        action={() => { props.copyMatrix(props.selection) }} />
                    : null}

                {props.selection !== "0" ?
                    <MenuButton
                        key="deleteButton"
                        buttonStyle={"danger"}
                        text={`Delete Matrix ${props.selection}`}
                        action={() => {
                            if (props.selection !== "0" && window.confirm("Are you sure you want to delete " + props.selection + "?")) {
                                props.deleteMatrix(props.selection);
                                props.setSelection("0");
                            }
                        }} />
                    : null}

                {props.matrices && Object.keys(props.matrices).length > 0 ?
                    <MenuButton
                        text={"Delete All Matrices"}
                        buttonStyle={"danger"}
                        action={props.deleteAllMatrices}
                    />
                    : null}



            </div> : null}

                
        </div>



    </div>
}


export default Navigation;
