import React, { useState, useRef, useEffect } from 'react';

import SaveMatrices from './saving/SaveMatrices';
import Tutorial from './Tutorial';

import styles from "./Navigation.module.css";


const Navigation = (props) => {
    const [showTutorial, setShowTutorial] = useState(props.firstVisit);
    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [hoveringSettings, setHoveringSettings] = useState(false);

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
        saving = "Matrices will not be saved if you refresh the page.";
    }



    return <div className = {styles.navigation}>

        <div className={styles.topBar}
            onClick={(e) => { e.stopPropagation(); setShowSaveMenu(!showSaveMenu) }}>
            <div
                style={{ color: hoveringSettings ? (props.saveToLocal || props.username ? "rgb(147, 221, 165)" : "rgb(247, 198, 198)") : "white" }}
                onMouseEnter={() => { setHoveringSettings(true) }}
                onMouseLeave={() => { setHoveringSettings(false) }}
            >
                <div className={styles.savingInfo}>
                    {saving}
                </div>
                <div className={styles.savingInfo}>
                    {showSaveMenu ? " Click to close the save menu ↑" : " Click to open the save menu ↓"}
                    {""}
                </div>
            </div>

            {!showTutorial ?
            <div className={styles.toggleTutorial} onClick={(e) => { e.stopPropagation(); setShowTutorial(true) }} >
                ?
            </div> : null}
        </div>

        {showSaveMenu || showTutorial ?
            <div className={styles.navigateBar}>
                {showSaveMenu ?
                    <SaveMatrices
                        username={props.username}
                        updateUserInfo={props.updateUserInfo}
                        saveToLocal={props.saveToLocal}
                        settings={JSON.stringify({
                            mirror: props.mirror ? "1" : "0",
                            selectable: props.selectable ? "1" : "0",
                            numbersOnly: props.numbersOnly ? "1" : "0",
                            darkModeTable: props.darkModeTable ? "1" : "0",
                            sparseVal: props.sparseVal,
                            rounding: props.rounding
                        })}
                        updateParameter={props.updateParameter}
                        matrices={props.matrices}
                        refreshTokens={props.refreshTokens}

                        updateMatrices={props.updateMatrices}
                        setSelection={props.setSelection}
                        showMerge={props.showMerge}
                        userMatrices={props.userMatrices}
                        setShowMerge={props.setShowMerge}
                        closeSaveMenu={() => { setShowSaveMenu(false) }}
                    /> : null}

                {showTutorial ? <Tutorial closeTutorial={() => { setShowTutorial(false) }} /> : null}
            </div> : null}

    </div>
}


export default Navigation;
