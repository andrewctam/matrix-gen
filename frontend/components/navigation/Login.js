import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";

function Login(props) {
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    
    const [showWelcome, setShowWelcome] = useState(false);


    const clearLocalMatrices = () => {
        var message = "Your matrices have been deleted from your browser's local storage."
        if (props.username)
            message += "Your matrices on your account have not been deleted."

        alert(message)
        localStorage.setItem("names;", JSON.stringify([]));
        localStorage.setItem("matrices;", JSON.stringify([]));

        props.updateParameter("saveToLocal", false)}

    const logOut = () => {
        localStorage.setItem("token", null);
        localStorage.setItem("username", null);
        props.updateUserInfo(null, null);
        props.loadFromLocalStorage();

        setUsernameInput("")
        setPasswordInput("")

        setUsernameError(null)
        setPasswordError(null)

        setShowWelcome(false)
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

    
   
    

    return <div className={styles.login}>
        <button
            onClick={props.closeSaveMenu}
            className={"btn btn-danger " + styles.closeButton}>
            {"Close"}

        </button>

        <div className="row">

            <div className="col-sm-6">
                <h1>Save Matrices Online</h1>
                {
                    props.username ?
                        <div>
                            
                            {showWelcome ?
                            `New Account Created. Welcome, ${props.username}!`
                            :
                            `Signed in as ${props.username}`
                            }
                           <button onClick = {logOut}  className={"btn btn-secondary " + styles.loginButton}>Log Out</button>

                        </div>
                        :
                        <div>

                            <form onSubmit = {handleLogin} className={styles.loginForm}>
                            <p className = {styles.text}>Sign in or Create a New Account</p>

                                <label htmlFor="login" className = {styles.loginLabel}>Username</label>
                                <input className={styles.loginInput} id="login" type="text" value = {usernameInput} onChange = {(e) => {setUsernameInput(e.target.value)}}/>
                                {usernameError ?
                                <label htmlFor="password" className = {styles.errorLabel}>{usernameError}</label> 
                                : null}

                                <label htmlFor="password" className = {styles.loginLabel}>Password</label>
                                <input className={styles.loginInput} id="password" type="password" value = {passwordInput} onChange = {(e) => {setPasswordInput(e.target.value)}} />
                                {passwordError ?
                                <label htmlFor="password" className = {styles.errorLabel}>{passwordError}</label>
                                : null}
                            

                                <button onClick = {handleLogin}  className={"btn btn-secondary " + styles.loginButton}>Sign in</button>
                               
                                <button onClick = {handleRegister} className={"btn btn-secondary " + styles.registerButton}>Create New Account</button>
                                
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