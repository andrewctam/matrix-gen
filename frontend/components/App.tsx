import React, { useEffect, useState, useRef, useReducer } from 'react';
import styles from "./App.module.css"
import MatrixGenerator from './matrixgenerator/MatrixGenerator';
import { generateUniqueName, cloneMatrix, addRowsAndCols, addRows, addCols, updateEntry, deleteRowCol } from './matrixFunctions';
import useAlert from '../hooks/useAlert';
import TopBar from './TopBar';

import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';


export type Matrices = { [key: string]: string[][] }

export interface Settings {
    "Mirror Inputs": boolean
    "Disable Selection": boolean
    "Numbers Only Input": boolean
    "Dark Mode Table": boolean
    "Empty Element": string
    "Decimals To Round": string
}

type SettingsAction =
    { type: "UPDATE_ALL", payload: { settings: Settings } } |
    { type: "UPDATE_SETTING", payload: { name: keyof Settings, value: boolean | string } } |
    { type: "TOGGLE_SETTING", payload: { name: keyof Settings } };


type MatricesAction =
    { type: "UPDATE_ALL", payload: { matrices: Matrices, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "UPDATE_MATRIX", payload: { name: string | undefined, matrix: string[][], switch: boolean, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "ADD_ROW", payload: { name: string, row: number, col: number, updated: string, pos: number | undefined, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "ADD_COL", payload: { name: string, row: number, col: number, updated: string, pos: number | undefined, DO_NOT_UPDATE_UNDO_STACK: boolean} } |
    { type: "ADD_ROW_AND_COL", payload: { name: string, row: number, col: number, updated: string, DO_NOT_UPDATE_UNDO_STACK: boolean} } |
    { type: "DELETE_ROW_COL", payload: { name: string, row: number, col: number, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "UPDATE_ENTRY", payload: {name: string, row: number, col: number, updated: string, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "RENAME_MATRIX", payload: { oldName: string, newName: string, DO_NOT_UPDATE_UNDO_STACK: boolean } } |
    { type: "DELETE_MATRIX", payload: { name: string, DO_NOT_UPDATE_UNDO_STACK: boolean } }


const App = () => {
    const [undoStack, setUndoStack] = useState<Matrices[]>([]);
    const [redoStack, setRedoStack] = useState<Matrices[]>([]);
    const [selection, setSelection] = useState("");

    const settingsReducer = (state: Settings, action: SettingsAction) => {
        switch (action.type) {
            case 'UPDATE_ALL':
                return action.payload.settings;
            case 'UPDATE_SETTING':
                let tempObj = { ...state };
                let value = action.payload.value;

                switch(action.payload.name) {
                    case "Decimals To Round":
                        if (typeof value !== "string")
                            return state;

                        if (value === "") {
                            tempObj[action.payload.name] = ""
                            return tempObj    
                        } else if (/^\d+$/.test(value)) {
                            tempObj[action.payload.name] = Math.max(0, Math.min(parseInt(value), 16)).toString();
                            return tempObj;
                        } else {
                            return state;
                        }

                    case "Empty Element":
                        if (typeof value !== "string")
                            return state;

                        tempObj[action.payload.name] = value;
                        return tempObj;

                    case "Mirror Inputs":
                    case "Disable Selection":
                    case "Numbers Only Input":
                    case "Dark Mode Table":
                        if (typeof value !== "boolean")
                            return state;

                        tempObj[action.payload.name] = value;
                        return tempObj;

                    default: 
                        return state;
                } 


            case 'TOGGLE_SETTING':
                if (typeof action.payload.name !== "boolean" && !(
                    action.payload.name == "Mirror Inputs" ||
                    action.payload.name == "Disable Selection" ||
                    action.payload.name == "Numbers Only Input" ||
                    action.payload.name == "Dark Mode Table"
                ))
                    return state;

                tempObj = { ...state };
                tempObj[action.payload.name] = !tempObj[action.payload.name];
                return tempObj;
            default:
                return state;
        }
    }

    const [settings, settingsDispatch] = useReducer(settingsReducer, {
        "Mirror Inputs": false,
        "Disable Selection": false,
        "Numbers Only Input": false,
        "Dark Mode Table": false,
        "Empty Element": "0",
        "Decimals To Round": "8"
    });

    const matrixReducer = (state: Matrices, action: MatricesAction) => {
        if (!action.payload.DO_NOT_UPDATE_UNDO_STACK) {

            if (state) {
                setUndoStack([...undoStack, state]);
                setRedoStack([]);
            }
        }

        const tempObj = { ...state };

        switch (action.type) {
            case 'UPDATE_ALL': { //use blocks to scope variables
                return action.payload.matrices;
            }
            case 'UPDATE_MATRIX': {
                let { name, matrix } = action.payload;
                if (name === undefined) { //no name, generate one
                    name = generateUniqueName(state);
                }

                if (matrix === undefined) { //no matrix, generate 1 x 1 one
                    tempObj[name] = [["", ""], ["", ""]];
                } else {
                    tempObj[name] = matrix;
                }

                if (action.payload.switch)
                    setSelection(name);

                return tempObj;
            }

            case "ADD_ROW": {
                let { name, row, col, updated, pos } = action.payload;

                let clone = cloneMatrix(state[name]);

                if (pos !== undefined) {
                    clone = addRows(clone, 1, pos);
                } else if (settings["Mirror Inputs"]) {
                    const cols = clone[0].length;
                    const rows = clone.length
                    const max = Math.max(rows + 1, cols)

                    clone = addRowsAndCols(clone, max - rows, max - cols);
                    clone[col][row] = updated;
                } else {
                    clone = addRows(clone, 1);
                }
                
                clone[row][col] = updated;
                tempObj[name] = clone;
                return tempObj;
            }
            case "ADD_COL": {
                let { name, row, col, updated, pos} = action.payload;

                let clone = cloneMatrix(state[name]);

                if (pos !== undefined) {
                    clone = addCols(clone, 1, pos);
                } else if (settings["Mirror Inputs"]) {
                    const cols = clone[0].length;
                    const rows = clone.length
                    const max = Math.max(rows, cols + 1)

                    clone = addRowsAndCols(clone, max - rows, max - cols);
                    clone[col][row] = updated;
                } else {
                    clone = addCols(clone, 1);
                }

                clone[row][col] = updated;
                tempObj[name] = clone;
                return tempObj;

            }
            case 'ADD_ROW_AND_COL': {
                const { name, row, col, updated } = action.payload;

                let clone = cloneMatrix(state[name])

                if (settings["Mirror Inputs"]) {
                    const cols = clone[0].length;
                    const rows = clone.length
                    const max = Math.max(rows + 1, cols + 1);

                    clone = addRowsAndCols(clone, max - rows, max - cols);
                    clone[col][row] = updated;

                } else {
                    clone = addRowsAndCols(clone, 1, 1);
                }

                clone[row][col] = updated;
                tempObj[name] = clone;
                return tempObj;
            }
            case "DELETE_ROW_COL": {
                const { name, row, col } = action.payload;

                let clone = cloneMatrix(state[name]);
                let deleted = deleteRowCol(clone, row, col);
                
                if (deleted)
                    tempObj[name] = deleted;

                return tempObj;

            } case 'UPDATE_ENTRY': {
                const { name, row, col, updated } = action.payload;

                const modified = updateEntry(cloneMatrix(state[name]), row, col, updated, settings["Mirror Inputs"])
                tempObj[name] = modified;
                return tempObj;

            }
            case 'RENAME_MATRIX': {
                let { oldName, newName } = action.payload;

                if (newName in state) {
                    return state;
                }

                tempObj[newName] = state[oldName];
                delete tempObj[oldName];
                setSelection(newName);

                return tempObj;
            }
            case 'DELETE_MATRIX': {
                let { name } = action.payload;
                delete tempObj[name];
                return tempObj;
            }
            default:
                return state;

        }
    }
    const [matrices, matrixDispatch] = useReducer(matrixReducer, { "A": [["", ""], ["", ""]] });



    //state for saving online/local
    const [username, setUsername] = useState("");
    const [saveToLocal, setSaveToLocal] = useState(false);

    //state related to storing
    const [showMerge, setShowMerge] = useState(false);
    //in event of a conflict, store user's online matrices separate from local until resolved
    const [userMatrices, setUserMatrices] = useState<Matrices | null>(null);

    //state related to loading
    const [doneLoading, setDoneLoading] = useState(false);
    const saving = useRef(false);


    //load from local storage and set up app
    useEffect(() => {
        window.addEventListener("beforeunload", (e) => {
            if (saving.current)
                e.returnValue = "";
        });

        setSaveToLocal(window.localStorage.getItem("Save To Local") === "1");
        const username = localStorage.getItem("username");

        if (username !== null) {
            setUsername(username);
        } else if (localStorage.getItem("matrices") !== null) {
            loadFromLocalStorage();
            setShowMerge(false)
        } else { //default
            matrixDispatch({ type: 'UPDATE_ALL', payload: { "matrices": { "A": [["", ""], ["", ""]] }, "DO_NOT_UPDATE_UNDO_STACK": true } })
            setSelection("A");
            setShowMerge(false)
            setDoneLoading(true);
        }

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (doneLoading)
            window.localStorage.setItem("First Visit", "0");
    }, [doneLoading])

    //if a new user is logged in, get their matrices
    useEffect(() => {
        if (username) {
            getMatrixData();
            getMatrixSettings();
        }

        // eslint-disable-next-line
    }, [username]) //get new matrices if user changes account

    //send updates to server
    useEffect(() => {
        if (doneLoading) {
            if (!showMerge && username)
                updateAccountMatrices();

            if (matrices && saveToLocal)
                saveToLocalStorage();
        }

        // eslint-disable-next-line
    }, [matrices, saveToLocal, settings]); //only need to send if matrices or settings change

    useEffect(() => { //update settings
        if (username)
            updateMatrixSettings();
    // eslint-disable-next-line
    }, [settings]); //only send settings if they change



    //functions related to saving
    const saveToLocalStorage = () => {
        saving.current = true
        window.localStorage.setItem("matrices", JSON.stringify(matrices))
        window.localStorage.setItem("settings", JSON.stringify(settings))
        saving.current = false
    }

    const loadFromLocalStorage = () => {
        console.log("Loading from local storage...")
        try {
            const matrices = localStorage.getItem("matrices")
            console.log("Found: " + matrices)
            if (matrices === null)
                throw new Error("No matrices found in local storage");

            const parsed = JSON.parse(matrices);
            if (parsed.length === 0) { //if {} is saved, it will be parsed to []
                throw new Error("No matrices found in local storage");
            } else {
                matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": parsed, DO_NOT_UPDATE_UNDO_STACK: true } });

                const localMatrices = Object.keys(parsed);
                if (localMatrices.length > 0)
                    setSelection(localMatrices[0]);
                else
                    setSelection("");

                const settings = localStorage.getItem("settings");
                if (settings !== null) {
                    settingsDispatch({ type: "UPDATE_ALL", payload: { "settings": JSON.parse(settings) } });
                }
            }

        } catch (error) {
            console.log(error)
            localStorage.removeItem("matrices");
            setSelection("A");
            matrixDispatch({ "type": "UPDATE_ALL", "payload": { "matrices": { "A": [["", ""], ["", ""]] }, DO_NOT_UPDATE_UNDO_STACK: true } });
            settingsDispatch({
                type: "UPDATE_ALL", payload: {
                    "settings": {
                        "Mirror Inputs": false,
                        "Disable Selection": false,
                        "Numbers Only Input": false,
                        "Dark Mode Table": false,
                        "Empty Element": "0",
                        "Decimals To Round": "8"
                    }
                }
            });
        }

        setDoneLoading(true);
    }

    const updateUserInfo = (username: string, access_token: string, refresh_token: string) => {
        setUsername(username);

        if (username)
            localStorage.setItem("username", username);
        else
            localStorage.removeItem("username");

        if (access_token && refresh_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
        } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setShowMerge(false);
        }

        //if all is set to null (log out or invalid tokens), then load local storage
        if (!username && !access_token && !refresh_token) {
            setUndoStack([]);
            setRedoStack([]);
            loadFromLocalStorage();
        }

    }

    const getMatrixData = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            }
        }).then((response) => {
            if (response.status === 401) { //invalid access token
                return null;
            }

            return response.json()
        }).catch((error) => {
            console.log(error)
            addAlert("Error connecting to server.", 10000, "error");
            return null;
        });

        if (response === null) {
            if (await refreshTokens()) {
                console.log("Retrying Get Matrix...");
                getMatrixData(); //retry
                return;
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }


        const userMatrices = JSON.parse(response["matrix_data"]); //matrices saved in database
        var localMatricesStr = localStorage.getItem("matrices");

        if (localMatricesStr === null) { //saving to local storage is disabled so no matrices were found
            if (matrices === null) //page is loading, so its null
                localMatricesStr = null;
            else
                localMatricesStr = JSON.stringify(matrices); //use matrices in memory
        }

        //if the local matries are default, trivial, or the same as the user's matrices, merging is unnecessary
        const mergeUnnecessary = (localMatricesStr === null ||
            localMatricesStr === "{}" ||
            localMatricesStr === JSON.stringify({ "A": [["", ""], ["", ""]] }) ||
            localMatricesStr === response["matrix_data"])

        if (mergeUnnecessary) {
            setShowMerge(false)
            matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": userMatrices, "DO_NOT_UPDATE_UNDO_STACK": true } });
            if (Object.keys(userMatrices).length > 0)
                setSelection(Object.keys(userMatrices)[0])
            else
                setSelection("");

        } else {
            setShowMerge(true)
            addAlert("You have matrices saved locally that conflict with your account's matrices. Please see the save menu for more info.", 5000, "error")
            setUserMatrices(userMatrices);

            if (!matrices || saveToLocal) //if the page is loading, load from local storage if enabled.
                loadFromLocalStorage();
            //otherwise, the merge request was made after the page finished laoding, so don't re load from local storage


        }
        setDoneLoading(true);
    }

    const updateAccountMatrices = async () => {
        saving.current = true
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            },
            body: JSON.stringify({
                matrix_data: JSON.stringify(matrices)
            })
        }).then((response) => {
            if (response.status === 413) { //data too large
                addAlert("WARNING: Matrix data is too large to be saved online. Please delete some matrices or save to local storage, or your changes may be lost.", 5000, "error");
                return response.json();
            }

            if (response.status === 401) {
                return null; //invalid access token
            } else {
                console.log("Matrices saved to account")
                return response.json()
            }

        }).catch(error => {
            console.log(error)
        })

        if (response === null) {
            if (await refreshTokens()) {
                console.log("Retrying Update Data...");
                updateAccountMatrices(); //retry
                return;
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }

        saving.current = false
    }

    const refreshTokens = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/token`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("refresh_token")
            }
        }).then((response) => {
            if (response.status === 401) { //invalid refresh token
                return null;
            }

            return response.json()
        }).catch(error => {
            console.log(error)
        })

        if (response) {
            console.log("Tokens refreshed")
            localStorage.setItem("access_token", response["access_token"]);
            localStorage.setItem("refresh_token", response["refresh_token"]);

            return true; //tokens successfully refreshed
        } else {
            updateUserInfo("", "", "");
            localStorage.removeItem("refresh_token");
            return false; //failed to refresh tokens
        }
    }

    const getMatrixSettings = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            }
        }).then((response) => {
            if (response.status === 401) {
                return null; //invalid access token
            } else {
                return response.json()
            }

        }).catch(error => {
            console.log(error)
        })

        if (response === null) {
            if (await refreshTokens()) {
                console.log("Retrying Get Settings...");
                getMatrixSettings(); //retry
                return;
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }

        if (response) {
            const settings = JSON.parse(response["settings"]);
            if (settings)
                settingsDispatch({ type: "UPDATE_ALL", payload: { "settings": settings } });
        }

    }

    const updateMatrixSettings = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            },
            body: JSON.stringify({ settings: JSON.stringify(settings) })
        }).then((response) => {
            if (response.status === 401) {
                return null; //invalid access token
            } else {
                return response.json()
            }

        }).catch(error => {
            console.log(error)
        })

        if (response === null) {
            if (await refreshTokens()) {
                console.log("Retrying Update Settings...");
                updateMatrixSettings(); //retry
                return;
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }
    }


    const undo = () => {
        if (undoStack.length > 0) {
            setRedoStack([...redoStack, matrices]);
            // @ts-ignore, since undoStack is not empty, we know that the stack is not empty
            matrixDispatch({ "type": "UPDATE_ALL", "payload": { "matrices": undoStack.pop(), "DO_NOT_UPDATE_UNDO_STACK": true } })
        } else {
            addAlert("Nothing to undo", 1000);
        }
    }

    const redo = () => {
        if (redoStack.length > 0) {
            setUndoStack([...undoStack, matrices]);
            // @ts-ignore, since redoStack is not empty, we know that the stack is not empty
            matrixDispatch({ "type": "UPDATE_ALL", "payload": { "matrices": redoStack.pop(), "DO_NOT_UPDATE_UNDO_STACK": true } })

        } else {
            addAlert("Nothing to redo", 1000);
        }
    }

    
    useEffect(() => {
        const undoredo = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === "z") {
                e.preventDefault();
                undo();
            } else if (e.metaKey && e.key === "y") {
                e.preventDefault();
                redo();
            }
        }

        addEventListener('keydown', undoredo)

        return () => {
           removeEventListener('keydown', undoredo); 
        }

    }, [undo, redo])

    const [showTutorial, setShowTutorial] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [alerts, addAlert] = useAlert();

    if (!matrices || !doneLoading)
        return <div/>

    return (<> 
        {alerts}

        <TopBar
            showTutorial = {showTutorial}
            showSaveMenu = {showSaveMenu}
            setShowSaveMenu={setShowSaveMenu}
            setShowTutorial = {setShowTutorial}
            showMerge = {showMerge}
            username = {username}
            saveToLocal = {saveToLocal} />

        <div className={styles.floatingContainer}>
            {showSaveMenu ?
                <SaveMatrices
                    username={username}
                    updateUserInfo={updateUserInfo}
                    saveToLocal={saveToLocal}
                    settings={settings}
                    matrices={matrices}
                    refreshTokens={refreshTokens}

                    matrixDispatch={matrixDispatch}
                    setSelection={setSelection}
                    showMerge={showMerge}
                    setShowMerge={setShowMerge}
                    userMatrices={userMatrices}
                    closeSaveMenu={() => { setShowSaveMenu(false) }}
                    addAlert={addAlert}

                    setSaveToLocal={setSaveToLocal}
                /> : null}

            {showTutorial ?
                <Tutorial closeTutorial={() => { setShowTutorial(false) }} />
                : null}
        </div>
        

        <MatrixGenerator
            matrices={matrices}
            matrixDispatch={matrixDispatch}

            selection={selection}
            matrix={selection in matrices ? matrices[selection] : null}

            setSelection={setSelection}

            updateMatrixSettings={updateMatrixSettings}

            settings={settings}
            settingsDispatch={settingsDispatch}
            
            showMerge={showMerge}
            userMatrices={userMatrices}
            undo={undo}
            redo={redo}
            undoStack={undoStack}
            redoStack={redoStack}

            addAlert={addAlert}
        />
    </>);

}

export default App;