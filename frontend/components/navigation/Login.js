import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";

function Login(props) {
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const [showWelcome, setShowWelcome] = useState(false);

    const [showLogin, setShowLogin] = useState(true);


    const [showChangePassword, setShowChangePassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPasword, setNewPassword] = useState("");

    const [currentPasswordError, setCurrentPasswordError] = useState(null);
    const [newPasswordError, setNewPasswordError] = useState(null);
    const clearLocalMatrices = () => {
        var message = "Your matrices have been deleted from your browser's local storage."
        if (props.username)
            message += "Your matrices on your account have not been deleted."

        alert(message)

        localStorage.removeItem("matrices;");

        props.updateParameter("saveToLocal", false)
    }

    const logOut = () => {
        localStorage.setItem("token", null);
        localStorage.setItem("username", null);
        props.updateUserInfo(null, null);
        
        setUsernameInput("")
        setPasswordInput("")
        
        setUsernameError(null)
        setPasswordError(null)
        
        setShowWelcome(false)

        props.loadFromLocalStorage();
    }

    
    const handleLogin = async (e) => {
        e.preventDefault();

        var error = false
        if (!usernameInput) {
            setUsernameError("Enter your username");
            error = true
        } else {
            setUsernameError(null);
        }

        if (!passwordInput) {
            setPasswordError("Enter your password");
            error = true
        } else {
            setPasswordError(null);
        }

        if (error)
            return;

        const response = await fetch("http://localhost:8080/api/login", {
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
            if (response.status === 401) {
                return null;
            }

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
        } else {
            console.log("Error")
        }


    }

    const handleRegister = async (e) => {
        e.preventDefault();
        var error = false
        if (!usernameInput) {
            setUsernameError("Please provide a username");
            error = true
        } else {
            setUsernameError(null)
        }

        if (!passwordInput) {
            setPasswordError("Please provide a password");
            error = true
        } else {
            setPasswordError(null)
        }

        if (error)
            return

        const response = await fetch("http://localhost:8080/api/register", {
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
            if (response.status === 401) {
                return null
            }
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
        } else {
            console.log("error")
        }

    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to delete your account?"))
            return;

        const response = await fetch("http://localhost:8080/api/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                username: usernameInput,
                matrix_data: ""
            })
        }).then((response) => {
            if (response.status === 401) {
                return null
            }
            return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === null) {
            console.log("Failed to delete")
            return;
        }

        console.log("Account deleted")
        logOut();

    }

    const handleChangePassword = async (e) => {
        e.preventDefault();

        var error = false

        if (!currentPassword) {
            setCurrentPasswordError("Please enter your current password")
            error = true;
        }

        if (!newPasword) {
            setNewPasswordError("Please enter a new password")
            error = true;
        } else if (newPassword === currentPassword) {
            setNewPasswordError("Your new password is the same as your current password.")
            error = true;
        }

        if (error)
            return;

        const response = await fetch("http://localhost:8080/api/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                username: props.username,
                current_password: currentPassword,
                new_password: newPasword
            })
        }).then((response) => {
            if (response.status === 401) {
                return null
            }
            return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === null) {
            setCurrentPasswordError("Incorrect current password")
            return;
        } else {
            alert("Password changed!")
            setCurrentPasswordError(null)
            setNewPasswordError(null)
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

                    {showWelcome ?
                        `New Account Created. Welcome, ${props.username}!`
                        :
                        `Signed in as ${props.username}`
                    }
                    <button onClick={logOut} className={"btn btn-secondary " + styles.loginRegisterButton}>Log Out</button>
                    <button onClick={() => {setShowChangePassword(!showChangePassword)}} className={"btn btn-secondary " + styles.loginRegisterButton}>{showChangePassword ? "Close" : "Change Password"}</button>
                    {
                        showChangePassword ? 
                        <form onSubmit = {handleChangePassword} className = {styles.changePassword}>
                            <label htmlFor="currentPassword" className={styles.loginLabel}>Current Password</label>
                            <input className={styles.loginInput} id="currentPassword" type="text" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value) }} />
                            {currentPasswordError ?
                                <label htmlFor="currentPassword" className={styles.errorLabel}>{currentPasswordError}</label>
                                : null}


                            <label htmlFor="newPassword" className={styles.loginLabel}>New Password</label>
                            <input className={styles.loginInput} id="newPassword" type="password" value={newPasword} onChange={(e) => { setNewPassword(e.target.value) }} />
                            {newPasswordError ?
                                <label htmlFor="newPassword" className={styles.errorLabel}>{newPasswordError}</label>
                                : null}

                            
                            <button onClick={handleChangePassword} className={"btn btn-secondary " + styles.loginRegisterButton}>Confirm</button>
                        </form> 
                            : null
                        }
                    <button onClick={handleDeleteAccount} className={"btn btn-danger " + styles.loginRegisterButton}>Delete Account</button>
                </div>

                :
                
                <div>

                    <form onSubmit={showLogin ? handleLogin : handleRegister} className={styles.loginForm}>

                        <div className={styles.methodSelector}>
                            <div onClick={() => { setShowLogin(true) }}
                                style={{ color: (showLogin ? "rgb(185, 207, 220)" : "white") }}
                                className={styles.loginOption}>Sign In
                            </div>

                            <div onClick={() => { setShowLogin(false) }}
                                style={{ color: (!showLogin ? "rgb(185, 207, 220)" : "white") }}
                                className={styles.registerOption}>Create New Account
                            </div>
                        </div>

                        <label htmlFor="login" className={styles.loginLabel}>Username</label>
                        <input className={styles.loginInput} id="login" type="text" value={usernameInput} onChange={(e) => { setUsernameInput(e.target.value) }} />
                        {usernameError ?
                            <label htmlFor="password" className={styles.errorLabel}>{usernameError}</label>
                            : null}


                        <label htmlFor="password" className={styles.loginLabel}>Password</label>
                        <input className={styles.loginInput} id="password" type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value) }} />
                        {passwordError ?
                            <label htmlFor="password" className={styles.errorLabel}>{passwordError}</label>
                            : null}

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


                <button className={"btn btn-primary " + styles.clearButton} onClick={clearLocalMatrices}>{"Delete Matrices From Local Storage"}</button>
                <p>You can delete your matrices from local storage using the button above. Matrices on your account will not be deleted.</p>


            </div>
        </div>



    </div>

}


export default Login;