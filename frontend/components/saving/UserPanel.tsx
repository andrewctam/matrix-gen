import MergeStorage from "./MergeStorage";
import styles from "./SaveMatrices.module.css";
import SaveInput from "./SaveInput"
import React, { useState } from "react";
import { Matrices } from "../App";

interface UserPanelProps {
    username: string
    showWelcome: boolean
    setShowWelcome: (bool: boolean) => void
    showMerge: boolean
    matrices: Matrices
    userMatrices: Matrices | null
    matrixDispatch: React.Dispatch<any>
    setSelection: (str: string) => void
    updateUserInfo: (username: string, access_token: string, refresh_token: string) => void
    refreshTokens: () => Promise<boolean>
    addAlert: (str: string, time: number, type?: string) => void
    setShowMerge: (bool: boolean) => void
}

const UserPanel = (props: UserPanelProps) => {

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordSuccess, setNewPasswordSuccess] = useState("");

    const [deleteVerify, setDeleteVerify] = useState("");
    const [deleteVerifyError, setDeleteVerifyError] = useState("");
        

    const toggleShowChangePassword = () => {
        if (showChangePassword) {
            setCurrentPassword("");
            setCurrentPasswordError("");
            setNewPassword("");
            setNewPasswordError("");
        }
        
        setNewPasswordSuccess("");
        setShowChangePassword(!showChangePassword);
    }

    const toggleShowDeleteAccount = () => {
        if (showDeleteAccount) {
            setDeleteVerify("");
            setDeleteVerifyError("");
        }

        setShowDeleteAccount(!showDeleteAccount);
    }

    const logOut = () => {
        props.setShowWelcome(false)
        props.updateUserInfo("", "", "");
    }

    const handleDeleteAccount = async (e: null | React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (e)
            e.preventDefault();

        if (!deleteVerify) {
            setDeleteVerifyError("Enter your password")
            return;
        }

        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/delete`;
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            },
            body: JSON.stringify({
                username: props.username,
                password: deleteVerify
            })
        }).then((response) => {
            if (response.status === 401) //access token expired
                return 401;
            else if (response.status === 403) //wrong password
                return 403;
            else //OK
                return response.json();
        }).catch((error) => {
            console.log(error);
        })

        if (response === 401) { 
            if (await props.refreshTokens()) {
                handleDeleteAccount(null); //retry
                return;
            } else { //refresh token invalid
                props.updateUserInfo("", "", "");
            }
        } else if (response == 403) { //Access Denied
            setDeleteVerifyError("Incorrect password")
        } else {
            logOut();
            
            console.log("Account deleted")
        }
    }

    const handleChangePassword = async (e: null | React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (e)
            e.preventDefault();

        let error = false
        setCurrentPasswordError("")
        setNewPasswordError("")
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
        
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/password`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            },
            body: JSON.stringify({
                username: props.username,
                current_password: currentPassword,
                new_password: newPassword
            })
        }).then((response) => {
            if (response.status === 401)
                return 401; //Wrong Password
            else if (response.status === 403)
                return 403; //Access Token Expird
                
            return response.json();
        }).catch((error) => {
            console.log(error);
        })


        if (response === 401) { //access token expired 
            if (await props.refreshTokens())  {
                handleChangePassword(null); //retry
                return;
            } else //refresh token invalid
                props.updateUserInfo("", "", "");
        } else if (response == 403) { //Wrong Password
            setCurrentPasswordError("Incorrect current password")
        } else {
            setNewPasswordSuccess("Password successfully changed")
            setCurrentPasswordError("")
            setNewPasswordError("")
            setTimeout(() => { toggleShowChangePassword() }, 1000);
        }
    }


    return (
    <div>
        {props.showWelcome ? `New Account Created. Welcome, ${props.username}!` :`Signed in as ${props.username}`}

        <button onClick={logOut} className={"btn btn-secondary " + styles.loginRegisterButton}>Log Out</button>
        
        <button onClick={toggleShowChangePassword} className={"btn btn-secondary " + styles.loginRegisterButton}>{showChangePassword ? "Close" : "Change Password"}</button>
        { showChangePassword ?
            <form onSubmit={handleChangePassword} className={styles.loginSubBox}>
                <SaveInput
                    name="Current Password"
                    type="password"
                    current={currentPassword}
                    setCurrent={setCurrentPassword}
                    error={currentPasswordError}
                />
                <SaveInput
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


        <button onClick={toggleShowDeleteAccount} className={"btn btn-secondary " + styles.loginRegisterButton}>{showDeleteAccount ? "Cancel" : "Delete Account"}</button>
        { showDeleteAccount ?
            <form onSubmit={handleDeleteAccount} className={styles.loginSubBox}>
                <SaveInput
                    name="Verify your password"
                    type="password"
                    current={deleteVerify}
                    setCurrent={setDeleteVerify}
                    error={deleteVerifyError}
                />

                <button onClick={handleDeleteAccount} className={"btn btn-danger " + styles.loginRegisterButton}>Confirm</button>
            </form> : null
        }


        {props.showMerge && props.userMatrices?
        <MergeStorage
            matrices={props.matrices}
            userMatrices={props.userMatrices}
            matrixDispatch={props.matrixDispatch}
            setSelection={props.setSelection}
            setShowMerge={props.setShowMerge}
            addAlert={props.addAlert}

        /> : null}
    </div>)
}


export default UserPanel;