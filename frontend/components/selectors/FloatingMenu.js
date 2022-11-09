
import { useState, useRef } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../inputs/ParameterBoxInput.js';
import ParameterTextInput from '../inputs/ParameterTextInput.js';

import BasicActionButton from '../buttons/BasicActionButton';
import ActiveButton from '../buttons/ActiveButton';
import styles from "./FloatingMenu.module.css"
import useMove from '../../hooks/useMove';

import { cloneMatrix } from '../matrixFunctions';
const FloatingMenu = (props) => {

    const [showSelectors, setShowSelectors] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [multiSelected, setMultiSelected] = useState([]);

    const selectors = useRef(null);
    const selectorsToggle = useRef(null);
    const settings = useRef(null);
    const settingsToggle = useRef(null);

    const [selectorsX, selectorsY] = useMove(selectors, selectorsToggle);
    const [settingsX, settingsY] = useMove(settings, settingsToggle);

    const [lastClicked, setLastClicked] = useState(null);

    const updateSetting = (name, value) => {
        props.settingsDispatch({ "type": "UPDATE_SETTING", "payload": {"name": name, "value": value }});
    }

    const toggleTool = (e) => {
        props.toolDispatch({ "type": "TOGGLE", payload: {"name": e.target.id } });
    }



    const deleteSelectedMatrices = (matricesToDelete) => {
        if (matricesToDelete.length === 0) { //if input is empty, delete all
            if (window.confirm("Are you sure you want to delete all of your matrices?")) {
                props.setSelection("0");
                props.matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": {} } });
                localStorage.removeItem("matrices");
                return true;
            }
            return false;
        } else if (window.confirm(`Are you sure you want to delete these matrices: ${matricesToDelete.join(" ")}?`)) {
            const tempObj = { ...props.matrices };

            for (let i = 0; i < matricesToDelete.length; i++) {
                if (props.selection === matricesToDelete[i])
                    props.setSelection("0");

                delete tempObj[matricesToDelete[i]];
            }

            props.matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": tempObj } });
            return true;
        }

        return false;

    }

    return (<div className={styles.floatingMenu}>
        <div className={styles.bar}>
            <BasicActionButton
                innerRef={selectorsToggle}
                name={"Matrices"} buttonStyle={showSelectors ? "info" : "primary"}
                action={() => {setShowSelectors(!showSelectors); }}
            />
            <BasicActionButton
                innerRef={settingsToggle}
                name={"Settings"} buttonStyle={showSettings ? "info" : "primary"}
                action={() => { setShowSettings(!showSettings); setLastClicked("settings");}}
            />
            <div className={styles.pair}>
                <BasicActionButton buttonStyle={"primary"} disabled={!props.canUndo} name="↺" action={props.undo} />
                <BasicActionButton buttonStyle={"primary"} disabled={!props.canRedo} name="↻" action={props.redo} />
            </div>
        </div>
        <div className={styles.bar}>


            {props.selection in props.matrices ?
                <>
                    <ActiveButton name="Matrix Actions" id = {"Matrix Actions"}  active={props.toolActive["Matrix Actions"]} action={toggleTool} />

                    <ActiveButton name="Matrix Math" id = {"Matrix Math"} active={props.toolActive["Matrix Math"]} action={toggleTool} />

                    {!props.settings["Disable Selection"] ?
                        <ActiveButton name="Selection" id = {"Selection"} active={props.toolActive["Selection"]} action={toggleTool} />
                        : null}

                    <ActiveButton name="Export Matrix" id = {"Export Matrix"} active={props.toolActive["Export Matrix"]} action={toggleTool} />
                </> : null}
            <ActiveButton name="Import From Text" id = {"Import From Text"} active={props.toolActive["Import From Text"]} action={toggleTool} />



        </div>

        {showSelectors ?
            <div className={styles.selectors} 
                style={
                    window.innerWidth < 1133 ? null : { 
                        left: selectorsX, 
                        top: selectorsY, 
                        zIndex: lastClicked === "selectors" ? 5 : 4 
                }} 
                ref={selectors}
                onMouseDown = {() => {setLastClicked("selectors")}}>
                <MatrixSelector
                    matrices={props.matrices}
                    userMatrices={props.userMatrices}
                    name={props.selection}
                    setSelection={props.setSelection}
                    selection={props.selection}
                    matrixDispatch={props.matrixDispatch}
                    showMerge={props.showMerge}
                    multiSelected={multiSelected}
                    setMultiSelected={setMultiSelected}
                    
                    addAlert={props.addAlert}
                />

                <div>
                    <div className = {styles.pair}>
                        <BasicActionButton
                            key="addButton" name={"New Matrix"} buttonStyle={"success"}
                            action={() => {
                                props.matrixDispatch({type: "UPDATE_MATRIX", payload: {name: undefined, matrix: undefined}}); //new matrix
                            }}
                        />

                        {props.selection !== "0" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"success"} name={`Duplicate ${props.selection}`}
                                action={() => { 
                                    props.matrixDispatch({type: "UPDATE_MATRIX", payload: {name: undefined, matrix: cloneMatrix(props.matrices[props.selection])}});
                                }} />
                            : null}
                    </div>
                    <div className = {styles.pair}>
                        {props.selection !== "0" ?
                            <BasicActionButton
                                key="deleteButton" buttonStyle={"danger"} name={`Delete ${props.selection}`}
                                action={() => {
                                    if (props.selection !== "0") {
                                        props.matrixDispatch({type: "DELETE_MATRIX", payload: {name: props.selection}});
                                        props.setSelection("0");
                                    }
                                }} />
                            : null}


                        <BasicActionButton
                            buttonStyle={"danger"} name={`Delete ${multiSelected.length > 0 ? "Selected" : "All"}`}
                            disabled={!(props.matrices && Object.keys(props.matrices).length) > 0}
                            action={() => {
                                if (deleteSelectedMatrices(multiSelected))
                                    setMultiSelected([])
                            }}
                        />
                    </div>
                </div>
            </div> : null}




        {showSettings ?
            <div 
            className={styles.settingsMenu} 
            ref={settings}
            style={window.innerWidth < 1133 ? null : { 
                left: settingsX,
                top: settingsY, 
                zIndex: lastClicked === "settings" ? 5 : 4 }}
                onMouseDown = {() => {setLastClicked("settings")}}
                >
                <ParameterBoxInput isChecked={props.settings["Mirror Inputs"]} name={"Mirror Inputs"} updateParameter={updateSetting} />
                <ParameterBoxInput isChecked={props.settings["Disable Selection"]} name={"Disable Selection"} updateParameter={updateSetting} />
                <ParameterBoxInput isChecked={props.settings["Numbers Only Input"]} name={"Numbers Only Input"} updateParameter={updateSetting} />
                <ParameterBoxInput isChecked={props.settings["Dark Mode Table"]} name={"Dark Mode Table"} updateParameter={updateSetting} />
                <div>{"Empty Element: "} 
                    <ParameterTextInput width={"30px"} text={props.settings["Empty Element"]} id={"Empty Element"} updateParameter={updateSetting} />
                </div>
                <div>{"Decimals To Round: "} 
                    <ParameterTextInput width={"30px"} text={props.settings["Decimals To Round"]} id={"Decimals To Round"} updateParameter={updateSetting} placeholder={props.settings["Decimals To Round"] === "" ? "None" : ""} />
                </div>

            </div>
            : null}



    </div>)
}

export default FloatingMenu