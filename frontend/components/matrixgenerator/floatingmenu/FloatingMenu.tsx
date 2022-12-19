
import React, { useState, useRef } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../../inputs/ParameterBoxInput';
import ParameterTextInput from '../../inputs/ParameterTextInput';

import BasicActionButton from '../../buttons/BasicActionButton';
import ActiveButton from '../../buttons/ActiveButton';
import styles from "./FloatingMenu.module.css"
import useMove from '../../../hooks/useMove';

import { cloneMatrix } from '../../matrixFunctions';
import { Matrices, Settings } from '../../App';
import { Tools } from '../MatrixGenerator';

interface FloatingMenuProps {
    matrices: Matrices
    matrix: string[][] | null
    matrixDispatch: React.Dispatch<any>
    selection: string
    setSelection: (str: string) => void
    showMerge: boolean
    userMatrices: Matrices | null
    settings: Settings
    settingsDispatch: React.Dispatch<any>
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    toolActive: Tools
    toolDispatch: React.Dispatch<any>
    addAlert: (str: string, time: number, type?: string) => void

}


const FloatingMenu = (props: FloatingMenuProps) => {

    const [showSelectors, setShowSelectors] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [multiSelected, setMultiSelected] = useState<string[]>([]);

    const selectors = useRef<HTMLDivElement | null>(null);
    const selectorsToggle = useRef<HTMLButtonElement | null>(null);
    const settings = useRef<HTMLDivElement | null>(null);
    const settingsToggle = useRef<HTMLButtonElement | null>(null);

    const [selectorsX, selectorsY] = useMove(selectors, selectorsToggle);
    const [settingsX, settingsY] = useMove(settings, settingsToggle);

    const [lastClicked, setLastClicked] = useState<string>("settings");

    const updateSetting = (name: string, value: string) => {
        props.settingsDispatch({ "type": "UPDATE_SETTING", "payload": {"name": name, "value": value }});
    }

    const toggleTool = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.toolDispatch({ "type": "TOGGLE", payload: {"name": (e.target as HTMLButtonElement).id } });
    }



    const deleteSelectedMatrices = (matricesToDelete: string[]) => {
        if (matricesToDelete.length === 0) { //if input is empty, delete all
            if (window.confirm("Are you sure you want to delete all of your matrices?")) {
                props.setSelection("");
                props.matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": {} } });
                localStorage.removeItem("matrices");
                return true;
            }
            return false;
        } else if (window.confirm(`Are you sure you want to delete these matrices: ${matricesToDelete.join(" ")}?`)) {
            const tempObj = { ...props.matrices };

            for (let i = 0; i < matricesToDelete.length; i++) {
                if (props.selection === matricesToDelete[i])
                    props.setSelection("");

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
                    <ActiveButton name="Actions" id = {"Actions"}  active={props.toolActive["Actions"]} action={toggleTool} />

                    <ActiveButton name="Math" id = {"Math"} active={props.toolActive["Math"]} action={toggleTool} />

                    {!props.settings["Disable Selection"] ?
                        <ActiveButton name="Selection" id = {"Selection"} active={props.toolActive["Selection"]} action={toggleTool} />
                        : null}

                    <ActiveButton name="Export" id = {"Export"} active={props.toolActive["Export"]} action={toggleTool} />
                </> : null}
            <ActiveButton name="Import" id = {"Import"} active={props.toolActive["Import"]} action={toggleTool} />



        </div>

        {showSelectors ?
            <div className={styles.selectors} 
                style = {
                        window.innerWidth < 1133 ? undefined : { 
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

                        {props.selection !== "" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"success"} name={`Duplicate ${props.selection}`}
                                action={() => { 
                                    props.matrixDispatch({type: "UPDATE_MATRIX", payload: {name: undefined, matrix: cloneMatrix(props.matrices[props.selection])}});
                                }} />
                            : null}
                    </div>
                    <div className = {styles.pair}>
                        {props.selection !== "" ?
                            <BasicActionButton
                                key="deleteButton" buttonStyle={"danger"} name={`Delete ${props.selection}`}
                                action={() => {
                                    if (props.selection !== "") {
                                        props.matrixDispatch({type: "DELETE_MATRIX", payload: {name: props.selection}});
                                        props.setSelection("");
                                    }
                                }} />
                            : null}


                        <BasicActionButton
                            buttonStyle={"danger"} name={`Delete ${multiSelected.length > 0 ? "Selected" : "All"}`}
                            disabled={!props.matrices || Object.keys(props.matrices).length === 0}
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
            style={window.innerWidth < 1133 ? undefined : { 
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
                    <ParameterTextInput width={"30px"} text={props.settings["Decimals To Round"].toString()} id={"Decimals To Round"} updateParameter={updateSetting} placeholder={props.settings["Decimals To Round"] === "0" ? "None" : ""} />
                </div>

            </div>
            : null}



    </div>)
}

export default FloatingMenu