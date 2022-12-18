import React, { useEffect, useState, useRef } from 'react';

import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';

import styles from "./Navigation.module.css";
import { Matrices, Settings } from '../App';

interface NavigationProps {
    matrices: Matrices
    matrixDispatch: React.Dispatch<any>
    setSelection: (str: string) => void
    settings: Settings
    updateMatrixSettings: () => void
    username: string
    updateUserInfo: (username: string, access_token: string, refresh_token: string) => void
    refreshTokens: () => void
    saveToLocal: boolean
    saveToLocalStorage: () => void
    setSaveToLocal: (bool: boolean) => void
    showMerge: boolean
    setShowMerge: (bool: boolean) => void
    userMatrices: Matrices | null
    dataTooLarge: boolean
    addAlert: (str: string, time: number, type?: string) => void


}
const Navigation = (props: NavigationProps) => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [hovering, setHovering] = useState(false);
    const topBar = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (localStorage.getItem("First Visit") === null) {
            setShowTutorial(true);
        }
    }, []);
    

    if (props.showMerge) {
        var saving = `Logged in as ${props.username}. There is currently a storage conflict.`;
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
        saving = "Matrices will not be saved if you refresh the page.";
    }



    return <div className={styles.navigation}>
        <div className = {styles.topBar} onClick={(e) => { e.stopPropagation(); setShowSaveMenu(!showSaveMenu); setShowTutorial(false) }} ref = {topBar}>
            <div
                style={{ color: hovering ? (props.saveToLocal || props.username ? "rgb(147, 221, 165)" : "rgb(247, 198, 198)") : "white" }}
                onMouseEnter={() => { setHovering(true) }}
                onMouseLeave={() => { setHovering(false) }}
            >
                <div className={styles.savingInfo}>
                    {saving + (showSaveMenu ? " Click to close the save menu ↑" : " Click to open the save menu ↓")}
                </div>


            </div>

            {!showTutorial ?
                <div className={styles.toggleTutorial} onClick={(e) => { e.stopPropagation(); setShowTutorial(true); setShowSaveMenu(false) }} >
                    ?
                </div> : null}
        </div>

        <div className={styles.navigateBar} style = {{top: topBar.current ? topBar.current.offsetHeight + "px" : "0px"}}>
            {showSaveMenu ?
                <SaveMatrices
                    username={props.username}
                    updateUserInfo={props.updateUserInfo}
                    saveToLocal={props.saveToLocal}
                    settings={props.settings}
                    matrices={props.matrices}
                    refreshTokens={props.refreshTokens}

                    matrixDispatch={props.matrixDispatch}
                    setSelection={props.setSelection}
                    showMerge={props.showMerge}
                    setShowMerge={props.setShowMerge}
                    userMatrices={props.userMatrices}
                    closeSaveMenu={() => { setShowSaveMenu(false) }}
                    addAlert={props.addAlert}

                    setSaveToLocal={props.setSaveToLocal}
                /> : null}

            {showTutorial ?
                <Tutorial closeTutorial={() => { setShowTutorial(false) }} />
                : null}
        </div>
    </div>
}


export default Navigation;
