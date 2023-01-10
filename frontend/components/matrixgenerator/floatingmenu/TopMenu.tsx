
import React, { useState, useRef } from 'react';
import MatrixSelector from './MatrixSelector';

import ParameterBoxInput from '../../inputs/ParameterBoxInput';
import ParameterTextInput from '../../inputs/ParameterTextInput';

import BasicActionButton from '../../buttons/BasicActionButton';
import ActiveButton from '../../buttons/ActiveButton';
import styles from "./TopMenu.module.css"
import useMove from '../../../hooks/useMove';

import { cloneMatrix } from '../../matrixFunctions';
import { Tools, ToolsAction } from '../MatrixGenerator';
import { deleteMatrix, redo, undo, updateAllMatrices, updateMatrix, updateSelection } from '../../../features/matrices-slice';
import { updateSetting } from '../../../features/settings-slice';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';

interface TopMenuProps {
    toolActive: Tools
    toolDispatch: React.Dispatch<ToolsAction>
}


const TopMenu = (props: TopMenuProps) => {

    const {matrices, selection, undoStack, redoStack} = useAppSelector((state) => state.matricesData)
    const settings = useAppSelector((state) => state.settings )
    const dispatch = useAppDispatch();



    const [showSelectors, setShowSelectors] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [multiSelected, setMultiSelected] = useState<string[]>([]);


    const selectorsRef = useRef<HTMLDivElement | null>(null);
    const selectorsToggleRef = useRef<HTMLButtonElement | null>(null);
    const settingsRef = useRef<HTMLDivElement | null>(null);
    const settingsToggleRef = useRef<HTMLButtonElement | null>(null);

    const [selectorsX, selectorsY] = useMove(selectorsRef, selectorsToggleRef);
    const [settingsX, settingsY] = useMove(settingsRef, settingsToggleRef);

    const [lastClicked, setLastClicked] = useState<string>("settings");

    const setSetting = (name: string, value: string) => {
        dispatch(updateSetting({ "name": name, "value": value }));
    }

    const toggleTool = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.toolDispatch({ "type": "TOGGLE", payload: {"name": (e.target as HTMLButtonElement).id  as keyof Tools} });
    }


    const deleteSelectedMatrices = (matricesToDelete: string[]) => {
        if (matricesToDelete.length === 0) { //if input is empty, delete all
            if (window.confirm("Are you sure you want to delete all of your matrices?")) {
                dispatch(updateAllMatrices({ "matrices": {} }))
                dispatch(updateSelection(""))
                localStorage.removeItem("matrices");
                return true;
            }
            return false;
        } else if (window.confirm(`Are you sure you want to delete these matrices: ${matricesToDelete.join(" ")}?`)) {
            const tempObj = { ...matrices };

            for (let i = 0; i < matricesToDelete.length; i++) {
                if (selection === matricesToDelete[i])
                dispatch(updateSelection(""))

                delete tempObj[matricesToDelete[i]];
            }

            dispatch(updateAllMatrices({ "matrices": tempObj }))
            return true;
        }

        return false;

    }

    return (<div className={styles.floatingMenu}>
        <div className={styles.bar}>
            <BasicActionButton
                innerRef={selectorsToggleRef}
                name={"Matrices"} buttonStyle={showSelectors ? "info" : "primary"}
                action={() => {setShowSelectors(!showSelectors); }}
            />
            <BasicActionButton
                innerRef={settingsToggleRef}
                name={"Settings"} buttonStyle={showSettings ? "info" : "primary"}
                action={() => { setShowSettings(!showSettings); setLastClicked("settings");}}
            />
            <div className={styles.pair}>
                <BasicActionButton buttonStyle={"primary"} disabled={undoStack.length === 0} name="↺" action={ () => dispatch(undo()) } />
                <BasicActionButton buttonStyle={"primary"} disabled={redoStack.length === 0} name="↻" action={ () => dispatch(redo()) } />
            </div>
        </div>
        <div className={styles.bar}>
            <ActiveButton name="Actions" id = {"Actions"}  active={props.toolActive["Actions"]} action={toggleTool} disabled = {! (selection in matrices)}/>

            <ActiveButton name="Math" id = {"Math"} active={props.toolActive["Math"]} action={toggleTool} disabled = {! (selection in matrices)}/>

            {!settings["Disable Selection"] ?
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
                ref={selectorsRef}
                onMouseDown = {() => {setLastClicked("selectors")}}>
                <MatrixSelector
                    multiSelected={multiSelected}
                    setMultiSelected={setMultiSelected}
                />

                <div>
                    <div className = {styles.pair}>
                        <BasicActionButton
                            key="addButton" name={"New Matrix"} buttonStyle={"success"}
                            action={() => {
                                dispatch(updateMatrix({ "name": undefined, "matrix": [["", ""], ["", ""]] }))
                            }}
                        />

                        {selection !== "" ?
                            <BasicActionButton
                                key="duplicateButton" buttonStyle={"success"} name={`Duplicate ${selection}`}
                                action={() => { 
                                    dispatch(updateMatrix({ "name": undefined, "matrix": cloneMatrix(matrices[selection]) }))
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
                                        dispatch(deleteMatrix(selection))
                                        dispatch(updateSelection(""))
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
            <div ref={settingsRef} className={styles.settingsMenu} style={
                window.innerWidth < 1133 ? undefined : { 
                    left: settingsX,
                    top: settingsY, 
                    zIndex: lastClicked === "settings" ? 5 : 4 }}
                    onMouseDown = {() => {setLastClicked("settings")}}>

                <ParameterBoxInput isChecked={settings["Mirror Inputs"]} name={"Mirror Inputs"} updateParameter={setSetting} />
                <ParameterBoxInput isChecked={settings["Disable Selection"]} name={"Disable Selection"} updateParameter={setSetting} />
                <ParameterBoxInput isChecked={settings["Numbers Only Input"]} name={"Numbers Only Input"} updateParameter={setSetting} />
                <ParameterBoxInput isChecked={settings["Dark Mode Table"]} name={"Dark Mode Table"} updateParameter={setSetting} />
                <div>{"Empty Element: "} 
                    <ParameterTextInput width={"30px"} text={settings["Empty Element"]} id={"Empty Element"} updateParameter={setSetting} />
                </div>
                <div>{"Decimals To Round: "} 
                    <ParameterTextInput width={"30px"} 
                        id={"Decimals To Round"} 
                        text={settings["Decimals To Round"].toString()} 
                        updateParameter={setSetting} 
                        placeholder={settings["Decimals To Round"] === "0" ? "None" : ""} />
                </div>

            </div>
        : null}



    </div>)
}

export default TopMenu