import styles from "./SaveMatrices.module.css";
import React, { useState } from "react";

import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";

const SaveMatrices = (props) => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showLocalStorageWarning, setShowLocalStorageWarning] = useState(false);

    return <div className={styles.saveMatrices}>
       
        <div className="row">
            <div className="col-sm-6">
                <h1>Save Matrices Online</h1>
                    {props.username ?
                    <UserPanel 
                        username={props.username}
                        showWelcome = {showWelcome}
                        setShowWelcome = {setShowWelcome}
                        showMerge = {props.showMerge}
                        matrices={props.matrices}
                        userMatrices={props.userMatrices}
                        updateMatrices={props.updateMatrices}
                        setSelection={props.setSelection}
                        updateParameter={props.updateParameter}
                        updateUserInfo = {props.updateUserInfo}
                        refreshTokens = {props.refreshTokens}
                    />
                    :
                    <LoginForm
                        matrices = {props.matrices}
                        updateUserInfo = {props.updateUserInfo}
                        setShowWelcome = {setShowWelcome}
                   />
                }


            </div>

            <div className="col-sm-6">
                <h1>Save Matrices Locally</h1>

                <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor={"saveToLocalSwitch"}>Save To Browser Storage</label>

                    <input className="form-check-input pull-right"
                        onChange={() => { 
                            props.updateParameter("Save To Local", !props.saveToLocal) 
                            setShowLocalStorageWarning(props.saveToLocal); //set to true if currently saving to local (which will become false after this)
                        }}
                        checked={props.saveToLocal}
                        type="checkbox"
                        role={"switch"}
                        id="saveToLocalSwitch"
                    />
                </div>
                <p>{"If this option is enabled, your matrices will automatically be saved to your browser's local storage after making any edits, even when logged out."}</p>
                
                {showLocalStorageWarning ? 
                <p className = {styles.localWarning}>WARNING: Your matrices in local storage will be deleted once you refresh this page.</p>
                : null}
            </div>

        </div>

        <button
            onClick={props.closeSaveMenu}
            className={"btn btn-danger " + styles.closeButton}>
            {"Close"}
        </button>


    </div>
}


export default SaveMatrices;