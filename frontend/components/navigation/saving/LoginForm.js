import { useState } from "react";
import styles from "./SaveMatrices.module.css";
import SaveInput from "./SaveInput"



const LoginForm = (props) => {

    const [showLogin, setShowLogin] = useState(true);

    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");


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
            if (response.status === 403) //wrong password
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
        
        if (usernameInput && response) {
            props.updateUserInfo(usernameInput, response["access_token"], response["refresh_token"]);
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
            if (response.status === 400) //username already exists
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
        else if (usernameInput && response) {
            props.updateUserInfo(usernameInput, response["access_token"], response["refresh_token"]);
            props.setShowWelcome(true)
        }
    }


    return (
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

                <SaveInput
                    name="Username"
                    type="text"
                    current={usernameInput}
                    setCurrent={setUsernameInput}
                    error={usernameError}
                />

                <SaveInput
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
    )
}

export default LoginForm