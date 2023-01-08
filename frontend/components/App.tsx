import React, { useEffect, useState, useRef, useReducer } from 'react';
import styles from "./App.module.css"
import MatrixGenerator from './matrixgenerator/MatrixGenerator';
import useAlert from '../hooks/useAlert';
import TopBar from './TopBar';

import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';
import { clearStacks, updateAll, updateSelection } from '../features/matrices-slice';
import { Matrices } from '../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';

export interface Settings {
    "Mirror Inputs": boolean
    "Disable Selection": boolean
    "Numbers Only Input": boolean
    "Dark Mode Table": boolean
    "Empty Element": string
    "Decimals To Round": string
}

export type SettingsAction =
    { type: "UPDATE_ALL", payload: { settings: Settings } } |
    { type: "UPDATE_SETTING", payload: { name: keyof Settings, value: boolean | string } } |
    { type: "TOGGLE_SETTING", payload: { name: keyof Settings } };


const App = () => {
    const {matrices, selection} = useAppSelector((state) => state.matricesData);
    const dispatch = useAppDispatch();

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
            dispatch(updateAll({ "matrices": { "A": [["", ""], ["", ""]] }, "DO_NOT_UPDATE_UNDO": true }))
            dispatch(updateSelection("A"))

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
                dispatch(updateAll({ "matrices": parsed, "DO_NOT_UPDATE_UNDO": true}))

                const localMatrices = Object.keys(parsed);
                if (localMatrices.length > 0)
                    dispatch(updateSelection(localMatrices[0]));
                else
                    dispatch(updateSelection(""));

                const settings = localStorage.getItem("settings");
                if (settings !== null) {
                    settingsDispatch({ type: "UPDATE_ALL", payload: { "settings": JSON.parse(settings) } });
                }
            }

        } catch (error) {
            console.log(error)
            localStorage.removeItem("matrices");
            dispatch(updateSelection("A"));
            dispatch(updateAll({ "matrices": { "A": [["", ""], ["", ""]] }, "DO_NOT_UPDATE_UNDO": true }))
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
            dispatch(clearStacks())
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
            dispatch(updateAll({ "matrices": userMatrices, "DO_NOT_UPDATE_UNDO": true }))
            if (Object.keys(userMatrices).length > 0)
                dispatch(updateSelection(Object.keys(userMatrices)[0]));
            else
                dispatch(updateSelection(""));

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
                    refreshTokens={refreshTokens}
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
            username = {username}
            updateMatrixSettings={updateMatrixSettings}
            settings={settings}
            settingsDispatch={settingsDispatch}
            showMerge={showMerge}
            userMatrices={userMatrices}
            addAlert={addAlert}
        />
    </>);

}

export default App;
