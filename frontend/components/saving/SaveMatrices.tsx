import styles from "./SaveMatrices.module.css";
import React, { useState } from "react";

import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { updateSaveToLocal } from "../../features/user-slice";

interface SaveMatricesProps {
    closeSaveMenu: () => void
}

const SaveMatrices = (props: SaveMatricesProps) => {
    const {username, saveToLocal} = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    const [showWelcome, setShowWelcome] = useState(false);
    const [showLocalStorageWarning, setShowLocalStorageWarning] = useState(false);

    return <div className={styles.saveMatrices}>
        <div className="row">
            <div className="col-sm-6">
                <h1>Save Matrices Online</h1>
                {username ?
                    <UserPanel
                        showWelcome={showWelcome}
                        setShowWelcome={setShowWelcome}
                    />
                    :
                    <LoginForm
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
                            dispatch(updateSaveToLocal(!saveToLocal))
                            window.localStorage.setItem("Save To Local", !saveToLocal ? "1" : "0");
            
                            if (saveToLocal) {//if currently saving to local (which will become false after this)
                                setShowLocalStorageWarning(true);
                                localStorage.removeItem("matrices");
                                localStorage.removeItem("settings");
                            } else 
                                setShowLocalStorageWarning(false);


                        }}
                        checked={saveToLocal}
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