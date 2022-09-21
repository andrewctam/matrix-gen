import React, { useLayoutEffect, useState } from "react";
import ParameterBoxInput from "../inputs/ParameterBoxInput";
import styles from "./Login.module.css";

function Login(props) {
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const clearLocalMatrices = () => {
        var message = "Your matrices have been deleted from your browser's local storage."
        if (props.username)
            message += " Your matrices on your account have not been deleted."
        else {
            props.setSelection("0");
            props.setMatrices({});
        }

        if (props.saveToLocal)
            message += " Making further change will save your matrices to local storage again; please disable this option above if you do not want this to happen."

        alert(message)
        localStorage.setItem("names;", JSON.stringify([]));
        localStorage.setItem("matrices;", JSON.stringify([]));
    }

    const handleLogin = (e) => {
        e.preventDefault();
        if (!username) {
            setUsernameError("Enter your username");
            return;
        
        }

        if (!password) {
            setPasswordError("Enter your password");
            return;
        }

    }


    const handleRegister = (e) => {
        e.preventDefault();
        if (!username) {
            setUsernameError("Please provide a username");
            return;
        
        }

        if (!password) {
            setPasswordError("Please provide a password");
            return;
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
                        <div >{`Welcome ${props.username}`}</div>
                        :
                        <div>

                            <form onSubmit = {handleLogin} className={styles.loginForm}>
                            <p className = {styles.text}>Sign in or Create a New Account</p>

                                <label htmlFor="login" className = {styles.loginLabel}>Username</label>
                                <input className={styles.loginInput} id="login" type="text" value = {username} onChange = {(e) => {setUsername(e.target.value)}}/>
                                {usernameError ?
                                <label htmlFor="password" className = {styles.errorLabel}>{usernameError}</label> 
                                : null}

                                <label htmlFor="password" className = {styles.loginLabel}>Password</label>
                                <input className={styles.loginInput} id="password" type="password" value = {password} onChange = {(e) => {setPassword(e.target.value)}} />
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
                <p>If this option is enabled, your matrices will be saved to your browser's local storage, even after logging out.</p>


                <button className={"btn btn-primary " + styles.clearButton} onClick={clearLocalMatrices}>{"Clear Matrices in Local Storage"}</button>

            </div>
        </div>



    </div>

}


export default Login;