
import React, { useState, useRef } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../../inputs/ParameterBoxInput';
import ParameterTextInput from '../../inputs/ParameterTextInput';

import BasicActionButton from '../../buttons/BasicActionButton';
import ActiveButton from '../../buttons/ActiveButton';
import styles from "./FloatingMenu.module.css"
import useMove from '../../../hooks/useMove';

import { cloneMatrix } from '../../matrixFunctions';
import { Settings, SettingsAction } from '../../App';
import { Tools, ToolsAction } from '../MatrixGenerator';
import { deleteMatrix, Matrices, redo, undo, updateAll, updateMatrix, updateSelection } from '../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';

interface FloatingMenuProps {
    showMerge: boolean
    userMatrices: Matrices | null
    settings: Settings
    settingsDispatch: React.Dispatch<SettingsAction>
    toolActive: Tools
    toolDispatch: React.Dispatch<ToolsAction>
    addAlert: (str: string, time: number, type?: string) => void

}


const FloatingMenu = (props: FloatingMenuProps) => {

    const {matrices, selection, undoStack, redoStack} = useAppSelector((state) => state.matricesData)
    const matrixDispatch = useAppDispatch();

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
        props.settingsDispatch({ "type": "UPDATE_SETTING", "payload": {"name": name as keyof Settings, "value": value }});
    }

    const toggleTool = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.toolDispatch({ "type": "TOGGLE", payload: {"name": (e.target as HTMLButtonElement).id  as keyof Tools} });
    }



    const deleteSelectedMatrices = (matricesToDelete: string[]) => {
        if (matricesToDelete.length === 0) { //if input is empty, delete all
            if (window.confirm("Are you sure you want to delete all of your matrices?")) {
                matrixDispatch(updateAll({ "matrices": {} }))
                matrixDispatch(updateSelection(""))
                localStorage.removeItem("matrices");
                return true;
            }
            return false;
        } else if (window.confirm(`Are you sure you want to delete these matrices: ${matricesToDelete.join(" ")}?`)) {
            const tempObj = { ...matrices };

            for (let i = 0; i < matricesToDelete.length; i++) {
                if (selection === matricesToDelete[i])
                matrixDispatch(updateSelection(""))

                delete tempObj[matricesToDelete[i]];
            }

            matrixDispatch(updateAll({ "matrices": tempObj }))
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
                <BasicActionButton buttonStyle={"primary"} disabled={undoStack.length === 0} name="↺" action={ () => matrixDispatch(undo()) } />
                <BasicActionButton buttonStyle={"primary"} disabled={redoStack.length === 0} name="↻" action={ () => matrixDispatch(redo()) } />
            </div>
        </div>
        <div className={styles.bar}>


            <ActiveButton name="Actions" id = {"Actions"}  active={props.toolActive["Actions"]} action={toggleTool} disabled = {! (selection in matrices)}/>

            <ActiveButton name="Math" id = {"Math"} active={props.toolActive["Math"]} action={toggleTool} disabled = {! (selection in matrices)}/>

            {!props.settings["Disable Selection"] ?
                <ActiveButton name="Selection" id = {"Selection"} active={props.toolActive["Selection"]} action={toggleTool} disabled = {! (selection in matrices)}/>
                : null}

            <ActiveButton name="Export" id = {"Export"} active={props.toolActive["Export"]} action={toggleTool} disabled = {! (selection in matrices)}/>

            <ActiveButton name="Import" id = {"Import"} active={props.toolActive["Import"]} action={toggleTool} disabled = {false}/>



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
                    userMatrices={props.userMatrices}
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
                                matrixDispatch(updateMatrix({ "name": undefined, "matrix": [["", ""], ["", ""]] }))
                            }}
                        />

                        {selection !== "" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"success"} name={`Duplicate ${selection}`}
                                action={() => { 
                                    matrixDispatch(updateMatrix({ "name": undefined, "matrix": cloneMatrix(matrices[selection]) }))
                                }} 
                            />
                            : null}
                    </div>
                    <div className = {styles.pair}>
                        {selection !== "" ?
                            <BasicActionButton
                                key="deleteButton" buttonStyle={"danger"} name={`Delete ${selection}`}
                                action={() => {
                                    if (selection !== "") {
                                        matrixDispatch(deleteMatrix(selection))
                                        matrixDispatch(updateSelection(""))
                                    }
                                }} />
                            : null}


                        <BasicActionButton
                            buttonStyle={"danger"} name={`Delete ${multiSelected.length > 0 ? "Selected" : "All"}`}
                            disabled={!matrices || Object.keys(matrices).length === 0}
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