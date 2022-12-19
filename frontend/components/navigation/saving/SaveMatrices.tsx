import styles from "./SaveMatrices.module.css";
import React, { useState } from "react";

import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";
import { Matrices, Settings } from "../../App";

interface SaveMatricesProps {
    username: string
    updateUserInfo: (username: string, access_token: string, refresh_token: string) => void
    saveToLocal: boolean
    settings: Settings
    matrices: Matrices
    refreshTokens: () => boolean
    matrixDispatch: React.Dispatch<any>
    setSelection: (str: string) => void
    showMerge: boolean
    setShowMerge: (bool: boolean) => void
    userMatrices: Matrices | null
    closeSaveMenu: () => void
    addAlert: (str: string, time: number, type?: string) => void
    setSaveToLocal: (bool: boolean) => void
}

const SaveMatrices = (props: SaveMatricesProps) => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showLocalStorageWarning, setShowLocalStorageWarning] = useState(false);

    return <div className={styles.saveMatrices}>

        <div className="row">
            <div className="col-sm-6">
                <h1>Save Matrices Online</h1>
                {props.username ?
                    <UserPanel
                        username={props.username}
                        showWelcome={showWelcome}
                        setShowWelcome={setShowWelcome}
                        showMerge={props.showMerge}
                        matrices={props.matrices}
                        userMatrices={props.userMatrices}
                        matrixDispatch={props.matrixDispatch}
                        setSelection={props.setSelection}
                        updateUserInfo={props.updateUserInfo}
                        refreshTokens={props.refreshTokens}
                        addAlert={props.addAlert}
                        setShowMerge={props.setShowMerge}
                    />
                    :
                    <LoginForm
                        matrices={props.matrices}
                        settings={props.settings}
                        updateUserInfo={props.updateUserInfo}
                        setShowWelcome={setShowWelcome}

                    />
                }


            </div>

            <div className="col-sm-6">
                <h1>Save Matrices Locally</h1>

                <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor={"saveToLocalSwitch"}>Save To Browser Storage</label>

                    <input className="form-check-input pull-right"
                        onChange={() => {
                            props.setSaveToLocal(!props.saveToLocal);
                            window.localStorage.setItem("Save To Local", !props.saveToLocal ? "1" : "0");
            
                            if (props.saveToLocal) {//if currently saving to local (which will become false after this)
                                setShowLocalStorageWarning(true);
                                localStorage.removeItem("matrices");
                                localStorage.removeItem("settings");

                            } else 
                                setShowLocalStorageWarning(false);


                        }}
                        checked={props.saveToLocal}
                        type="checkbox"
                        role={"switch"}
                        id="saveToLocalSwitch"
                    />
                </div>
                <p>{"If this option is enabled, your matrices will automatically be saved to your browser's local storage after making any edits, even when logged out."}</p>

                {showLocalStorageWarning ?
                    <p className={styles.localWarning}>WARNING: Your matrices in local storage will be deleted once you refresh this page.</p>
                    : null}


            </div>

            <button
                onClick={props.closeSaveMenu}
                className={"btn btn-danger " + styles.closeButton}>
                {"Close"}
            </button>

        </div>



    </div>
}


export default SaveMatrices;