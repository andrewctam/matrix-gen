import {  useContext, useEffect, useState } from 'react';
import { loadLocalMatrices, updateAllMatrices, updateSelection } from '../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { loadLocalSettings, setAllSettings } from '../features/settings-slice';
import { declareMergeConflict, clearUser, updateSaveToLocal, updateUser } from '../features/user-slice';
import { AlertContext } from '../components/App';

const useSaving = () => {
    const { matrices } = useAppSelector((state) => state.matricesData);
    const { username, accessToken, refreshToken, mergeConflict, saveToLocal } = useAppSelector((state) => state.user);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();
    
    const addAlert = useContext(AlertContext)
    const [doneLoading, setDoneLoading] = useState(false);
    
    //load from local storage and set up app
    useEffect(() => {
        if (window.localStorage.getItem("Save To Local") === "1")
            dispatch(updateSaveToLocal(true));

        const username = localStorage.getItem("username")
        const access = localStorage.getItem("accessToken")
        const refresh = localStorage.getItem("refreshToken")
        if (username || access || refresh) {
            if (username && access && refresh)
                dispatch(updateUser({username: username, accessToken: access, refreshToken: refresh}));
            else //one of the fields null
                dispatch(clearUser())
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
            getUserData();
        }

    // eslint-disable-next-line
    }, [username]) //get new matrices if user changes account

    //send updates to server/save local when matrices changed
    useEffect(() => {
        if (doneLoading) {
            if (!mergeConflict && username)
                updateAccountMatrices();

            if (matrices && saveToLocal) {
                window.localStorage.setItem("matrices", JSON.stringify(matrices))
            }    
        }

    // eslint-disable-next-line
    }, [matrices, saveToLocal]); //only need to send if matrices or settings change


    //send settings when changed
    useEffect(() => { 
        if (doneLoading) {
            if (username)
                updateAccountSettings();
            if (saveToLocal)
                window.localStorage.setItem("settings", JSON.stringify(settings))
        }

    // eslint-disable-next-line
    }, [settings, saveToLocal]); //only send settings if they change



    //get data from database
    const getUserData = async (overrideAccessToken?: string) => {
        let url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (overrideAccessToken ?? accessToken)
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
            const [access, refresh] = await retry(getUserData, refreshToken)
            if (access && refresh) {
                dispatch(updateUser({ username: username, accessToken: access, refreshToken: refresh }))
                return;
            } else {
                setDoneLoading(true);
                dispatch(clearUser());
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

        url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
        response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (overrideAccessToken ?? accessToken)
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
            const [access, refresh] =  await retry(getUserData, refreshToken)
            if (access && refresh) {
                dispatch(updateUser({ username: username, accessToken: access, refreshToken: refresh }))
            } else
                dispatch(clearUser());
        } else {
            const settings = JSON.parse(response["settings"]);
            if (settings)
                dispatch(setAllSettings(settings))
        }

        setDoneLoading(true);
    }

    //send data to database
    const updateAccountMatrices = async (overrideAccessToken?: string) => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (overrideAccessToken ?? accessToken)
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
                console.log("Invalid access token")
                return null; //invalid access token
            } else {
                console.log("Matrices saved to account")
                return response.json()
            }

        }).catch(error => {
            console.log(error)
        })

        if (response === null) {
            const [access, refresh] =  await retry(updateAccountMatrices, refreshToken)
            if (access && refresh) {
                dispatch(updateUser({ username: username, accessToken: access, refreshToken: refresh }))
            } else
                dispatch(clearUser());
        }

    }





    const updateAccountSettings = async (overrideAccessToken?: string) => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (overrideAccessToken ?? accessToken)
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
            const [access, refresh] =  await retry(updateAccountSettings, refreshToken)
            if (access && refresh) {
                dispatch(updateUser({ username: username, accessToken: access, refreshToken: refresh }))
            } else
                dispatch(clearUser());
        }

    }


    //initial load
    return doneLoading;
}

export default useSaving

//refresh tokens and retry the retry() function using a new access token.
export const retry = async (retry: (overrideAccessToken?: string) => void, refreshToken: string) => {
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
        console.log("Tokens refreshed, retrying...")

        retry(response["access_token"]); //retry

        return [response["access_token"], response["refresh_token"]]
    } else { //refresh token invalid
        
        console.log("Unauthorized. Refresh token invalid.");
        return [null, null];
    }
}