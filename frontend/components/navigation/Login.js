import React, { useState } from "react";
import styles from "./Login.module.css";
import LoginInput from "./LoginInput"

import MergeStorage from "./MergeStorage";

function Login(props) {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState(null);

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState(null);
    const [newPasswordSuccess, setNewPasswordSuccess] = useState(null);

    const [deleteVerify, setDeleteVerify] = useState("");
    const [deleteVerifyError, setDeleteVerifyError] = useState(null);


    const resetStates = (arr) => {
        if (arr.includes("bools")) {
            setShowLogin(true);
            setShowChangePassword(false);
            setShowDeleteAccount(false);
        }
        if (arr.includes("login")) {
            setUsernameError(null);
            setPasswordError(null);
            setUsernameInput("");
            setPasswordInput("");
        }
        if (arr.includes("changePassword")) {
            setCurrentPassword("");
            setCurrentPasswordError(null);
            setNewPassword("");
            setNewPasswordError(null);
            setNewPasswordSuccess(null);
        }
        if (arr.includes("deleteAccount")) {
            setDeleteVerify("");
            setDeleteVerifyError(null);
        }
    }

    const logOut = () => {
        localStorage.setItem("token", null);
        localStorage.setItem("username", null);
        resetStates(["bools", "login", "changePassword", "deleteAccount"]);
        setShowWelcome(false)

        props.updateUserInfo(null, null);
        props.loadFromLocalStorage();        
    }


    const handleLogin = async (e) => {
        e.preventDefault();

        var error = false
        if (!usernameInput) {
            setUsernameError("Enter your username");
            error = true
        } else
            setUsernameError(null);

        if (!passwordInput) {
            setPasswordError("Enter your password");
            error = true
        } else
            setPasswordError(null);

        if (error)
            return;

        const response = await fetch("https://matrixgen.fly.dev/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                matrix_data: JSON.stringify(props.matrices)
            })
        }).then((response) => {
            if (response.status === 401)
                return null;
            else
                return response.json();
        }).catch((error) => {
            console.log(error);
        });

        if (response === null) {
            setUsernameError("Invalid username or password");
            return;
        }

        if (usernameInput && response && response["access_token"]) {
            props.updateUserInfo(usernameInput, response["access_token"]);
            resetStates(["bools", "login", "changePassword", "deleteAccount"]);
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        var error = false
        if (!usernameInput) {
            setUsernameError("Please provide a username");
            error = true
        } else
            setUsernameError(null)

        if (!passwordInput) {
            setPasswordError("Please provide a password");
            error = true
        } else
            setPasswordError(null)

        if (error)
            return;

        const response = await fetch("https://matrixgen.fly.dev/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                matrix_data: JSON.stringify(props.matrices)
            })

        }).then((response) => {
            if (response.status === 401)
                return null;
            else
                return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === null) {
            setUsernameError("Username already exists");
            return;
        }

        if (usernameInput && response && response["access_token"]) {
            props.updateUserInfo(usernameInput, response["access_token"]);
            setShowWelcome(true)
            resetStates(["bools", "login", "changePassword", "deleteAccount"]);
        }
    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        if (!deleteVerify) {
            setDeleteVerifyError("Enter your password")
            return;
        }

        if (!window.confirm("Are you sure you want to delete your account?"))
            return;

        const response = await fetch("https://matrixgen.fly.dev/api/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                username: props.username,
                password: deleteVerify
            })
        }).then((response) => {
            if (response.status === 401) {
                return null;
            }
            return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === null) {
            setDeleteVerifyError("Incorrect password")
            return;
        } else {
            logOut();
            console.log("Account deleted")
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault();

        var error = false
        if (!currentPassword) {
            setCurrentPasswordError("Please enter your current password")
            error = true;
        }

        if (!newPassword) {
            setNewPasswordError("Please enter a new password")
            error = true;
        } else if (newPassword === currentPassword) {
            setNewPasswordError("Your new password is the same as your current password")
            error = true;
        }

        if (error)
            return;

        const response = await fetch("https://matrixgen.fly.dev/api/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                username: props.username,
                current_password: currentPassword,
                new_password: newPassword
            })
        }).then((response) => {
            if (response.status === 401)
                return null;
            else
                return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === null) {
            setCurrentPasswordError("Incorrect current password")
            return;
        } else {
            setNewPasswordSuccess("Password successfully changed")
            setCurrentPasswordError(null)
            setNewPasswordError(null)
            setTimeout(() => { setShowChangePassword(false) }, 2000);
        }
    }



    return <div className={styles.login}>
        <button
            onClick={props.closeSaveMenu}
            className={"btn btn-danger " + styles.closeButton}>
            {"Close"}
        </button>

        <div className="row">
            <div className="col-sm-6">
                <h1>Save Matrices Online</h1>
                    {props.username ?
                    <div>
                        {showWelcome ? `New Account Created. Welcome, ${props.username}!` :`Signed in as ${props.username}`}

                        <button onClick={logOut} className={"btn btn-secondary " + styles.loginRegisterButton}>Log Out</button>
                        <button onClick={() => { setShowChangePassword(!showChangePassword); resetStates(["changePassword"]); }} className={"btn btn-secondary " + styles.loginRegisterButton}>{showChangePassword ? "Close" : "Change Password"}</button>
                        { showChangePassword ?
                            <form onSubmit={handleChangePassword} className={styles.loginSubBox}>
                                <LoginInput
                                    name="Current Password"
                                    type="password"
                                    current={currentPassword}
                                    setCurrent={setCurrentPassword}
                                    error={currentPasswordError}
                                />
                                <LoginInput
                                    name="New Password"
                                    type="password"
                                    current={newPassword}
                                    setCurrent={setNewPassword}
                                    error={newPasswordError}
                                    success={newPasswordSuccess}
                                />
                                <button onClick={handleChangePassword} className={"btn btn-secondary " + styles.loginRegisterButton}>Confirm</button>
                            </form> 
                        : null}
                        <button onClick={() => { setShowDeleteAccount(!showDeleteAccount); resetStates(["deleteAccount"]); }} className={"btn btn-secondary " + styles.loginRegisterButton}>{showDeleteAccount ? "Cancel" : "Delete Account"}</button>
                        { showDeleteAccount ?
                            <form onSubmit={handleDeleteAccount} className={styles.loginSubBox}>
                                <LoginInput
                                    name="Verify your password"
                                    type="password"
                                    current={deleteVerify}
                                    setCurrent={setDeleteVerify}
                                    error={deleteVerifyError}
                                />

                                <button onClick={handleDeleteAccount} className={"btn btn-danger " + styles.loginRegisterButton}>Confirm</button>
                            </form> : null
                        }

                        {props.showMerge ?
                        <MergeStorage
                            matrices={props.matrices}
                            userMatrices={props.userMatrices}
                            setMatrices={props.setMatrices}
                            setSelection={props.setSelection}
                            updateParameter={props.updateParameter}
                        /> : null}
                    </div>

                    :

                    <div>
                        <form onSubmit={showLogin ? handleLogin : handleRegister} className={styles.loginForm}>
                            <div className={styles.methodSelector}>
                                <div onClick={() => { setShowLogin(true) }} style={{ color: (showLogin ? "rgb(102, 199, 239)" : "white") }} className={styles.loginOption}>
                                    Sign In
                                </div>

                                <div onClick={() => { setShowLogin(false) }} style={{ color: (!showLogin ? "rgb(102, 199, 239)" : "white") }} className={styles.registerOption}>
                                    Create New Account
                                </div>
                            </div>

                            <LoginInput
                                name="Username"
                                type="text"
                                current={usernameInput}
                                setCurrent={setUsernameInput}
                                error={usernameError}
                            />

                            <LoginInput
                                name="Password"
                                type="password"
                                current={passwordInput}
                                setCurrent={setPasswordInput}
                                error={passwordError}
                            />

                            {showLogin ?
                                <button onClick={handleLogin} className={"btn btn-secondary " + styles.loginRegisterButton}>Sign in</button>
                                :
                                <button onClick={handleRegister} className={"btn btn-secondary " + styles.loginRegisterButton}>Register</button>
                            }

                        </form>
                    </div>
                }

            </div>

            <div className="col-sm-6">

                <h1>Save Matrices Locally</h1>
                <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor={"saveToLocalSwitch"}>Save To Browser Storage</label>

                    <input className="form-check-input pull-right"
                        onChange={(e) => { props.updateParameter("saveToLocal", !props.saveToLocal) }}
                        checked={props.saveToLocal}
                        type="checkbox"
                        role={"switch"}
                        id="saveToLocalSwitch"
                    />
                </div>
                <p>{"If this option is enabled, your matrices will automatically be saved to your browser's local storage after making any edits, even when logged out."}</p>
            </div>
        </div>
    </div>
}


export default Login;