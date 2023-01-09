import React, { useEffect, useState } from 'react';
import MatrixGenerator from './matrixgenerator/MatrixGenerator';
import useAlert from '../hooks/useAlert';
import TopBar from './TopBar';

import { loadLocalMatrices, updateAllMatrices, updateSelection } from '../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { loadLocalSettings, setAllSettings } from '../features/settings-slice';
import { declareMergeConflict, loadUser, logoutUser, updateSaveToLocal } from '../features/user-slice';



const App = () => {
    const { matrices } = useAppSelector((state) => state.matricesData);
    const { username, accessToken, refreshToken, mergeConflict, saveToLocal } = useAppSelector((state) => state.user);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();

    const [doneLoading, setDoneLoading] = useState(false);
   
    const [alerts, addAlert] = useAlert();

    //load from local storage and set up app
    useEffect(() => {
        if (window.localStorage.getItem("Save To Local") === "1")
            dispatch(updateSaveToLocal(true));

        if (localStorage.getItem("username") !== null) {
            dispatch(loadUser());
        } else if (localStorage.getItem("matrices") !== null) {
            dispatch(loadLocalMatrices());
            dispatch(loadLocalSettings());
            setDoneLoading(true);
        } else { //default
            dispatch(updateAllMatrices({ "matrices": { "A": [["", ""], ["", ""]] }, "DO_NOT_UPDATE_UNDO": true }))
            dispatch(updateSelection("A"))
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
            if (mergeConflict && username)
                updateAccountMatrices();

            if (matrices && saveToLocal) {
                window.localStorage.setItem("matrices", JSON.stringify(matrices))
            }    
        }

        // eslint-disable-next-line
    }, [matrices, saveToLocal]); //only need to send if matrices or settings change

    useEffect(() => { //update settings
        if (doneLoading) {
            if (username)
                updateAccountSettings();
            if (saveToLocal)
                window.localStorage.setItem("settings", JSON.stringify(settings))
        }
    // eslint-disable-next-line
    }, [settings]); //only send settings if they change


    const getMatrixData = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
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
            dispatch(updateAllMatrices({ "matrices": userMatrices, "DO_NOT_UPDATE_UNDO": true }))
            if (Object.keys(userMatrices).length > 0)
                dispatch(updateSelection(Object.keys(userMatrices)[0]));
            else
                dispatch(updateSelection(""));

        } else {
            addAlert("You have matrices saved locally that conflict with your account's matrices. Please see the save menu for more info.", 5000, "error")
            dispatch(declareMergeConflict(userMatrices))

            if (!matrices || saveToLocal) //if the page is loading, load from local storage if enabled.
                dispatch(loadLocalMatrices());
            //otherwise, the merge request was made after the page finished laoding, so don't re load from local storage

        }

        setDoneLoading(true);
    }

    const updateAccountMatrices = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
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

    }

    const refreshTokens = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/token`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + refreshToken
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
            dispatch(logoutUser())
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
                "Authorization": "Bearer " + accessToken
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
                dispatch(setAllSettings(settings))
        }

        setDoneLoading(true);

    }

    const updateAccountSettings = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
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
                updateAccountSettings(); //retry
                return;
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }
    }


    if (!matrices || !doneLoading)
        return <div/>

    return (<> 
        {alerts}

        <TopBar
            addAlert={addAlert}
            refreshTokens={refreshTokens}
        />

        
        <MatrixGenerator
            addAlert={addAlert}
            updateMatrixSettings={updateAccountSettings}
        />
    </>);

}

export default App;
