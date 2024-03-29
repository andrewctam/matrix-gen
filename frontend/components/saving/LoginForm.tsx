import React, { useState } from "react";
import styles from "./SaveMatrices.module.css";
import SaveInput from "./SaveInput"
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { updateUser } from "../../features/user-slice";

interface LoginFormProps {
    setShowWelcome: (bool: boolean) => void
}

const LoginForm = (props: LoginFormProps) => {
    const {matrices} = useAppSelector((state) => state.matricesData);
    const dispatch = useAppDispatch();

    const settings = useAppSelector((state) => state.settings);
    const [showLogin, setShowLogin] = useState(true);

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [verifyPasswordInput, setVerifyPasswordInput] = useState("");


    const handleLogin = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
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

        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/login`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                matrix_data: JSON.stringify(matrices)
            })
        }).then((response) => {
            if (response.status === 403) //wrong password
                return null;
            else
                return response.json();
        }).catch((error) => {
            console.log(error);
            setPasswordError("Unable to connect to server");
        })
        if (response === null) {
            setUsernameError("Invalid username or password");
            return;
        }
        
        if (usernameInput && response) {
            dispatch(updateUser({
                username: usernameInput,
                accessToken: response["access_token"],
                refreshToken: response["refresh_token"]
            }))
        }
    }

    const handleRegister = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
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

        if (!verifyPasswordInput) {
            setPasswordError("Please verify your password");
            error = true
        } else if (verifyPasswordInput !== passwordInput) {
            setPasswordError("Passwords do not match");
            error = true
        }

        if (error)
            return;

        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/register`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                matrix_data: JSON.stringify(matrices),
                settings: JSON.stringify(settings)
            })

        }).then((response) => {
            if (response.status === 400) //username already exists
                return null;
            else
                return response.json();
        }).catch((error) => {
            console.log(error);
            setPasswordError("Unable to connect to server");

        })
    console.log(response)
        if (response === null) {
            setUsernameError("Username already exists");
            return;
        }
        else if (usernameInput && response) {
            dispatch(updateUser({
                username: usernameInput,
                accessToken: response["access_token"],
                refreshToken: response["refresh_token"]
            }))
            props.setShowWelcome(true)
        }
    }


    return (
        <div>
            <form onSubmit={showLogin ? handleLogin : handleRegister} className={styles.loginForm}>
                <div className={styles.methodSelector}>
                    <div onClick={() => { setShowLogin(true) }} className={styles.option + " " + (showLogin ? styles.selectedOption : "")}>
                        Sign In
                    </div>

                    <div onClick={() => { setShowLogin(false) }} className={styles.option + " " + (!showLogin ? styles.selectedOption : "")}>
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

                {!showLogin ? 
                    <SaveInput
                    name="Verify Password"
                    type="password"
                    current={verifyPasswordInput}
                    setCurrent={setVerifyPasswordInput}
                    error={null}
                /> : null}

                {showLogin ?
                    <button onClick={handleLogin} className={"btn btn-secondary " + styles.loginRegisterButton}>Sign In</button>
                    :
                    <button onClick={handleRegister} className={"btn btn-secondary " + styles.loginRegisterButton}>Register</button>
                }

            </form>
        </div>
    )
}

export default LoginForm