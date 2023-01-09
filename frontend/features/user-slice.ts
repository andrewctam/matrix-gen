import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { Matrices } from "./matrices-slice";

export interface User {
    username: string
    accessToken: string
    refreshToken: string
    mergeConflict: boolean
    userMatrices: Matrices | null
    saveToLocal: boolean
}

const initialState: User = {
    username: "",
    accessToken: "",
    refreshToken: "",
    mergeConflict: false,
    userMatrices: null,
    saveToLocal: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state: User, action: PayloadAction<{username: string, accessToken: string, refreshToken: string}>) => {
            state.username = action.payload.username;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;

            localStorage.setItem("username", state.username);
            localStorage.setItem("accessToken", state.accessToken);
            localStorage.setItem("refreshToken", state.refreshToken);
        },
        loadUser: (state: User) => {
            let username = localStorage.getItem("username")
            let accessToken = localStorage.getItem("accessToken")
            let refreshToken = localStorage.getItem("refreshToken")

            if (username && accessToken && refreshToken) {
                state.username = username;
                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
            } else {
                logoutUser();
            }
        },
        logoutUser: (state: User) => {
            state.username = "";
            state.accessToken = "";
            state.refreshToken = "";

            localStorage.removeItem("username");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        declareMergeConflict: (state: User, action: PayloadAction<Matrices>) => {
            state.mergeConflict = true;
            state.userMatrices = action.payload;
        },
        resolveMergeConflict: (state: User) => {
            state.mergeConflict = false;
            state.userMatrices = null;
        },
        updateSaveToLocal: (state: User, action: PayloadAction<boolean>) => {
            state.saveToLocal = action.payload;
        }

    }
})

export const {updateUser, loadUser, logoutUser, declareMergeConflict, resolveMergeConflict, updateSaveToLocal} = userSlice.actions;

export default userSlice.reducer;